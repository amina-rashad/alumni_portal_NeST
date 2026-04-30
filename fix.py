import os
import re

def resolve_file(filepath, keep='both'):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Pattern to match git conflict markers
    pattern = re.compile(r'<<<<<<< Updated upstream\n(.*?)\n=======\n(.*?)\n>>>>>>> Stashed changes\n', re.DOTALL)
    
    def replacer(match):
        upstream = match.group(1)
        stashed = match.group(2)
        if keep == 'both':
            return upstream + '\n' + stashed + '\n'
        elif keep == 'stashed':
            return stashed + '\n'
        else:
            return upstream + '\n'

    resolved_content = pattern.sub(replacer, content)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(resolved_content)

resolve_file('src/pages/admin/AdminDashboard.tsx', 'stashed')
resolve_file('src/pages/admin/AdminUsers.tsx', 'stashed')
resolve_file('src/pages/ViewProfile.tsx', 'stashed')
resolve_file('src/pages/EditProfile.tsx', 'both')
print("Conflicts resolved programmatically!")
