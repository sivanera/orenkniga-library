
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ChevronLeft, 
  Save,
  FileText,
  Info,
  AlertTriangle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Book } from '@/lib/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const AuthorEdit: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [book, setBook] = useState<Book | null>(null);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [nextPath, setNextPath] = useState('');
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    genre: '',
    content: ''
  });
  const [previewMode, setPreviewMode] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
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
    
    // Загружаем данные книги
    const loadBook = () => {
      // В реальном приложении здесь был бы API-запрос
      const authorBooks = JSON.parse(localStorage.getItem('orenkniga-author-books') || '[]');
      const foundBook = authorBooks.find((b: Book) => b.id === id);
      
      if (foundBook) {
        setBook(foundBook);
        setEditForm({
          title: foundBook.title,
          description: foundBook.description,
          genre: foundBook.genres.join(', '),
          content: foundBook.content || ''
        });
      } else {
        toast.error('Произведение не найдено');
        navigate('/author');
      }
    };
    
    loadBook();
  }, [user, navigate, id]);
  
  useEffect(() => {
    if (!book) return;
    
    const hasChanged = 
      book.title !== editForm.title || 
      book.description !== editForm.description || 
      book.genres.join(', ') !== editForm.genre ||
      (book.content || '') !== editForm.content;
    
    setHasChanges(hasChanged);
  }, [book, editForm]);
  
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };
  
  const handleNavigate = (path: string) => {
    if (hasChanges) {
      setNextPath(path);
      setShowUnsavedDialog(true);
    } else {
      navigate(path);
    }
  };
  
  const handleSaveChanges = () => {
    if (!book) return;
    
    if (!editForm.title || !editForm.description || !editForm.genre) {
      toast.error('Заполните все обязательные поля');
      return;
    }
    
    setIsLoading(true);
    
    // Имитация отправки на сервер
    setTimeout(() => {
      const updatedBook: Book = {
        ...book,
        title: editForm.title,
        description: editForm.description,
        genres: editForm.genre.split(',').map(g => g.trim()),
        content: editForm.content
      };
      
      // В реальном приложении здесь был бы API-запрос
      // Обновляем в localStorage для демонстрации
      const authorBooks = JSON.parse(localStorage.getItem('orenkniga-author-books') || '[]');
      const updatedBooks = authorBooks.map((b: Book) => 
        b.id === updatedBook.id ? updatedBook : b
      );
      localStorage.setItem('orenkniga-author-books', JSON.stringify(updatedBooks));
      
      setBook(updatedBook);
      setIsLoading(false);
      setHasChanges(false);
      toast.success('Изменения сохранены');
    }, 1000);
  };
  
  if (!user || user.role !== 'author') {
    return null;
  }

  if (!book) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-[70vh]">
          <div className="animate-pulse text-center">
            <p>Загрузка произведения...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout className="pb-20">
      <div className="px-4 pt-6 pb-6 space-y-6">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full shrink-0"
              onClick={() => handleNavigate('/author')}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">Редактирование</h1>
          </div>
          
          <Button
            onClick={handleSaveChanges}
            disabled={!hasChanges || isLoading}
            size="sm"
          >
            {isLoading ? (
              <span className="flex items-center gap-1">
                <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-1" />
                Сохранение...
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Save className="h-4 w-4" />
                Сохранить
              </span>
            )}
          </Button>
        </header>
        
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-base">Название <span className="text-destructive">*</span></Label>
                  <Input
                    id="title"
                    name="title"
                    value={editForm.title}
                    onChange={handleFormChange}
                    placeholder="Введите название произведения"
                    className="h-12"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-base">Описание <span className="text-destructive">*</span></Label>
                  <Textarea
                    id="description"
                    name="description"
                    rows={4}
                    value={editForm.description}
                    onChange={handleFormChange}
                    placeholder="Краткое описание произведения"
                    className="resize-none"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="genre" className="text-base">Жанры <span className="text-destructive">*</span></Label>
                  <Input
                    id="genre"
                    name="genre"
                    value={editForm.genre}
                    onChange={handleFormChange}
                    placeholder="Жанры через запятую (напр.: Фантастика, Роман)"
                    className="h-12"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="content" className="text-base">
                      Текст произведения <span className="text-destructive">*</span>
                    </Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      type="button"
                      onClick={() => setPreviewMode(!previewMode)}
                      className="h-8 text-xs"
                    >
                      {previewMode ? 'Редактировать' : 'Предпросмотр'}
                    </Button>
                  </div>
                  
                  {previewMode ? (
                    <div className="border rounded-md p-4 min-h-[300px] max-h-[500px] overflow-y-auto whitespace-pre-wrap">
                      {editForm.content || <span className="text-muted-foreground italic">Нет текста для предпросмотра</span>}
                    </div>
                  ) : (
                    <Textarea
                      id="content"
                      name="content"
                      value={editForm.content}
                      onChange={handleFormChange}
                      placeholder="Введите текст произведения..."
                      className="min-h-[300px] font-mono text-sm"
                    />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="h-5 w-5 mt-0.5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Все изменения вступят в силу после нажатия кнопки "Сохранить".
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Несохраненные изменения</AlertDialogTitle>
            <AlertDialogDescription>
              У вас есть несохраненные изменения. Вы уверены, что хотите покинуть страницу? Все несохраненные изменения будут потеряны.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowUnsavedDialog(false)}>
              Отмена
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => navigate(nextPath)}>
              Покинуть страницу
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default AuthorEdit;
