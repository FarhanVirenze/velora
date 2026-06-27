"use client";

interface CategoryGridProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  categories: string[];
}

const categoryIcons: Record<string, string> = {
  "Electronics": "💻",
  "Fashion": "👗",
  "Handphone": "📱",
  "Accessories": "⌚",
  "Gaming": "🎮",
  "Audio": "🎧",
  "Wearable": "⌚",
  "Camera": "📷",
  "Furniture": "🛋️",
  "Sports": "⚽",
  "Home": "🏠",
  "Books": "📚",
  "Beauty": "💄",
  "Food": "🍔",
  "Health": "💊",
};

function getIcon(category: string): string {
  return categoryIcons[category] || "📦";
}

export default function CategoryGrid({ selectedCategory, onSelectCategory, categories }: CategoryGridProps) {
  return (
    <section className="mb-12">
      <h2 className="text-xl font-bold text-foreground mb-6">Categories</h2>
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
        {/* All button */}
        <button
          onClick={() => onSelectCategory(null)}
          className={`flex flex-col items-center justify-center min-w-[90px] px-4 py-4 rounded-2xl border-2 transition-all shrink-0 ${
            selectedCategory === null
              ? "border-primary bg-primary/10 text-primary shadow-[0_0_15px_rgba(139,92,246,0.15)]"
              : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:bg-primary/5"
          }`}
        >
          <span className="text-2xl mb-1.5">🏪</span>
          <span className="text-xs font-semibold whitespace-nowrap">All</span>
        </button>

        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onSelectCategory(cat === selectedCategory ? null : cat)}
            className={`flex flex-col items-center justify-center min-w-[90px] px-4 py-4 rounded-2xl border-2 transition-all shrink-0 ${
              selectedCategory === cat
                ? "border-primary bg-primary/10 text-primary shadow-[0_0_15px_rgba(139,92,246,0.15)]"
                : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:bg-primary/5"
            }`}
          >
            <span className="text-2xl mb-1.5">{getIcon(cat)}</span>
            <span className="text-xs font-semibold whitespace-nowrap">{cat}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
