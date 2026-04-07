- Time table module

- existing data
  - standards: 1 to 12
  - each standard has 3 division(A,B,C)

monday to saturday: every day 6 period.

- create subjects according to standard
- create enough teachers to maintain timetbale
- assign teacher to subjects (model:TeacherSubject) 
- assign teacher <=> subject accordingly to maintain timetbale
- every standard has atleast 6 subject
- each division of same standard should have same occurance of subject in week
  - for ex, 1-A Maths 3 times, then 1-B and 1-C 
- time table of  class should not overlap with class
- for each class division(ex: A) of stardard(for ex: 1) timetbale should not be same as other class division(B,C)
- any subject can not be more then 2 times a day for any class


- generate sql records to create time table for each class(1-A, 2-B, etc)


all records should looks real not test data.
think like create user base is india
