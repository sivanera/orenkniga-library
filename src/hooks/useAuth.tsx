
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { User, UserRole } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  logout: () => void;
  updateProfile: (user: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock storage for demo purposes
const USERS_STORAGE_KEY = 'orenkniga-users';
const CURRENT_USER_KEY = 'orenkniga-current-user';

const mockUsers = [
  {
    id: '1',
    email: 'author@example.com',
    name: 'Иван Автор',
    role: 'author' as UserRole,
    avatar: '',
    bio: 'Автор популярных романов и рассказов'
  },
  {
    id: '2',
    email: 'reader@example.com',
    name: 'Анна Читатель',
    role: 'reader' as UserRole,
    avatar: '',
    bio: 'Люблю классическую литературу и современные романы'
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize mock users if not already present
    const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    if (!storedUsers) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(mockUsers));
    }

    // Check if user is already logged in
    const currentUser = localStorage.getItem(CURRENT_USER_KEY);
    if (currentUser) {
      setUser(JSON.parse(currentUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // In a real app, this would be an API call
      const storedUsers = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
      const user = storedUsers.find((u: User) => u.email === email);
      
      if (!user) {
        throw new Error('Пользователь не найден');
      }
      
      // In a real app, we would verify the password here
      
      setUser(user);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      toast({
        title: "Успешный вход в систему!",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: (error as Error).message || 'Ошибка входа',
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, role: UserRole) => {
    setIsLoading(true);
    try {
      // In a real app, this would be an API call
      const storedUsers = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
      
      if (storedUsers.some((u: User) => u.email === email)) {
        throw new Error('Пользователь с таким email уже существует');
      }
      
      const newUser: User = {
        id: Date.now().toString(),
        email,
        name,
        role,
        avatar: '',
        bio: ''
      };
      
      const updatedUsers = [...storedUsers, newUser];
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
      
      setUser(newUser);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
      toast({
        title: "Регистрация успешна!",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: (error as Error).message || 'Ошибка регистрации',
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
    toast({
      title: "Вы вышли из системы",
      variant: "default",
    });
  };

  const updateProfile = async (updatedInfo: Partial<User>) => {
    if (!user) return;
    
    try {
      const storedUsers = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
      const updatedUsers = storedUsers.map((u: User) => 
        u.id === user.id ? { ...u, ...updatedInfo } : u
      );
      
      const updatedUser = { ...user, ...updatedInfo };
      
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
      
      setUser(updatedUser);
      toast({
        title: "Профиль обновлен",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Не удалось обновить профиль",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
