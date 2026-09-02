import { useTranslation } from "react-i18next";
import { Shield } from "lucide-react";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-background border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-muted-foreground" strokeWidth={1.8} />
            <span className="text-sm font-semibold text-foreground">
              {t("app.name")}
            </span>
          </div>
          <p className="text-xs text-muted-foreground max-w-md leading-relaxed">
            {t("app.description")}
          </p>
          <div className="w-12 h-px bg-border" />
          <p className="text-[11px] text-muted-foreground max-w-lg leading-relaxed">
            {t("common.demoData")}
          </p>
          <p className="text-[10px] text-muted-foreground/60 mt-2">
            © 2026 {t("app.name")} — {t("common.demoData")}
          </p>
        </div>
      </div>
    </footer>
  );
}
