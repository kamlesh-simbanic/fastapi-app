import random

# Configuration
STANDARDS = list(range(1, 13))
DIVISIONS = ['A', 'B', 'C']
DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
PERIODS = list(range(1, 7))

# Class IDs from DB (mapping standard + division to ID)
# From my previous check: Standard 1-12 mapped to IDs 75-110
# 1-A: 75, 1-B: 76, 1-C: 77, 2-A: 78, ..., 12-C: 110
class_data = []
current_id = 75
for std in STANDARDS:
    for div in DIVISIONS:
        class_data.append({'id': current_id, 'standard': str(std), 'division': div})
        current_id += 1

# Realistic Indian Teacher Names
FIRST_NAMES = [
    "Aarav", "Advait", "Arjun", "Ishaan", "Vihaan", "Pranav", "Rohan", "Siddharth", "Zayan", "Kabir",
    "Ananya", "Diya", "Isha", "Myra", "Navya", "Riya", "Saanvi", "Sara", "Vanya", "Zoya",
    "Amit", "Rajesh", "Suresh", "Vijay", "Sunil", "Anil", "Meena", "Geeta", "Sunita", "Anita",
    "Deepak", "Sandeep", "Pankaj", "Rahul", "Vikram", "Shikha", "Neha", "Priyanka", "Kavita", "Sapna"
]
LAST_NAMES = [
    "Sharma", "Verma", "Gupta", "Malhotra", "Kapoor", "Khanna", "Mehta", "Jain", "Patel", "Shah",
    "Chaudhary", "Yadav", "Trivedi", "Iyer", "Nair", "Reddy", "Kulkarni", "Deshmukh", "Pande", "Mishra",
    "Srinivasan", "Mukherjee", "Chatterjee", "Banerjee", "Bose", "Dutta", "Das", "Sen", "Roy", "Basu"
]

def get_random_name():
    return f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"

# Subjects by Grade Level
SUBJECT_GROUPS = {
    'PRIMARY': ["Mathematics", "English", "Hindi", "EVS", "Art & Craft", "Physical Education", "General Knowledge", "Music"],
    'MIDDLE': ["Mathematics", "Science", "Social Science", "English", "Hindi", "Sanskrit", "Computer Science", "Physical Education"],
    'SECONDARY': ["Mathematics", "Physics", "Chemistry", "Biology", "History", "Civics", "Geography", "English", "Hindi", "Economics"],
    'HIGHER': ["Physics", "Chemistry", "Mathematics", "English", "Biology", "Computer Science", "Business Studies", "Accountancy", "Economics"]
}

def get_grade_group(std):
    if std <= 5: return 'PRIMARY'
    if std <= 8: return 'MIDDLE'
    if std <= 10: return 'SECONDARY'
    return 'HIGHER'

# 1. Generate Subjects
subjects_all = set()
for group in SUBJECT_GROUPS.values():
    for s in group:
        subjects_all.add(s)

subjects_list = sorted(list(subjects_all))
subject_sql = []
subj_to_id = {}
for i, s in enumerate(subjects_list, 1):
    subj_to_id[s] = i
    subject_sql.append(f"INSERT INTO subjects (id, name, created_at, updated_at) VALUES ({i}, '{s}', NOW(), NOW());")

# 2. Generate Teachers (enough to avoid overlaps)
# 36 classes are active at any time. Let's create 120 teachers.
teachers = []
teacher_sql = []
for i in range(200, 320): # Using IDs 200-319
    name = get_random_name()
    teachers.append({'id': i, 'name': name})
    mobile = f"9{random.randint(100000000, 999999999)}"
    # Add a suffix to email to ensure uniqueness if name repeats
    email = f"{name.lower().replace(' ', '.')}.{i}@example.com"
    teacher_sql.append(f"INSERT INTO staff (id, name, mobile, email, department, created_at, updated_at) VALUES ({i}, '{name}', '{mobile}', '{email}', 'TEACHING', NOW(), NOW());")

# Map teachers to subjects (each teacher can teach a broader range to avoid bottlenecks)
teacher_subjects = []
teacher_subj_sql = []
ts_id = 1
for t in teachers:
    can_teach = random.sample(subjects_list, random.randint(8, 12))
    for s in can_teach:
        teacher_subjects.append({'teacher_id': t['id'], 'subject_id': subj_to_id[s]})
        teacher_subj_sql.append(f"INSERT INTO teacher_subjects (id, teacher_id, subject_id, created_at, updated_at) VALUES ({ts_id}, {t['id']}, {subj_to_id[s]}, NOW(), NOW());")
        ts_id += 1

# 3. Generate Timetable
timetable_sql = []
tt_id = 1

# Global teacher availability: availability[day][period] = set of busy teacher IDs
availability = {day: {p: set() for p in PERIODS} for day in DAYS}

# For each standard, decide subject frequencies (Total 36 slots per week)
standard_syllabi = {}
for std in STANDARDS:
    group = get_grade_group(std)
    available_subjects = SUBJECT_GROUPS[group]
    # Pick 6-8 subjects
    picked = random.sample(available_subjects, min(len(available_subjects), 8))
    
    # Assign frequencies
    freq = {}
    slots_left = 36
    for i, s in enumerate(picked):
        if i == len(picked) - 1:
            f = slots_left
        else:
            f = random.randint(3, 6)
            slots_left -= f
        freq[s] = max(1, f)
    
    # Create weekly pool
    pool = []
    for s, f in freq.items():
        pool += [s] * f
    random.shuffle(pool)
    standard_syllabi[std] = pool

# Now assign to each class (A, B, C)
for day in DAYS:
    for p in PERIODS:
        # Assign all classes for this slot first to ensure no overlaps
        for std in STANDARDS:
            for div in DIVISIONS:
                class_id = next(c['id'] for c in class_data if c['standard'] == str(std) and c['division'] == div)
                
                # Get the next subject for this class from its pre-shuffled pool
                # Wait, to simplify, I'll just pick from the pool based on a calculated index
                slot_idx = (DAYS.index(day) * 6) + (p - 1)
                subj_name = standard_syllabi[std][slot_idx]
                subj_id = subj_to_id[subj_name]
                
                # Find available teacher for this subject at this time
                possible_teachers = [ts['teacher_id'] for ts in teacher_subjects if ts['subject_id'] == subj_id]
                available_ones = [tid for tid in possible_teachers if tid not in availability[day][p]]
                
                if not available_ones:
                    # If no specific teacher is available, find ANY teacher who isn't busy
                    # and assign them to this subject for this slot (this assumes anyone can teach if pushed)
                    # and update teacher_subjects if needed, or just allow it.
                    # Actually, with 120 teachers and each teaching 10 subjects, this shouldn't happen.
                    all_non_busy = [t['id'] for t in teachers if t['id'] not in availability[day][p]]
                    teacher_id = random.choice(all_non_busy)
                    # Optionally add mapping
                else:
                    teacher_id = random.choice(available_ones)
                
                availability[day][p].add(teacher_id)
                timetable_sql.append(f"INSERT INTO timetables (id, class_id, subject_id, teacher_id, day_of_week, period_number, created_at, updated_at) VALUES ({tt_id}, {class_id}, {subj_id}, {teacher_id}, '{day}', {p}, NOW(), NOW());")
                tt_id += 1

# Output all SQL
with open('timetable_data.sql', 'w') as f:
    f.write("SET FOREIGN_KEY_CHECKS = 0;\n")
    f.write("TRUNCATE TABLE teacher_subjects;\n")
    f.write("TRUNCATE TABLE timetables;\n")
    f.write("TRUNCATE TABLE subjects;\n")
    f.write("DELETE FROM staff WHERE id >= 200;\n")
    # Note: we don't truncate staff because there might be other staff, but we are adding new ones
    f.write("\n-- Subjects\n")
    f.write("\n".join(subject_sql) + "\n")
    f.write("\n-- New Teachers\n")
    f.write("\n".join(teacher_sql) + "\n")
    f.write("\n-- Teacher-Subject Mapping\n")
    f.write("\n".join(teacher_subj_sql) + "\n")
    f.write("\n-- Timetable Records\n")
    f.write("\n".join(timetable_sql) + "\n")
    f.write("SET FOREIGN_KEY_CHECKS = 1;\n")

print(f"Generated {len(timetable_sql)} timetable records.")
