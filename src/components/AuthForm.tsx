
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { UserRole } from '@/lib/types';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

type AuthMode = 'login' | 'register';

const AuthForm: React.FC = () => {
  const { login, register: registerUser } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'reader' as UserRole
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({ ...prev, role: value as UserRole }));
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (mode === 'login') {
        await login(formData.email, formData.password);
      } else {
        await registerUser(formData.email, formData.password, formData.name, formData.role);
      }
    } catch (error) {
      // Error handling is done in the auth hook
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg animate-slide-up">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl">
          {mode === 'login' ? 'Вход' : 'Регистрация'}
        </CardTitle>
        <CardDescription>
          {mode === 'login' 
            ? 'Войдите, чтобы получить доступ к библиотеке' 
            : 'Создайте новый аккаунт'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div className="space-y-2">
              <Label htmlFor="name">Имя</Label>
              <Input
                id="name"
                name="name"
                placeholder="Ваше имя"
                required
                value={formData.name}
                onChange={handleChange}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="example@mail.ru"
              required
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                required
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <div className="space-y-2">
              <Label>Роль</Label>
              <RadioGroup 
                value={formData.role} 
                onValueChange={handleRoleChange}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="reader" id="reader" />
                  <Label htmlFor="reader">Читатель</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="author" id="author" />
                  <Label htmlFor="author">Автор</Label>
                </div>
              </RadioGroup>
            </div>
          )}

          <div className="flex flex-col space-y-3 pt-2">
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
            </Button>
            
            <div className="text-center text-sm">
              <span className="text-muted-foreground">
                {mode === 'login' ? 'Нет аккаунта? ' : 'Уже есть аккаунт? '}
              </span>
              <button
                type="button"
                className="text-primary hover:underline"
                onClick={toggleMode}
              >
                {mode === 'login' ? 'Зарегистрироваться' : 'Войти'}
              </button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AuthForm;
