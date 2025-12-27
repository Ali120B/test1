import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import PageTransition from "./PageTransition";
import MobileBottomNav from "./MobileBottomNav";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

export default function MainLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const isMobile = useIsMobile();
    const { user, isAuthenticated } = useAuth();

    // Redirect unverified users to verification page (with delay to allow verification to complete)
    useEffect(() => {
        if (isAuthenticated && user && user.emailVerification === false) {
            // Allow access to verification page, but redirect from other pages
            if (location.pathname !== '/verify-email') {
                // Small delay to allow verification state to update
                const timeoutId = setTimeout(() => {
                    navigate('/verify-email', { replace: true });
                }, 1000); // 1 second delay

                return () => clearTimeout(timeoutId);
            }
        }
    }, [user, isAuthenticated, location.pathname, navigate]);

    return (
        <div className="flex flex-col min-h-screen bg-background relative smooth-scroll custom-scrollbar">
            {/* Extremely subtle global background for dark mode depth - hidden on mobile to prevent rendering glitches */}
            <div className="hidden md:block fixed inset-0 z-[-1] opacity-5 dark:opacity-20 pointer-events-none animated-gradient"></div>

            <Navbar />
            <div className={cn("flex-grow flex flex-col", isMobile && "pb-24")}>
                <Outlet />
            </div>
            <Footer />
            {isMobile && <MobileBottomNav />}
        </div>
    );
}
