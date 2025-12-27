import { useState } from "react";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Save, X, Heart, Bookmark, Play, Upload } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { DarsItem, Attachment } from "@/contexts/DataContext";
import CategoriesManager from "./CategoriesManager";
import ConfirmModal from "./ConfirmModal";
import RichTextEditor from "./RichTextEditor";

export default function DarsEditor() {
  const { dars, addDars, updateDars, deleteDars, categories, series, toggleFavorite, toggleReadLater, isSaved, uploadFile } = useData();
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<Partial<DarsItem> | null>(null);
  const [selectedCategory, setSelectedCategory] = useState(categories[0] || "");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const [newAttachments, setNewAttachments] = useState<Attachment[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editingImageFile, setEditingImageFile] = useState<File | null>(null);

  // Pagination state
  const ITEMS_PER_PAGE = 20;
  const [visibleDarsCount, setVisibleDarsCount] = useState(ITEMS_PER_PAGE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [newDars, setNewDars] = useState<Partial<DarsItem>>({
    title: "",
    description: "",
    content: "",
    teacher: "",
    duration: "",
    category: categories[0] || "",
    type: "article",
    image: "📚",
  });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const handleAddNew = async () => {
    if (
      newDars.title &&
      newDars.description &&
      newDars.teacher &&
      newDars.category
    ) {
      try {
        let finalVideoUrl = newDars.videoUrl;
        let finalImage = newDars.image || "📚";

        // 1. Upload image if provided
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

        // 2. Upload video if it exists
        if (newDars.type === "video" && videoFile) {
          const videoToast = toast.loading("Uploading video...");
          try {
            finalVideoUrl = await uploadFile(videoFile, "videos");
            toast.dismiss(videoToast);
          } catch (e) {
            toast.dismiss(videoToast);
            throw e;
          }
        }

        // 2. Upload attachments if they exist
        const uploadedAttachments: Attachment[] = [];
        if (attachmentFiles.length > 0) {
          const attToast = toast.loading("Uploading attachments...");
          try {
            for (const file of attachmentFiles) {
              const url = await uploadFile(file, "attachments");
              uploadedAttachments.push({
                id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
                name: file.name,
                url: url
              });
            }
            toast.dismiss(attToast);
          } catch (e) {
            toast.dismiss(attToast);
            throw e;
          }
        }

        const darsItem: Omit<DarsItem, "id" | "createdAt"> = {
          title: newDars.title!,
          description: newDars.description!,
          teacher: newDars.teacher!,
          category: newDars.category!,
          type: newDars.type as "article" | "video",
          image: finalImage,
          duration: newDars.duration || "",
          content: newDars.content,
          videoUrl: finalVideoUrl,
          attachments: uploadedAttachments,
          seriesId: newDars.seriesId || undefined,
          seriesOrder: newDars.seriesOrder || undefined,
        };
        await addDars(darsItem);
        setNewDars({
          title: "",
          description: "",
          content: "",
          teacher: "",
          duration: "",
          category: categories[0] || "",
          type: "article",
          image: "📚",
          seriesId: "",
          seriesOrder: 0,
        });
        setVideoFile(null);
        setAttachmentFiles([]);
        setNewAttachments([]);
        setImageFile(null);
        setIsAddingNew(false);
      } catch (error) {
        console.error("Error adding dars:", error);
      }
    }
  };

  const handleDelete = (id: string) => {
    setItemToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      deleteDars(itemToDelete);
      setItemToDelete(null);
    }
  };

  const handleSaveEdit = async (id: string) => {
    if (!editingItem) return;

    try {
      let finalVideoUrl = editingItem.videoUrl;
      let finalAttachments = editingItem.attachments || [];
      let finalImage = editingItem.image || "📚";

      // 1. Upload new image if provided
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

      // 1. Upload video if changed
      if (editingItem.type === "video" && videoFile) {
        const videoToast = toast.loading("Uploading new video...");
        try {
          finalVideoUrl = await uploadFile(videoFile, "videos");
          toast.dismiss(videoToast);
        } catch (e) {
          toast.dismiss(videoToast);
          throw e;
        }
      }

      // 2. Upload new attachments if any
      if (attachmentFiles.length > 0) {
        const attToast = toast.loading("Uploading new attachments...");
        try {
          const newUploaded: Attachment[] = [];
          for (const file of attachmentFiles) {
            const url = await uploadFile(file, "attachments");
            newUploaded.push({
              id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
              name: file.name,
              url: url
            });
          }
          finalAttachments = [...finalAttachments, ...newUploaded];
          toast.dismiss(attToast);
        } catch (e) {
          toast.dismiss(attToast);
          throw e;
        }
      }

      await updateDars(id, {
        ...editingItem,
        image: finalImage,
        videoUrl: finalVideoUrl,
        attachments: finalAttachments
      } as any);

      setEditingId(null);
      setEditingItem(null);
      setVideoFile(null);
      setAttachmentFiles([]);
      setEditingImageFile(null);
    } catch (error) {
      console.error("Error saving edits:", error);
    }
  };

  const handleEditChange = (
    field: keyof DarsItem,
    value: any,
  ) => {
    setEditingItem(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Categories Manager */}
      <CategoriesManager
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
      />

      {/* Add New Dars Section */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">
            Dars Management
          </h2>
          <button
            onClick={() => setIsAddingNew(!isAddingNew)}
            className="flex items-center gap-2 px-4 py-2.5 sm:px-6 sm:py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg transition text-sm sm:text-base"
          >
            <Plus size={20} className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="hidden sm:inline">Add New Dars</span>
            <span className="sm:hidden">Add New</span>
          </button>
        </div>

        {isAddingNew && (
          <div className="bg-card border border-border rounded-xl p-4 sm:p-8 mb-8 shadow-sm">
            <h3 className="text-lg sm:text-xl font-bold text-foreground mb-4 sm:mb-6">
              Add New Dars
            </h3>

            <div className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-foreground font-semibold mb-2 text-sm sm:text-base">
                  Title
                </label>
                <input
                  type="text"
                  value={newDars.title || ""}
                  onChange={(e) =>
                    setNewDars({ ...newDars, title: e.target.value })
                  }
                  placeholder="Enter dars title..."
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="block text-foreground font-semibold mb-2 text-sm sm:text-base">
                  Description
                </label>
                <textarea
                  value={newDars.description || ""}
                  onChange={(e) =>
                    setNewDars({ ...newDars, description: e.target.value })
                  }
                  placeholder="Enter description..."
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground text-sm sm:text-base"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-foreground font-semibold mb-2 text-sm sm:text-base">
                    Type
                  </label>
                  <select
                    value={newDars.type || "article"}
                    onChange={(e) =>
                      setNewDars({
                        ...newDars,
                        type: e.target.value as "article" | "video",
                      })
                    }
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground text-sm sm:text-base"
                  >
                    <option value="article">Article</option>
                    <option value="video">Video</option>
                  </select>
                </div>

                <div>
                  <label className="block text-foreground font-semibold mb-2 text-sm sm:text-base">
                    Category
                  </label>
                  <select
                    value={newDars.category || ""}
                    onChange={(e) =>
                      setNewDars({ ...newDars, category: e.target.value })
                    }
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground text-sm sm:text-base"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-foreground font-semibold mb-2 text-sm sm:text-base">
                    Series (Optional)
                  </label>
                  <select
                    value={newDars.seriesId || ""}
                    onChange={(e) =>
                      setNewDars({ ...newDars, seriesId: e.target.value })
                    }
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground text-sm sm:text-base"
                  >
                    <option value="">None</option>
                    {series && series.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                {newDars.seriesId && (
                  <div>
                    <label className="block text-foreground font-semibold mb-2 text-sm sm:text-base">
                      Order in Series
                    </label>
                    <input
                      type="number"
                      value={newDars.seriesOrder || 0}
                      onChange={(e) =>
                        setNewDars({ ...newDars, seriesOrder: parseInt(e.target.value) })
                      }
                      className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground text-sm sm:text-base"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-foreground font-semibold mb-2 text-sm sm:text-base">
                    Teacher Name
                  </label>
                  <input
                    type="text"
                    value={newDars.teacher || ""}
                    onChange={(e) =>
                      setNewDars({ ...newDars, teacher: e.target.value })
                    }
                    placeholder="Enter teacher name..."
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-foreground font-semibold mb-2">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={newDars.duration || ""}
                    onChange={(e) =>
                      setNewDars({ ...newDars, duration: e.target.value })
                    }
                    placeholder="e.g., 45 minutes"
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                  />
                </div>
              </div>

              {newDars.type === "article" ? (
                <div>
                  <label className="block text-foreground font-semibold mb-2">
                    Article Content
                  </label>
                  <RichTextEditor
                    value={newDars.content || ""}
                    onChange={(content) =>
                      setNewDars({ ...newDars, content })
                    }
                    placeholder="Enter article content..."
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-foreground font-semibold mb-2">
                      YouTube Video URL
                    </label>
                    <input
                      type="url"
                      value={newDars.videoUrl || ""}
                      onChange={(e) =>
                        setNewDars({ ...newDars, videoUrl: e.target.value })
                      }
                      placeholder="e.g., https://www.youtube.com/embed/..."
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-foreground font-semibold mb-2">
                      Or Upload Local Video
                    </label>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) =>
                        setVideoFile(e.target.files?.[0] || null)
                      }
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                    />
                    {videoFile && (
                      <p className="text-sm text-green-600 mt-1">
                        ✓ File selected: {videoFile.name}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-foreground font-semibold mb-2">
                  Attach Files (optional)
                </label>
                <input
                  type="file"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setAttachmentFiles(files);
                  }}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                />
                {attachmentFiles.length > 0 && (
                  <ul className="mt-2 text-sm text-green-600 list-none">
                    {attachmentFiles.map((file, i) => (
                      <li key={i} className="flex items-center gap-1">
                        ✓ {file.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <label className="block text-foreground font-semibold mb-2">
                  Image
                </label>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={newDars.image || "📚"}
                    onChange={(e) =>
                      setNewDars({ ...newDars, image: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground text-2xl"
                    placeholder="📚 (emoji) or upload image below"
                  />
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="new-dars-image"
                    />
                    <label
                      htmlFor="new-dars-image"
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

              <div className="flex gap-3 sm:gap-4">
                <button
                  onClick={handleAddNew}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 sm:px-6 sm:py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg transition text-sm sm:text-base"
                >
                  <Save size={20} className="w-5 h-5" />
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsAddingNew(false);
                    setNewDars({
                      title: "",
                      description: "",
                      content: "",
                      teacher: "",
                      duration: "",
                      category: categories[0] || "",
                      type: "article",
                      image: "📚",
                    });
                    setVideoFile(null);
                    setImageFile(null);
                  }}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 sm:px-6 sm:py-3 bg-muted hover:bg-muted/80 text-foreground font-bold rounded-lg transition text-sm sm:text-base"
                >
                  <X size={20} className="w-5 h-5" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dars Items List */}
      <div className="space-y-4">
        {dars.slice(0, visibleDarsCount).map((item) => (
          <div
            key={item.id}
            className="relative bg-card text-card-foreground border border-border rounded-xl overflow-hidden hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1"
          >
            {editingId === item.id ? (
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-foreground font-semibold mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={editingItem?.title || ""}
                    onChange={(e) =>
                      handleEditChange("title", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-foreground font-semibold mb-2">
                    Description
                  </label>
                  <textarea
                    value={editingItem?.description || ""}
                    onChange={(e) =>
                      handleEditChange("description", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-foreground font-semibold mb-2">
                      Type
                    </label>
                    <select
                      value={editingItem?.type || "article"}
                      onChange={(e) =>
                        handleEditChange("type", e.target.value as "article" | "video")
                      }
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                    >
                      <option value="article">Article</option>
                      <option value="video">Video</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-foreground font-semibold mb-2">
                      Duration
                    </label>
                    <input
                      type="text"
                      value={editingItem?.duration || ""}
                      onChange={(e) =>
                        handleEditChange("duration", e.target.value)
                      }
                      placeholder="e.g., 45 minutes"
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-foreground font-semibold mb-2">
                    Image
                  </label>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editingItem?.image || "📚"}
                      onChange={(e) =>
                        handleEditChange("image", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground text-2xl"
                      placeholder="📚 (emoji) or upload image below"
                    />
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setEditingImageFile(e.target.files?.[0] || null)}
                        className="hidden"
                        id="edit-dars-image"
                      />
                      <label
                        htmlFor="edit-dars-image"
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
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-foreground font-semibold mb-2">
                      Category
                    </label>
                    <select
                      value={editingItem?.category || ""}
                      onChange={(e) =>
                        handleEditChange("category", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-foreground font-semibold mb-2">
                      Series (Optional)
                    </label>
                    <select
                      value={editingItem?.seriesId || ""}
                      onChange={(e) =>
                        handleEditChange("seriesId", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                    >
                      <option value="">None</option>
                      {series && series.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {editingItem?.seriesId && (
                  <div>
                    <label className="block text-foreground font-semibold mb-2">
                      Order in Series
                    </label>
                    <input
                      type="number"
                      value={editingItem?.seriesOrder || 0}
                      onChange={(e) =>
                        handleEditChange("seriesOrder", parseInt(e.target.value))
                      }
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-foreground font-semibold mb-2">
                    Teacher
                  </label>
                  <input
                    type="text"
                    value={editingItem?.teacher || ""}
                    onChange={(e) =>
                      handleEditChange("teacher", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                  />
                </div>

                {editingItem?.type === "article" && (
                  <div className="pt-4 border-t border-border">
                    <label className="block text-foreground font-semibold mb-2">
                      Article Content
                    </label>
                    <RichTextEditor
                      value={editingItem?.content || ""}
                      onChange={(content) => handleEditChange("content", content)}
                      placeholder="Enter article content..."
                    />
                  </div>
                )}

                {editingItem?.type === "video" && (
                  <div className="space-y-4 pt-4 border-t border-border">
                    <div>
                      <label className="block text-foreground font-semibold mb-2">
                        YouTube Video URL
                      </label>
                      <input
                        type="url"
                        value={editingItem.videoUrl || ""}
                        onChange={(e) =>
                          handleEditChange("videoUrl", e.target.value)
                        }
                        placeholder="e.g., https://www.youtube.com/embed/..."
                        className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                      />
                    </div>
                    <div>
                      <label className="block text-foreground font-semibold mb-2">
                        Or Change Local Video
                      </label>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) =>
                          setVideoFile(e.target.files?.[0] || null)
                        }
                        className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                      />
                      {videoFile && (
                        <p className="text-sm text-green-600 mt-1">
                          ✓ New file: {videoFile.name}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-border">
                  <label className="block text-foreground font-semibold mb-2">
                    Add More Attachments
                  </label>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setAttachmentFiles(files);
                    }}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                  />
                  {attachmentFiles.length > 0 && (
                    <ul className="mt-2 text-sm text-green-600 list-none">
                      {attachmentFiles.map((file, i) => (
                        <li key={i} className="flex items-center gap-1">
                          ✓ {file.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleSaveEdit(item.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition"
                  >
                    <Save size={18} />
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(null);
                      setEditingImageFile(null);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground font-semibold rounded-lg transition"
                  >
                    <X size={18} />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{item.image}</span>
                      <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold border border-primary/20">
                        {item.category}
                      </span>
                      {item.seriesId && (
                        <span className="hidden sm:inline-block bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 px-3 py-1 rounded-full text-sm font-semibold border border-emerald-200 dark:border-emerald-800">
                          {series?.find(s => s.id === item.seriesId)?.name || "Series"}
                        </span>
                      )}
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded border border-border flex items-center gap-1">
                        {item.type === "video" ? <><Play size={10} /> Video</> : "📄 Article"}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground mb-4 line-clamp-2">{item.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>By {item.teacher}</span>
                      <span>•</span>
                      <span>{item.duration}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">

                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => {
                          setEditingId(item.id);
                          setEditingItem({ ...item });
                          setVideoFile(null);
                          setAttachmentFiles([]);
                        }}
                        className="p-2 bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary rounded-lg transition"
                        title="Edit"
                      >
                        <Edit2 size={20} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 bg-muted hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Series indicator in bottom right - mobile only */}
                {item.seriesId && (
                  <div className="absolute bottom-4 right-4 sm:hidden">
                    <span className="inline-block bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 px-3 py-1 rounded-full text-sm font-semibold border border-emerald-200 dark:border-emerald-800">
                      {series?.find(s => s.id === item.seriesId)?.name || "Series"}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {
        dars.length === 0 && !isAddingNew && (
          <div className="bg-muted/30 border-2 border-dashed border-border rounded-xl p-12 text-center">
            <p className="text-muted-foreground text-lg mb-4">
              No dars yet. Add your first one!
            </p>
            <button
              onClick={() => setIsAddingNew(true)}
              className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg transition mx-auto"
            >
              <Plus size={20} />
              Add First Dars
            </button>
          </div>
        )
      }

      {/* Load More Button */}
      {visibleDarsCount < dars.length && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => {
              setIsLoadingMore(true);
              // Simulate loading delay for better UX
              setTimeout(() => {
                setVisibleDarsCount(prev => Math.min(prev + ITEMS_PER_PAGE, dars.length));
                setIsLoadingMore(false);
              }, 500);
            }}
            disabled={isLoadingMore}
            className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-semibold rounded-lg transition-all"
          >
            {isLoadingMore ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                Loading...
              </>
            ) : (
              <>
                Load More ({dars.length - visibleDarsCount} remaining)
              </>
            )}
          </button>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Dars"
        message="Are you sure you want to delete this Dars? This action cannot be undone and will remove it for all users."
      />
    </div >
  );
}
