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
          <Phone className="w-5 h-5 text-muted-foreground" />
          <h1 className="text-xl font-semibold text-foreground">
            {t("helplines.title")}
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          {t("helplines.subtitle")}
        </p>
      </div>

      {helplines === undefined ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-sm">Loading helplines from database…</p>
        </div>
      ) : helplines.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-sm">No helplines available yet.</p>
          <p className="text-xs text-muted-foreground mt-1">
            Admins can add helplines from the Admin Dashboard.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {helplines.map((hl) => (
            <a
              key={`hl-${hl._id}`}
              href={`tel:${hl.phone}`}
              className="bg-card border border-border rounded-xl p-5 flex items-center gap-4 hover:border-primary/50 transition-colors no-underline group"
            >
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 group-hover:bg-primary transition-colors">
                <Phone
                  className="w-5 h-5 text-muted-foreground group-hover:text-white transition-colors"
                  strokeWidth={1.8}
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{hl.name}</p>
                <p className="text-lg font-semibold text-foreground mt-0.5">
                  {hl.phone}
                </p>
                {hl.description && (
                  <p className="text-xs text-muted-foreground mt-0.5">{hl.description}</p>
                )}
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground/60 group-hover:text-muted-foreground transition-colors" />
            </a>
          ))}
        </div>
      )}

      <div className="mt-10 bg-background border border-border rounded-xl p-5">
        <p className="text-xs text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Note:</strong> These are
          standard Indian emergency numbers. For specific regional helplines,
          contact your local disaster management authority. Admins can add or
          edit helplines from the Admin Dashboard.
        </p>
      </div>
    </div>
  );
}
