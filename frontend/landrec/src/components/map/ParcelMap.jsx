import { useEffect, useState } from "react";
import {
  MapPin,
  Loader2,
  ExternalLink,
  Satellite,
  AlertTriangle,
} from "lucide-react";

import api from "../../services/api";

export default function ParcelMap({ record }) {
  const [marker, setMarker] = useState(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [satelliteMode, setSatelliteMode] = useState(false);

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
        plot_area: record.plot_area,
        land_classification: record.land_classification,
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

  if (!record) {
    return (
      <div className="rounded-clay bg-base-surfaceLight p-5 shadow-clay">
        <p className="text-sm text-ink-secondary">
          Select a land record to view its location.
        </p>
      </div>
    );
  }

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

  if (failed || !marker?.available) {
    return (
      <div className="rounded-clay bg-base-surfaceLight p-5 shadow-clay">
        <p className="text-sm text-ink-secondary">
          Map location unavailable for this record.
        </p>

        {marker?.area_check?.checked &&
          !marker.area_check.plausible && (
            <p className="mt-2 flex items-center gap-1 text-xs text-amber-600">
              <AlertTriangle className="h-3 w-3" />
              {marker.area_check.note}
            </p>
          )}
      </div>
    );
  }

  const embedUrl = satelliteMode
    ? marker.satellite_embed_url
    : `https://www.google.com/maps?q=${marker.latitude},${marker.longitude}&z=13&output=embed`;

  return (
    <div className="overflow-hidden rounded-clay bg-base-surfaceLight shadow-clay">
      {/* Header */}
      <div className="flex items-center gap-2 p-4">
        <MapPin className="h-4 w-4 text-blue-600" />

        <p className="text-sm font-medium text-ink-primary">
          {marker.label}
        </p>

        <span className="text-xs capitalize text-ink-muted">
          {marker.precision}-level
        </span>

        {/* Satellite Toggle */}
        <button
          type="button"
          onClick={() => setSatelliteMode((prev) => !prev)}
          className={`ml-auto flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
            satelliteMode
              ? "bg-blue-500 text-white"
              : "bg-base-surface text-ink-secondary"
          }`}
        >
          <Satellite className="h-3 w-3" />
          Satellite
        </button>

        {/* Open Google Maps */}
        {marker.satellite_link && (
          <a
            href={marker.satellite_link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
          >
            Open
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>

      {/* Map */}
      <iframe
        title="Parcel location"
        src={embedUrl}
        className="h-64 w-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />

      {/* Area Check */}
      {marker.area_check?.checked && (
        <div
          className={`px-4 py-2 text-xs ${
            marker.area_check.plausible
              ? "text-green-600"
              : "text-amber-600"
          }`}
        >
          {marker.area_check.plausible ? "✓ " : "⚠ "}
          {marker.area_check.note}
        </div>
      )}
    </div>
  );
}