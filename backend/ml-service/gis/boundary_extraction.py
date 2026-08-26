VILLAGE_COORDINATES = {
    "shirdi": {"lat": 19.7645, "lng": 74.4769},
    "kopargaon": {"lat": 19.8833, "lng": 74.4833},
    "rahata": {"lat": 19.7167, "lng": 74.4833}
}

DISTRICT_COORDINATES = {
    "ahmednagar": {"lat": 19.0948, "lng": 74.7480},
    "nashik": {"lat": 19.9975, "lng": 73.7898}
}


def resolve_coordinates(village, district):
    if village:
        key = village.strip().lower()
        if key in VILLAGE_COORDINATES:
            return {**VILLAGE_COORDINATES[key], "precision": "village"}

    if district:
        key = district.strip().lower()
        if key in DISTRICT_COORDINATES:
            return {**DISTRICT_COORDINATES[key], "precision": "district"}

    return None