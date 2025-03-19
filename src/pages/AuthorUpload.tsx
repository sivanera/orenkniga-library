
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  Upload,
  FileText,
  Info,
  Image as ImageIcon
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Book } from '@/lib/types';

const AuthorUpload: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    genre: '',
    content: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [previewMode, setPreviewMode] = useState(false);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  
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
  }, [user, navigate]);
  
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUploadForm(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'text/plain' && file.type !== 'application/rtf' && !file.name.endsWith('.txt')) {
        toast.error('Пожалуйста, загрузите файл в формате .txt');
        return;
      }
      setSelectedFile(file);
      
      // Читаем содержимое файла
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setFileContent(content || '');
        setUploadForm(prev => ({ ...prev, content }));
      };
      reader.readAsText(file);
    }
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Пожалуйста, загрузите файл изображения');
        return;
      }
      
      setCoverImageFile(file);
      
      // Создаем превью изображения
      const reader = new FileReader();
      reader.onload = (event) => {
        setCoverImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleBookUpload = () => {
    if (!selectedFile && !uploadForm.content) {
      toast.error('Пожалуйста, загрузите файл или введите текст произведения');
      return;
    }
    
    if (!uploadForm.title || !uploadForm.description) {
      toast.error('Заполните все обязательные поля');
      return;
    }
    
    setIsLoading(true);
    
    // Имитация отправки на сервер
    setTimeout(() => {
      const newBook: Book = {
        id: Date.now().toString(),
        title: uploadForm.title,
        author: { id: user!.id, name: user!.name },
        description: uploadForm.description,
        genres: uploadForm.genre.split(',').map(g => g.trim()),
        rating: 0,
        reviewCount: 0,
        publishedDate: new Date().toISOString().split('T')[0],
        content: uploadForm.content || fileContent,
        cover: coverImage
      };
      
      // В реальном приложении здесь был бы API-запрос
      // Сохраняем в localStorage для демонстрации
      const authorBooks = JSON.parse(localStorage.getItem('orenkniga-author-books') || '[]');
      authorBooks.push(newBook);
      localStorage.setItem('orenkniga-author-books', JSON.stringify(authorBooks));
      
      setIsLoading(false);
      toast.success('Произведение успешно загружено');
      navigate('/author');
    }, 1500);
  };
  
  if (!user || user.role !== 'author') {
    return null;
  }

  return (
    <Layout className="pb-20">
      <div className="px-4 pt-6 pb-6 space-y-6">
        <header className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full shrink-0"
            onClick={() => navigate('/author')}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Загрузка произведения</h1>
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
                    value={uploadForm.title}
                    onChange={handleFormChange}
                    placeholder="Введите название произведения"
                    className="h-12"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-base">Обложка</Label>
                  <div className="border border-dashed rounded-lg p-6 text-center bg-muted/30">
                    {coverImage ? (
                      <div className="flex flex-col items-center space-y-2">
                        <div className="relative w-32 h-48 rounded-md overflow-hidden border">
                          <img 
                            src={coverImage} 
                            alt="Предпросмотр обложки" 
                            className="w-full h-full object-cover"
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-1 right-1 h-6 w-6 p-0"
                            onClick={() => {
                              setCoverImage(null);
                              setCoverImageFile(null);
                            }}
                          >
                            ×
                          </Button>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            document.getElementById('cover-image')?.click();
                          }}
                        >
                          Изменить
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center space-y-2">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        <div className="space-y-1">
                          <p className="text-sm font-medium">
                            Загрузите обложку произведения
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Поддерживаемые форматы: JPG, PNG, GIF
                          </p>
                        </div>
                        
                        <Button
                          variant="outline"
                          onClick={() => {
                            document.getElementById('cover-image')?.click();
                          }}
                        >
                          Выбрать файл
                        </Button>
                      </div>
                    )}
                    <Input
                      id="cover-image"
                      type="file"
                      accept="image/*"
                      onChange={handleCoverImageChange}
                      className="hidden"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-base">Описание <span className="text-destructive">*</span></Label>
                  <Textarea
                    id="description"
                    name="description"
                    rows={4}
                    value={uploadForm.description}
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
                    value={uploadForm.genre}
                    onChange={handleFormChange}
                    placeholder="Жанры через запятую (напр.: Фантастика, Роман)"
                    className="h-12"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-base">Текст произведения <span className="text-destructive">*</span></Label>
                  
                  <div className="space-y-4">
                    <div className="border border-dashed rounded-lg p-6 text-center bg-muted/30">
                      <div className="flex flex-col items-center space-y-2">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                        <div className="space-y-1">
                          <p className="text-sm font-medium">
                            Загрузите файл или введите текст ниже
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Поддерживаемый формат: .txt
                          </p>
                        </div>
                        
                        <Input
                          id="file"
                          type="file"
                          accept=".txt"
                          onChange={handleFileChange}
                          className="max-w-xs"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="content" className="text-sm">
                          Текст произведения
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
                          {uploadForm.content || fileContent || <span className="text-muted-foreground italic">Нет текста для предпросмотра</span>}
                        </div>
                      ) : (
                        <Textarea
                          id="content"
                          name="content"
                          value={uploadForm.content || fileContent}
                          onChange={handleFormChange}
                          placeholder="Введите текст произведения..."
                          className="min-h-[300px] font-mono text-sm"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="h-5 w-5 mt-0.5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                После загрузки произведение будет доступно в вашей панели автора, где вы сможете его редактировать или удалить.
              </p>
            </div>
          </div>
          
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => navigate('/author')}
              disabled={isLoading}
            >
              Отмена
            </Button>
            <Button
              onClick={handleBookUpload}
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-1">
                  <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-1" />
                  Загрузка...
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Upload className="h-4 w-4" />
                  Опубликовать
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AuthorUpload;
