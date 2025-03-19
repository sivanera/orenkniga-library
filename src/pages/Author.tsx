
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookText, 
  ChevronLeft, 
  Trash2,
  Upload,
  Eye,
  Pencil,
  BarChart
} from 'lucide-react';
import { Book } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Получаем книги из localStorage
const getAuthorBooks = (userId: string): Book[] => {
  const storedBooks = localStorage.getItem('orenkniga-author-books');
  if (!storedBooks) return [];
  
  const authorBooks = JSON.parse(storedBooks);
  // Фильтруем книги по ID автора
  return authorBooks.filter((book: Book) => book.author.id === userId);
};

const Author: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (user.role !== 'author') {
      navigate('/');
      toast.error('Доступ только для авторов');
      return;
    }
    
    // Получаем книги автора
    setBooks(getAuthorBooks(user.id));
  }, [user, navigate]);
  
  const handleDeleteBook = () => {
    if (!selectedBook) return;
    
    // В реальном приложении здесь был бы API-запрос
    // Удаляем из localStorage для демонстрации
    const authorBooks = JSON.parse(localStorage.getItem('orenkniga-author-books') || '[]');
    const updatedBooks = authorBooks.filter((book: Book) => book.id !== selectedBook.id);
    localStorage.setItem('orenkniga-author-books', JSON.stringify(updatedBooks));
    
    setBooks(prev => prev.filter(book => book.id !== selectedBook.id));
    setIsDeleteDialogOpen(false);
    toast.success('Произведение удалено');
  };
  
  const confirmDelete = (book: Book) => {
    setSelectedBook(book);
    setIsDeleteDialogOpen(true);
  };
  
  if (!user || user.role !== 'author') {
    return null; // Will redirect in useEffect
  }

  return (
    <Layout className="pb-20">
      <div className="px-4 pt-6 pb-6 space-y-6">
        <header className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full shrink-0"
            onClick={() => navigate('/profile')}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Панель автора</h1>
        </header>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Мои произведения</h2>
            <Button 
              className="flex items-center gap-1"
              onClick={() => navigate('/author/upload')}
            >
              <Upload className="h-4 w-4" />
              <span>Загрузить</span>
            </Button>
          </div>
          
          <Tabs defaultValue="books" className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="books">
                <BookText className="h-4 w-4 mr-1" />
                Произведения
              </TabsTrigger>
              <TabsTrigger value="stats">
                <BarChart className="h-4 w-4 mr-1" />
                Статистика
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="books">
              {books.length > 0 ? (
                <div className="space-y-3">
                  {books.map((book) => (
                    <div key={book.id} className="border rounded-lg overflow-hidden bg-card hover:shadow-sm transition-shadow">
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex gap-3">
                            {book.cover && (
                              <div className="w-16 h-24 rounded overflow-hidden flex-shrink-0 border">
                                <img 
                                  src={book.cover} 
                                  alt={book.title} 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div>
                              <h3 className="font-medium">{book.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                Опубликовано: {new Date(book.publishedDate).toLocaleDateString('ru-RU')}
                              </p>
                              <p className="text-sm mt-2 line-clamp-2">{book.description}</p>
                              
                              <div className="flex flex-wrap gap-1 mt-2">
                                {book.genres.map((genre, i) => (
                                  <span 
                                    key={i}
                                    className="text-xs bg-secondary px-2 py-0.5 rounded-full"
                                  >
                                    {genre}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className="text-amber-500 text-sm">★</span>
                            <span className="text-sm">{book.rating.toFixed(1)}</span>
                            <span className="text-sm text-muted-foreground">({book.reviewCount})</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border-t grid grid-cols-3 divide-x">
                        <Button 
                          variant="ghost" 
                          className="py-2 rounded-none flex items-center justify-center gap-1"
                          onClick={() => navigate(`/book/${book.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                          <span className="text-sm">Просмотр</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          className="py-2 rounded-none flex items-center justify-center gap-1"
                          onClick={() => navigate(`/author/edit/${book.id}`)}
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="text-sm">Редактировать</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          className="py-2 rounded-none flex items-center justify-center gap-1 text-destructive hover:text-destructive/90"
                          onClick={() => confirmDelete(book)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="text-sm">Удалить</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground bg-muted/10 rounded-lg">
                  <Pencil className="h-10 w-10 mx-auto mb-2 text-muted" />
                  <p>У вас пока нет загруженных произведений</p>
                  <Button 
                    variant="link" 
                    onClick={() => navigate('/author/upload')}
                    className="mt-2"
                  >
                    Загрузить первое произведение
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="stats">
              <div className="space-y-4">
                <div className="text-center py-8 bg-muted/10 rounded-lg">
                  <h3 className="font-medium">Статистика чтения</h3>
                  {books.length > 0 ? (
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {books.map(book => (
                        <div key={book.id} className="border rounded-md p-3 bg-card">
                          <h4 className="font-medium text-sm truncate">{book.title}</h4>
                          <div className="flex justify-between mt-2 text-sm">
                            <span>Просмотры:</span>
                            <span className="font-medium">{Math.floor(Math.random() * 100) + 10}</span>
                          </div>
                          <div className="flex justify-between mt-1 text-sm">
                            <span>Рейтинг:</span>
                            <span className="font-medium text-amber-500">
                              {book.rating.toFixed(1)} <span className="text-xs">({book.reviewCount})</span>
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-4">
                      Загрузите произведения, чтобы видеть их статистику
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить произведение</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить "{selectedBook?.title}"? Это действие невозможно отменить.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={handleDeleteBook}>
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Author;
