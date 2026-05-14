import re

with open('report.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Regex to find src="/Users/doni/.gemini/antigravity/brain/.../filename.ext"
def repl(match):
    full_path = match.group(1)
    filename = full_path.split('/')[-1]
    return f'src="report_assets/{filename}"'

new_content = re.sub(r'src="(/Users/doni/\.gemini/antigravity/brain/[^"]+)"', repl, content)

with open('report.html', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("HTML updated.")
