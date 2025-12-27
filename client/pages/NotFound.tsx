import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-md">
          <div className="text-6xl font-bold text-emerald-900 mb-4">404</div>
          <h1 className="text-3xl font-bold text-emerald-900 mb-4">Page Not Found</h1>
          <p className="text-gray-600 text-lg mb-8">
            Sorry, the page you're looking for doesn't exist. It might have been moved or deleted.
          </p>
          <Link
            to="/"
            className="inline-block px-8 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg transition"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
