import base64

def get_b64(path):
    with open(path, 'rb') as f:
        return base64.b64encode(f.read()).decode()

bg_path = r'C:\Users\shinto.sebastian\.gemini\antigravity\brain\c47c01ea-e5c1-481d-bc08-31c91ff61ed4\dynamic_red_blue_geometric_bg_v2_1778445535879.png'
logo_path = r'C:\Users\shinto.sebastian\.gemini\antigravity\brain\c47c01ea-e5c1-481d-bc08-31c91ff61ed4\nest_oval_logo_clean_1778442143476.png'
output_path = r'd:\alumni_portal(NeST)\alumni_portal_NeST\src\utils\LogoBase64.ts'

b64_bg = get_b64(bg_path)
b64_logo = get_b64(logo_path)

content = f'export const CERTIFICATE_BG = "data:image/png;base64,{b64_bg}";\n'
content += f'export const NEST_OVAL_LOGO = "data:image/png;base64,{b64_logo}";\n'
content += f'export const EVENT_CERTIFICATE_BG = "data:image/png;base64,{b64_bg}";\n'

with open(output_path, 'w') as f:
    f.write(content)

print("Successfully updated LogoBase64.ts with dynamic geometric template.")
