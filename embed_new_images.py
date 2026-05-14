import base64

def embed_image(html_path, image_path, search_str):
    with open(image_path, "rb") as image_file:
        encoded_string = base64.b64encode(image_file.read()).decode("utf-8")
    
    with open(html_path, "r") as html_file:
        html_content = html_file.read()
        
    # We are replacing the old base64 URI (or the old src attribute) with the new one.
    # Since we already replaced the src with base64 earlier, we need to find the specific img tags.
    # Let's just use re.sub to replace the src of the specific alt tags.
    import re
    data_uri = f"data:image/png;base64,{encoded_string}"
    
    if "Payment Failure Recovery" in search_str:
        html_content = re.sub(
            r'<img src="[^"]+" alt="Payment Failure Recovery"',
            f'<img src="{data_uri}" alt="Payment Failure Recovery"',
            html_content
        )
    elif "Multi-Language Voice Assist &amp; 2G-Safe Pattern" in search_str:
        html_content = re.sub(
            r'<img src="[^"]+" alt="Multi-Language Voice Assist &amp; 2G-Safe Pattern"',
            f'<img src="{data_uri}" alt="Multi-Language Voice Assist &amp; 2G-Safe Pattern"',
            html_content
        )

    with open(html_path, "w") as html_file:
        html_file.write(html_content)

html_file = "report.html"

# Embed the first image
embed_image(
    html_file, 
    "/Users/doni/.gemini/antigravity/brain/9a88a9ba-cfdf-4b16-80bc-a2c393b45268/refinements_4_5_voice_2g_1777805796518.png", 
    "Multi-Language Voice Assist &amp; 2G-Safe Pattern"
)

# Embed the second image
embed_image(
    html_file, 
    "/Users/doni/.gemini/antigravity/brain/9a88a9ba-cfdf-4b16-80bc-a2c393b45268/refinement_6_payment_failure_1777805782516.png", 
    "Payment Failure Recovery"
)

print("Successfully embedded new screenshots into report.html")
