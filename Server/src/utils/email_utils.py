"""Email service for sending password reset emails via Gmail."""

import asyncio
import logging
import os
import smtplib
from concurrent.futures import ThreadPoolExecutor
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from src.config import SMTP_EMAIL, SMTP_PASSWORD

# Configure simple logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

executor = ThreadPoolExecutor(max_workers=5)

class EmailService:
    """Gmail SMTP email service."""

    def __init__(self):
        self.smtp_server = "smtp.gmail.com"
        self.smtp_port = 465  # Use 465 for SSL (more reliable on Render)
        self.sender_email = SMTP_EMAIL
        self.sender_password = SMTP_PASSWORD
        self.sender_name = "PharmaPilot"
        
        # Safe logging
        has_email = bool(self.sender_email)
        has_password = bool(self.sender_password)
        logger.info(f"EmailService loaded. Has email: {has_email}, Has password: {has_password}")

    # ... (skipping unchanged methods until send_password_reset_email connection block)

    # Note: I need to target the connection block separately or include the whole file if I can't target cleanly.
    # I will replace the __init__ and the connection block in two chunks or one if close enough?
    # They are far apart. I will use multi_replace.
    # Wait, the tool is replace_file_content (single block). 
    # I will use multi_replace_file_content.
    pass

    def is_configured(self) -> bool:
        """Check if Gmail is properly configured."""
        # DIAGNOSTIC: Print status to console
        valid = bool(self.sender_email and self.sender_password)
        if not valid:
            print("----------------------------------------------------------------")
            print("⚠️ EMAIL SERVICE DEBUG: Credentials missing in initialized service.")
            print(f"Current Email: {self.sender_email}")
            print(f"Current Password: {'******' if self.sender_password else 'None'}")
            
            # Attempt lazy reload from environment
            from dotenv import load_dotenv
            load_dotenv()
            self.sender_email = os.getenv("SMTP_EMAIL")
            self.sender_password = os.getenv("SMTP_PASSWORD")
            print(f"Reloading from Env... New Email: {self.sender_email}")
            print("----------------------------------------------------------------")
            
        return bool(self.sender_email and self.sender_password)

    def send_password_reset_email(self, recipient_email: str, reset_token: str, user_name: str = "User") -> bool:
        """Send password reset email."""
        if not self.is_configured():
            logger.warning("EmailService not configured: missing SMTP_EMAIL or SMTP_PASSWORD")
            return False

        try:
            # Use production frontend URL from environment or fallback to localhost
            frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
            reset_link = f"{frontend_url}/reset-password?token={reset_token}"

            message = MIMEMultipart("alternative")
            message["Subject"] = "Reset Your PharmaPilot Password"
            message["From"] = f"{self.sender_name} <{self.sender_email}>"
            message["To"] = recipient_email

            html_content = f"""<!DOCTYPE html>
<html>
  <head>
    <meta charset=\"UTF-8\">
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
  </head>
  <body style=\"font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px; margin: 0;\">
    <div style=\"max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);\">
      <h2 style=\"color: #333; text-align: center; margin-bottom: 20px;\">🔐 Reset Your Password</h2>
      <p style=\"color: #666; font-size: 14px;\">Hi {user_name},</p>
      <p style=\"color: #666; font-size: 14px; line-height: 1.6;\">
        We received a request to reset your PharmaPilot password. Click the button below to create a new password.
      </p>
      <div style=\"text-align: center; margin: 30px 0;\">
        <a href=\"{reset_link}\" style=\"background-color: #009688; color: white; padding: 15px 40px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block; font-size: 16px;\">
          Reset Password
        </a>
      </div>
      <p style=\"color: #666; font-size: 13px; line-height: 1.6;\">
        Or copy and paste this link in your browser:
      </p>
      <p style=\"background-color: #f0f0f0; padding: 12px; border-radius: 4px; word-wrap: break-word; overflow-wrap: break-word; font-size: 12px; color: #333;\">
        {reset_link}
      </p>
      <div style=\"background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 20px 0; border-radius: 4px;\">
        <p style=\"color: #856404; font-size: 12px; margin: 0; line-height: 1.5;\">
          <strong>⏰ Important:</strong> This link expires in 30 minutes. If you didn't request this, please ignore this email.
        </p>
      </div>
      <hr style=\"border: none; border-top: 1px solid #ddd; margin: 20px 0;\">
      <p style=\"color: #999; font-size: 12px; text-align: center; margin: 0;\">
        PharmaPilot - AI-Powered Pharmaceutical Research Platform<br>
        © 2025 EY Technathon 6.0
      </p>
    </div>
  </body>
</html>
"""

            text_content = f"""
Reset Your PharmaPilot Password

Hi {user_name},

We received a request to reset your PharmaPilot password.

Click this link to reset your password:
{reset_link}

This link expires in 30 minutes.

If you didn't request this, please ignore this email.

PharmaPilot - AI-Powered Pharmaceutical Research Platform
"""

            message.attach(MIMEText(text_content, "plain"))
            message.attach(MIMEText(html_content, "html"))

            # Force IPv4 resolution to fix [Errno 101] Network is unreachable on Render/Docker
            # smtp.gmail.com often resolves to IPv6 which fails in some containers
            import socket
            smtp_host = self.smtp_server
            try:
                # Get the first IPv4 address
                addr_info = socket.getaddrinfo(self.smtp_server, self.smtp_port, socket.AF_INET, socket.SOCK_STREAM)
                if addr_info:
                    smtp_host = addr_info[0][4][0]  # Extract IP address
                    logger.info(f"Resolved {self.smtp_server} to IPv4: {smtp_host}")
            except Exception as dns_err:
                logger.warning(f"Failed to resolve IPv4 for {self.smtp_server}: {dns_err}")
                # Fallback to hostname

            logger.info(f"Attempting to send email to {recipient_email} via {smtp_host}:{self.smtp_port}")
            
            # Using SMTP_SSL for port 465 (Implicit SSL)
            # We use the resolved IP (smtp_host) but MUST pass the original hostname
            # to context for certificate verification if checking hostname
            import ssl
            context = ssl.create_default_context()
            
            # Connect to the IP directly
            with smtplib.SMTP_SSL(smtp_host, self.smtp_port, context=context, timeout=15) as server:
                logger.info("SSL connection established, attempting login...")
                server.login(self.sender_email, self.sender_password)
                logger.info("Login successful, sending message...")
                server.send_message(message)
                logger.info(f"Email sent successfully to {recipient_email}")

            logger.info(f"Password reset email sent to {recipient_email}")
            return True
            
        except smtplib.SMTPAuthenticationError as exc:
            logger.error(f"SMTP authentication failed: {exc}")
            print(f"❌ EMAIL ERROR: Authentication Failed. Msg: {exc}")
            print("👉 Check your Gmail App Password.")
            return False
        except smtplib.SMTPException as exc:
            logger.error(f"SMTP error: {exc}")
            print(f"❌ EMAIL ERROR: General SMTP Error. Msg: {exc}")
            return False
        except Exception as exc:
            logger.error(f"Unexpected error sending email: {exc}")
            print(f"❌ EMAIL ERROR: Unexpected. Type: {type(exc).__name__}, Msg: {exc}")
            return False

# Initialize the service singleton
email_service = EmailService()

# Backward compatibility wrapper for auth_flask.py
def send_reset_email(to_email: str, reset_token: str) -> bool:
    """Wrapper function to maintain compatibility with existing code"""
    return email_service.send_password_reset_email(to_email, reset_token)
