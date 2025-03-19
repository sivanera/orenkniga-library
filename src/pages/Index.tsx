
import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ChevronRight, Search, Star, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BookCard from '@/components/BookCard';
import { Book } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';

// Mock data for demo
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

const Index: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [popularBooks, setPopularBooks] = useState<Book[]>([]);
  const [newBooks, setNewBooks] = useState<Book[]>([]);

  useEffect(() => {
    // Combine mock books with author-uploaded books from localStorage
    let allBooks = [...mockBooks];
    
    // Get author books from localStorage
    const authorBooks = JSON.parse(localStorage.getItem('orenkniga-author-books') || '[]');
    if (authorBooks.length > 0) {
      allBooks = [...allBooks, ...authorBooks];
    }
    
    // Set popular books (sorted by rating) and new books (sorted by date)
    setPopularBooks([...allBooks].sort((a, b) => b.rating - a.rating));
    setNewBooks([...allBooks].sort((a, b) => 
      new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()
    ));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <Layout className="pb-20">
      <div className="px-4 pt-6 pb-6 space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold animate-slide-down">
            {user ? `Добро пожаловать, ${user.name}` : 'OrenKniga'}
          </h1>
          <p className="text-muted-foreground animate-slide-down" style={{ animationDelay: '50ms' }}>
            Ваша персональная библиотека
          </p>
        </header>

        <form onSubmit={handleSearch} className="relative animate-slide-down" style={{ animationDelay: '100ms' }}>
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="search"
            placeholder="Поиск книг, авторов..."
            className="pl-10 pr-4"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        <div className="space-y-1 animate-slide-down" style={{ animationDelay: '150ms' }}>
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">Категории</h2>
            <Button variant="ghost" size="sm" className="text-primary text-sm" onClick={() => navigate('/catalog')}>
              Все <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar snap-x">
            {['Классика', 'Фантастика', 'Детективы', 'Романы', 'История', 'Психология'].map((category) => (
              <Button
                key={category}
                variant="outline"
                className="snap-start whitespace-nowrap"
                onClick={() => navigate(`/catalog?category=${category}`)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-4 animate-slide-down" style={{ animationDelay: '200ms' }}>
          <Tabs defaultValue="popular" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="popular" className="flex items-center">
                <TrendingUp className="mr-2 h-4 w-4" />
                Популярное
              </TabsTrigger>
              <TabsTrigger value="new" className="flex items-center">
                <BookOpen className="mr-2 h-4 w-4" />
                Новое
              </TabsTrigger>
            </TabsList>
            <TabsContent value="popular" className="pt-4">
              <div className="grid grid-cols-2 gap-3">
                {popularBooks.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="new" className="pt-4">
              <div className="grid grid-cols-2 gap-3">
                {newBooks.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
