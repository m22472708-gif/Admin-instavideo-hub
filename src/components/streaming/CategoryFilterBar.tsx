import React from 'react';
import { Film, Flame, Sparkles } from 'lucide-react';

interface CategoryFilterBarProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  videoCounts: { [key: string]: number };
  totalCount: number;
}

export const CategoryFilterBar: React.FC<CategoryFilterBarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  videoCounts,
  totalCount,
}) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto py-2 scrollbar-none">
      {/* "All" chip */}
      <button
        type="button"
        onClick={() => onSelectCategory('All')}
        className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 ${
          selectedCategory === 'All'
            ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-lg shadow-rose-950/50 scale-105'
            : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800'
        }`}
      >
        <Flame className="w-3.5 h-3.5 text-amber-400" />
        <span>All Streams</span>
        <span
          className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full ${
            selectedCategory === 'All' ? 'bg-white/20 text-white' : 'bg-zinc-800 text-zinc-400'
          }`}
        >
          {totalCount}
        </span>
      </button>

      {/* Category Chips */}
      {categories.map((cat) => {
        const count = videoCounts[cat] || 0;
        const isSelected = selectedCategory === cat;

        return (
          <button
            key={cat}
            type="button"
            onClick={() => onSelectCategory(cat)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all flex items-center gap-1.5 ${
              isSelected
                ? 'bg-rose-600 text-white shadow-md shadow-rose-950/40 scale-105'
                : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800/80'
            }`}
          >
            <span>{cat}</span>
            {count > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
