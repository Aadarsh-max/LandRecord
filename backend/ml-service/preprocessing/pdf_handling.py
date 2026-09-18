import os
from io import BytesIO
from pdf2image import convert_from_bytes

POPPLER_PATH = os.getenv("POPPLER_PATH")


def is_pdf(filename):
    return filename.lower().endswith(".pdf")


def convert_pdf_to_images(pdf_bytes, dpi=200, max_pages=5):
    kwargs = {"dpi": dpi}
    if POPPLER_PATH:
        kwargs["poppler_path"] = POPPLER_PATH

    pages = convert_from_bytes(pdf_bytes, **kwargs)
    pages = pages[:max_pages]

    image_bytes_list = []
    for page in pages:
        buffer = BytesIO()
        page.convert("RGB").save(buffer, format="JPEG", quality=92)
        image_bytes_list.append(buffer.getvalue())

    return image_bytes_list