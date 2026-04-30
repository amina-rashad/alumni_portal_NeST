import re

def check_balance(filename, tag):
    with open(filename, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    stack = []
    for i, line in enumerate(lines):
        # Find all <tag and </tag
        # This is still naive but better if we look line by line
        parts = re.split(r'(</?'+tag+r'[^>]*>)', line)
        for part in parts:
            if part.startswith('<'+tag):
                if not part.endswith('/>'):
                    stack.append(i+1)
            elif part.startswith('</'+tag):
                if stack:
                    stack.pop()
                else:
                    print(f"Extra closing {tag} at line {i+1}")
    
    if stack:
        for line_num in stack:
            print(f"Unclosed {tag} from line {line_num}")

print("Checking CourseDetails.tsx")
check_balance('src/pages/CourseDetails.tsx', 'div')
print("Checking CourseListing.tsx")
check_balance('src/pages/CourseListing.tsx', 'div')
