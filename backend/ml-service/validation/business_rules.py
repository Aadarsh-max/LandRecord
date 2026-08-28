import re

REQUIRED_FIELDS = ["landowner_name", "survey_number", "village", "district"]

NUMBER_FORMAT = re.compile(r"^\d+[\d/\-]*$")


def validate_fields(structured_fields):
    violations = []

    for field in REQUIRED_FIELDS:
        value = structured_fields.get(field, {}).get("value")
        if not value:
            violations.append({
                "field": field,
                "rule": "required_field_missing",
                "message": f"{field} is required but missing"
            })

    for field in ["survey_number", "khasra_number", "khata_number"]:
        value = structured_fields.get(field, {}).get("value")
        if value and not NUMBER_FORMAT.match(value):
            violations.append({
                "field": field,
                "rule": "invalid_number_format",
                "message": f"{field} value '{value}' does not match expected numeric format"
            })

    plot_area_value = structured_fields.get("plot_area", {}).get("value")
    if plot_area_value:
        try:
            area_match = re.search(r"\d+\.\d+", str(plot_area_value))
            if area_match:
                area_number = float(area_match.group(0))
                if area_number <= 0 or area_number > 10000:
                    violations.append({
                        "field": "plot_area",
                        "rule": "area_out_of_range",
                        "message": f"plot_area value '{plot_area_value}' is outside plausible range"
                    })
            else:
                digits_only = re.search(r"\d+", str(plot_area_value))
                if not digits_only:
                    violations.append({
                        "field": "plot_area",
                        "rule": "invalid_area_format",
                        "message": f"plot_area value '{plot_area_value}' has no numeric component"
                    })
        except (ValueError, TypeError) as error:
            violations.append({
                "field": "plot_area",
                "rule": "area_parse_error",
                "message": f"plot_area value '{plot_area_value}' could not be parsed: {error}"
            })

    return violations