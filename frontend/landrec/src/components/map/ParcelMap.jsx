import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import api from "../../services/api";

export default function ParcelMap({ record }) {
  const [marker, setMarker] = useState(null);

  useEffect(() => {
    if (!record) return;
    api.post("/gis/marker", {
      survey_number: record.survey_number,
      village: record.village,
      district: record.district
    }).then((response) => setMarker(response.data));
  }, [record]);

  if (!marker?.available) {
    return (
      <div className="rounded-clay bg-base-surfaceLight p-5 shadow-clay">
        <p className="text-sm text-ink-secondary">Map location unavailable for this record.</p>
      </div>
    );
  }

  const mapUrl = `https://www.google.com/maps?q=${marker.latitude},${marker.longitude}&z=13&output=embed`;

  return (
    <div className="overflow-hidden rounded-clay bg-base-surfaceLight shadow-clay">
      <div className="flex items-center gap-2 p-4">
        <MapPin className="h-4 w-4 text-blue-600" />
        <p className="text-sm font-medium text-ink-primary">{marker.label}</p>
        <span className="ml-auto text-xs text-ink-muted capitalize">{marker.precision}-level</span>
      </div>
      <iframe
        title="Parcel location"
        src={mapUrl}
        className="h-64 w-full border-0"
        loading="lazy"
      />
    </div>
  );
}