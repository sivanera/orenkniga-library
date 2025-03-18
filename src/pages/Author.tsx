
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookText, 
  ChevronLeft, 
  Edit,
  Trash2,
  Upload,
  Star,
  Eye,
  Pencil
} from 'lucide-react';
import { Book } from '@/lib/types';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

// Mock data
const mockAuthorBooks: Book[] = [
  {
    id: '5',
    title: 'Мой первый роман',
    author: { id: '1', name: 'Иван Автор' },
    description: 'Дебютный роман о приключениях молодого человека в большом городе.',
    genres: ['Приключения', 'Современная проза'],
    rating: 4.2,
    reviewCount: 32,
    publishedDate: '2023-05-15'
  },
  {
    id: '6',
    title: 'Летние истории',
    author: { id: '1', name: 'Иван Автор' },
    description: 'Сборник коротких рассказов о лете и отдыхе.',
    genres: ['Рассказы', 'Лирика'],
    rating: 4.5,
    reviewCount: 18,
    publishedDate: '2023-07-20'
  }
];

const Author: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    genre: '',
    content: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
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
    
    // In a real app, this would be an API call to get user's books
    setBooks(mockAuthorBooks);
  }, [user, navigate]);
  
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUploadForm(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'text/plain') {
        toast.error('Пожалуйста, загрузите файл в формате .txt');
        return;
      }
      setSelectedFile(file);
    }
  };
  
  const handleBookUpload = () => {
    if (!selectedFile) {
      toast.error('Пожалуйста, загрузите файл');
      return;
    }
    
    if (!uploadForm.title || !uploadForm.description) {
      toast.error('Заполните все обязательные поля');
      return;
    }
    
    // In a real app, this would be an API call to upload book
    
    const newBook: Book = {
      id: Date.now().toString(),
      title: uploadForm.title,
      author: { id: user!.id, name: user!.name },
      description: uploadForm.description,
      genres: uploadForm.genre.split(',').map(g => g.trim()),
      rating: 0,
      reviewCount: 0,
      publishedDate: new Date().toISOString().split('T')[0]
    };
    
    setBooks(prev => [newBook, ...prev]);
    setUploadForm({
      title: '',
      description: '',
      genre: '',
      content: ''
    });
    setSelectedFile(null);
    setIsUploadDialogOpen(false);
    
    toast.success('Произведение успешно загружено');
  };
  
  const handleDeleteBook = () => {
    if (!selectedBook) return;
    
    // In a real app, this would be an API call to delete book
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
            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-1">
                  <Upload className="h-4 w-4" />
                  <span>Загрузить</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Загрузить новое произведение</DialogTitle>
                  <DialogDescription>
                    Заполните информацию и загрузите файл в формате .txt
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Название</Label>
                    <Input
                      id="title"
                      name="title"
                      value={uploadForm.title}
                      onChange={handleFormChange}
                      placeholder="Введите название произведения"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Описание</Label>
                    <Textarea
                      id="description"
                      name="description"
                      rows={3}
                      value={uploadForm.description}
                      onChange={handleFormChange}
                      placeholder="Краткое описание произведения"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="genre">Жанры</Label>
                    <Input
                      id="genre"
                      name="genre"
                      value={uploadForm.genre}
                      onChange={handleFormChange}
                      placeholder="Жанры через запятую (напр.: Фантастика, Роман)"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="file">Файл произведения (.txt)</Label>
                    <Input
                      id="file"
                      type="file"
                      accept=".txt"
                      onChange={handleFileChange}
                    />
                    <p className="text-xs text-muted-foreground">
                      Максимальный размер файла: 10MB
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                    Отмена
                  </Button>
                  <Button onClick={handleBookUpload}>
                    Загрузить
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          <Tabs defaultValue="books" className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="books">
                <BookText className="h-4 w-4 mr-1" />
                Произведения
              </TabsTrigger>
              <TabsTrigger value="stats">
                <Star className="h-4 w-4 mr-1" />
                Статистика
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="books">
              {books.length > 0 ? (
                <div className="space-y-3">
                  {books.map((book) => (
                    <div key={book.id} className="border rounded-lg overflow-hidden">
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{book.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              Опубликовано: {new Date(book.publishedDate).toLocaleDateString('ru-RU')}
                            </p>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className="text-amber-500 text-sm">★</span>
                            <span className="text-sm">{book.rating.toFixed(1)}</span>
                            <span className="text-sm text-muted-foreground">({book.reviewCount})</span>
                          </div>
                        </div>
                        
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
                          onClick={() => toast.info("Редактирование произведений будет доступно в следующей версии")}
                        >
                          <Edit className="h-4 w-4" />
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
                <div className="text-center py-8 text-muted-foreground">
                  <Pencil className="h-10 w-10 mx-auto mb-2 text-muted" />
                  <p>У вас пока нет загруженных произведений</p>
                  <Button 
                    variant="link" 
                    onClick={() => setIsUploadDialogOpen(true)}
                    className="mt-2"
                  >
                    Загрузить первое произведение
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="stats">
              <div className="text-center py-8 bg-muted/20 rounded-lg">
                <h3 className="font-medium">Статистика будет доступна в следующей версии</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Здесь вы сможете просматривать статистику чтения, отзывы и рейтинги
                </p>
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
