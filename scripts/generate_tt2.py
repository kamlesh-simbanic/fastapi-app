import random

# Configuration
STANDARDS = list(range(1, 13))
DIVISIONS = ['A', 'B', 'C']
DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
PERIODS = list(range(1, 7))

# Realistic Indian Teacher Names
FIRST_NAMES = [
    "Aarav", "Advait", "Arjun", "Ishaan", "Vihaan", "Pranav", "Rohan", "Siddharth", "Kabir",
    "Ananya", "Diya", "Isha", "Myra", "Navya", "Riya", "Saanvi", "Sara", "Vanya", "Zoya",
    "Amit", "Rajesh", "Suresh", "Vijay", "Sunil", "Anil", "Meena", "Geeta", "Sunita", "Anita",
    "Deepak", "Sandeep", "Pankaj", "Rahul", "Vikram", "Shikha", "Neha", "Priyanka", "Kavita", "Sapna"
]
LAST_NAMES = [
    "Sharma", "Verma", "Gupta", "Malhotra", "Kapoor", "Khanna", "Mehta", "Jain", "Patel", "Shah",
    "Chaudhary", "Yadav", "Trivedi", "Iyer", "Nair", "Reddy", "Kulkarni", "Deshmukh", "Pande", "Mishra"
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

all_subjects = set()
for grp in SUBJECT_GROUPS.values():
    all_subjects.update(grp)

subjects_list = sorted(list(all_subjects))
subj_to_id = {s: i + 1 for i, s in enumerate(subjects_list)}

class TimetableGenerator:
    def __init__(self):
        self.teachers = []
        self.teacher_subject_map = {} # teacher_id -> list of subject_ids
        self.subject_teacher_map = {} # subject_id -> list of teacher_ids
        self.class_data = []
        self.availability = {day: {p: set() for p in PERIODS} for day in DAYS}
        self.timetable_records = []
        self.subject_sql = []
        self.teacher_sql = []
        self.teacher_subj_sql = []

    def generate_base_data(self):
        # 1. Subjects
        for s, sid in subj_to_id.items():
            self.subject_sql.append(f"INSERT INTO subjects (id, name, created_at, updated_at) VALUES ({sid}, '{s}', NOW(), NOW());")

        # 2. Teachers (let's create 150)
        for i in range(1, 151):
            name = get_random_name()
            mobile = f"{random.randint(7, 9)}{random.randint(100000000, 999999999)}"
            email = f"{name.lower().replace(' ', '.')}.{i}@example.edu.in"
            self.teacher_sql.append(f"INSERT INTO staff (id, name, mobile, email, department, created_at, updated_at) VALUES ({i}, '{name}', '{mobile}', '{email}', 'TEACHING', NOW(), NOW());")
            
            # Map teachers to subjects (3-5 subjects per teacher)
            can_teach = random.sample(subjects_list, random.randint(3, 5))
            self.teacher_subject_map[i] = [subj_to_id[s] for s in can_teach]
            for sname in can_teach:
                sid = subj_to_id[sname]
                if sid not in self.subject_teacher_map: self.subject_teacher_map[sid] = []
                self.subject_teacher_map[sid].append(i)
                self.teacher_subj_sql.append(f"INSERT INTO teacher_subjects (teacher_id, subject_id, created_at, updated_at) VALUES ({i}, {sid}, NOW(), NOW());")

        # 3. Classes
        cid = 1
        for std in STANDARDS:
            for div in DIVISIONS:
                self.class_data.append({'id': cid, 'standard': str(std), 'division': div})
                cid += 1

    def generate_timetable(self):
        # For each standard, decide subject frequencies (Total 36 slots per week)
        standard_frequencies = {}
        for std in STANDARDS:
            group = get_grade_group(std)
            available = SUBJECT_GROUPS[group]
            picked = random.sample(available, min(len(available), 7))
            
            # Core subjects get more weight
            freq = {}
            slots_left = 36
            for i, s in enumerate(picked):
                if i == len(picked) - 1:
                    freq[s] = slots_left
                else:
                    if s in ["Mathematics", "English", "Science", "Physics", "Chemistry"]:
                        f = random.randint(6, 7)
                    else:
                        f = random.randint(3, 5)
                    freq[s] = f
                    slots_left -= f
            standard_frequencies[std] = freq

        # Assign for each division
        for std in STANDARDS:
            freq = standard_frequencies[std]
            for div in DIVISIONS:
                class_info = next(c for c in self.class_data if c['standard'] == str(std) and c['division'] == div)
                
                # Create a candidate pool for the week
                pool = []
                for s, f in freq.items():
                    pool += [s] * f
                random.shuffle(pool)
                
                # Attempt to fill (Day, Period) while checking constraints
                # Constraints: 
                # 1. Teacher not busy
                # 2. Subject not more than 2 times a day
                
                day_subject_count = {day: {s: 0 for s in freq} for day in DAYS}
                assigned_count = 0
                max_retries = 100
                
                # We'll use a simple fill. If we get stuck, we reshuffle pool and retry.
                while assigned_count < 36 and max_retries > 0:
                    current_assignments = []
                    temp_availability = {day: {p: set() for p in PERIODS} for day in DAYS}
                    # We need to respect global availability too
                    
                    random.shuffle(pool)
                    possible = True
                    temp_idx = 0
                    
                    for day in DAYS:
                        if not possible: break
                        for p in PERIODS:
                            found = False
                            # Try to find a subject from pool that hasn't exceeded 2/day
                            # and has an available teacher
                            # To be efficient, we'll try to rotate the pool
                            for i in range(len(pool)):
                                sname = pool[i]
                                if day_subject_count[day][sname] >= 2: continue
                                
                                sid = subj_to_id[sname]
                                # Check if any teacher for this subject is free
                                possible_teachers = self.subject_teacher_map.get(sid, [])
                                if not possible_teachers: continue
                                
                                # Global free + local free (local free is redundant as one class has one period)
                                free_teachers = [tid for tid in possible_teachers if tid not in self.availability[day][p]]
                                if free_teachers:
                                    tid = random.choice(free_teachers)
                                    # Record it
                                    current_assignments.append({
                                        'class_id': class_info['id'],
                                        'subject_id': sid,
                                        'teacher_id': tid,
                                        'day_of_week': day,
                                        'period_number': p
                                    })
                                    self.availability[day][p].add(tid)
                                    day_subject_count[day][sname] += 1
                                    pool.pop(i)
                                    found = True
                                    break
                            
                            if not found:
                                possible = False
                                break
                    
                    if possible:
                        self.timetable_records.extend(current_assignments)
                        assigned_count = 36
                    else:
                        # Rollback and retry
                        max_retries -= 1
                        # Reset for this class
                        for a in current_assignments:
                            self.availability[a['day_of_week']][a['period_number']].remove(a['teacher_id'])
                        # Rebuild pool
                        pool = []
                        for s, f in freq.items():
                            pool += [s] * f
                        random.shuffle(pool)
                        day_subject_count = {day: {s: 0 for s in freq} for day in DAYS}
                
                if max_retries == 0:
                    print(f"Warning: Failed to fully satisfy constraints for Class {std}-{div}")

    def write_sql(self, filename):
        with open(filename, 'w') as f:
            f.write("SET FOREIGN_KEY_CHECKS = 0;\n")
            f.write("TRUNCATE TABLE teacher_subjects;\n")
            f.write("TRUNCATE TABLE timetables;\n")
            f.write("TRUNCATE TABLE subjects;\n")
            f.write("TRUNCATE TABLE school_classes;\n")
            f.write("TRUNCATE TABLE staff;\n")
            
            f.write("\n-- Subjects\n")
            f.write("\n".join(self.subject_sql) + "\n")
            
            f.write("\n-- Teachers\n")
            f.write("\n".join(self.teacher_sql) + "\n")
            
            f.write("\n-- Teacher-Subject Mapping\n")
            f.write("\n".join(self.teacher_subj_sql) + "\n")
            
            f.write("\n-- School Classes\n")
            for c in self.class_data:
                f.write(f"INSERT INTO school_classes (id, standard, division, created_at, updated_at) VALUES ({c['id']}, '{c['standard']}', '{c['division']}', NOW(), NOW());\n")
            
            f.write("\n-- Timetable Records\n")
            for i, r in enumerate(self.timetable_records, 1):
                f.write(f"INSERT INTO timetables (id, class_id, subject_id, teacher_id, day_of_week, period_number, created_at, updated_at) VALUES ({i}, {r['class_id']}, {r['subject_id']}, {r['teacher_id']}, '{r['day_of_week']}', {r['period_number']}, NOW(), NOW());\n")
            
            f.write("SET FOREIGN_KEY_CHECKS = 1;\n")

if __name__ == "__main__":
    gen = TimetableGenerator()
    gen.generate_base_data()
    gen.generate_timetable()
    gen.write_sql('timetable_data.sql')
    print(f"Generated {len(gen.timetable_records)} timetable records.")
