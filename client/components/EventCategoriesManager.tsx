import { useState } from "react";
import { Plus, Trash2, X, Tag } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { EventCategory } from "@shared/api";

interface EventCategoriesManagerProps {
  onCategorySelect?: (category: string) => void;
  selectedCategory?: string;
}

export default function EventCategoriesManager({
  onCategorySelect,
  selectedCategory,
}: EventCategoriesManagerProps) {
  const { eventCategories, addEventCategory, deleteEventCategory } = useData();
  const [newCategory, setNewCategory] = useState({ name: "", description: "", color: "#3b82f6" });
  const [showAddForm, setShowAddForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleAddCategory = () => {
    if (newCategory.name.trim()) {
      addEventCategory(newCategory);
      setNewCategory({ name: "", description: "", color: "#3b82f6" });
      setShowAddForm(false);
    }
  };

  const handleDeleteCategory = (id: string, name: string) => {
    deleteEventCategory(id);
    setDeleteConfirm(null);
    if (selectedCategory === name) {
      onCategorySelect?.("");
    }
  };

  return (
    <div className="bg-muted/30 border border-border rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Tag size={20} className="text-primary" />
          Event Categories
        </h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-3 py-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm transition"
        >
          <Plus size={16} />
          New Category
        </button>
      </div>

      {showAddForm && (
        <div className="mb-4 p-4 bg-card border border-border rounded-lg animate-in fade-in slide-in-from-top-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">
                Category Name
              </label>
              <input
                type="text"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                placeholder="Ex: Workshop, Seminar..."
                className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">
                Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={newCategory.color}
                  onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                  className="h-9 w-12 bg-background border border-input rounded pointer-cursor"
                />
                <input
                  type="text"
                  value={newCategory.color}
                  onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                  className="flex-1 px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground text-sm"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">
                Description (Optional)
              </label>
              <input
                type="text"
                value={newCategory.description}
                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                placeholder="Briefly describe this category..."
                className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground text-sm"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewCategory({ name: "", description: "", color: "#3b82f6" });
              }}
              className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg transition text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleAddCategory}
              className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition text-sm"
            >
              Save Category
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {eventCategories.map((category) => (
          <div
            key={category.id}
            className={`relative group px-4 py-2 rounded-lg transition cursor-pointer border-2 ${selectedCategory === category.name
                ? "bg-primary/10 border-primary text-primary"
                : "bg-card text-foreground border-border hover:border-primary/50"
              }`}
            onClick={() => onCategorySelect?.(category.name)}
          >
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: category.color }}
              />
              <span className="font-semibold text-sm">{category.name}</span>
            </div>

            {/* Delete button on hover */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDeleteConfirm(category.id);
              }}
              className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-full p-1 shadow-md z-10"
              title="Delete category"
            >
              <X size={12} />
            </button>

            {/* Delete confirmation */}
            {deleteConfirm === category.id && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-card border border-border rounded-lg p-3 z-20 whitespace-nowrap shadow-xl">
                <p className="text-sm font-semibold text-foreground mb-2">
                  Delete "{category.name}"?
                </p>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCategory(category.id, category.name);
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

      {eventCategories.length === 0 && (
        <p className="text-muted-foreground text-sm italic py-4 text-center border-2 border-dashed border-border rounded-lg">
          No event categories defined yet.
        </p>
      )}
    </div>
  );
}
