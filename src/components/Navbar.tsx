
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, BookOpen, Heart, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const navItems = [
    {
      name: 'Главная',
      path: '/',
      icon: Home
    },
    {
      name: 'Каталог',
      path: '/catalog',
      icon: BookOpen
    },
    {
      name: 'Избранное',
      path: '/favorites',
      icon: Heart
    },
    {
      name: 'Профиль',
      path: '/profile',
      icon: User
    }
  ];

  return (
    <nav className="sticky bottom-0 w-full glass-effect shadow-lg px-2 py-2 z-50">
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-lg transition-all",
                "w-16 h-16 space-y-1",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn(
                "h-6 w-6 transition-transform duration-200",
                isActive ? "scale-110" : ""
              )} />
              <span className={cn(
                "text-xs font-medium transition-all duration-200",
                isActive ? "opacity-100" : "opacity-70"
              )}>
                {item.name}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Navbar;
