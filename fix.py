import re

with open('c:/Users/noble.sibi/Downloads/alumni_portal_NeST/src/pages/Dashboard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the dark wrapper background
content = content.replace("backgroundColor: '#0F1523'", "backgroundColor: '#F8FAFC'")
content = content.replace("className=\"font-sans dark-dashboard\"", "className=\"font-sans light-dashboard\"")
content = content.replace("backgroundImage: `\n        radial-gradient(at 0% 0%, rgba(211, 47, 47, 0.08) 0px, transparent 40%),\n        radial-gradient(at 100% 0%, rgba(59, 130, 246, 0.08) 0px, transparent 40%)\n      `,", "")
content = content.replace("color: '#fff'", "color: '#0F172A'")

pattern = re.compile(r"<div style=\{\{ display: 'grid', gridTemplateColumns: 'minmax\(0, 1\.15fr\) minmax\(0, 1fr\)'.*?\{/\* REST OF SECTIONS", re.DOTALL)

replacement = """{/* TOP BANNER EXACTLY LIKE SCREENSHOT */}
        <div style={{
          background: '#FFF8F6',
          borderRadius: '32px',
          display: 'flex',
          overflow: 'hidden',
          minHeight: '440px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.03)',
          border: '1px solid rgba(0,0,0,0.05)',
          marginBottom: '2.5rem'
        }}>
          <div style={{ padding: '5rem', flex: '1.1', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
              <span style={{ fontWeight: 800, color: '#334155', letterSpacing: '0.12em', fontSize: '0.85rem', textTransform: 'uppercase' }}>Dashboard Overview</span>
              <span style={{ background: '#1E1B4B', color: '#fff', padding: '6px 16px', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.05em' }}>Alumni</span>
            </div>
            <h1 style={{ fontSize: '4.5rem', fontWeight: 900, color: '#0F172A', lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>
              Welcome back,<br/>
              <span style={{ color: '#EF4444' }}>{user ? user.full_name.split(' ')[0] : 'Amina'}</span>
            </h1>
            <p style={{ fontSize: '1.3rem', color: '#64748B', lineHeight: 1.6, maxWidth: '500px', fontWeight: 500, margin: 0 }}>
              Your alumni network is growing. Check out the latest updates and opportunities from classmates.
            </p>
          </div>
          <div style={{ flex: '1', position: 'relative' }}>
             <img src={bannerImg} alt="Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
             <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '150px', background: 'linear-gradient(to right, #FFF8F6, transparent)' }} />
          </div>
        </div>

        {/* REST OF SECTIONS"""

content = pattern.sub(replacement, content)

with open('c:/Users/noble.sibi/Downloads/alumni_portal_NeST/src/pages/Dashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Done!')
