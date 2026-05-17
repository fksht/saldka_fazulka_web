import { Category } from '../../types';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: Category | 'Všetko';
  onSelect: (category: Category | 'Všetko') => void;
}

const CategoryFilter = ({ categories, selectedCategory, onSelect }: CategoryFilterProps) => {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      <button
        type="button"
        onClick={() => onSelect('Všetko')}
        className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
          selectedCategory === 'Všetko'
            ? 'bg-cocoa-800 text-white shadow-sm'
            : 'border border-cream-300 bg-white text-cocoa-600 hover:border-rose-300 hover:bg-rose-50'
        }`}
      >
        Všetko
      </button>
      {categories.map((category) => (
        <button
          type="button"
          key={category}
          onClick={() => onSelect(category)}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
            selectedCategory === category
              ? 'bg-cocoa-800 text-white shadow-sm'
              : 'border border-cream-300 bg-white text-cocoa-600 hover:border-rose-300 hover:bg-rose-50'
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
