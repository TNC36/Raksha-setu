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
        className="inline-flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        aria-label="Select language"
      >
        <Globe className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">{currentLang.nativeName}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-lg py-2 w-48 max-h-80 overflow-y-auto">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLang(lang.code)}
                className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between gap-2 transition-colors ${
                  i18n.language === lang.code
                    ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-medium"
                    : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                }`}
              >
                <span>{lang.nativeName}</span>
                <span className="text-neutral-400 text-[10px]">{lang.code.toUpperCase()}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
