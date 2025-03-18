
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BookCard from '@/components/BookCard';
import { Book } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';

const mockBooks: Book[] = [
  {
    id: '1',
    title: 'Мастер и Маргарита',
    author: { id: '3', name: 'Михаил Булгаков' },
    description: 'Классический роман о добре и зле, о жизни и смерти, о любви и ненависти.',
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

const Favorites: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [favoriteBooks, setFavoriteBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    // Fetch favorites from localStorage
    const favorites = JSON.parse(localStorage.getItem('orenkniga-favorites') || '[]');
    const favoriteBooksList = mockBooks.filter(book => favorites.includes(book.id));
    
    setFavoriteBooks(favoriteBooksList);
    setLoading(false);
  }, [user, navigate]);
  
  const removeFavorite = (bookId: string) => {
    const favorites = JSON.parse(localStorage.getItem('orenkniga-favorites') || '[]');
    const updatedFavorites = favorites.filter((id: string) => id !== bookId);
    localStorage.setItem('orenkniga-favorites', JSON.stringify(updatedFavorites));
    
    setFavoriteBooks(prev => prev.filter(book => book.id !== bookId));
    toast({
      title: "Успешно",
      description: "Удалено из избранного",
      variant: "default",
    });
  };
  
  if (loading) {
    return (
      <Layout className="pb-20">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-pulse space-y-4 w-full max-w-md">
            <div className="h-6 bg-muted rounded w-3/4"></div>
            <div className="h-64 bg-muted rounded w-full"></div>
            <div className="h-64 bg-muted rounded w-full"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout className="pb-20">
      <div className="px-4 pt-6 pb-6 space-y-6">
        <header>
          <h1 className="text-2xl font-semibold">Избранное</h1>
          <p className="text-muted-foreground">Сохраненные книги</p>
        </header>
        
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
          <div className="text-center py-12 space-y-4">
            <Heart className="h-12 w-12 mx-auto text-muted" />
            <h2 className="text-lg font-medium">Нет избранных книг</h2>
            <p className="text-muted-foreground">
              Добавляйте книги в избранное, чтобы быстро находить их
            </p>
            <Button 
              onClick={() => navigate('/catalog')}
              className="mt-4"
            >
              Перейти в каталог
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Favorites;
