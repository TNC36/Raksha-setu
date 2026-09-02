import { useState } from "react";
import { useQuery } from "convex/react";
import { useTranslation } from "react-i18next";
import { api } from "../../convex/_generated/api";
import { BookOpen } from "lucide-react";
import { DISASTER_TYPES, DISASTER_META, DisasterType } from "../../data/disasters";
import GuideCard from "../../components/suraksha/GuideCard";

export default function GuidesPage() {
  const { t } = useTranslation();
  const guidesData = useQuery(api.guides.list);
  const [selectedType, setSelectedType] = useState<DisasterType | "All">("All");

  // Map Convex documents to the Guide shape expected by GuideCard
  const guides = (guidesData || []).map((g) => ({
    id: g._id,
    type: g.type,
    title: g.title,
    before: g.before,
    during: g.during,
    after: g.after,
  }));

  const filtered =
    selectedType === "All"
      ? guides
      : guides.filter((g) => g.type === selectedType);

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-5 h-5 text-muted-foreground" />
          <h1 className="text-xl font-semibold text-foreground">
            {t("guides.title")}
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          {t("guides.subtitle")}
        </p>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setSelectedType("All")}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
            selectedType === "All"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card text-muted-foreground border-border hover:border-primary/50"
          }`}
        >
          All
        </button>
        {DISASTER_TYPES.map((dt) => {
          const meta = DISASTER_META[dt];
          return (
            <button
              key={dt}
              onClick={() => setSelectedType(dt)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                selectedType === dt
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-primary/50"
              }`}
            >
              {meta.icon} {dt}
            </button>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground mb-4">
        {filtered.length} guide{filtered.length !== 1 ? "s" : ""} found
        {guidesData === undefined && " · " + t("common.loading")}
      </p>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-sm">
            {guidesData === undefined
              ? t("common.loading")
              : t("guides.noGuides")}
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((guide) => (
            <GuideCard key={`guide-${guide.id}`} guide={guide} />
          ))}
        </div>
      )}
    </div>
  );
}
