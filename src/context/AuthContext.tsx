import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types.ts';

interface AuthContextType {
  currentUser: User | null;
  isLoggedIn: boolean;
  allUsers: User[];
  setCurrentUser: (user: User | null) => void;
  switchUserById: (userId: string) => void;
  switchRole: (role: UserRole) => void;
  login: (email: string, password?: string) => Promise<boolean>;
  register: (userData: Omit<User, 'user_id'>) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
  isOrganizer: boolean;
  isStudent: boolean;
  refreshUsers: () => Promise<void>;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
}

const defaultStudent: User = {
  user_id: 'usr_stu_01',
  name: 'Aarav Patel',
  email: 'aarav.patel@campus.edu',
  role: 'student',
  avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  college_id: 'CS-2024-042',
  department: 'Computer Science & Engineering',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('smart_campus_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return defaultStudent;
      }
    }
    return defaultStudent;
  });

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setAllUsers(data);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSetUser = (user: User | null) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem('smart_campus_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('smart_campus_user');
    }
  };

  const login = async (email: string, password?: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        handleSetUser(data.user);
        await fetchUsers();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const register = async (userData: Omit<User, 'user_id'>): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (res.ok) {
        handleSetUser(data);
        await fetchUsers();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const logout = () => {
    handleSetUser(null);
  };

  const switchUserById = (userId: string) => {
    const found = allUsers.find((u) => u.user_id === userId);
    if (found) {
      handleSetUser(found);
    }
  };

  const switchRole = (role: UserRole) => {
    const found = allUsers.find((u) => u.role === role);
    if (found) {
      handleSetUser(found);
    } else if (currentUser) {
      handleSetUser({
        ...currentUser,
        role,
      });
    }
  };

  const isLoggedIn = currentUser !== null;
  const isAdmin = currentUser?.role === 'admin';
  const isOrganizer = currentUser?.role === 'organizer' || currentUser?.role === 'admin';
  const isStudent = currentUser?.role === 'student';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoggedIn,
        allUsers,
        setCurrentUser: handleSetUser,
        switchUserById,
        switchRole,
        login,
        register,
        logout,
        isAdmin,
        isOrganizer,
        isStudent,
        refreshUsers: fetchUsers,
        isLoginModalOpen,
        setIsLoginModalOpen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
