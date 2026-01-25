#!/usr/bin/env python3

import csv
import sys
import re
import json

OPEN_CALL_RE = re.compile(r'openStudentPicture\((.*?)\)', re.DOTALL)
UNITS_RE = re.compile(
    r'name="students\[\d+\]\.units".*?value="(?P<units>\d+)"',
    re.DOTALL
)

def parse_name(name):
    # "Last, First Middle"
    last, rest = name.split(",", 1)
    parts = rest.strip().split()
    first = parts[0]
    middle = parts[1][:-1] if len(parts) > 1 else ""
    return last.strip(), first.strip(), middle.strip()

def main(frag_path, grades_path):
    # ---- load inputs ----
    with open(frag_path, "r", encoding="utf-8") as f:
        text = f.read()

    with open(grades_path, "r", encoding="utf-8") as f:
        grades_raw = json.load(f)

    # normalize emails to lowercase
    grades = {k.lower(): v for k, v in grades_raw.items()}

    calls = OPEN_CALL_RE.findall(text)
    units_iter = UNITS_RE.finditer(text)

    students = []

    for call in calls:
        parts = call.split("&quot;")

        if len(parts) < 6:
            continue  # malformed, skip safely

        mitid = parts[1]
        name = parts[3]
        email = parts[5].lower()

        try:
            units = next(units_iter).group("units")
        except StopIteration:
            units = ""

        last, first, middle = parse_name(name)

        grade = grades.get(email, "")  # blank if missing

        students.append({
            "Last Name": last,
            "First Name": first,
            "Middle Name": middle,
            "MIT ID": mitid,
            "Subject #": "6.S913",
            "Section #": "",
            "Grade": grade,   # <-- integrated here
            "Units": units,
            "Comment": "",
        })

    writer = csv.DictWriter(
        sys.stdout,
        fieldnames=[
            "Last Name",
            "First Name",
            "Middle Name",
            "MIT ID",
            "Subject #",
            "Section #",
            "Grade",
            "Units",
            "Comment",
        ],
    )
    writer.writeheader()
    writer.writerows(students)

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print(f"usage: {sys.argv[0]} frag.txt grades.json > out.csv")
        sys.exit(1)

    main(sys.argv[1], sys.argv[2])
