import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import current_app

def send_email(to_email, subject, body, html_body=None):
    """
    Sends an email using the configured SMTP settings.
    Raises ValueError if SMTP credentials are not configured.
    """
    # Get config from current_app
    server = current_app.config.get("MAIL_SERVER")
    port = current_app.config.get("MAIL_PORT")
    username = current_app.config.get("MAIL_USERNAME")
    password = current_app.config.get("MAIL_PASSWORD")
    sender = current_app.config.get("MAIL_DEFAULT_SENDER")
    use_tls = current_app.config.get("MAIL_USE_TLS")

    # Raise an error if no credentials
    if not username or not password:
        raise ValueError("SMTP Configuration Error: Valid credentials must be provided to send emails.")

    try:
        # Create message
        msg = MIMEMultipart('alternative')
        msg['From'] = sender
        msg['To'] = to_email
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'plain'))
        if html_body:
            msg.attach(MIMEText(html_body, 'html'))

        # Connect and send
        smtp = smtplib.SMTP(server, port)
        if use_tls:
            smtp.starttls()
        
        smtp.login(username, password)
        smtp.send_message(msg)
        smtp.quit()
        return True
    except Exception as e:
        print(f"ERROR: Failed to send email to {to_email}: {e}")
        return False

def broadcast_email(recipients, subject, body):
    """Broadcasts an email to multiple recipients."""
    success_count = 0
    for email in recipients:
        if send_email(email, subject, body):
            success_count += 1
    return success_count
