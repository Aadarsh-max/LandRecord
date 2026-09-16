from gis.boundary_extraction import resolve_coordinates
from gis.satellite_view import build_satellite_embed_url, build_satellite_link
from gis.area_consistency_check import check_area_plausibility


def build_map_marker(land_record):
    coordinates = resolve_coordinates(land_record.get("village"), land_record.get("district"))

    area_check = check_area_plausibility(
        land_record.get("plot_area"),
        land_record.get("land_classification")
    )

    if not coordinates:
        return {"available": False, "area_check": area_check}

    return {
        "available": True,
        "latitude": coordinates["lat"],
        "longitude": coordinates["lng"],
        "precision": coordinates["precision"],
        "label": f"{land_record.get('survey_number', 'Survey')} — {land_record.get('village', '')}",
        "satellite_embed_url": build_satellite_embed_url(coordinates["lat"], coordinates["lng"]),
        "satellite_link": build_satellite_link(coordinates["lat"], coordinates["lng"]),
        "area_check": area_check
    }