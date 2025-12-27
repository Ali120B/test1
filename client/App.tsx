import "./global.css";
import React, { Suspense } from "react";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { DataProvider } from "./contexts/DataContext";
import MainLayout from "./components/MainLayout";
import { ThemeProvider } from "./contexts/ThemeContext";

// Lazy load pages for better performance
const Index = React.lazy(() => import("./pages/Index"));
const Dars = React.lazy(() => import("./pages/Dars"));
const QnA = React.lazy(() => import("./pages/QnA"));
const DarsDetail = React.lazy(() => import("./pages/DarsDetail"));
const QnADetail = React.lazy(() => import("./pages/QnADetail"));
const SeriesDetail = React.lazy(() => import("./pages/SeriesDetail"));
const Login = React.lazy(() => import("./pages/Login"));
const Register = React.lazy(() => import("./pages/Register"));
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const AdminPanel = React.lazy(() => import("./pages/AdminPanel"));
const Profile = React.lazy(() => import("./pages/Profile"));
const About = React.lazy(() => import("./pages/About"));
const Events = React.lazy(() => import("./pages/Events"));
const EventDetail = React.lazy(() => import("./pages/EventDetail"));
const VerifyEmail = React.lazy(() => import("./pages/VerifyEmail"));
const NotFound = React.lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <AuthProvider>
              <DataProvider>
                <Suspense fallback={
                  <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                }>
                    <Routes>
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/verify-email" element={<VerifyEmail />} />
                      <Route element={<MainLayout />}>
                        <Route path="/" element={<Index />} />
                        <Route path="/dars" element={<Dars />} />
                        <Route path="/dars/:id" element={<DarsDetail />} />
                        <Route path="/series/:id" element={<SeriesDetail />} />
                        <Route path="/qna" element={<QnA />} />
                        <Route path="/questions/:id" element={<QnADetail />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/admin" element={<AdminPanel />} />
                        <Route path="/events" element={<Events />} />
                        <Route path="/events/:id" element={<EventDetail />} />
                        <Route path="/about" element={<About />} />
                        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                        <Route path="*" element={<NotFound />} />
                      </Route>
                    </Routes>
                  </Suspense>
                </DataProvider>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
