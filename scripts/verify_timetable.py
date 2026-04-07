import re
from collections import defaultdict

# Read the SQL file
with open("timetable_data.sql") as f:
    sql = f.read()

# Extract timetable inserts
# Pattern: INSERT INTO timetables (id, class_id, subject_id, teacher_id, day_of_week, period_number, ...) VALUES (tt_id, class_id, subj_id, teacher_id, 'day', p, ...);
pattern = r"INSERT INTO timetables .* VALUES \(\d+, (\d+), (\d+), (\d+), '([^']+)', (\d+), .*\);"
matches = re.findall(pattern, sql)

# Checks
teacher_conflicts = defaultdict(list)  # (day, period, teacher_id) -> list of class_ids
class_conflicts = defaultdict(list)  # (day, period, class_id) -> list of teacher_ids
subject_counts = defaultdict(
    lambda: defaultdict(int)
)  # class_id -> subject_id -> count

for m in matches:
    class_id, subj_id, teacher_id, day, period = m

    teacher_conflicts[(day, period, teacher_id)].append(class_id)
    class_conflicts[(day, period, class_id)].append(teacher_id)
    subject_counts[class_id][subj_id] += 1

# 1. Teacher overlap check
overlaps = {k: v for k, v in teacher_conflicts.items() if len(v) > 1}
if overlaps:
    print(f"FAILED: Found {len(overlaps)} teacher overlaps!")
    for k, v in list(overlaps.items())[:5]:
        print(f"  Teacher {k[2]} is in classes {v} at {k[0]} Period {k[1]}")
else:
    print("SUCCESS: No teacher overlaps found.")

# 2. Class overlap check
class_overlaps = {k: v for k, v in class_conflicts.items() if len(v) > 1}
if class_overlaps:
    print(
        f"FAILED: Found {len(class_overlaps)} class overlaps (multiple teachers in one slot)!"
    )
else:
    print("SUCCESS: No class overlaps found.")

# 3. Subject frequency check across divisions
# Standard 1: 75, 76, 77
# Standard 2: 78, 79, 80
standards = []
for i in range(12):
    standards.append([75 + i * 3, 75 + i * 3 + 1, 75 + i * 3 + 2])

frequency_errors = 0
for std_classes in standards:
    counts_a = subject_counts[str(std_classes[0])]
    counts_b = subject_counts[str(std_classes[1])]
    counts_c = subject_counts[str(std_classes[2])]

    all_subjects = set(counts_a.keys()) | set(counts_b.keys()) | set(counts_c.keys())
    for s in all_subjects:
        if not (counts_a[s] == counts_b[s] == counts_c[s]):
            print(
                f"FAILED: Frequency mismatch for Standard (Class IDs {std_classes}), Subject {s}: {counts_a[s]}, {counts_b[s]}, {counts_c[s]}"
            )
            frequency_errors += 1

if frequency_errors == 0:
    print("SUCCESS: Subject frequencies are consistent across divisions.")
else:
    print(f"FAILED: Found {frequency_errors} frequency mismatches.")
