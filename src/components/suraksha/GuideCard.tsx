import { Guide } from "../../data/guides";
import { DISASTER_META } from "../../data/disasters";
import ReadAloud from "./ReadAloud";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface GuideCardProps {
  guide: Guide;
}

function guideToText(guide: Guide): string {
  const parts: string[] = [guide.title];
  if (guide.before?.length) {
    parts.push("Before: " + guide.before.join(". "));
  }
  if (guide.during?.length) {
    parts.push("During: " + guide.during.join(". "));
  }
  if (guide.after?.length) {
    parts.push("After: " + guide.after.join(". "));
  }
  return parts.join(". ");
}

export default function GuideCard({ guide }: GuideCardProps) {
  const [open, setOpen] = useState(false);
  const meta = DISASTER_META[guide.type];
  const hasContent =
    (guide.before?.length ?? 0) > 0 ||
    (guide.during?.length ?? 0) > 0 ||
    (guide.after?.length ?? 0) > 0;

  return (
    <article className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium"
              style={{ backgroundColor: meta.color + "10", color: meta.color }}
            >
              {meta.icon} {guide.type}
            </span>
          </div>
          <ReadAloud text={guideToText(guide)} label="" />
        </div>

        <h3 className="text-sm font-semibold text-neutral-900 mb-1">
          {guide.title}
        </h3>

        {hasContent && (
          <button
            onClick={() => setOpen(!open)}
            className="mt-2 text-xs text-neutral-500 hover:text-neutral-900 flex items-center gap-1 transition-colors"
          >
            {open ? (
              <>
                <ChevronUp className="w-3 h-3" /> Hide Instructions
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3" /> View Instructions
              </>
            )}
          </button>
        )}
      </div>

      {open && hasContent && (
        <div className="border-t border-neutral-100 px-4 py-4 space-y-4 bg-neutral-50">
          {guide.before?.length > 0 && (
            <GuideSection title="Before" items={guide.before} />
          )}
          {guide.during?.length > 0 && (
            <GuideSection title="During" items={guide.during} />
          )}
          {guide.after?.length > 0 && (
            <GuideSection title="After" items={guide.after} />
          )}
        </div>
      )}

      <div className="h-0.5" style={{ backgroundColor: meta.color }} />
    </article>
  );
}

function GuideSection({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h4 className="text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
        {title}
      </h4>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li
            key={`${title}-${i}`}
            className="text-xs text-neutral-600 leading-relaxed pl-4 relative before:content-[''] before:absolute before:left-0 before:top-1.5 before:w-1.5 before:h-1.5 before:rounded-full before:bg-neutral-300"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
