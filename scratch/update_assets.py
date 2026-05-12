import base64
import os

bg_path = r'C:\Users\shinto.sebastian\.gemini\antigravity\brain\c47c01ea-e5c1-481d-bc08-31c91ff61ed4\premium_gold_certificate_clean_bg_1778442112922.png'
logo_path = r'C:\Users\shinto.sebastian\.gemini\antigravity\brain\c47c01ea-e5c1-481d-bc08-31c91ff61ed4\nest_oval_logo_clean_1778442143476.png'
output_path = r'd:\alumni_portal(NeST)\alumni_portal_NeST\src\utils\LogoBase64.ts'

with open(bg_path, 'rb') as f:
    bg_b64 = base64.b64encode(f.read()).decode()

with open(logo_path, 'rb') as f:
    logo_b64 = base64.b64encode(f.read()).decode()

content = f'export const CERTIFICATE_BG = "data:image/png;base64,{bg_b64}";\n'
content += f'export const NEST_OVAL_LOGO = "data:image/png;base64,{logo_b64}";\n'

with open(output_path, 'w') as f:
    f.write(content)

print("Successfully updated LogoBase64.ts")
