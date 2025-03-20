import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import UserAvatar from '@/components/UserAvatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { 
  BookMarked, 
  Edit, 
  LogOut, 
  Settings, 
  Heart,
  History,
  Globe,
  Moon,
  PenTool,
  Upload,
  ChevronRight
} from 'lucide-react';
import BookCard from '@/components/BookCard';
import { Book } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

const Profile: React.FC = () => {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [favoriteBooks, setFavoriteBooks] = useState<Book[]>([]);
  const [historyBooks, setHistoryBooks] = useState<Book[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    bio: ''
  });
  
  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    setProfileForm({
      name: user.name,
      bio: user.bio || ''
    });
    
    const authorBooks = JSON.parse(localStorage.getItem('orenkniga-author-books') || '[]');
    const favorites = JSON.parse(localStorage.getItem('orenkniga-favorites') || '[]');
    const favoriteBooksList = authorBooks.filter((book: Book) => favorites.includes(book.id));
    setFavoriteBooks(favoriteBooksList);
    
    setHistoryBooks([]);
  }, [user, navigate]);
  
  const handleLogout = () => {
    logout();
    navigate('/auth');
  };
  
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmitProfile = () => {
    updateProfile({
      name: profileForm.name,
      bio: profileForm.bio
    });
    setEditMode(false);
  };
  
  const removeFavorite = (bookId: string) => {
    const favorites = JSON.parse(localStorage.getItem('orenkniga-favorites') || '[]');
    const updatedFavorites = favorites.filter((id: string) => id !== bookId);
    localStorage.setItem('orenkniga-favorites', JSON.stringify(updatedFavorites));
    
    setFavoriteBooks(prev => prev.filter(book => book.id !== bookId));
    toast.success('Удалено из избранного');
  };
  
  if (!user) {
    return null;
  }

  return (
    <Layout className="pb-20">
      <div className="px-4 pt-6 pb-6 space-y-6">
        <Card className="overflow-hidden border">
          <div className="h-24 bg-gradient-to-r from-primary/80 to-accent/80"></div>
          <CardContent className="pt-0 relative">
            <div className="flex flex-col items-center -mt-10 text-center">
              <UserAvatar user={user} size="lg" className="border-4 border-background" />
              
              {!editMode ? (
                <>
                  <h2 className="text-xl font-semibold mt-2">{user.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {user.role === 'author' ? 'Автор' : 'Читатель'}
                  </p>
                  
                  {user.bio && (
                    <p className="text-sm mt-2 max-w-md">
                      {user.bio}
                    </p>
                  )}
                  
                  <div className="flex gap-2 mt-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="rounded-full"
                      onClick={() => setEditMode(true)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Редактировать
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="rounded-full"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4 mr-1" />
                      Выйти
                    </Button>
                  </div>
                </>
              ) : (
                <div className="w-full mt-4 space-y-4">
                  <div className="space-y-2 text-left">
                    <Label htmlFor="name">Имя</Label>
                    <Input
                      id="name"
                      name="name"
                      value={profileForm.name}
                      onChange={handleFormChange}
                    />
                  </div>
                  
                  <div className="space-y-2 text-left">
                    <Label htmlFor="bio">О себе</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      rows={3}
                      placeholder="Расскажите немного о себе..."
                      value={profileForm.bio}
                      onChange={handleFormChange}
                    />
                  </div>
                  
                  <div className="flex gap-2 justify-end">
                    <Button 
                      variant="outline"
                      onClick={() => setEditMode(false)}
                    >
                      Отмена
                    </Button>
                    <Button onClick={handleSubmitProfile}>
                      Сохранить
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Tabs defaultValue="favorites" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="favorites">
              <Heart className="h-4 w-4 mr-1" />
              Избранное
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="h-4 w-4 mr-1" />
              История
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-1" />
              Настройки
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="favorites">
            {favoriteBooks.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {favoriteBooks.map((book) => (
                  <BookCard 
                    key={book.id} 
                    book={book} 
                    isFavorite={true}
                    onFavoriteToggle={() => removeFavorite(book.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Heart className="h-10 w-10 mx-auto mb-2 text-muted" />
                <p>У вас пока нет избранных книг</p>
                <Button 
                  variant="link" 
                  onClick={() => navigate('/catalog')}
                  className="mt-2"
                >
                  Перейти в каталог
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="history">
            <div className="text-center py-8 text-muted-foreground">
              <History className="h-10 w-10 mx-auto mb-2 text-muted" />
              <p>История чтения пуста</p>
              <Button 
                variant="link" 
                onClick={() => navigate('/catalog')}
                className="mt-2"
              >
                Начать читать
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="settings">
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">Приложение</h3>
                <div className="space-y-2">
                  {[
                    { icon: Globe, label: 'Язык' },
                    { icon: Moon, label: 'Темная тема' }
                  ].map((item, i) => (
                    <Button 
                      key={i}
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => toast.info(`Настройка "${item.label}" будет доступна в следующей версии`)}
                    >
                      <item.icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </Button>
                  ))}
                </div>
              </div>
              
              {user.role === 'author' && (
                <div className="space-y-2">
                  <h3 className="font-medium">Авторские настройки</h3>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => navigate('/author')}
                    >
                      <PenTool className="h-4 w-4 mr-2" />
                      Мои произведения
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => navigate('/author/upload')}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Загрузить новое произведение
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="pt-4">
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Выйти из аккаунта
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Profile;
