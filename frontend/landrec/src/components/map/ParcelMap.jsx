import { useEffect, useState } from "react";
import { MapPin, Loader2, ExternalLink } from "lucide-react";
import api from "../../services/api";

export default function ParcelMap({ record }) {
  const [marker, setMarker] = useState(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!record) {
      setMarker(null);
      return;
    }

    setLoading(true);
    setFailed(false);
    setMarker(null);

    api
      .post("/gis/marker", {
        survey_number: record.survey_number,
        village: record.village,
        district: record.district,
      })
      .then((response) => {
        setMarker(response.data);
      })
      .catch((error) => {
        console.error("Failed to fetch parcel location:", error);
        setFailed(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [record]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-clay bg-base-surfaceLight p-8 shadow-clay">
        <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
        <p className="ml-2 text-sm text-ink-secondary">
          Locating on map...
        </p>
      </div>
    );
  }

  // Failed / unavailable state
  if (failed || !marker?.available) {
    return (
      <div className="rounded-clay bg-base-surfaceLight p-5 shadow-clay">
        <p className="text-sm text-ink-secondary">
          Map location unavailable for this record.
        </p>
      </div>
    );
  }

  // Google Maps URLs
  const embedUrl = `https://www.google.com/maps?q=${marker.latitude},${marker.longitude}&z=13&output=embed`;

  const openInMapsUrl = `https://www.google.com/maps/search/?api=1&query=${marker.latitude},${marker.longitude}`;

  return (
    <div className="overflow-hidden rounded-clay bg-base-surfaceLight shadow-clay">
      {/* Header */}
      <div className="flex items-center gap-2 p-4">
        <MapPin className="h-4 w-4 text-blue-600" />

        <p className="text-sm font-medium text-ink-primary">
          {marker.label}
        </p>

        <span className="text-xs text-ink-muted capitalize">
          {marker.precision}-level
        </span>

        <a
          href={openInMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
        >
          Open in Maps
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {/* Google Maps */}
      <iframe
        title="Parcel location"
        src={embedUrl}
        className="h-64 w-full border-0"
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}