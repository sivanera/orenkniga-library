
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ChevronRight, Search, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';

const Index: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

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
              <div className="text-center py-8 bg-muted/10 rounded-lg">
                <p className="text-muted-foreground">Пока нет книг в библиотеке</p>
                {user?.role === 'author' && (
                  <Button 
                    variant="link" 
                    onClick={() => navigate('/author/upload')}
                    className="mt-2"
                  >
                    Загрузить свое произведение
                  </Button>
                )}
              </div>
            </TabsContent>
            <TabsContent value="new" className="pt-4">
              <div className="text-center py-8 bg-muted/10 rounded-lg">
                <p className="text-muted-foreground">Пока нет новых книг</p>
                {user?.role === 'author' && (
                  <Button 
                    variant="link" 
                    onClick={() => navigate('/author/upload')}
                    className="mt-2"
                  >
                    Загрузить свое произведение
                  </Button>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
