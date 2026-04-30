const fs = require('fs');
const path = require('path');
const dir = 'd:/alumni_portal(NeST)/alumni_portal_NeST/src/pages/course_manager';

const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx') && f !== 'Dashboard.tsx');

const patterns = [
    'className="cm-animate-fade-up flex flex-col gap-8"',
    'className="cm-animate-fade-up space-y-8"',
    'className="cm-animate-fade-up space-y-10"'
];

const replacement = 'className="cm-animate-fade-up" style={{ maxWidth: "1350px", margin: "0 auto", padding: "0 32px 48px 32px", display: "flex", flexDirection: "column", gap: "32px", fontFamily: "\\"Inter\\", sans-serif" }}';

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    let modified = false;
    
    patterns.forEach(p => {
        if (content.includes(p)) {
            content = content.replace(p, replacement);
            modified = true;
        }
    });
    
    if (modified) {
        fs.writeFileSync(filePath, content);
        console.log('Updated ' + file);
    }
});
