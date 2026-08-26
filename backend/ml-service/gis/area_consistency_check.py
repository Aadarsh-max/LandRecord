def check_area_plausibility(plot_area):
    if plot_area is None:
        return {"checked": False}

    is_plausible = 0.01 <= plot_area <= 500

    return {
        "checked": True,
        "plausible": is_plausible,
        "note": "Area outside typical individual parcel range" if not is_plausible else "Area within typical range"
    }