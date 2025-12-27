import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { account, teams, ADMIN_TEAM_ID } from "@/lib/appwrite";
import { ID, Models, OAuthProvider } from "appwrite";

interface AuthUser {
  id: string;
  email: string;
  username: string;
  avatarUrl?: string | null;
  role: "user" | "admin";
  emailVerification?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  updateProfile: (data: {
    username: string;
    email: string;
    avatarUrl?: string;
    currentPassword?: string;
    newPassword?: string;
  }) => Promise<boolean>;
  sendVerificationEmail: () => Promise<boolean>;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkUserStatus = async () => {
    try {
      const sessionUser = await account.get();

      // Check if admin (member of 'admins' team)
      let role: "user" | "admin" = "user";
      try {
        const userTeams = await teams.list();
        const isAdminMember = userTeams.teams.some(team => team.$id === ADMIN_TEAM_ID || team.name.toLowerCase() === 'admins');
        if (isAdminMember) role = "admin";
      } catch (e) {
        console.warn("Could not fetch teams", e);
      }

      setUser({
        id: sessionUser.$id,
        email: sessionUser.email,
        username: sessionUser.name || sessionUser.email.split("@")[0],
        avatarUrl: null,
        role,
        emailVerification: sessionUser.emailVerification || false,
      });
      console.log("Current Auth Status:", { id: sessionUser.$id, email: sessionUser.email, role });
    } catch (error: any) {
      // Handle 401 errors gracefully - user is not logged in (guest)
      if (error.code === 401) {
        console.log("No active session - User is a guest");
        setUser(null);
      } else {
        console.error("Auth status check failed:", error);
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkUserStatus();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      await account.createEmailPasswordSession(email, password);
      await checkUserStatus();
      return true;
    } catch (error: any) {
      if (error?.code === 401 && error?.message?.includes('active')) {
        // Session already active, just refresh user status
        await checkUserStatus();
        return true;
      }
      console.error("Login failed:", error);
      return false;
    }
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      // This will redirect the user
      account.createOAuth2Session(
        OAuthProvider.Google,
        window.location.origin + '/dashboard',
        window.location.origin + '/login'
      );
      return true;
    } catch (error) {
      console.error("Google login failed:", error);
      return false;
    }
  };

  const register = async (email: string, password: string): Promise<boolean> => {
    try {
      // 1. Create User Account
      await account.create(ID.unique(), email, password);

      // 2. CRITICAL: Create Session (Log them in immediately)
      // This is required before sending verification emails
      try {
        await account.createEmailPasswordSession(email, password);
      } catch (sessionError: any) {
        if (sessionError?.code === 401 && sessionError?.message?.includes('active')) {
          console.log("Session already active, proceeding to verification...");
        } else {
          throw sessionError;
        }
      }

      // 3. Send Verification Email (now user has active session)
      await account.createVerification(`${window.location.origin}/verify-email`);

      console.log('Account created, session started, and verification email sent');

      return true;
    } catch (error: any) {
      console.error("Registration failed:", error);

      // Provide more specific error messages based on Appwrite error codes
      if (error?.code) {
        switch (error.code) {
          case 409: // User already exists
            throw new Error("This email is already registered. Please try logging in instead.");
          case 400: // Bad request - invalid email or password
            if (error.message?.includes('email')) {
              throw new Error("Please enter a valid email address.");
            } else if (error.message?.includes('password')) {
              throw new Error("Password must be at least 8 characters long.");
            }
            throw new Error("Invalid registration details. Please check your email and password.");
          case 429: // Too many requests
            throw new Error("Too many registration attempts. Please wait a few minutes and try again.");
          case 401: // Unauthorized - API key issues
            throw new Error("Authentication service configuration error. Please check Appwrite project settings.");
          case 403: // Forbidden - missing scopes
            throw new Error("Appwrite project permissions not configured correctly. Please follow the setup guide.");
          case 503: // Service unavailable
            throw new Error("Registration service is temporarily unavailable. Please try again later.");
          default:
            throw new Error(`Registration failed: ${error.message || 'Unknown error'}`);
        }
      }

      // Fallback for network or other errors
      if (error?.message?.includes('fetch')) {
        throw new Error("Network error. Please check your internet connection and try again.");
      }

      throw new Error("Registration failed. Please try again.");
    }
  };

  const updateProfile: AuthContextType["updateProfile"] = async (data) => {
    try {
      if (data.username) {
        await account.updateName(data.username);
      }

      if (data.newPassword && data.currentPassword) {
        await account.updatePassword(data.newPassword, data.currentPassword);
      }

      await checkUserStatus();
      return true;
    } catch (error) {
      console.error("Update profile failed:", error);
      return false;
    }
  };

  const sendVerificationEmail = async (): Promise<boolean> => {
    try {
      await account.createVerification(`${window.location.origin}/verify-email`);
      return true;
    } catch (error: any) {
      console.error("Failed to send verification email:", error);
      return false;
    }
  };

  const refreshUser = async () => {
    try {
      await checkUserStatus();
    } catch (error) {
      console.error("Failed to refresh user:", error);
    }
  };

  const logout = async () => {
    try {
      await account.deleteSession('current');
      setUser(null);
      // Force a page reload to ensure clean state and redirect to login
      window.location.href = '/login';
    } catch (error) {
      console.error("Logout failed:", error);
      // Even if logout fails, clear local state and redirect to login
      setUser(null);
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
        isLoading,
        login,
        loginWithGoogle,
        register,
        updateProfile,
        sendVerificationEmail,
        refreshUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
