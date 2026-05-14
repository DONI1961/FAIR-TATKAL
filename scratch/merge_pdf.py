from PIL import Image
import os

# Screenshot paths
images = [
    "/Users/doni/.gemini/antigravity/brain/a0a7c45c-798c-46cf-bb18-1162c74dd02c/report_part_1_1777465639970.png",
    "/Users/doni/.gemini/antigravity/brain/a0a7c45c-798c-46cf-bb18-1162c74dd02c/report_part_2_1777465659610.png",
    "/Users/doni/.gemini/antigravity/brain/a0a7c45c-798c-46cf-bb18-1162c74dd02c/report_part_3_1777465680546.png"
]

output_pdf = "/Users/doni/.gemini/antigravity/scratch/design-thinking/smart_rail_flow_report.pdf"

def make_pdf():
    try:
        pil_images = []
        for img_path in images:
            img = Image.open(img_path)
            # Convert to RGB as PDF doesn't support RGBA in the same way
            if img.mode == 'RGBA':
                # Create a white background for transparent areas
                background = Image.new("RGB", img.size, (255, 255, 255))
                background.paste(img, mask=img.split()[3])
                pil_images.append(background)
            else:
                pil_images.append(img.convert('RGB'))
        
        if pil_images:
            # Save the first image as the first page, and the rest as subsequent pages
            pil_images[0].save(
                output_pdf, "PDF", resolution=100.0, save_all=True, append_images=pil_images[1:]
            )
            print(f"Successfully created PDF: {output_pdf}")
        else:
            print("No images found.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    make_pdf()
