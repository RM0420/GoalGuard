import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";

/**
 * @interface AuthContextType
 * Defines the shape of the authentication context, including session, user, loading state,
 * and authentication functions.
 */
interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

/**
 * `AuthContext` provides authentication state and functions to its children components.
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * @interface AuthProviderProps
 * Defines the props for the AuthProvider component.
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * `AuthProvider` is a component that wraps parts of the application
 * needing access to authentication state. It initializes Supabase auth listeners
 * and provides the AuthContext value to its children.
 * @param {AuthProviderProps} props - The props for the component.
 * @returns {JSX.Element} The provider component.
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    // Check for an existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  /**
   * Signs in a user with their email and password using Supabase Auth.
   * @param {string} email - The user's email.
   * @param {string} password - The user's password.
   */
  const signInWithEmail = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      // Session will be set by onAuthStateChange listener
    } catch (error) {
      console.error("Error signing in:", error);
      // Handle error (e.g., show a message to the user)
    } finally {
      setLoading(false);
    }
  };

  /**
   * Signs up a new user with their email and password using Supabase Auth.
   * @param {string} email - The user's email.
   * @param {string} password - The user's password.
   */
  const signUpWithEmail = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      // Session will be set by onAuthStateChange listener
      // Or, you might want to manually fetch and set session here if signUp doesn't trigger it as expected
      // For now, relying on onAuthStateChange
    } catch (error) {
      console.error("Error signing up:", error);
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  /**
   * Signs out the current user using Supabase Auth.
   */
  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      // Session and user will be cleared by onAuthStateChange listener
    } catch (error) {
      console.error("Error signing out:", error);
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  const value = {
    session,
    user,
    loading,
    signInWithEmail,
    signUpWithEmail,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * `useAuth` is a custom hook to easily access the `AuthContext`.
 * Throws an error if used outside of an `AuthProvider`.
 * @returns {AuthContextType} The authentication context.
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
