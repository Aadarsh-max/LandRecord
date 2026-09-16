def build_satellite_embed_url(latitude, longitude, zoom=17):
    return f"https://www.google.com/maps?q={latitude},{longitude}&z={zoom}&t=k&output=embed"


def build_satellite_link(latitude, longitude):
    return f"https://www.google.com/maps/@{latitude},{longitude},{18}z/data=!3m1!1e3"