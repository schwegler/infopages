import sys

with open("hollyoaks_history.html", "r") as f:
    content = f.read()

expected_tag = '<script src="https://cdn.jsdelivr.net/npm/chart.js@4.5.1/dist/chart.umd.min.js" integrity="sha384-jb8JQMbMoBUzgWatfe6COACi2ljcDdZQ2OxczGA3bGNeWe+6DChMTBJemed7ZnvJ" crossorigin="anonymous"></script>'

if expected_tag in content:
    print("PASS: SRI script tag found correctly.")
    sys.exit(0)
else:
    print("FAIL: SRI script tag not found.")
    print("Found Chart.js occurrences:")
    for line in content.splitlines():
        if "chart.js" in line.lower():
            print(line.strip())
    sys.exit(1)
