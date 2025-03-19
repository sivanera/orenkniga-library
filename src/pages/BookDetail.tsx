import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useParams, useNavigate } from 'react-router-dom';
import { Book, Review } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, Bookmark, Heart, Share2, Star, User, Clock, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import UserAvatar from '@/components/UserAvatar';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

const mockBooks: Book[] = [
  {
    id: '1',
    title: 'Мастер и Маргарита',
    author: { id: '3', name: 'Михаил Булгаков' },
    description: 'Роман «Мастер и Маргарита» - одно из самых загадочных и мистических произведений XX века. Сочетание реальности и фантастики, сатиры и глубокой философии делает его уникальным в мировой литературе. В романе переплетаются две сюжетные линии: история Понтия Пилата и история Мастера и Маргариты в Москве 1930-х годов. Воланд, появляющийся в советской Москве со своей свитой, становится катализатором удивительных событий. Роман затрагивает вечные темы любви и преданности, добра и зла, творчества и ответственности.',
    genres: ['Классика', 'Фантастика', 'Роман'],
    rating: 4.8,
    reviewCount: 1240,
    publishedDate: '1967-01-01'
  },
  {
    id: '2',
    title: 'Преступление и наказание',
    author: { id: '4', name: 'Федор Достоевский' },
    description: 'Психологический роман о нравственных мучениях и преступлении.',
    genres: ['Классика', 'Психология', 'Роман'],
    rating: 4.7,
    reviewCount: 983,
    publishedDate: '1866-01-01'
  },
  {
    id: '3',
    title: 'Тихий Дон',
    author: { id: '5', name: 'Михаил Шолохов' },
    description: 'Эпопея о донском казачестве в Первой мировой и Гражданской войнах.',
    genres: ['Классика', 'История', 'Роман'],
    rating: 4.6,
    reviewCount: 754,
    publishedDate: '1928-01-01'
  },
  {
    id: '4',
    title: 'Война и мир',
    author: { id: '6', name: 'Лев Толстой' },
    cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=687&auto=format&fit=crop',
    description: 'Эпический роман о русском обществе в эпоху войн против Наполеона.',
    genres: ['Классика', 'История', 'Роман'],
    rating: 4.9,
    reviewCount: 1427,
    publishedDate: '1869-01-01'
  },
];

const mockReviews: Review[] = [
  {
    id: '1',
    bookId: '1',
    userId: '10',
    userName: 'Александр',
    rating: 5,
    text: 'Потрясающее произведение! Булгаков создал уникальный мир, сочетающий реальность и фантастику. История Мастера и Маргариты трогает до глубины души.',
    date: '2023-04-15'
  },
  {
    id: '2',
    bookId: '1',
    userId: '11',
    userName: 'Елена',
    rating: 4,
    text: 'Очень понравилось, но некоторые моменты показались затянутыми. Тем не менее, это классика, которую должен прочитать кажды��!',
    date: '2023-03-22'
  },
  {
    id: '3',
    bookId: '1',
    userId: '12',
    userName: 'Михаил',
    rating: 5,
    text: 'Перечитываю уже третий раз и каждый раз нахожу что-то новое. Великолепный роман с глубоким философским подтекстом.',
    date: '2023-02-10'
  }
];

const BookDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [book, setBook] = useState<Book | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  
  useEffect(() => {
    let fetchedBook = mockBooks.find((b) => b.id === id);
    
    if (!fetchedBook) {
      const authorBooks = JSON.parse(localStorage.getItem('orenkniga-author-books') || '[]');
      fetchedBook = authorBooks.find((b: Book) => b.id === id);
    }
    
    const fetchedReviews = mockReviews.filter((r) => r.bookId === id);
    
    setTimeout(() => {
      setBook(fetchedBook || null);
      setReviews(fetchedReviews);
      setLoading(false);
    }, 500);
    
    const favorites = JSON.parse(localStorage.getItem('orenkniga-favorites') || '[]');
    setIsFavorite(favorites.includes(id));
  }, [id]);
  
  const toggleFavorite = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    const favorites = JSON.parse(localStorage.getItem('orenkniga-favorites') || '[]');
    
    if (isFavorite) {
      const updatedFavorites = favorites.filter((bookId: string) => bookId !== id);
      localStorage.setItem('orenkniga-favorites', JSON.stringify(updatedFavorites));
      setIsFavorite(false);
      toast.success('Удалено из избранного');
    } else {
      const updatedFavorites = [...favorites, id];
      localStorage.setItem('orenkniga-favorites', JSON.stringify(updatedFavorites));
      setIsFavorite(true);
      toast.success('Добавлено в избранное');
    }
  };
  
  const handleReadBook = () => {
    if (book) {
      navigate(`/reader/${book.id}`);
    }
  };
  
  const handleDownload = () => {
    toast.success('Книга загружена для офлайн чтения');
  };
  
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Ссылка скопирована в буфер обмена');
  };

  if (loading) {
    return (
      <Layout className="pb-20">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-pulse space-y-4 w-full max-w-md">
            <div className="h-6 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-64 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-5/6"></div>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (!book) {
    return (
      <Layout className="pb-20">
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <h1 className="text-2xl font-bold mb-4">Книга не найдена</h1>
          <p className="text-muted-foreground mb-6">Запрошенная книга не существует или была удалена</p>
          <Button onClick={() => navigate('/catalog')}>Вернуться в каталог</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout className="pb-20">
      <div className="px-4 pt-6 pb-6 space-y-6">
        <header className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full shrink-0"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold line-clamp-1">{book.title}</h1>
        </header>
        
        <div className="flex gap-4">
          <div className="w-1/3 aspect-[2/3] bg-muted rounded-lg overflow-hidden shrink-0">
            {book.cover ? (
              <img 
                src={book.cover} 
                alt={book.title} 
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-primary/10">
                <span className="text-primary/50 font-medium">OrenKniga</span>
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0 space-y-3">
            <div>
              <h2 className="text-lg font-medium">{book.title}</h2>
              <p className="text-primary">{book.author.name}</p>
            </div>
            
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star}
                  className={cn(
                    "h-4 w-4",
                    star <= Math.round(book.rating) 
                      ? "fill-amber-500 text-amber-500" 
                      : "text-muted"
                  )}
                />
              ))}
              <span className="text-sm ml-1">{book.rating.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">({book.reviewCount})</span>
            </div>
            
            <div className="flex flex-wrap gap-1">
              {book.genres.map((genre) => (
                <span 
                  key={genre}
                  className="text-xs bg-secondary px-2 py-1 rounded-full"
                >
                  {genre}
                </span>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant={isFavorite ? "default" : "outline"}
                size="icon"
                className={cn(
                  "rounded-full",
                  isFavorite ? "bg-primary text-white" : ""
                )}
                onClick={toggleFavorite}
              >
                <Heart className={cn("h-4 w-4", isFavorite ? "fill-current" : "")} />
              </Button>
              
              <Button 
                variant="outline"
                size="icon"
                className="rounded-full"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="outline"
                size="icon"
                className="rounded-full"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button className="flex-1" onClick={handleReadBook}>
            Читать
          </Button>
          <Button variant="outline" className="flex items-center gap-1">
            <Bookmark className="h-4 w-4" />
            <span>Продолжить</span>
          </Button>
        </div>
        
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="description">Описание</TabsTrigger>
            <TabsTrigger value="reviews">Отзывы</TabsTrigger>
          </TabsList>
          
          <TabsContent value="description" className="pt-4 text-balance text-sm">
            <p>{book.description}</p>
            
            <div className="mt-6 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{book.author.name}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {new Date(book.publishedDate).toLocaleDateString('ru-RU', {
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="reviews" className="pt-4">
            <div className="space-y-4">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <UserAvatar 
                          user={{ 
                            name: review.userName, 
                            avatar: review.userAvatar 
                          }} 
                          size="sm"
                        />
                        <div>
                          <p className="font-medium text-sm">{review.userName}</p>
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star 
                                key={star}
                                className={cn(
                                  "h-3 w-3",
                                  star <= review.rating 
                                    ? "fill-amber-500 text-amber-500" 
                                    : "text-muted"
                                )}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.date).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                    <p className="text-sm">{review.text}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Отзывов пока нет</p>
                  <p className="text-sm mt-1">Будьте первым, кто оставит отзыв</p>
                </div>
              )}
              
              {user && (
                <Button variant="outline" className="w-full" onClick={() => toast.info('Функция оставления отзывов будет доступна в следующей версии')}>
                  Оставить отзыв
                </Button>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default BookDetail;
