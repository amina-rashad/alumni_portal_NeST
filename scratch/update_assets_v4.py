import base64

def get_b64(path):
    with open(path, 'rb') as f:
        return base64.b64encode(f.read()).decode()

bg_new_path = r'C:\Users\shinto.sebastian\.gemini\antigravity\brain\c47c01ea-e5c1-481d-bc08-31c91ff61ed4\red_blue_geometric_certificate_bg_1778444914024.png'
logo_white_path = r'C:\Users\shinto.sebastian\.gemini\antigravity\brain\c47c01ea-e5c1-481d-bc08-31c91ff61ed4\nest_oval_logo_clean_1778442143476.png'
output_path = r'd:\alumni_portal(NeST)\alumni_portal_NeST\src\utils\LogoBase64.ts'

content = f'export const CERTIFICATE_BG = "data:image/png;base64,{get_b64(bg_new_path)}";\n'
content += f'export const NEST_OVAL_LOGO = "data:image/png;base64,{get_b64(logo_white_path)}";\n'
content += f'export const EVENT_CERTIFICATE_BG = "data:image/png;base64,{get_b64(bg_new_path)}";\n'

with open(output_path, 'w') as f:
    f.write(content)

print("Successfully updated LogoBase64.ts with new geometric template.")
