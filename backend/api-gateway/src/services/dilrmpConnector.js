export function formatForDILRMP(landRecord) {
  return {
    dilrmp_schema_version: "1.0",
    state_code: "MH",
    survey_number: landRecord.survey_number,
    khasra_number: landRecord.khasra_number,
    khata_number: landRecord.khata_number,
    owner_name: landRecord.landowner_name,
    village_code: landRecord.village,
    tehsil_code: landRecord.tehsil,
    district_code: landRecord.district,
    land_use_classification: landRecord.land_classification,
    area_in_acres: landRecord.plot_area,
    last_updated: landRecord.created_at
  };
}