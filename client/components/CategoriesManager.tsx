import { useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { useData } from "@/contexts/DataContext";

interface CategoriesManagerProps {
  onCategorySelect?: (category: string) => void;
  selectedCategory?: string;
}

export default function CategoriesManager({
  onCategorySelect,
  selectedCategory,
}: CategoriesManagerProps) {
  const { categories, addCategory, deleteCategory } = useData();
  const [newCategory, setNewCategory] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      addCategory(newCategory.trim());
      setNewCategory("");
      setShowAddForm(false);
    }
  };

  const handleDeleteCategory = (category: string) => {
    deleteCategory(category);
    setDeleteConfirm(null);
    if (selectedCategory === category) {
      onCategorySelect?.(categories[0] || "");
    }
  };

  return (
    <div className="bg-muted/30 border border-border rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-foreground">Categories</h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-2.5 sm:px-3 py-1 sm:py-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-xs sm:text-sm transition"
        >
          <Plus size={16} />
          New
        </button>
      </div>

      {showAddForm && (
        <div className="mb-4 p-4 bg-card border border-border rounded-lg animate-in fade-in slide-in-from-top-2">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Enter new category name..."
              className="flex-1 px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground text-sm"
              onKeyPress={(e) => e.key === "Enter" && handleAddCategory()}
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddCategory}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition text-sm"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewCategory("");
                }}
                className="flex-1 sm:flex-none px-2.5 sm:px-3 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg transition"
              >
                <X size={16} className="mx-auto" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <div
            key={category}
            className={`relative group px-4 py-2 rounded-lg transition cursor-pointer border ${selectedCategory === category
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-foreground border-border hover:border-primary/50 hover:bg-accent/5"
              }`}
            onClick={() => onCategorySelect?.(category)}
          >
            <span className="font-semibold text-sm">{category}</span>

            {/* Delete button on hover */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDeleteConfirm(category);
              }}
              className="absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/3 opacity-0 group-hover:opacity-100 transition bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-full p-1 shadow-sm"
              title="Delete category"
            >
              <X size={12} />
            </button>

            {/* Delete confirmation */}
            {deleteConfirm === category && (
              <div className="absolute top-full left-0 mt-2 bg-card border border-border rounded-lg p-3 z-10 whitespace-nowrap shadow-xl">
                <p className="text-sm font-semibold text-foreground mb-2">
                  Delete this category?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCategory(category);
                    }}
                    className="px-2 py-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs rounded transition"
                  >
                    Delete
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirm(null);
                    }}
                    className="px-2 py-1 bg-muted hover:bg-muted/80 text-foreground text-xs rounded transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <p className="text-muted-foreground text-sm italic">
          No categories yet. Add one to get started!
        </p>
      )}
    </div>
  );
}
