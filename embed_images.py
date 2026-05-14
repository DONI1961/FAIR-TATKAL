import base64

def embed_image(html_path, image_path, search_str):
    with open(image_path, "rb") as image_file:
        encoded_string = base64.b64encode(image_file.read()).decode("utf-8")
    
    with open(html_path, "r") as html_file:
        html_content = html_file.read()
        
    data_uri = f"data:image/png;base64,{encoded_string}"
    
    html_content = html_content.replace(search_str, data_uri)
    
    with open(html_path, "w") as html_file:
        html_file.write(html_content)

html_file = "report.html"

# Embed the first image
embed_image(
    html_file, 
    "report_assets/voice_and_2g_refinement.png", 
    'report_assets/voice_and_2g_refinement.png'
)

# Embed the second image
embed_image(
    html_file, 
    "report_assets/payment_failure_refinement.png", 
    'report_assets/payment_failure_refinement.png'
)

print("Successfully embedded images directly into report.html as base64 data URIs.")
