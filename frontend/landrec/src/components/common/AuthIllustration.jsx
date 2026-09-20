import { FileText, MapPin, ShieldCheck, Languages } from "lucide-react";

export default function AuthIllustration() {
  return (
    <div className="relative hidden overflow-hidden rounded-clay bg-gradient-to-br from-blue-600 via-blue-500 to-green-600 p-10 shadow-clay md:flex md:flex-col md:justify-between">
      <div className="absolute -right-10 -top-10 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-16 -left-10 h-64 w-64 rounded-full bg-amia-400/20 blur-2xl" />

      <div className="relative z-10">
        <p className="text-sm uppercase tracking-widest text-white/70">BhuLekh AI</p>
        <h1 className="mt-4 text-3xl font-semibold leading-snug text-white">
          Intelligent land record digitization for every village, tehsil and district.
        </h1>
      </div>

      <div className="relative z-10 mt-10 flex justify-center">
        <div className="relative flex h-56 w-56 items-center justify-center">
          <div className="absolute inset-0 rounded-clay bg-white/10 backdrop-blur-sm" />
          <FileText className="h-16 w-16 text-white/90" />

          <div className="absolute -left-4 -top-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-clay">
            <Languages className="h-5 w-5 text-blue-600" />
          </div>
          <div className="absolute -right-5 top-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-clay">
            <MapPin className="h-5 w-5 text-green-600" />
          </div>
          <div className="absolute -bottom-4 left-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-clay">
            <ShieldCheck className="h-5 w-5 text-amia-600" />
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-10 grid grid-cols-3 gap-3">
        <div className="rounded-claySm bg-white/10 p-3 text-center backdrop-blur-sm">
          <p className="text-xs font-medium text-white">Multilingual OCR</p>
        </div>
        <div className="rounded-claySm bg-white/10 p-3 text-center backdrop-blur-sm">
          <p className="text-xs font-medium text-white">Confidence Scoring</p>
        </div>
        <div className="rounded-claySm bg-white/10 p-3 text-center backdrop-blur-sm">
          <p className="text-xs font-medium text-white">GIS Mapping</p>
        </div>
      </div>
    </div>
  );
}