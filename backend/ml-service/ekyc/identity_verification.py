import re

MOCK_IDENTITY_REGISTRY = {
    "ganesh vitthal deshmukh": {"id_number": "XXXX-XXXX-4821", "status": "active", "match_type": "exact"},
    "murugan velu": {"id_number": "XXXX-XXXX-7734", "status": "active", "match_type": "exact"},
    "harpreet singh gill": {"id_number": "XXXX-XXXX-2290", "status": "active", "match_type": "exact"},
    "jayesh patel": {"id_number": "XXXX-XXXX-5561", "status": "active", "match_type": "exact"},
    "anil kumar nair": {"id_number": "XXXX-XXXX-8843", "status": "active", "match_type": "exact"},
    "chandra verma": {"id_number": "XXXX-XXXX-1102", "status": "active", "match_type": "exact"},
}


def normalize_name(name):
    if not name:
        return ""
    cleaned = re.sub(r"[^a-zA-Z\s]", "", name).lower().strip()
    return re.sub(r"\s+", " ", cleaned)


def lookup_identity(owner_name):
    normalized = normalize_name(owner_name)
    record = MOCK_IDENTITY_REGISTRY.get(normalized)

    if record:
        return {
            "found": True,
            "id_number_masked": record["id_number"],
            "status": record["status"],
            "verified_name": owner_name
        }

    return {"found": False, "id_number_masked": None, "status": None, "verified_name": None}


def verify_ownership_consistency(current_owner_name, previously_verified_owner_name):
    if not current_owner_name or not previously_verified_owner_name:
        return {"status": "unverified", "reason": "insufficient_data"}

    current_norm = normalize_name(current_owner_name)
    previous_norm = normalize_name(previously_verified_owner_name)

    if current_norm == previous_norm:
        return {"status": "verified", "reason": "owner_matches_prior_record"}

    return {
        "status": "mismatch",
        "reason": "owner_differs_from_prior_verified_record",
        "current_owner": current_owner_name,
        "prior_owner": previously_verified_owner_name
    }


def run_ekyc_check(owner_name, survey_number, existing_records):
    identity_lookup = lookup_identity(owner_name)

    matching_prior_records = [
        record for record in existing_records
        if record.get("survey_number") == survey_number and record.get("landowner_name")
    ]

    consistency = {"status": "no_prior_record", "reason": "first_record_for_this_survey_number"}
    if matching_prior_records:
        prior_owner = matching_prior_records[0]["landowner_name"]
        consistency = verify_ownership_consistency(owner_name, prior_owner)

    return {
        "identity_lookup": identity_lookup,
        "ownership_consistency": consistency,
        "note": "Simulated e-KYC check using a mock identity registry. Production deployment would integrate with Aadhaar eKYC / DigiLocker, pending government-granted API access."
    }