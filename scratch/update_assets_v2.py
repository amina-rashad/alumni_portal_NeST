import base64
import os

bg_gold_path = r'C:\Users\shinto.sebastian\.gemini\antigravity\brain\c47c01ea-e5c1-481d-bc08-31c91ff61ed4\premium_gold_certificate_clean_bg_1778442112922.png'
logo_path = r'C:\Users\shinto.sebastian\.gemini\antigravity\brain\c47c01ea-e5c1-481d-bc08-31c91ff61ed4\nest_oval_logo_clean_1778442143476.png'
bg_navy_path = r'C:\Users\shinto.sebastian\.gemini\antigravity\brain\c47c01ea-e5c1-481d-bc08-31c91ff61ed4\navy_gold_event_certificate_bg_1778442830674.png'
output_path = r'd:\alumni_portal(NeST)\alumni_portal_NeST\src\utils\LogoBase64.ts'

def get_b64(path):
    with open(path, 'rb') as f:
        return base64.b64encode(f.read()).decode()

bg_gold_b64 = get_b64(bg_gold_path)
logo_b64 = get_b64(logo_path)
bg_navy_b64 = get_b64(bg_navy_path)

content = f'export const CERTIFICATE_BG = "data:image/png;base64,{bg_gold_b64}";\n'
content += f'export const NEST_OVAL_LOGO = "data:image/png;base64,{logo_b64}";\n'
content += f'export const EVENT_CERTIFICATE_BG = "data:image/png;base64,{bg_navy_b64}";\n'

with open(output_path, 'w') as f:
    f.write(content)

print("Successfully updated LogoBase64.ts with all assets.")
