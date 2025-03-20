import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useLocation, useNavigate } from 'react-router-dom';
import { Book } from '@/lib/types';
import BookCard from '@/components/BookCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, Filter, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

const genres = ['Все жанры', 'Классика', 'Фантастика', 'Детективы', 'Романы', 'История', 'Психология', 'Драма', 'Поэма'];

const Catalog: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState('Все жанры');
  const [sortOption, setSortOption] = useState('rating');
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('q');
    const category = params.get('category');
    
    if (query) {
      setSearchQuery(query);
    }
    
    if (category) {
      setSelectedGenre(category);
    }
    
    const authorBooks = JSON.parse(localStorage.getItem('orenkniga-author-books') || '[]');
    let filteredBooks = [...authorBooks];
    
    if (query) {
      const lowercaseQuery = query.toLowerCase();
      filteredBooks = filteredBooks.filter(book => 
        book.title.toLowerCase().includes(lowercaseQuery) ||
        book.author.name.toLowerCase().includes(lowercaseQuery)
      );
    }
    
    if (category && category !== 'Все жанры') {
      filteredBooks = filteredBooks.filter(book => 
        book.genres.some(genre => genre.toLowerCase() === category.toLowerCase())
      );
    }
    
    if (sortOption === 'rating') {
      filteredBooks.sort((a, b) => b.rating - a.rating);
    } else if (sortOption === 'newest') {
      filteredBooks.sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime());
    } else if (sortOption === 'title') {
      filteredBooks.sort((a, b) => a.title.localeCompare(b.title));
    }
    
    setBooks(filteredBooks);
  }, [location.search, sortOption]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/catalog?q=${encodeURIComponent(searchQuery)}`);
  };
  
  const handleGenreChange = (genre: string) => {
    setSelectedGenre(genre);
    if (genre === 'Все жанры') {
      navigate('/catalog');
    } else {
      navigate(`/catalog?category=${encodeURIComponent(genre)}`);
    }
  };
  
  const handleSortChange = (value: string) => {
    setSortOption(value);
  };
  
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedGenre('Все жанры');
    navigate('/catalog');
  };

  return (
    <Layout className="pb-20">
      <div className="px-4 pt-6 pb-6 space-y-4">
        <header className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full shrink-0"
            onClick={() => navigate('/')}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Каталог книг</h1>
        </header>
        
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="search"
            placeholder="Поиск книг, авторов..."
            className="pl-10 pr-4"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
        
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => setFilterOpen(!filterOpen)}
          >
            <Filter className="h-4 w-4" />
            Фильтры
          </Button>
          
          <Select defaultValue={sortOption} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Сортировка" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">По рейтингу</SelectItem>
              <SelectItem value="newest">Сначала новые</SelectItem>
              <SelectItem value="title">По названию</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className={cn(
          "bg-card border rounded-lg shadow-lg p-4 space-y-4 transition-all duration-300",
          filterOpen ? "max-h-[300px] opacity-100" : "max-h-0 opacity-0 overflow-hidden p-0 border-0"
        )}>
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Фильтры</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters}
              className="text-sm text-muted-foreground"
            >
              <X className="h-3 w-3 mr-1" />
              Сбросить
            </Button>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Жанры</h4>
            <ScrollArea className="h-[130px] rounded-md border">
              <div className="p-2 grid grid-cols-2 gap-1">
                {genres.map((genre) => (
                  <div key={genre} className="flex items-center space-x-2">
                    <Button
                      variant={selectedGenre === genre ? "default" : "outline"}
                      size="sm"
                      className={cn(
                        "w-full justify-start text-sm",
                        selectedGenre === genre ? "bg-primary text-white" : ""
                      )}
                      onClick={() => handleGenreChange(genre)}
                    >
                      {genre}
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
        
        <div className="pt-2">
          <Tabs defaultValue="grid" className="w-full">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm">
                Найдено книг: <strong>{books.length}</strong>
              </span>
              <TabsList>
                <TabsTrigger value="grid">Сетка</TabsTrigger>
                <TabsTrigger value="list">Список</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="grid" className="pt-2">
              {books.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {books.map((book) => (
                    <BookCard key={book.id} book={book} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p>Книги не найдены</p>
                  <Button 
                    variant="link" 
                    onClick={clearFilters}
                    className="mt-2"
                  >
                    Сбросить фильтры
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="list" className="pt-2">
              {books.length > 0 ? (
                <div className="flex flex-col space-y-3">
                  {books.map((book) => (
                    <div 
                      key={book.id}
                      className="border rounded-lg p-3 flex gap-3 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => navigate(`/book/${book.id}`)}
                    >
                      <div className="w-16 h-24 bg-muted rounded shrink-0 overflow-hidden">
                        {book.cover ? (
                          <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-primary/10">
                            <span className="text-primary/50 text-xs">OrenKniga</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium">{book.title}</h3>
                        <p className="text-sm text-muted-foreground">{book.author.name}</p>
                        <div className="flex items-center space-x-1 mt-1">
                          <span className="text-amber-500 text-xs">★</span>
                          <span className="text-xs">{book.rating.toFixed(1)}</span>
                        </div>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {book.genres.slice(0, 2).map((genre) => (
                            <span 
                              key={genre} 
                              className="text-[10px] bg-secondary px-2 py-0.5 rounded-full"
                            >
                              {genre}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p>Книги не найдены</p>
                  <Button 
                    variant="link" 
                    onClick={clearFilters}
                    className="mt-2"
                  >
                    Сбросить фильтры
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Catalog;
