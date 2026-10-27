import smtplib
import re
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import current_app

def send_email(to_email, subject, body, html_body=None):
    """
    Sends an email using the configured SMTP settings from ndaconnect@nestgroup.net.
    Raises ValueError if SMTP credentials are not configured.
    """
    server = current_app.config.get("MAIL_SERVER")
    port = current_app.config.get("MAIL_PORT")
    username = current_app.config.get("MAIL_USERNAME")
    password = current_app.config.get("MAIL_PASSWORD")
    sender = current_app.config.get("MAIL_DEFAULT_SENDER", username)
    use_tls = current_app.config.get("MAIL_USE_TLS")

    if not username or not password:
        raise ValueError("SMTP Configuration Error: Valid credentials must be provided to send emails.")

    # Determine HTML vs plain text
    if not html_body and ("<" in body and ">" in body):
        html_body = body
        plain_body = re.sub(r'<[^>]+>', ' ', body)
        plain_body = re.sub(r'\s+', ' ', plain_body).strip()
    else:
        plain_body = body

    try:
        msg = MIMEMultipart('alternative')
        msg['From'] = f"NeST Digital <{sender}>"
        msg['To'] = to_email
        msg['Subject'] = subject
        msg.attach(MIMEText(plain_body, 'plain'))
        if html_body:
            msg.attach(MIMEText(html_body, 'html'))

        smtp = smtplib.SMTP(server, port, timeout=25)
        if use_tls:
            smtp.starttls()
        
        smtp.login(username, password)
        smtp.sendmail(username, [to_email], msg.as_string())
        smtp.quit()
        print(f"SUCCESS: Email sent to {to_email} from {sender}")
        return True
    except Exception as e:
        print(f"ERROR: Failed to send email to {to_email}: {e}")
        return False

def broadcast_email(recipients, subject, body, html_body=None):
    """
    Broadcasts real emails to multiple recipients using a single authenticated SMTP session
    from ndaconnect@nestgroup.net.
    """
    if not recipients:
        return 0

    server = current_app.config.get("MAIL_SERVER")
    port = current_app.config.get("MAIL_PORT")
    username = current_app.config.get("MAIL_USERNAME")
    password = current_app.config.get("MAIL_PASSWORD")
    sender = current_app.config.get("MAIL_DEFAULT_SENDER", username)
    use_tls = current_app.config.get("MAIL_USE_TLS")

    if not username or not password:
        raise ValueError("SMTP Configuration Error: Valid credentials must be provided to send emails.")

    # Detect HTML formatting if present
    if not html_body and ("<" in body and ">" in body):
        html_body = body
        plain_body = re.sub(r'<[^>]+>', ' ', body)
        plain_body = re.sub(r'\s+', ' ', plain_body).strip()
    else:
        plain_body = body

    success_count = 0
    try:
        smtp = smtplib.SMTP(server, port, timeout=30)
        if use_tls:
            smtp.starttls()
        
        smtp.login(username, password)
        print(f"INFO: Logged into SMTP {server} as {username} for broadcast")

        for email in recipients:
            clean_email = (email or "").strip()
            if not clean_email or "@" not in clean_email:
                continue
            try:
                msg = MIMEMultipart('alternative')
                msg['From'] = f"NeST Digital <{sender}>"
                msg['To'] = clean_email
                msg['Subject'] = subject
                msg.attach(MIMEText(plain_body, 'plain'))
                if html_body:
                    msg.attach(MIMEText(html_body, 'html'))

                smtp.sendmail(username, [clean_email], msg.as_string())
                success_count += 1
                print(f"SUCCESS: Broadcast email delivered to {clean_email}")
            except Exception as single_err:
                print(f"ERROR: Failed to deliver broadcast to {clean_email}: {single_err}")

        smtp.quit()
    except Exception as batch_err:
        print(f"CRITICAL: SMTP broadcast session failure: {batch_err}")

    return success_count
