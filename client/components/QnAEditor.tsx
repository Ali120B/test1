import { useState } from "react";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Save, X, Heart, Bookmark } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { Attachment } from "@shared/api";
import CategoriesManager from "./CategoriesManager";
import ConfirmModal from "./ConfirmModal";
import RichTextEditor from "./RichTextEditor";

export default function QnAEditor({ showPreview = false }: { showPreview?: boolean }) {
  const { questions, addQuestion, updateQuestion, deleteQuestion, addAnswer, categories, toggleFavorite, toggleReadLater, isSaved } =
    useData();
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [answerInputs, setAnswerInputs] = useState<Record<string, string>>({});
  const [selectedCategory, setSelectedCategory] = useState(categories[0] || "");
  const [newQA, setNewQA] = useState({
    title: "",
    content: "",
    author: "",
    category: categories[0] || "",
    answerContent: "",
  });
  const [newAttachments, setNewAttachments] = useState<Attachment[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const { uploadFile } = useData();

  // Pagination state
  const ITEMS_PER_PAGE = 20;
  const [visibleQuestionsCount, setVisibleQuestionsCount] = useState(ITEMS_PER_PAGE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const handleAddNew = async () => {
    if (newQA.title && newQA.content && newQA.author && newQA.category) {
      const qnaToast = toast.loading("Adding question...");
      try {
        // Upload attachments first
        const uploadedAttachments: any[] = [];
        if (attachmentFiles.length > 0) {
          for (const file of attachmentFiles) {
            const url = await uploadFile(file, "attachments");
            uploadedAttachments.push({
              id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
              name: file.name,
              url: url
            });
          }
        }

        await addQuestion({
          title: newQA.title,
          content: newQA.content,
          author: newQA.author,
          category: newQA.category,
          attachments: uploadedAttachments,
        }, newQA.answerContent);

        setNewQA({
          title: "",
          content: "",
          author: "",
          category: categories[0] || "",
          answerContent: "",
        });
        setAttachmentFiles([]);
        setNewAttachments([]);
        setIsAddingNew(false);
        toast.dismiss(qnaToast);
      } catch (error) {
        toast.dismiss(qnaToast);
        console.error("Error adding question:", error);
      }
    }
  };

  const handleDelete = (id: string) => {
    setItemToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      deleteQuestion(itemToDelete);
      setItemToDelete(null);
    }
  };

  const handleSaveEdit = (id: string) => {
    setEditingId(null);
  };

  const handleAddAnswer = async (questionId: string) => {
    const content = answerInputs[questionId];
    if (content) {
      const ansToast = toast.loading("Adding answer...");
      try {
        await addAnswer(questionId, {
          content,
          author: "Admin", // Could be improved if we pass user from AuthContext
        }, true);
        setAnswerInputs(prev => ({ ...prev, [questionId]: "" }));
        toast.dismiss(ansToast);
      } catch (error) {
        toast.dismiss(ansToast);
        console.error("Error adding answer:", error);
      }
    }
  };

  const handleEditChange = (
    id: string,
    field: string,
    value: string | number,
  ) => {
    updateQuestion(id, { [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Categories Manager */}
      <CategoriesManager
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
      />

      {/* Add New Q&A Section */}
      <div>
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-2xl font-bold text-foreground">
            Q&A Management
          </h2>
          <button
            onClick={() => setIsAddingNew(!isAddingNew)}
            className="flex items-center gap-1.5 px-3 py-2 sm:px-6 sm:py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg transition text-xs sm:text-base"
          >
            <Plus size={16} className="w-4 h-4 sm:w-6 sm:h-6" />
            <span className="hidden sm:inline">Add New Q&A</span>
            <span className="sm:hidden">Add New</span>
          </button>
        </div>

        {isAddingNew && (
          <div className="bg-card border border-border rounded-xl p-4 sm:p-8 mb-8 shadow-sm">
            <h3 className="text-lg sm:text-xl font-bold text-foreground mb-4 sm:mb-6">
              Add New Question & Answer
            </h3>

            <div className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-foreground font-semibold mb-2 text-sm sm:text-base">
                  Question Title
                </label>
                <input
                  type="text"
                  value={newQA.title || ""}
                  onChange={(e) =>
                    setNewQA({ ...newQA, title: e.target.value })
                  }
                  placeholder="Enter the question title..."
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="block text-foreground font-semibold mb-2 text-sm sm:text-base">
                  Question Details
                </label>
                <RichTextEditor
                  value={newQA.content || ""}
                  onChange={(content) =>
                    setNewQA({ ...newQA, content })
                  }
                  placeholder="Enter the question details..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-foreground font-semibold mb-2 text-sm sm:text-base">
                    Author
                  </label>
                  <input
                    type="text"
                    value={newQA.author || ""}
                    onChange={(e) =>
                      setNewQA({ ...newQA, author: e.target.value })
                    }
                    placeholder="User name..."
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-foreground font-semibold mb-2 text-sm sm:text-base">
                    Category
                  </label>
                  <select
                    value={newQA.category || ""}
                    onChange={(e) =>
                      setNewQA({ ...newQA, category: e.target.value })
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

              <div className="bg-muted/50 p-4 sm:p-6 rounded-lg border border-border">
                <h4 className="font-bold text-foreground mb-4 text-sm sm:text-base">
                  Official Answer (Optional)
                </h4>
                <div>
                  <label className="block text-foreground font-semibold mb-2 text-sm sm:text-base">
                    Answer Content
                  </label>
                  <RichTextEditor
                    value={newQA.answerContent || ""}
                    onChange={(content) =>
                      setNewQA({ ...newQA, answerContent: content })
                    }
                    placeholder="Enter the answer (can be added later)..."
                  />
                </div>
              </div>

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
                    setNewQA({
                      title: "",
                      content: "",
                      author: "",
                      category: categories[0] || "",
                      answerContent: "",
                    });
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

      {/* Q&A Items List */}
      <div className="space-y-4">
        {questions
          .filter((_, index) => !showPreview || index === 0)
          .slice(0, visibleQuestionsCount)
          .map((item) => (
            <div
              key={item.id}
              className="bg-card text-card-foreground border border-border rounded-xl overflow-hidden hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 sm:hover:-translate-y-1"
            >
              {editingId === item.id ? (
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-foreground font-semibold mb-2">
                      Question Title
                    </label>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) =>
                        handleEditChange(item.id, "title", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                    />
                  </div>

                  <div>
                    <label className="block text-foreground font-semibold mb-2">
                      Question Details
                    </label>
                    <RichTextEditor
                      value={item.content}
                      onChange={(content) =>
                        handleEditChange(item.id, "content", content)
                      }
                      placeholder="Enter the question details..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-foreground font-semibold mb-2">
                        Category
                      </label>
                      <select
                        value={item.category}
                        onChange={(e) =>
                          handleEditChange(item.id, "category", e.target.value)
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
                        Author
                      </label>
                      <input
                        type="text"
                        value={item.author}
                        onChange={(e) =>
                          handleEditChange(item.id, "author", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                      />
                    </div>
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
                      onClick={() => setEditingId(null)}
                      className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground font-semibold rounded-lg transition"
                    >
                      <X size={18} />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 sm:p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-block bg-primary/10 text-primary px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-sm font-semibold border border-primary/20">
                          {item.category}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-xl font-bold text-foreground mb-1 sm:mb-2">
                        {item.title}
                      </h3>
                      <div
                        className="text-muted-foreground mb-4 line-clamp-2 prose prose-sm dark:prose-invert"
                        dangerouslySetInnerHTML={{ __html: item.content }}
                      />
                      <p className="text-sm text-muted-foreground">
                        By {item.author} • {item.answers?.length || 0} Answer(s)
                      </p>
                    </div>
                    <div className="flex flex-col gap-3 sm:gap-4 ml-0 sm:ml-4 mt-4 sm:mt-0">
                      {!item.answers?.some(a => a.isOfficial) && (
                        <div className="bg-muted ring-1 ring-border rounded-lg p-3 sm:p-4 w-full sm:w-64">
                          <label className="block text-[10px] sm:text-xs font-bold text-muted-foreground uppercase mb-1.5 sm:mb-2 text-center sm:text-left">
                            Add Official Answer
                          </label>
                          <textarea
                            value={answerInputs[item.id] || ""}
                            onChange={(e) => setAnswerInputs(prev => ({ ...prev, [item.id]: e.target.value }))}
                            placeholder="Type answer here..."
                            className="w-full px-3 py-2 text-xs sm:text-sm border border-border rounded-md bg-background focus:ring-1 focus:ring-primary outline-none transition-all mb-2"
                            rows={2}
                          />
                          <button
                            onClick={() => handleAddAnswer(item.id)}
                            disabled={!answerInputs[item.id]}
                            className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-secondary text-secondary-foreground text-[10px] sm:text-xs font-bold rounded-md hover:bg-secondary/90 disabled:opacity-50 transition-all border border-secondary/20 shadow-sm"
                          >
                            <Plus size={12} className="sm:size-14" /> Submit Answer
                          </button>
                        </div>
                      )}

                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setEditingId(item.id)}
                          className="p-1.5 sm:p-2 bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary rounded-lg transition"
                          title="Edit"
                        >
                          <Edit2 size={16} className="sm:size-20" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 sm:p-2 bg-muted hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 size={16} className="sm:size-20" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
      </div>

      {
        questions.length === 0 && !isAddingNew && (
          <div className="bg-muted/30 border-2 border-dashed border-border rounded-xl p-12 text-center">
            <p className="text-muted-foreground text-lg mb-4">
              No Q&A items yet. Add your first one!
            </p>
            <button
              onClick={() => setIsAddingNew(true)}
              className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg transition mx-auto"
            >
              <Plus size={20} />
              Add First Q&A
            </button>
          </div>
        )
      }

      {/* Load More Button */}
      {(() => {
        const filteredQuestions = questions.filter((_, index) => !showPreview || index === 0);
        return visibleQuestionsCount < filteredQuestions.length && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => {
                setIsLoadingMore(true);
                // Simulate loading delay for better UX
                setTimeout(() => {
                  setVisibleQuestionsCount(prev => Math.min(prev + ITEMS_PER_PAGE, filteredQuestions.length));
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
                  Load More ({filteredQuestions.length - visibleQuestionsCount} remaining)
                </>
              )}
            </button>
          </div>
        );
      })()}

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Q&A"
        message="Are you sure you want to delete this Q&A? This action cannot be undone and will remove it for all users."
      />
    </div >
  );
}
