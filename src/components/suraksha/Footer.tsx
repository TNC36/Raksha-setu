import { Shield } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-neutral-50 border-t border-neutral-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-neutral-400" strokeWidth={1.8} />
            <span className="text-sm font-semibold text-neutral-700">
              Suraksha Setu
            </span>
          </div>
          <p className="text-xs text-neutral-500 max-w-md leading-relaxed">
            A disaster and civilian safety platform. Built for safer communities.
          </p>
          <div className="w-12 h-px bg-neutral-200" />
          <p className="text-[11px] text-neutral-400 max-w-lg leading-relaxed">
            Demo data is used for this MVP. Production deployment should use
            verified and authoritative emergency data from government and
            disaster management agencies.
          </p>
          <p className="text-[10px] text-neutral-300 mt-2">
            © 2026 Suraksha Setu — Prototype for demonstration purposes only.
          </p>
        </div>
      </div>
    </footer>
  );
}
