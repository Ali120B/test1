import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Lock, User } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  // Redirect if already logged in
  if (isAuthenticated) {
    navigate('/admin');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(username, password);
      if (success) {
        navigate('/admin');
      } else {
        setError('Invalid username or password. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />

      <div className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-md">
          {/* Login Card */}
          <div className="bg-white border-2 border-emerald-200 rounded-xl shadow-xl overflow-hidden">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-emerald-700 to-emerald-600 px-8 py-8 text-white">
              <div className="flex items-center justify-center w-16 h-16 bg-white rounded-full mx-auto mb-4">
                <span className="text-2xl text-emerald-700 font-bold">I</span>
              </div>
              <h1 className="text-2xl font-bold text-center">Admin Login</h1>
              <p className="text-emerald-100 text-center mt-2">Islami Zindagi Admin Panel</p>
            </div>

            {/* Form */}
            <div className="px-8 py-8">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border-2 border-red-300 rounded-lg">
                  <p className="text-red-700 font-semibold">⚠️ {error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Username Field */}
                <div>
                  <label className="block text-emerald-900 font-semibold mb-2">Username</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 text-gray-400" size={20} />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username"
                      className="w-full pl-10 pr-4 py-3 border-2 border-emerald-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-emerald-50"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-emerald-900 font-semibold mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 text-gray-400" size={20} />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full pl-10 pr-4 py-3 border-2 border-emerald-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-emerald-50"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-800 hover:to-emerald-700 text-white font-bold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Logging in...' : 'Login'}
                </button>
              </form>

              {/* Demo Credentials */}
              <div className="mt-8 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
                <p className="text-yellow-900 font-semibold text-sm mb-2">Demo Credentials:</p>
                <p className="text-yellow-800 text-sm mb-1">Username: <code className="bg-white px-2 py-1 rounded">admin</code></p>
                <p className="text-yellow-800 text-sm">Password: <code className="bg-white px-2 py-1 rounded">12345678</code></p>
              </div>
            </div>

            {/* Footer Note */}
            <div className="bg-emerald-50 px-8 py-4 border-t-2 border-emerald-200">
              <p className="text-emerald-800 text-xs text-center">
                Only authorized administrators can access this panel.
              </p>
            </div>
          </div>

          {/* Back Home Link */}
          <div className="text-center mt-6">
            <a href="/" className="text-emerald-700 hover:text-emerald-800 font-semibold">
              ← Back to Home
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
