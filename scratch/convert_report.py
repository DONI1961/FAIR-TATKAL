import os
import sys
from markdown_it import MarkdownIt

# Input and output paths
md_file = "/Users/doni/.gemini/antigravity/scratch/design-thinking/scratch/report_temp.md"
html_file = "/Users/doni/.gemini/antigravity/scratch/design-thinking/report.html"

# CSS for a premium look
CSS = """
body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    line-height: 1.6;
    color: #333;
    max-width: 900px;
    margin: 0 auto;
    padding: 40px;
    background: #fff;
}
h1, h2, h3 {
    color: #1a202c;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 8px;
    margin-top: 32px;
}
h1 { font-size: 2.5em; text-align: center; border-bottom: none; }
h2 { font-size: 1.8em; margin-top: 48px; }
hr { border: 0; border-top: 1px solid #e2e8f0; margin: 40px 0; }
img {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    margin: 20px 0;
    display: block;
    margin-left: auto;
    margin-right: auto;
}
code {
    background-color: #f7fafc;
    padding: 2px 4px;
    border-radius: 4px;
    font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
    font-size: 0.9em;
}
pre {
    background-color: #f7fafc;
    padding: 16px;
    border-radius: 8px;
    overflow-x: auto;
    border: 1px solid #e2e8f0;
}
blockquote {
    border-left: 4px solid #4299e1;
    padding-left: 16px;
    color: #4a5568;
    font-style: italic;
    margin: 20px 0;
}
table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
}
th, td {
    padding: 12px;
    border: 1px solid #e2e8f0;
    text-align: left;
}
th { background-color: #f7fafc; }
.mermaid {
    text-align: center;
    margin: 20px 0;
}
@media print {
    body { padding: 0; }
    h1, h2, h3 { page-break-after: avoid; }
    img { page-break-inside: avoid; }
    pre { page-break-inside: avoid; }
}
"""

def convert():
    try:
        with open(md_file, "r") as f:
            lines = f.readlines()
        
        # Remove line numbers from the file if they were added by view_file (though view_file output is what I saw, the file itself shouldn't have them)
        # Wait, the view_file output showed line numbers like "1: # ...".
        # I need to check if the file actually has them or if it was just the display.
        # Actually, view_file says "The following code has been modified to include a line number before every line".
        # So the file itself is likely clean. I'll read it directly.
        
        content = "".join(lines)
        
        md = MarkdownIt()
        html_content = md.render(content)
        
        full_html = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Smart Rail Report</title>
    <style>{CSS}</style>
</head>
<body>
    {html_content}
</body>
</html>"""
        
        with open(html_file, "w") as f:
            f.write(full_html)
        
        print(f"Successfully converted to {html_file}")
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    convert()
