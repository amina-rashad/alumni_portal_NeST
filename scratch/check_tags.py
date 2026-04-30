import re

def check_tags(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Simple regex to find <tag and </tag
    # This is naive but can help find obvious mismatches
    open_tags = re.findall(r'<([a-zA-Z0-9.]+)(?:\s|>|/)', content)
    # Filter out self-closing tags and components
    # This is getting complicated. Let's just count divs.
    
    divs_open = len(re.findall(r'<div', content))
    divs_close = len(re.findall(r'</div', content))
    
    print(f"File: {filename}")
    print(f"  div open: {divs_open}, close: {divs_close}")
    
    motion_divs_open = len(re.findall(r'<motion.div', content))
    motion_divs_close = len(re.findall(r'</motion.div', content))
    print(f"  motion.div open: {motion_divs_open}, close: {motion_divs_close}")

check_tags('src/pages/CourseDetails.tsx')
check_tags('src/pages/CourseListing.tsx')
