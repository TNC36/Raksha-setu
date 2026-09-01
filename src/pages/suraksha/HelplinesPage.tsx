import { useQuery } from "convex/react";
import { useTranslation } from "react-i18next";
import { api } from "../../convex/_generated/api";
import { Phone, ExternalLink } from "lucide-react";

export default function HelplinesPage() {
  const { t } = useTranslation();
  const helplines = useQuery(api.helplines.list);

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Phone className="w-5 h-5 text-neutral-600" />
          <h1 className="text-xl font-semibold text-neutral-900">
            {t("helplines.title")}
          </h1>
        </div>
        <p className="text-sm text-neutral-500">
          {t("helplines.subtitle")}
        </p>
      </div>

      {helplines === undefined ? (
        <div className="text-center py-20 text-neutral-400">
          <p className="text-sm">Loading helplines from database…</p>
        </div>
      ) : helplines.length === 0 ? (
        <div className="text-center py-20 text-neutral-400">
          <p className="text-sm">No helplines available yet.</p>
          <p className="text-xs text-neutral-400 mt-1">
            Admins can add helplines from the Admin Dashboard.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {helplines.map((hl) => (
            <a
              key={`hl-${hl._id}`}
              href={`tel:${hl.phone}`}
              className="bg-white border border-neutral-200 rounded-xl p-5 flex items-center gap-4 hover:border-neutral-300 transition-colors no-underline group"
            >
              <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0 group-hover:bg-neutral-900 transition-colors">
                <Phone
                  className="w-5 h-5 text-neutral-600 group-hover:text-white transition-colors"
                  strokeWidth={1.8}
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-neutral-900">{hl.name}</p>
                <p className="text-lg font-semibold text-neutral-700 mt-0.5">
                  {hl.phone}
                </p>
                {hl.description && (
                  <p className="text-xs text-neutral-400 mt-0.5">{hl.description}</p>
                )}
              </div>
              <ExternalLink className="w-4 h-4 text-neutral-300 group-hover:text-neutral-500 transition-colors" />
            </a>
          ))}
        </div>
      )}

      <div className="mt-10 bg-neutral-50 border border-neutral-200 rounded-xl p-5">
        <p className="text-xs text-neutral-500 leading-relaxed">
          <strong className="text-neutral-700">Note:</strong> These are
          standard Indian emergency numbers. For specific regional helplines,
          contact your local disaster management authority. Admins can add or
          edit helplines from the Admin Dashboard.
        </p>
      </div>
    </div>
  );
}
