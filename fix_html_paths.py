import re

with open("report.html", "r") as f:
    html_content = f.read()

# Replace the base64 images back to relative paths
html_content = re.sub(
    r'<img src="data:image/png;base64,[^"]+" alt="Multi-Language Voice Assist &amp; 2G-Safe Pattern"',
    '<img src="report_assets/voice_and_2g_refinement.png" alt="Multi-Language Voice Assist &amp; 2G-Safe Pattern"',
    html_content
)

html_content = re.sub(
    r'<img src="data:image/png;base64,[^"]+" alt="Payment Failure Recovery"',
    '<img src="report_assets/payment_failure_refinement.png" alt="Payment Failure Recovery"',
    html_content
)

with open("report.html", "w") as f:
    f.write(html_content)

print("Reverted base64 to relative paths in report.html")
