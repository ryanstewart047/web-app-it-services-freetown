#!/usr/bin/env python3
"""
BridgeTech IT Services - Freetown Flood Emergency Safety Broadcast CLI
========================================================================
Sends an urgent, caring flood safety warning and emergency advisory to all customers,
including the 117 national emergency hotline and the interactive safety reveal link.

Usage:
  python3 scripts/send-flood-emergency-alert.py --dry-run
  python3 scripts/send-flood-emergency-alert.py --test your-email@gmail.com
  python3 scripts/send-flood-emergency-alert.py --broadcast
"""

import sys
import os
import re
import argparse
import smtplib
import ssl
import time
import urllib.parse
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

REVEAL_URL = "https://www.itservicesfreetown.com/flood-safety-guide"
BRAND_NAME = "BridgeTech IT Services"
BRAND_PHONE = "+232 33 399391"
EMERGENCY_HOTLINE = "117"

def load_env(env_path=".env"):
    if not os.path.exists(env_path):
        return {}
    config = {}
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, val = line.split("=", 1)
                val = val.strip().strip('"').strip("'")
                config[key.strip()] = val
    return config

def get_db_emails(database_url):
    import pg8000.native
    parsed = urllib.parse.urlparse(database_url)
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    con = pg8000.native.Connection(
        user=parsed.username,
        password=parsed.password,
        host=parsed.hostname,
        port=parsed.port or 5432,
        database=parsed.path.lstrip("/"),
        ssl_context=ctx
    )

    emails = set()
    # 1. Customer table
    try:
        for row in con.run("SELECT email FROM \"Customer\" WHERE email IS NOT NULL AND email != ''"):
            e = row[0].strip().lower()
            if "@" in e and "." in e:
                emails.add(e)
    except Exception as e:
        print(f"Warning reading Customer table: {e}")

    # 2. EmailLead table (active only)
    try:
        for row in con.run("SELECT email FROM \"EmailLead\" WHERE \"deliveryFailed\" = false AND email IS NOT NULL AND email != ''"):
            e = row[0].strip().lower()
            if "@" in e and "." in e:
                emails.add(e)
    except Exception as e:
        print(f"Warning reading EmailLead table: {e}")

    # 3. Order table
    try:
        for row in con.run("SELECT \"customerEmail\" FROM \"Order\" WHERE \"customerEmail\" IS NOT NULL AND \"customerEmail\" != ''"):
            e = row[0].strip().lower()
            if "@" in e and "." in e:
                emails.add(e)
    except Exception as e:
        print(f"Warning reading Order table: {e}")

    # 4. Receipt table
    try:
        for row in con.run("SELECT \"customerEmail\" FROM \"Receipt\" WHERE \"customerEmail\" IS NOT NULL AND \"customerEmail\" != ''"):
            e = row[0].strip().lower()
            if "@" in e and "." in e:
                emails.add(e)
    except Exception as e:
        print(f"Warning reading Receipt table: {e}")

    con.close()
    return sorted(list(emails))

def create_email_content(recipient_email=""):
    subject = "⚠️ URGENT: Freetown Heavy Rain & Flood Safety Advisory — Dial 117 for Emergency Help"

    text_body = f"""
URGENT SAFETY ADVISORY: FREETOWN HEAVY RAINFALL & FLOOD WARNING
From: BridgeTech IT Services Community Care Team
Emergency Hotline: Dial 117 (Toll-Free, 24/7 across Sierra Leone)

Dear Valued Customer & Community Member,

Continuous heavy rainfall across Freetown has created severe flooding and mudslide hazards across low-lying and hillside communities. Because Freetown's terrain and drainage infrastructure can flood rapidly with devastating consequences, your safety and the safety of your family is our highest priority.

🚨 NATIONAL EMERGENCY TOLL-FREE HOTLINE: 117
If you or anyone around you is in distress, trapped by rising waters, or witness a landslide or collapsed structure, dial 117 immediately from any mobile network (Africell, Orange, QCell) to reach the National Disaster Management Agency (NDMA).

⚠️ CRITICAL FLOOD SAFETY MEASURES:
1. NEVER walk or drive through flowing water. Just 15 cm (6 inches) of moving water can knock an adult down.
2. Avoid drainage culverts, bridges, and gutter banks—they can collapse or conceal violent underwater suction.
3. If living in steep hillside or low-lying basin areas, move early to higher ground or community shelters.
4. Check on elderly family members, children, and vulnerable neighbors.

🔌 CRITICAL TECH & ELECTRICAL PROTECTION:
1. UNPLUG EVERYTHING: Unplug laptops, desktop PCs, TVs, routers, and power strips from wall sockets right now. Power surges during rainstorms destroy delicate motherboards and components.
2. ELEVATE VALUABLES: Move your computers, phones, backup hard drives, and crucial documents off the floor onto high tables or top shelves.
3. MAIN BREAKER: If water begins entering your home or office, turn off your main electrical power breaker switch immediately to prevent lethal electrocution and electrical fires.
4. WATER-DAMAGED DEVICES: If a phone or laptop gets wet, DO NOT power it on or plug it into a charger. Powering a wet device instantly fries internal chips. Keep it turned off and contact our technicians once the weather clears.

🌟 INTERACTIVE FLOOD SAFETY REVEAL:
We have created an interactive Safety Reveal guide with safety checklists and emergency details.
Tap here to view and share with family:
{REVEAL_URL}

Please stay indoors, stay off the roads, and call 117 in any emergency.

With care and solidarity,
The Management & Technical Team
BridgeTech IT Services
#1 Regent Highway, Jui Junction, Freetown
Helpline: {BRAND_PHONE}
Website: https://www.itservicesfreetown.com
"""

    html_body = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Freetown Heavy Rain & Flood Safety Warning</title>
</head>
<body style="margin:0; padding:0; background-color:#f1f5f9; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color:#1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f1f5f9; padding:20px 10px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" width="100%" max-width="620" cellspacing="0" cellpadding="0" border="0" style="max-width:620px; background-color:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 10px 25px rgba(0,0,0,0.08); border:1px solid #e2e8f0;">
          
          <!-- Top Emergency Header Banner -->
          <tr>
            <td style="background:linear-gradient(135deg, #b91c1c 0%, #dc2626 50%, #991b1b 100%); padding:28px 24px; text-align:center;">
              <span style="background-color:rgba(255,255,255,0.2); color:#ffffff; font-size:11px; font-weight:800; letter-spacing:2px; text-transform:uppercase; padding:6px 14px; border-radius:20px; display:inline-block; margin-bottom:12px; border:1px solid rgba(255,255,255,0.3);">
                🚨 Urgent Community Safety Advisory
              </span>
              <h1 style="margin:0; color:#ffffff; font-size:24px; font-weight:800; line-height:1.3; letter-spacing:-0.5px;">
                Freetown Heavy Rain &amp; Flood Warning
              </h1>
              <p style="margin:8px 0 0 0; color:#fee2e2; font-size:14px; line-height:1.4;">
                From the Community Response Team at BridgeTech IT Services
              </p>
            </td>
          </tr>

          <!-- Emergency 117 Callout Box -->
          <tr>
            <td style="padding:24px 24px 12px 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#fef2f2; border:2px solid #ef4444; border-radius:12px; padding:18px;">
                <tr>
                  <td align="center">
                    <p style="margin:0 0 6px 0; color:#991b1b; font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:1px;">
                      National Emergency Toll-Free Hotline
                    </p>
                    <p style="margin:0; color:#dc2626; font-size:38px; font-weight:900; line-height:1;">
                      DIAL 117
                    </p>
                    <p style="margin:8px 0 0 0; color:#7f1d1d; font-size:13px; line-height:1.4;">
                      <strong>Free call from all networks</strong> (Africell, Orange, QCell) for flood rescue, landslides, or emergency assistance through the National Disaster Management Agency (NDMA).
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Letter Body -->
          <tr>
            <td style="padding:12px 24px 20px 24px; font-size:15px; line-height:1.6; color:#334155;">
              <p style="margin-top:0;">
                Dear Valued Customer and Freetown Resident,
              </p>
              <p>
                Continuous torrential rains have been pouring across Freetown for several hours. As we have seen in past severe weather events, Freetown's unique geography makes our low-lying basins and steep hillside slopes extremely vulnerable to rapid flash floods, mudslides, and property damage.
              </p>
              <p style="background-color:#fffbeb; border-left:4px solid #f59e0b; padding:12px 16px; border-radius:0 8px 8px 0; margin:16px 0; color:#92400e; font-size:14px;">
                <strong>⚠️ Your life and your family's safety are irreplaceable.</strong> Please take every precaution immediately to protect yourself, your children, and your neighbors.
              </p>
            </td>
          </tr>

          <!-- Key Flood Safety Precautions -->
          <tr>
            <td style="padding:0 24px 20px 24px;">
              <h3 style="margin:0 0 12px 0; color:#0f172a; font-size:16px; font-weight:700; border-bottom:2px solid #e2e8f0; padding-bottom:8px;">
                🛑 Critical Flood Safety Rules
              </h3>
              <ul style="margin:0; padding-left:20px; color:#334155; font-size:14px; line-height:1.7;">
                <li><strong>Do NOT attempt to walk, wade, or drive through moving water:</strong> Just 15 cm (6 inches) of swift water can sweep an adult off their feet; 30 cm can float a vehicle.</li>
                <li><strong>Stay far away from open drainage canals, gutters, and low bridges:</strong> Drainages in areas like Kroo Bay, Culvert, Susan's Bay, Dwarzark, Congo Market, and Wellington can collapse without warning.</li>
                <li><strong>Move to higher ground early:</strong> If you notice rising water levels in your compound, do not wait until escape routes are blocked.</li>
                <li><strong>Assist vulnerable neighbors:</strong> Check on elderly relatives, nursing mothers, and children who may need assistance moving to safe ground.</li>
              </ul>
            </td>
          </tr>

          <!-- Electrical & Tech Protection -->
          <tr>
            <td style="padding:0 24px 20px 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f0f9ff; border:1px solid #bae6fd; border-radius:12px; padding:16px;">
                <tr>
                  <td>
                    <h4 style="margin:0 0 8px 0; color:#0369a1; font-size:15px; font-weight:700;">
                      🔌 Urgent Tech &amp; Electrical Precautions
                    </h4>
                    <ul style="margin:0; padding-left:18px; color:#0c4a6e; font-size:13px; line-height:1.6;">
                      <li><strong>Unplug electronics immediately:</strong> Disconnect laptops, desktop computers, TVs, routers, and power strips from wall outlets to guard against lethal power surges.</li>
                      <li><strong>Elevate equipment:</strong> Move computers, mobile phones, backup hard drives, and crucial documents off the floor onto high tables.</li>
                      <li><strong>Turn off the main breaker:</strong> If water begins entering your home or office, turn off your main electrical power breaker switch immediately to prevent electrocution and electrical fires.</li>
                      <li><strong>Never turn on wet electronics:</strong> If a phone, laptop, or charger has come into contact with water, DO NOT power it on or plug it into electricity. Doing so instantly destroys internal circuits.</li>
                    </ul>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Step-by-Step Flood Safety Guide Call-To-Action -->
          <tr>
            <td align="center" style="padding:10px 24px 28px 24px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="border-radius:12px; background:linear-gradient(135deg, #b91c1c 0%, #dc2626 100%);">
                    <a href="{REVEAL_URL}" target="_blank" rel="noopener noreferrer" style="display:inline-block; padding:16px 32px; color:#ffffff; font-size:16px; font-weight:800; text-decoration:none; border-radius:12px; letter-spacing:0.3px; box-shadow:0 4px 14px rgba(220,38,38,0.4);">
                      🚨 Open Step-by-Step Flood Safety Guide &rarr;
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:10px 0 0 0; color:#64748b; font-size:12px;">
                Complete life safety protocols, 117 emergency details, and community WhatsApp share.
              </p>
            </td>
          </tr>

          <!-- Emergency Hotlines Directory Table -->
          <tr>
            <td style="padding:0 24px 24px 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:14px; font-size:12px; color:#475569;">
                <tr>
                  <td style="padding:4px 0;"><strong>National Disaster &amp; Emergency:</strong></td>
                  <td style="padding:4px 0; text-align:right;"><strong style="color:#dc2626; font-size:14px;">117</strong> (Toll-Free)</td>
                </tr>
                <tr>
                  <td style="padding:4px 0;"><strong>Sierra Leone Police Emergency:</strong></td>
                  <td style="padding:4px 0; text-align:right;"><strong>112 / 999</strong></td>
                </tr>
                <tr>
                  <td style="padding:4px 0;"><strong>National Fire Force:</strong></td>
                  <td style="padding:4px 0; text-align:right;"><strong>076 611 999</strong></td>
                </tr>
                <tr>
                  <td style="padding:4px 0;"><strong>BridgeTech Tech Helpline:</strong></td>
                  <td style="padding:4px 0; text-align:right;"><strong>{BRAND_PHONE}</strong></td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer Section -->
          <tr>
            <td style="background-color:#0f172a; padding:24px; text-align:center; color:#94a3b8; font-size:12px; line-height:1.5;">
              <p style="margin:0 0 6px 0; color:#ffffff; font-weight:700; font-size:13px;">
                {BRAND_NAME}
              </p>
              <p style="margin:0 0 10px 0;">
                #1 Regent Highway, Jui Junction | Freetown, Sierra Leone
              </p>
              <p style="margin:0; font-size:11px; color:#64748b;">
                You received this high-priority emergency advisory because you are a registered customer or subscriber of BridgeTech IT Services.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""
    return subject, text_body, html_body

def send_alert_emails(recipients, smtp_config, dry_run=False):
    host = smtp_config.get("SMTP_HOST", "smtp.gmail.com")
    port = int(smtp_config.get("SMTP_PORT", 587))
    user = smtp_config.get("SMTP_USER")
    password = smtp_config.get("SMTP_PASS")

    if not user or not password:
        print("Error: SMTP_USER or SMTP_PASS not found in environment!")
        return False

    print(f"\n=======================================================")
    print(f"🚨 FREETOWN FLOOD EMERGENCY BROADCAST")
    print(f"=======================================================")
    print(f"Recipients count : {len(recipients)}")
    print(f"SMTP Server      : {host}:{port}")
    print(f"Sender           : {user}")
    print(f"Reveal URL       : {REVEAL_URL}")
    print(f"Dry run mode     : {'YES (No emails will be sent)' if dry_run else 'NO (LIVE BROADCAST)'}")
    print(f"=======================================================\n")

    if dry_run:
        print("Preview of recipients (first 10):")
        for idx, email in enumerate(recipients[:10], 1):
            print(f"  {idx}. {email}")
        if len(recipients) > 10:
            print(f"  ... and {len(recipients) - 10} more.")
        print("\nDry-run completed successfully! Use --broadcast to send live or --test <email> to test.")
        return True

    ctx = ssl.create_default_context()
    try:
        server = smtplib.SMTP(host, port, timeout=20)
        server.starttls(context=ctx)
        server.login(user, password)
        print("Connected to SMTP mail server successfully. Dispatching emergency emails...")
    except Exception as e:
        print(f"Failed to connect to SMTP server: {e}")
        return False

    sent_count = 0
    fail_count = 0

    for idx, to_email in enumerate(recipients, 1):
        try:
            subject, text_content, html_content = create_email_content(to_email)
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"BridgeTech IT Services Safety Alert <{user}>"
            msg["To"] = to_email
            msg["Reply-To"] = user

            msg.attach(MIMEText(text_content, "plain", "utf-8"))
            msg.attach(MIMEText(html_content, "html", "utf-8"))

            server.sendmail(user, [to_email], msg.as_string())
            sent_count += 1
            print(f"[{idx}/{len(recipients)}] ✅ Sent to: {to_email}")
            time.sleep(0.3)  # Gentle throttle for Gmail SMTP rate limits
        except Exception as err:
            fail_count += 1
            print(f"[{idx}/{len(recipients)}] ❌ Failed to {to_email}: {err}")
            # Reconnect if pipe broke
            try:
                server.quit()
            except:
                pass
            try:
                server = smtplib.SMTP(host, port, timeout=20)
                server.starttls(context=ctx)
                server.login(user, password)
            except:
                pass

    try:
        server.quit()
    except:
        pass

    print(f"\n=======================================================")
    print(f"BROADCAST SUMMARY")
    print(f"Total Sent Successfully : {sent_count}")
    print(f"Failed Deliveries       : {fail_count}")
    print(f"=======================================================\n")
    return sent_count > 0

def main():
    parser = argparse.ArgumentParser(description="Send Freetown Flood Emergency Safety Advisory to customers.")
    parser.add_argument("--dry-run", action="store_true", help="Preview message and recipients without sending.")
    parser.add_argument("--test", type=str, help="Send a single test email to the specified address.")
    parser.add_argument("--broadcast", action="store_true", help="Send emergency broadcast to ALL customers in DB.")

    args = parser.parse_args()

    if not args.dry_run and not args.test and not args.broadcast:
        parser.print_help()
        sys.exit(1)

    env = load_env()
    db_url = env.get("DATABASE_URL")
    if not db_url:
        print("DATABASE_URL is missing from .env")
        sys.exit(1)

    if args.test:
        recipients = [args.test.strip()]
        print(f"Running single test send to: {recipients[0]}")
    else:
        print("Gathering unique customer emails from live database...")
        recipients = get_db_emails(db_url)
        print(f"Found {len(recipients)} unique verified customer recipients.")

    if not recipients:
        print("No recipient emails found!")
        sys.exit(1)

    success = send_alert_emails(recipients, env, dry_run=args.dry_run)
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
