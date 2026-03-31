from sqlalchemy.orm import Session, joinedload
from sqlalchemy import extract, and_, or_
from fastapi import HTTPException, status
from typing import List, Optional
from datetime import date, datetime
from io import BytesIO
from reportlab.lib.pagesizes import A4, landscape
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import inch
import calendar

from .. import models, schemas, utils

def add_attendance_bulk_new(db: Session, data: schemas.AttendanceBulkCreateNew, current_user_id: int):
    # Check if a record already exists for this class and date
    existing = db.query(models.Attendance).filter(
        models.Attendance.class_id == data.class_id,
        models.Attendance.date == data.date
    ).first()

    records_json = [r.model_dump() for r in data.records]

    if existing:
        existing.records = records_json
        existing.updated_at = datetime.utcnow()
        existing.updated_by_id = current_user_id
    else:
        new_attendance = models.Attendance(
            class_id=data.class_id,
            date=data.date,
            records=records_json,
            created_by_id=current_user_id,
            updated_by_id=current_user_id
        )
        db.add(new_attendance)

    db.commit()
    return {"detail": "Attendance recorded successfully"}

def view_attendance(db: Session, skip: int = 0, limit: int = 100, sort_by: str = "date", order: str = "desc", class_id: Optional[int] = None, day: Optional[date] = None, month: Optional[int] = None, year: Optional[int] = None):
    query = db.query(models.Attendance).options(joinedload(models.Attendance.school_class))
    
    if class_id:
        query = query.filter(models.Attendance.class_id == class_id)
    if day:
        query = query.filter(models.Attendance.date == day)
    if month:
        query = query.filter(extract('month', models.Attendance.date) == month)
    if year:
        query = query.filter(extract('year', models.Attendance.date) == year)

    return utils.apply_pagination_sort(query, models.Attendance, skip, limit, sort_by, order).all()

def view_monthly_attendance_report(db: Session, month: int, year: int, class_id: int):
    # Get class students
    class_mapping = db.query(models.ClassStudent).filter(models.ClassStudent.class_id == class_id).first()
    if not class_mapping:
        return []
    
    students = db.query(models.Student).filter(models.Student.id.in_(class_mapping.students)).all()
    student_meta = {s.id: {"name": s.name, "surname": s.surname, "gr_no": s.gr_no} for s in students}

    records = db.query(models.Attendance).filter(
        and_(
            extract('month', models.Attendance.date) == month,
            extract('year', models.Attendance.date) == year,
            models.Attendance.class_id == class_id
        )
    ).all()

    report_dict = {}
    for s_id, meta in student_meta.items():
        report_dict[s_id] = {
            "student_id": s_id,
            "name": meta["name"],
            "surname": meta["surname"],
            "gr_no": meta["gr_no"],
            "total_days": len(records),
            "present_days": 0,
            "absent_days": 0,
            "attendance_percentage": 0.0,
            "data": {}
        }

    for record in records:
        day = str(record.date.day)
        for r in record.records:
            s_id = r.get("student_id")
            if s_id in report_dict:
                status = r.get("status")
                is_present = status == "P" or status == "present"
                report_dict[s_id]["data"][day] = "present" if is_present else "absent"
                if is_present:
                    report_dict[s_id]["present_days"] += 1
                else:
                    report_dict[s_id]["absent_days"] += 1

    for s_id in report_dict:
        total = report_dict[s_id]["total_days"]
        if total > 0:
            present = report_dict[s_id]["present_days"]
            report_dict[s_id]["attendance_percentage"] = round((present / total) * 100, 1)

    return list(report_dict.values())

def generate_monthly_attendance_pdf(db: Session, month: int, year: int, class_id: int):
    # Get class and school details
    school_class = db.query(models.SchoolClass).filter(models.SchoolClass.id == class_id).first()
    class_name = f"{school_class.standard} - {school_class.division}" if school_class else "Unknown"
    
    month_name = datetime(year, month, 1).strftime('%B')
    
    # Get and sort report data by full name DESC
    report_data = view_monthly_attendance_report(db, month, year, class_id)
    sorted_data = sorted(report_data, key=lambda x: f"{x['name']} {x['surname']}".lower(), reverse=True)
    
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=landscape(A4), rightMargin=30, leftMargin=30, topMargin=30, bottomMargin=30)
    elements = []
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'TitleStyle',
        parent=styles['Heading1'],
        alignment=1,
        spaceAfter=12,
        textColor=colors.HexColor('#10b981')
    )
    
    # Header
    elements.append(Paragraph(f"Monthly Attendance Report - {month_name} {year}", title_style))
    elements.append(Paragraph(f"Class: {class_name}", styles['Normal']))
    elements.append(Spacer(1, 0.2 * inch))
    
    # Table Header
    _, last_day = calendar.monthrange(year, month)
    
    headers = ['S.No', 'Student Name', 'GR No.']
    for d in range(1, last_day + 1):
        headers.append(str(d))
    headers.append('%')
    
    table_data = [headers]
    
    for idx, student in enumerate(sorted_data, 1):
        row = [idx, f"{student['name']} {student['surname']}", student['gr_no']]
        for d in range(1, last_day + 1):
            status = student['data'].get(str(d), "")
            if status == "present":
                row.append("P")
            elif status == "absent":
                row.append("A")
            else:
                row.append("-")
        row.append(f"{student['attendance_percentage']}%")
        table_data.append(row)
    
    # Table Styles
    col_widths = [0.4 * inch, 1.8 * inch, 0.8 * inch] + [0.22 * inch] * last_day + [0.5 * inch]
    table = Table(table_data, colWidths=col_widths, repeatRows=1)
    
    style = TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f4f4f5')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#18181b')),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 8),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('FONTSIZE', (0, 1), (-1, -1), 7),
        ('ALIGN', (1, 1), (1, -1), 'LEFT'),
    ])
    
    # Conditional Coloring
    for row_idx, row in enumerate(table_data[1:], 1):
        for col_idx, cell in enumerate(row[3:-1], 3):
            if cell == "P":
                style.add('TEXTCOLOR', (col_idx, row_idx), (col_idx, row_idx), colors.HexColor('#10b981'))
            elif cell == "A":
                style.add('TEXTCOLOR', (col_idx, row_idx), (col_idx, row_idx), colors.red)
    
    table.setStyle(style)
    elements.append(table)
    
    doc.build(elements)
    buffer.seek(0)
    return buffer
