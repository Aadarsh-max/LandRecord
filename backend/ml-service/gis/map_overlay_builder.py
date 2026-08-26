from gis.boundary_extraction import resolve_coordinates


def build_map_marker(land_record):
    coordinates = resolve_coordinates(land_record.get("village"), land_record.get("district"))
    if not coordinates:
        return {"available": False}

    return {
        "available": True,
        "latitude": coordinates["lat"],
        "longitude": coordinates["lng"],
        "precision": coordinates["precision"],
        "label": f"{land_record.get('survey_number', 'Survey')} — {land_record.get('village', '')}"
    }