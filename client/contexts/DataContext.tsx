import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { databases, storage, DB_ID, BUCKET_ID, ADMIN_TEAM_ID, ID } from "@/lib/appwrite";
import { Query, Permission, Role } from "appwrite";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";
import { Event, EventCategory } from "../../shared/api";

// Types
export interface Attachment {
  id: string;
  name: string;
  url: string;
}

export interface Series {
  id: string;
  name: string;
  description?: string;
  image?: string;
}

export interface DarsItem {
  id: string; // $id in Appwrite
  title: string;
  description: string;
  content?: string;
  teacher: string;
  duration: string;
  category: string;
  type: "article" | "video";
  image: string;
  videoUrl?: string;
  attachments?: Attachment[];
  createdAt: Date;
  seriesId?: string;
  seriesOrder?: number;
}

export interface DarsProgress {
  id: string;
  darsId: string;
  lastVisitedAt: Date;
  completed: boolean;
}

export interface Answer {
  id: string;
  questionId: string;
  content: string;
  author: string;
  isOfficial: boolean;
  date: Date;
}

export interface Question {
  id: string;
  title: string;
  content: string;
  author: string;
  category: string;
  date: Date;
  updatedAt?: Date;
  attachments?: Attachment[];
  answers: Answer[];
  audioUrl?: string;
}

interface SavedItem {
  id: string;
  itemId: string;
  itemType: "dars" | "question" | "series";
  listType: "favorite" | "read_later";
  savedAt: Date;
}

interface DataContextType {
  dars: DarsItem[];
  isLoading: boolean;
  getRandomDars: (count: number) => DarsItem[];
  addDars: (item: Omit<DarsItem, "id" | "createdAt">) => Promise<DarsItem>;
  updateDars: (id: string, item: Partial<DarsItem>) => Promise<void>;
  deleteDars: (id: string) => Promise<void>;

  series: Series[];
  addSeries: (series: Omit<Series, "id">) => Promise<Series>;
  deleteSeries: (id: string) => Promise<void>;

  darsProgress: DarsProgress[];
  touchDarsProgress: (darsId: string) => Promise<void>;
  setDarsCompleted: (darsId: string, completed: boolean) => Promise<void>;

  questions: Question[];
  getRandomQuestions: (count: number) => Question[];
  addQuestion: (question: Omit<Question, "id" | "date" | "likes" | "answers">, answerContent?: string) => Promise<Question>;
  updateQuestion: (id: string, question: Partial<Question>) => Promise<void>;
  deleteQuestion: (id: string) => Promise<void>;
  addAnswer: (questionId: string, answer: Omit<Answer, "id" | "date" | "questionId" | "isOfficial">, isOfficial?: boolean) => Promise<Answer>;

  events: Event[];
  addEvent: (event: Omit<Event, "id" | "createdAt">) => Promise<Event>;
  updateEvent: (id: string, event: Partial<Event>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;

  eventCategories: EventCategory[];
  addEventCategory: (category: Omit<EventCategory, "id">) => Promise<EventCategory>;
  deleteEventCategory: (id: string) => Promise<void>;

  categories: string[];
  addCategory: (category: string) => void;
  deleteCategory: (category: string) => void;

  savedItems: SavedItem[];
  isLoadingSaved: boolean;
  toggleFavorite: (itemId: string, itemType: "dars" | "question" | "series") => void;
  toggleReadLater: (itemId: string, itemType: "dars" | "question" | "series") => void;
  isSaved: (itemId: string, listType: "favorite" | "read_later") => boolean;
  uploadFile: (file: File, path: string) => Promise<string>;

  // Analytics
  trackView: (itemId: string, itemType: "dars" | "question") => Promise<void>;
  getStats: () => Promise<{ totalDars: number, totalQuestions: number, totalUsers: number }>;

  // Refresh
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [dars, setDars] = useState<DarsItem[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [series, setSeries] = useState<Series[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [eventCategories, setEventCategories] = useState<EventCategory[]>([]);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [darsProgress, setDarsProgress] = useState<DarsProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSaved, setIsLoadingSaved] = useState(false);

  const { isAuthenticated, user } = useAuth();

  // Load initial data
  const sanitizeHtml = (html: string) => {
    if (!html) return "";
    let cleaned = html.trim();
    if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
      cleaned = cleaned.substring(1, cleaned.length - 1);
    }
    return cleaned;
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);

      // Fetch Dars
      const darsResponse = await databases.listDocuments(DB_ID, 'dars', [
        Query.orderDesc('$createdAt')
      ]);
      setDars(darsResponse.documents.map(doc => ({
        id: doc.$id,
        title: doc.title,
        description: doc.description,
        content: sanitizeHtml(doc.content),
        teacher: doc.teacher,
        duration: doc.duration,
        category: doc.category,
        type: doc.type,
        image: doc.image,
        videoUrl: doc.videoUrl,
        attachments: typeof doc.attachments === 'string' ? JSON.parse(doc.attachments) : doc.attachments || [],
        createdAt: new Date(doc.$createdAt),
        seriesId: doc.seriesId,
        seriesOrder: doc.seriesOrder
      })) as DarsItem[]);

      // Fetch Series
      try {
        const seriesResponse = await databases.listDocuments(DB_ID, 'series', [
          Query.orderAsc('name')
        ]);
        setSeries(seriesResponse.documents.map(doc => ({
          id: doc.$id,
          name: doc.name,
          description: doc.description,
          image: doc.image
        })));
      } catch (error) {
        console.error("Error fetching series:", error);
      }

      // Fetch Questions
      const questionsResponse = await databases.listDocuments(DB_ID, 'questions', [
        Query.orderDesc('date')
      ]);
      setQuestions(questionsResponse.documents.map(doc => {
        let rawAnswers = [];
        try {
          rawAnswers = typeof doc.answers === 'string' ? JSON.parse(doc.answers) : doc.answers || [];
        } catch (e) {
          console.error("Error parsing answers:", e);
        }

        const cleanedAnswers = rawAnswers.map((a: any) => ({
          ...a,
          content: sanitizeHtml(a.content)
        }));

        return {
          id: doc.$id,
          title: doc.title,
          content: sanitizeHtml(doc.content),
          author: doc.askedBy,
          category: doc.category,
          date: new Date(doc.date),
          answers: cleanedAnswers
        };
      }) as Question[]);

      // Fetch Categories
      const categoriesResponse = await databases.listDocuments(DB_ID, 'categories');
      setCategories(categoriesResponse.documents.map(doc => doc.name));

      // Fetch Event Categories
      try {
        const eventCategoriesResponse = await databases.listDocuments(DB_ID, 'event_categories');
        setEventCategories(eventCategoriesResponse.documents.map(doc => ({
          id: doc.$id,
          name: doc.name,
          description: doc.description,
          color: doc.color
        })));
      } catch (error) {
        console.error("Error fetching event categories:", error);
      }

      // Fetch Events
      try {
        const eventsResponse = await databases.listDocuments(DB_ID, 'events', [
          Query.orderDesc('eventDate')
        ]);
        setEvents(eventsResponse.documents.map(doc => ({
          id: doc.$id,
          title: doc.title,
          description: doc.description,
          image: doc.image,
          eventDate: doc.eventDate,
          location: doc.location || "",
          organizer: doc.organizer || "",
          category: doc.category,
          createdAt: doc.$createdAt
        })) as Event[]);
      } catch (error) {
        console.error("Error fetching events:", error);
        // Events collection might not exist yet, so we'll leave it empty
      }

      // Fetch Saved Items if user is logged in
      if (isAuthenticated && user) {
        setIsLoadingSaved(true);
        try {
          const savedResponse = await databases.listDocuments(DB_ID, 'saved_items', [
            Query.equal('userId', user.id)
          ]);
          setSavedItems(savedResponse.documents.map(doc => ({
            id: doc.$id,
            itemId: doc.itemId,
            itemType: doc.itemType,
            listType: doc.listType,
            savedAt: new Date(doc.$createdAt)
          })) as SavedItem[]);
        } catch (error) {
          console.error('Error fetching saved items (favorites/read later):', error);
          setSavedItems([]);
        }

        try {
          const progressResponse = await databases.listDocuments(DB_ID, 'dars_progress', [
            Query.equal('userId', user.id),
            Query.orderDesc('lastVisitedAt')
          ]);
          setDarsProgress(progressResponse.documents.map((doc: any) => ({
            id: doc.$id,
            darsId: doc.darsId,
            lastVisitedAt: new Date(doc.lastVisitedAt),
            completed: Boolean(doc.completed)
          })) as DarsProgress[]);
        } catch (error) {
          console.error('Error fetching dars progress:', error);
          setDarsProgress([]);
        }

        setIsLoadingSaved(false);
      } else {
        setSavedItems([]);
        setDarsProgress([]);
      }

    } catch (error) {
      console.error("Error fetching initial data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isAuthenticated, user]);

  // ===== DARS OPERATIONS =====

  const touchDarsProgress = async (darsId: string): Promise<void> => {
    if (!isAuthenticated || !user || !darsId) return;

    try {
      const existing = darsProgress.find((p) => p.darsId === darsId);
      const now = new Date().toISOString();

      if (existing) {
        await databases.updateDocument(DB_ID, 'dars_progress', existing.id, {
          lastVisitedAt: now,
        });
        setDarsProgress((prev) =>
          prev
            .map((p) => (p.darsId === darsId ? { ...p, lastVisitedAt: new Date(now) } : p))
            .sort((a, b) => b.lastVisitedAt.getTime() - a.lastVisitedAt.getTime())
        );
        return;
      }

      const created: any = await databases.createDocument(
        DB_ID,
        'dars_progress',
        ID.unique(),
        {
          userId: user.id,
          darsId,
          lastVisitedAt: now,
          completed: false,
        },
        [
          Permission.read(Role.user(user.id)),
          Permission.update(Role.user(user.id)),
          Permission.delete(Role.user(user.id)),
        ]
      );

      setDarsProgress((prev) =>
        [
          {
            id: created.$id,
            darsId,
            lastVisitedAt: new Date(now),
            completed: false,
          },
          ...prev,
        ].sort((a, b) => b.lastVisitedAt.getTime() - a.lastVisitedAt.getTime())
      );
    } catch (error) {
      console.error('Error touching dars progress:', error);
    }
  };

  const setDarsCompleted = async (darsId: string, completed: boolean): Promise<void> => {
    if (!isAuthenticated || !user || !darsId) return;

    try {
      const existing = darsProgress.find((p) => p.darsId === darsId);
      const now = new Date().toISOString();

      if (!existing) {
        const created: any = await databases.createDocument(
          DB_ID,
          'dars_progress',
          ID.unique(),
          {
            userId: user.id,
            darsId,
            lastVisitedAt: now,
            completed,
          },
          [
            Permission.read(Role.user(user.id)),
            Permission.update(Role.user(user.id)),
            Permission.delete(Role.user(user.id)),
          ]
        );
        setDarsProgress((prev) =>
          [
            {
              id: created.$id,
              darsId,
              lastVisitedAt: new Date(now),
              completed,
            },
            ...prev,
          ].sort((a, b) => b.lastVisitedAt.getTime() - a.lastVisitedAt.getTime())
        );
        return;
      }

      await databases.updateDocument(DB_ID, 'dars_progress', existing.id, {
        completed,
        lastVisitedAt: now,
      });
      setDarsProgress((prev) =>
        prev
          .map((p) =>
            p.darsId === darsId
              ? { ...p, completed, lastVisitedAt: new Date(now) }
              : p
          )
          .sort((a, b) => b.lastVisitedAt.getTime() - a.lastVisitedAt.getTime())
      );
    } catch (error) {
      console.error('Error setting dars completed:', error);
    }
  };

  const addDars = async (item: Omit<DarsItem, "id" | "createdAt">): Promise<DarsItem> => {
    try {
      const dbData = {
        title: item.title,
        description: item.description,
        teacher: item.teacher,
        category: item.category,
        type: item.type,
        duration: item.duration,
        videoUrl: item.videoUrl || "",
        image: item.image || "",
        content: item.content ? sanitizeHtml(item.content) : "",
        attachments: JSON.stringify(item.attachments || []),
        seriesId: item.seriesId,
        seriesOrder: item.seriesOrder
      };

      const response = await databases.createDocument(DB_ID, 'dars', ID.unique(), dbData, [
        Permission.read(Role.any()),
        Permission.update(Role.team(ADMIN_TEAM_ID)),
        Permission.delete(Role.team(ADMIN_TEAM_ID))
      ]);

      const newItem: DarsItem = {
        ...item,
        content: sanitizeHtml(item.content || ""),
        id: response.$id,
        createdAt: new Date(response.$createdAt)
      };
      setDars(prev => [newItem, ...prev]);
      toast.success("Dars created successfully");
      return newItem;
    } catch (error: any) {
      console.error("Error adding dars:", error);
      toast.error(`Failed to create dars: ${error.message || 'Unknown error'}`);
      throw error;
    }
  };

  const updateDars = async (id: string, item: Partial<DarsItem>): Promise<void> => {
    try {
      const data = { ...item };
      // Remove id field as Appwrite doesn't allow updating it
      delete data.id;
      delete data.createdAt;
      if (item.attachments) {
        (data as any).attachments = JSON.stringify(item.attachments);
      }
      await databases.updateDocument(DB_ID, 'dars', id, data);
      setDars(prev => prev.map(d => d.id === id ? { ...d, ...item, content: item.content ? sanitizeHtml(item.content) : d.content } : d));
      toast.success("Dars updated successfully");
    } catch (error) {
      console.error("Error updating dars:", error);
      toast.error("Failed to update dars");
      throw error;
    }
  };

  const deleteDars = async (id: string): Promise<void> => {
    try {
      await databases.deleteDocument(DB_ID, 'dars', id);
      setDars(prev => prev.filter(d => d.id !== id));
      toast.success("Dars deleted successfully");
    } catch (error) {
      console.error("Error deleting dars:", error);
      toast.error("Failed to delete dars");
      throw error;
    }
  };

  // ===== SERIES OPERATIONS =====

  const addSeries = async (seriesData: Omit<Series, "id">): Promise<Series> => {
    try {
      const response = await databases.createDocument(
        DB_ID,
        'series',
        ID.unique(),
        seriesData,
        [
          Permission.read(Role.any()),
          Permission.update(Role.team(ADMIN_TEAM_ID)),
          Permission.delete(Role.team(ADMIN_TEAM_ID)),
        ]
      );

      const newSeries: Series = {
        id: response.$id,
        name: seriesData.name,
        description: seriesData.description,
        image: seriesData.image
      };
      setSeries(prev => [...prev, newSeries]);
      toast.success("Series created successfully");
      return newSeries;
    } catch (error: any) {
      console.error("Error adding series:", error);
      toast.error(`Failed to create series: ${error.message}`);
      throw error;
    }
  };

  const deleteSeries = async (id: string): Promise<void> => {
    try {
      await databases.deleteDocument(DB_ID, 'series', id);
      setSeries(prev => prev.filter(s => s.id !== id));
      toast.success("Series deleted successfully");
    } catch (error) {
      console.error("Error deleting series:", error);
      toast.error("Failed to delete series");
      throw error;
    }
  };

  // ===== QUESTION OPERATIONS =====

  const addQuestion = async (
    question: Omit<Question, "id" | "date" | "answers">,
    answerContent?: string
  ): Promise<Question> => {
    try {
      const initialAnswers = answerContent ? [{
        id: ID.unique(),
        content: answerContent,
        author: user?.username || "Admin",
        isOfficial: true,
        date: new Date().toISOString(),
        questionId: "" // Temp placeholder
      }] : [];

      const dbData = {
        title: question.title,
        content: question.content ? sanitizeHtml(question.content) : "",
        askedBy: question.author,
        category: question.category,
        date: new Date().toISOString(),
        answers: JSON.stringify(initialAnswers),
        attachments: JSON.stringify(question.attachments || [])
      };

      const response = await databases.createDocument(DB_ID, 'questions', ID.unique(), dbData, [
        Permission.read(Role.any()),
        Permission.delete(Role.team(ADMIN_TEAM_ID))
      ]);

      const newQuestion: Question = {
        ...question,
        content: sanitizeHtml(question.content),
        id: response.$id,
        date: new Date(),
        answers: initialAnswers.map(ans => ({ ...ans, date: new Date(ans.date), questionId: response.$id }))
      };

      setQuestions(prev => [newQuestion, ...prev]);
      toast.success("Question posted successfully");
      return newQuestion;
    } catch (error: any) {
      console.error("Error adding question:", error);
      toast.error(`Failed to post question: ${error.message || 'Unknown error'}`);
      throw error;
    }
  };

  const updateQuestion = async (id: string, question: Partial<Question>): Promise<void> => {
    try {
      const data = { ...question };
      if (question.answers) {
        (data as any).answers = JSON.stringify(question.answers);
      }
      await databases.updateDocument(DB_ID, 'questions', id, data);
      setQuestions(prev => prev.map(q => q.id === id ? { ...q, ...question, content: question.content ? sanitizeHtml(question.content) : q.content } : q));
    } catch (error) {
      console.error("Error updating question:", error);
    }
  };

  const deleteQuestion = async (id: string): Promise<void> => {
    try {
      await databases.deleteDocument(DB_ID, 'questions', id);
      setQuestions(prev => prev.filter(q => q.id !== id));
      toast.success("Question deleted successfully");
    } catch (error) {
      toast.error("Failed to delete question");
    }
  };

  const addAnswer = async (
    questionId: string,
    answer: Omit<Answer, "id" | "date" | "questionId" | "isOfficial">,
    isOfficial: boolean = true
  ): Promise<Answer> => {
    try {
      const q = questions.find(question => question.id === questionId);
      if (!q) throw new Error("Question not found");

      const newAnswer: Answer = {
        ...answer,
        content: sanitizeHtml(answer.content),
        id: ID.unique(),
        questionId,
        isOfficial,
        date: new Date()
      };

      const updatedAnswers = [...q.answers, newAnswer];
      await updateQuestion(questionId, { answers: updatedAnswers });

      toast.success("Answer added successfully");
      return newAnswer;
    } catch (error: any) {
      console.error("Error adding answer:", error);
      toast.error(`Failed to add answer: ${error.message || 'Unknown error'}`);
      throw error;
    }
  };

  // ===== EVENT OPERATIONS =====

  const addEvent = async (eventData: Omit<Event, "id" | "createdAt">): Promise<Event> => {
    try {
      const dbData = {
        title: eventData.title,
        description: eventData.description,
        image: eventData.image || "",
        eventDate: eventData.eventDate,
        location: eventData.location || "",
        organizer: eventData.organizer || "",
        category: eventData.category
      };

      const response = await databases.createDocument(DB_ID, 'events', ID.unique(), dbData, [
        Permission.read(Role.any()),
        Permission.update(Role.team(ADMIN_TEAM_ID)),
        Permission.delete(Role.team(ADMIN_TEAM_ID))
      ]);

      const newEvent: Event = {
        ...eventData,
        id: response.$id,
        createdAt: response.$createdAt
      };
      setEvents(prev => [newEvent, ...prev]);
      toast.success("Event created successfully");
      return newEvent;
    } catch (error: any) {
      console.error("Error adding event:", error);
      toast.error(`Failed to create event: ${error.message || 'Unknown error'}`);
      throw error;
    }
  };

  const updateEvent = async (id: string, eventData: Partial<Event>): Promise<void> => {
    try {
      const data = { ...eventData };
      // Remove fields that shouldn't be updated
      delete data.id;
      delete data.createdAt;

      await databases.updateDocument(DB_ID, 'events', id, data);
      setEvents(prev => prev.map(event => event.id === id ? { ...event, ...eventData } : event));
      toast.success("Event updated successfully");
    } catch (error) {
      console.error("Error updating event:", error);
      toast.error("Failed to update event");
      throw error;
    }
  };

  const deleteEvent = async (id: string): Promise<void> => {
    try {
      await databases.deleteDocument(DB_ID, 'events', id);
      setEvents(prev => prev.filter(event => event.id !== id));
      toast.success("Event deleted successfully");
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event");
      throw error;
    }
  };

  // ===== CATEGORY OPERATIONS =====

  const addCategory = async (category: string) => {
    if (!categories.includes(category)) {
      try {
        await databases.createDocument(DB_ID, 'categories', ID.unique(), { name: category }, [
          Permission.read(Role.any()),
          Permission.update(Role.team(ADMIN_TEAM_ID)),
          Permission.delete(Role.team(ADMIN_TEAM_ID))
        ]);
        setCategories(prev => [...prev, category]);
        toast.success("Category added");
      } catch (error: any) {
        console.error("Error adding category:", error);
        toast.error(`Failed to add category: ${error.message || 'Unknown error'}`);
      }
    }
  };

  const deleteCategory = async (category: string) => {
    try {
      const doc = await databases.listDocuments(DB_ID, 'categories', [
        Query.equal('name', category)
      ]);
      if (doc.documents.length > 0) {
        await databases.deleteDocument(DB_ID, 'categories', doc.documents[0].$id);
        setCategories(prev => prev.filter(c => c !== category));
        toast.success("Category deleted");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  // ===== EVENT CATEGORY OPERATIONS =====

  const addEventCategory = async (categoryData: Omit<EventCategory, "id">): Promise<EventCategory> => {
    try {
      const response = await databases.createDocument(
        DB_ID,
        'event_categories',
        ID.unique(),
        categoryData,
        [
          Permission.read(Role.any()),
          Permission.update(Role.team(ADMIN_TEAM_ID)),
          Permission.delete(Role.team(ADMIN_TEAM_ID)),
        ]
      );

      const newCategory: EventCategory = {
        id: response.$id,
        ...categoryData
      };
      setEventCategories(prev => [...prev, newCategory]);
      toast.success("Event category added");
      return newCategory;
    } catch (error: any) {
      console.error("Error adding event category:", error);
      toast.error(`Failed to add event category: ${error.message}`);
      throw error;
    }
  };

  const deleteEventCategory = async (id: string): Promise<void> => {
    try {
      await databases.deleteDocument(DB_ID, 'event_categories', id);
      setEventCategories(prev => prev.filter(c => c.id !== id));
      toast.success("Event category deleted");
    } catch (error) {
      console.error("Error deleting event category:", error);
      toast.error("Failed to delete event category");
      throw error;
    }
  };

  // ===== SAVED ITEMS OPERATIONS =====

  const isSaved = (itemId: string, listType: "favorite" | "read_later") => {
    return savedItems.some((item) => item.itemId === itemId && item.listType === listType);
  };

  const toggleFavorite = async (itemId: string, itemType: "dars" | "question" | "series") => {
    if (!isAuthenticated || !user) {
      toast.error("Please login to save favorites");
      return;
    }

    const existing = savedItems.find(
      (item) => item.itemId === itemId && item.listType === "favorite"
    );

    try {
      if (existing) {
        await databases.deleteDocument(DB_ID, 'saved_items', existing.id);
        setSavedItems(prev => prev.filter(item => item.id !== existing.id));
        toast.success("Removed from favorites");
      } else {
        const response = await databases.createDocument(
          DB_ID,
          'saved_items',
          ID.unique(),
          {
            userId: user.id,
            itemId,
            itemType,
            listType: "favorite",
          },
          [
            Permission.read(Role.user(user.id)),
            Permission.update(Role.user(user.id)),
            Permission.delete(Role.user(user.id)),
          ]
        );
        setSavedItems(prev => [...prev, {
          id: response.$id,
          itemId,
          itemType,
          listType: "favorite",
          savedAt: new Date()
        }]);
        toast.success("Added to favorites");
      }
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      toast.error(error?.message ? `Failed to update favorites: ${error.message}` : 'Failed to update favorites');
    }
  };

  const toggleReadLater = async (itemId: string, itemType: "dars" | "question" | "series") => {
    if (!isAuthenticated || !user) {
      toast.error("Please login to save for later");
      return;
    }

    const existing = savedItems.find(
      (item) => item.itemId === itemId && item.listType === "read_later"
    );

    try {
      if (existing) {
        await databases.deleteDocument(DB_ID, 'saved_items', existing.id);
        setSavedItems(prev => prev.filter(item => item.id !== existing.id));
        toast.success("Removed from read later");
      } else {
        const response = await databases.createDocument(
          DB_ID,
          'saved_items',
          ID.unique(),
          {
            userId: user.id,
            itemId,
            itemType,
            listType: "read_later",
          },
          [
            Permission.read(Role.user(user.id)),
            Permission.update(Role.user(user.id)),
            Permission.delete(Role.user(user.id)),
          ]
        );
        setSavedItems(prev => [...prev, {
          id: response.$id,
          itemId,
          itemType,
          listType: "read_later",
          savedAt: new Date()
        }]);
        toast.success("Added to read later");
      }
    } catch (error: any) {
      console.error('Error toggling read later:', error);
      toast.error(error?.message ? `Failed to update read later: ${error.message}` : 'Failed to update read later');
    }
  };

  // ===== HELPERS =====

  const getRandomDars = (count: number) => {
    const shuffled = [...dars].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const getRandomQuestions = (count: number) => {
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const uploadFile = async (file: File, path: string): Promise<string> => {
    try {
      const response = await storage.createFile(BUCKET_ID, ID.unique(), file);
      // Constructing URL manually or using getFileView
      return `${storage.client.config.endpoint}/storage/buckets/${BUCKET_ID}/files/${response.$id}/view?project=${storage.client.config.project}`;
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload file");
      throw error;
    }
  };

  // ===== ANALYTICS OPERATIONS =====

  const trackView = async (itemId: string, itemType: "dars" | "question") => {
    // Analytics disabled as views attribute was removed from schema
    return;
  };

  const getStats = async () => {
    return {
      totalDars: dars.length,
      totalQuestions: questions.length,
      totalUsers: 0,
    };
  };

  return (
    <DataContext.Provider
      value={{
        dars,
        isLoading,
        getRandomDars,
        addDars,
        updateDars,
        deleteDars,

        series,
        addSeries,
        deleteSeries,

        darsProgress,
        touchDarsProgress,
        setDarsCompleted,

        questions,
        getRandomQuestions,
        addQuestion,
        updateQuestion,
        deleteQuestion,
        addAnswer,

        events,
        addEvent,
        updateEvent,
        deleteEvent,

        eventCategories,
        addEventCategory,
        deleteEventCategory,

        categories,
        addCategory,
        deleteCategory,

        savedItems,
        isLoadingSaved,
        toggleFavorite,
        toggleReadLater,
        isSaved,
        uploadFile,

        trackView,
        getStats,
        refreshData: fetchData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
