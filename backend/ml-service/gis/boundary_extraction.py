import os
import httpx

GEOCODE_URL = "https://api.opencagedata.com/geocode/v1/json"
_geocode_cache = {}

MIN_CONFIDENCE_BY_PRECISION = {
    "village": 3,
    "district": 1
}


def geocode_place(query, min_confidence):
    if not query or not query.strip():
        return None

    cache_key = f"{query.strip().lower()}::{min_confidence}"
    if cache_key in _geocode_cache:
        return _geocode_cache[cache_key]

    api_key = os.getenv("OPENCAGE_API_KEY")
    if not api_key:
        print("[gis] OPENCAGE_API_KEY not set")
        return None

    try:
        response = httpx.get(
            GEOCODE_URL,
            params={
                "q": query,
                "key": api_key,
                "countrycode": "in",
                "limit": 1,
                "no_annotations": 1
            },
            timeout=8.0
        )
        response.raise_for_status()
        data = response.json()

        if not data.get("results"):
            _geocode_cache[cache_key] = None
            return None

        result = data["results"][0]
        confidence = result.get("confidence", 0)

        if confidence < min_confidence:
            print(f"[gis] Confidence {confidence} below threshold {min_confidence} for '{query}', rejecting")
            _geocode_cache[cache_key] = None
            return None

        geometry = result["geometry"]
        geocoded = {
            "lat": geometry["lat"],
            "lng": geometry["lng"],
            "display_name": result.get("formatted", query)
        }
        _geocode_cache[cache_key] = geocoded
        return geocoded

    except Exception as error:
        print(f"[gis] Geocoding failed for '{query}': {error}")
        return None


def resolve_coordinates(village, district):
    attempts = []

    if village and district:
        attempts.append((f"{village}, {district}, India", "village"))
    if village:
        attempts.append((f"{village}, India", "village"))
    if district:
        attempts.append((f"{district}, India", "district"))

    for query, precision in attempts:
        min_confidence = MIN_CONFIDENCE_BY_PRECISION.get(precision, 1)
        result = geocode_place(query, min_confidence)
        if result:
            return {
                "lat": result["lat"],
                "lng": result["lng"],
                "precision": precision,
                "display_name": result["display_name"]
            }

    return None