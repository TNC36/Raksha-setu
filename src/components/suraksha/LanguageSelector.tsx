/**
 * Language Selector for Raksha Setu
 * Runtime language switching across 13 Indian languages.
 */
import { useTranslation } from "react-i18next";
import { LANGUAGES } from "../../i18n";
import { Globe } from "lucide-react";
import { useState } from "react";

export default function LanguageSelector() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);

  const currentLang = LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0];

  function changeLang(code: string) {
    i18n.changeLanguage(code);
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium rounded-lg border border-border text-muted-foreground dark:text-muted-foreground/60 hover:bg-secondary dark:hover:bg-primary/90 transition-colors"
        aria-label="Select language"
      >
        <Globe className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">{currentLang.nativeName}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 bg-card dark:bg-primary border border-border rounded-xl shadow-lg py-2 w-48 max-h-80 overflow-y-auto">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLang(lang.code)}
                className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between gap-2 transition-colors ${
                  i18n.language === lang.code
                    ? "bg-secondary bg-primary text-foreground dark:text-white font-medium"
                    : "text-muted-foreground dark:text-muted-foreground/60 hover:bg-secondary"
                }`}
              >
                <span>{lang.nativeName}</span>
                <span className="text-muted-foreground text-[10px]">{lang.code.toUpperCase()}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
