import re

AREA_PATTERN = re.compile(r"(above|over|more than)\s+([\d.]+)\s*(acre|acres|hectare|hectares)", re.IGNORECASE)


def parse_query_filters(query_text):
    filters = {}

    area_match = AREA_PATTERN.search(query_text)
    if area_match:
        filters["min_area"] = float(area_match.group(2))

    return filters