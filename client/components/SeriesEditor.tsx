import { useState } from "react";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Save, X, BookOpen, Play, Upload, Image } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { Series } from "@/contexts/DataContext";
import ConfirmModal from "./ConfirmModal";

export default function SeriesEditor() {
  const { series, addSeries, updateSeries, deleteSeries, dars, uploadFile } = useData();
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<Partial<Series> | null>(null);
  const [newSeries, setNewSeries] = useState<Partial<Series>>({
    name: "",
    description: "",
    image: "📚",
  });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editingImageFile, setEditingImageFile] = useState<File | null>(null);

  const handleAddNew = async () => {
    if (newSeries.name) {
      try {
        let finalImage = newSeries.image || "📚";

        // Upload image if provided
        if (imageFile) {
          const imageToast = toast.loading("Uploading image...");
          try {
            finalImage = await uploadFile(imageFile, "images");
            toast.dismiss(imageToast);
          } catch (e) {
            toast.dismiss(imageToast);
            throw e;
          }
        }

        await addSeries({
          name: newSeries.name,
          description: newSeries.description || "",
          image: finalImage,
        });
        setNewSeries({ name: "", description: "", image: "📚" });
        setImageFile(null);
        setIsAddingNew(false);
        toast.success("Series created successfully!");
      } catch (error) {
        console.error("Error creating series:", error);
        toast.error("Failed to create series");
      }
    }
  };

  const handleEdit = (series: Series) => {
    setEditingId(series.id);
    setEditingItem({ ...series });
  };

  const handleSaveEdit = async () => {
    if (editingItem && editingId) {
      try {
        let finalImage = editingItem.image || "📚";

        // Upload new image if provided
        if (editingImageFile) {
          const imageToast = toast.loading("Uploading new image...");
          try {
            finalImage = await uploadFile(editingImageFile, "images");
            toast.dismiss(imageToast);
          } catch (e) {
            toast.dismiss(imageToast);
            throw e;
          }
        }

        await updateSeries(editingId, {
          name: editingItem.name || "",
          description: editingItem.description || "",
          image: finalImage,
        });

        setEditingId(null);
        setEditingItem(null);
        setEditingImageFile(null);
      } catch (error) {
        console.error("Error updating series:", error);
      }
    }
  };

  const handleDelete = async (id: string) => {
    setItemToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      try {
        await deleteSeries(itemToDelete);
        toast.success("Series deleted successfully!");
      } catch (error) {
        console.error("Error deleting series:", error);
        toast.error("Failed to delete series");
      }
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  const getSeriesDarsCount = (seriesId: string) => {
    return dars.filter(d => d.seriesId === seriesId).length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-2xl font-bold text-foreground">Series Management</h2>
          <p className="text-xs sm:text-base text-muted-foreground">Create and manage dars series (playlists)</p>
        </div>
        <button
          onClick={() => setIsAddingNew(true)}
          className="flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-colors text-xs sm:text-base whitespace-nowrap"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Add Series</span>
          <span className="sm:hidden">Add New</span>
        </button>
      </div>

      {/* Add New Series Form */}
      {isAddingNew && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Create New Series</h3>
            <button
              onClick={() => {
                setIsAddingNew(false);
                setImageFile(null);
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Series Name *</label>
              <input
                type="text"
                value={newSeries.name}
                onChange={(e) => setNewSeries({ ...newSeries, name: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter series name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Image</label>
              <div className="space-y-3">
                <input
                  type="text"
                  value={newSeries.image}
                  onChange={(e) => setNewSeries({ ...newSeries, image: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="📚 (emoji) or upload image below"
                />
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="new-series-image"
                  />
                  <label
                    htmlFor="new-series-image"
                    className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg cursor-pointer transition-colors"
                  >
                    <Upload size={16} />
                    {imageFile ? imageFile.name : "Upload Image"}
                  </label>
                  {imageFile && (
                    <button
                      onClick={() => setImageFile(null)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={newSeries.description}
              onChange={(e) => setNewSeries({ ...newSeries, description: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              rows={3}
              placeholder="Describe this series..."
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleAddNew}
              disabled={!newSeries.name}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={18} />
              Create Series
            </button>
            <button
              onClick={() => setIsAddingNew(false)}
              className="px-4 py-2 border border-border rounded-lg hover:bg-muted"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Series List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {series.map((item) => (
          <div key={item.id} className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-shadow">
            {editingId === item.id ? (
              /* Edit Mode */
              <div className="space-y-3">
                <input
                  type="text"
                  value={editingItem?.name || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary"
                />
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editingItem?.image || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, image: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="📚 (emoji) or upload image below"
                  />
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setEditingImageFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="edit-series-image"
                    />
                    <label
                      htmlFor="edit-series-image"
                      className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg cursor-pointer transition-colors"
                    >
                      <Upload size={16} />
                      {editingImageFile ? editingImageFile.name : "Upload New Image"}
                    </label>
                    {editingImageFile && (
                      <button
                        onClick={() => setEditingImageFile(null)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>
                <textarea
                  value={editingItem?.description || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary"
                  rows={2}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveEdit}
                    className="flex items-center gap-1 px-3 py-1 bg-primary text-primary-foreground rounded text-sm"
                  >
                    <Save size={14} />
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(null);
                      setEditingItem(null);
                      setEditingImageFile(null);
                    }}
                    className="px-3 py-1 border border-border rounded text-sm hover:bg-muted"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              /* View Mode */
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-muted rounded-lg overflow-hidden border border-border">
                      {item.image && (item.image.startsWith("http") || item.image.startsWith("/")) ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl">{item.image || "📚"}</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground line-clamp-1">{item.name}</h3>
                      <p className="text-xs text-muted-foreground whitespace-nowrap">
                        {getSeriesDarsCount(item.id)} dars
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1 text-muted-foreground hover:text-destructive hover:bg-muted rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {item.description && (
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                )}

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <BookOpen size={14} />
                  <span>{getSeriesDarsCount(item.id)} lessons in this series</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {series.length === 0 && !isAddingNew && (
        <div className="text-center py-12">
          <BookOpen size={48} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Series Yet</h3>
          <p className="text-muted-foreground mb-4">Create your first dars series to organize your content</p>
          <button
            onClick={() => setIsAddingNew(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Create First Series
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Series"
        message="Are you sure you want to delete this series? This action cannot be undone and will remove the series from all associated dars."
        confirmText="Delete Series"
        type="danger"
      />
    </div>
  );
}