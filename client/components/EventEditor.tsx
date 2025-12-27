import { useState } from "react";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Save, X, Calendar, MapPin, Users, Upload } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { Event } from "../../shared/api";
import ConfirmModal from "./ConfirmModal";

export default function EventEditor() {
  const { events, addEvent, updateEvent, deleteEvent, uploadFile } = useData();
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<Partial<Event> | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editingImageFile, setEditingImageFile] = useState<File | null>(null);

  // Pagination state
  const ITEMS_PER_PAGE = 20;
  const [visibleEventsCount, setVisibleEventsCount] = useState(ITEMS_PER_PAGE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const { eventCategories } = useData();
  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    title: "",
    description: "",
    image: "",
    eventDate: "",
    location: "",
    organizer: "",
    category: eventCategories.length > 0 ? eventCategories[0].name : "Islamic Event"
  });

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const handleAddNew = async () => {
    if (newEvent.title && newEvent.description && newEvent.eventDate && newEvent.category) {
      try {
        let finalImage = newEvent.image || "";

        // Upload image if provided
        if (imageFile) {
          const imageToast = toast.loading("Uploading image...");
          try {
            finalImage = await uploadFile(imageFile, "images");
            toast.dismiss(imageToast);
            toast.success("Image uploaded successfully");
          } catch (e) {
            toast.dismiss(imageToast);
            toast.error("Failed to upload image");
            throw e;
          }
        }

        const eventItem: Omit<Event, "id" | "createdAt"> = {
          title: newEvent.title!,
          description: newEvent.description!,
          image: finalImage,
          eventDate: newEvent.eventDate!,
          location: newEvent.location || "",
          organizer: newEvent.organizer || "",
          category: newEvent.category!
        };

        const creatingToast = toast.loading("Creating event...");
        await addEvent(eventItem);
        toast.dismiss(creatingToast);
        toast.success("Event created successfully!");

        setNewEvent({
          title: "",
          description: "",
          image: "",
          eventDate: "",
          location: "",
          organizer: "",
          category: eventCategories.length > 0 ? eventCategories[0].name : "Islamic Event"
        });
        setImageFile(null);
        setIsAddingNew(false);
      } catch (error) {
        console.error("Error adding event:", error);
        toast.error(`Failed to create event: ${error.message || 'Unknown error'}`);
      }
    } else {
      toast.error("Please fill in all required fields: Title, Description, Date, and Category");
    }
  };

  const handleDelete = (id: string) => {
    setItemToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      deleteEvent(itemToDelete);
      setItemToDelete(null);
    }
  };

  const handleSaveEdit = async (id: string) => {
    if (!editingItem) return;

    try {
      let finalImage = editingItem.image || "";

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

      await updateEvent(id, {
        ...editingItem,
        image: finalImage
      });

      setEditingId(null);
      setEditingItem(null);
      setEditingImageFile(null);
    } catch (error) {
      console.error("Error saving edits:", error);
    }
  };

  const handleEditChange = (field: keyof Event, value: any) => {
    setEditingItem(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Add New Event Section */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">
            Event Management
          </h2>
          <button
            onClick={() => setIsAddingNew(!isAddingNew)}
            className="flex items-center gap-2 px-4 py-2.5 sm:px-6 sm:py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg transition text-sm sm:text-base"
          >
            <Plus size={20} className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="hidden sm:inline">Add New Event</span>
            <span className="sm:hidden">Add New</span>
          </button>
        </div>

        {isAddingNew && (
          <div className="bg-card border border-border rounded-xl p-4 sm:p-8 mb-8 shadow-sm">
            <h3 className="text-lg sm:text-xl font-bold text-foreground mb-4 sm:mb-6">
              Add New Event
            </h3>

            <div className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-foreground font-semibold mb-2 text-sm sm:text-base">
                  Title
                </label>
                <input
                  type="text"
                  value={newEvent.title || ""}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, title: e.target.value })
                  }
                  placeholder="Enter event title..."
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="block text-foreground font-semibold mb-2 text-sm sm:text-base">
                  Description
                </label>
                <textarea
                  value={newEvent.description || ""}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, description: e.target.value })
                  }
                  placeholder="Enter event description..."
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground text-sm sm:text-base"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-foreground font-semibold mb-2 text-sm sm:text-base">
                    Event Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={newEvent.eventDate || ""}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, eventDate: e.target.value })
                    }
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-foreground font-semibold mb-2 text-sm sm:text-base">
                    Category
                  </label>
                  <select
                    value={newEvent.category || ""}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, category: e.target.value })
                    }
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground text-sm sm:text-base"
                  >
                    {eventCategories.length > 0 ? (
                      eventCategories.map((category) => (
                        <option key={category.id} value={category.name}>
                          {category.name}
                        </option>
                      ))
                    ) : (
                      <option value="Islamic Event">Islamic Event</option>
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-foreground font-semibold mb-2 text-sm sm:text-base">
                    Location (Optional)
                  </label>
                  <input
                    type="text"
                    value={newEvent.location || ""}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, location: e.target.value })
                    }
                    placeholder="Enter location..."
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-foreground font-semibold mb-2 text-sm sm:text-base">
                    Organizer (Optional)
                  </label>
                  <input
                    type="text"
                    value={newEvent.organizer || ""}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, organizer: e.target.value })
                    }
                    placeholder="Enter organizer name..."
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground text-sm sm:text-base"
                  />
                </div>
              </div>

              <div>
                <label className="block text-foreground font-semibold mb-2">
                  Event Image (Optional)
                </label>
                <div className="space-y-3">
                  <input
                    type="url"
                    value={newEvent.image || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val.startsWith("data:image")) {
                        toast.error("Please upload the image using the file picker instead of pasting raw image data.");
                        return;
                      }
                      setNewEvent({ ...newEvent, image: val });
                    }}
                    placeholder="Enter image URL..."
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground text-sm sm:text-base"
                  />
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="new-event-image"
                    />
                    <label
                      htmlFor="new-event-image"
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
                    setNewEvent({
                      title: "",
                      description: "",
                      image: "",
                      eventDate: "",
                      location: "",
                      organizer: "",
                      category: "Islamic Event"
                    });
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

      {/* Events List */}
      <div className="space-y-4">
        {events.slice(0, visibleEventsCount).map((event) => (
          <div
            key={event.id}
            className="relative bg-card text-card-foreground border border-border rounded-xl overflow-hidden hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1"
          >
            {editingId === event.id ? (
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
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-foreground font-semibold mb-2">
                      Event Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={editingItem?.eventDate || ""}
                      onChange={(e) =>
                        handleEditChange("eventDate", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                    />
                  </div>

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
                      {eventCategories.length > 0 ? (
                        eventCategories.map((category) => (
                          <option key={category.id} value={category.name}>
                            {category.name}
                          </option>
                        ))
                      ) : (
                        <option value="Islamic Event">Islamic Event</option>
                      )}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-foreground font-semibold mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={editingItem?.location || ""}
                      onChange={(e) =>
                        handleEditChange("location", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                    />
                  </div>

                  <div>
                    <label className="block text-foreground font-semibold mb-2">
                      Organizer
                    </label>
                    <input
                      type="text"
                      value={editingItem?.organizer || ""}
                      onChange={(e) =>
                        handleEditChange("organizer", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-foreground font-semibold mb-2">
                    Event Image
                  </label>
                  <div className="space-y-3">
                    <input
                      type="url"
                      value={editingItem?.image || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val.startsWith("data:image")) {
                          toast.error("Please upload the image using the file picker instead of pasting raw image data.");
                          return;
                        }
                        handleEditChange("image", val);
                      }}
                      placeholder="Enter image URL..."
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                    />
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setEditingImageFile(e.target.files?.[0] || null)}
                        className="hidden"
                        id="edit-event-image"
                      />
                      <label
                        htmlFor="edit-event-image"
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

                <div className="flex gap-2">
                  <button
                    onClick={() => handleSaveEdit(event.id)}
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
                      {event.image ? (
                        <img src={event.image} alt="" className="w-8 h-8 rounded-lg object-cover" />
                      ) : (
                        <Calendar className="w-8 h-8 text-primary" />
                      )}
                      <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold border border-primary/20">
                        {event.category}
                      </span>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${new Date(event.eventDate) > new Date()
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-gray-50 text-gray-700 border-gray-200"
                        }`}>
                        {new Date(event.eventDate) > new Date() ? "Upcoming" : "Past"}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      {event.title}
                    </h3>
                    <p className="text-muted-foreground mb-4 line-clamp-2">{event.description}</p>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(event.eventDate).toLocaleDateString()}</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>

                    {event.organizer && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>Organized by {event.organizer}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => {
                          setEditingId(event.id);
                          setEditingItem({ ...event });
                          setEditingImageFile(null);
                        }}
                        className="p-2 bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary rounded-lg transition"
                        title="Edit"
                      >
                        <Edit2 size={20} />
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="p-2 bg-muted hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {events.length === 0 && !isAddingNew && (
        <div className="bg-muted/30 border-2 border-dashed border-border rounded-xl p-12 text-center">
          <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-lg mb-4">
            No events yet. Add your first Islamic event!
          </p>
          <button
            onClick={() => setIsAddingNew(true)}
            className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg transition mx-auto"
          >
            <Plus size={20} />
            Add First Event
          </button>
        </div>
      )}

      {/* Load More Button */}
      {visibleEventsCount < events.length && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => {
              setIsLoadingMore(true);
              setTimeout(() => {
                setVisibleEventsCount(prev => Math.min(prev + ITEMS_PER_PAGE, events.length));
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
                Load More ({events.length - visibleEventsCount} remaining)
              </>
            )}
          </button>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Event"
        message="Are you sure you want to delete this event? This action cannot be undone."
      />
    </div>
  );
}
