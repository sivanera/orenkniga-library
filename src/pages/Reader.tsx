import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Book, ReaderSettings } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  ChevronRight, 
  Settings, 
  Bookmark, 
  X, 
  Sun, 
  Moon,
  PanelLeft, 
  Minus, 
  Plus,
  TextQuote,
  Type
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/hooks/use-toast';

const mockBooks: Book[] = [
  {
    id: '1',
    title: 'Мастер и Маргарита',
    author: { id: '3', name: 'Михаил Булгаков' },
    description: 'Роман о добре и зле, о любви и ненависти, о жизни и смерти.',
    genres: ['Классика', 'Фантастика', 'Роман'],
    rating: 4.8,
    reviewCount: 1240,
    publishedDate: '1967-01-01',
    content: `В час жаркого весеннего заката на Патриарших прудах появились двое граждан. Первый из них — приблизительно сорокалетний, одетый в серенькую летнюю пару, был маленького роста, темноволос, упитан, лыс, свою приличную шляпу нес в руке, а аккуратно выбритое лицо его украшали сверхъестественных размеров очки в черной роговой оправе. Второй — плечистый, рыжеватый, вихрастый молодой человек в заломленной на затылок клетчатой кепке — был в ковбойке, жеваных белых брюках и черных тапочках.

Первый был не кто иной, как Михаил Александрович Берлиоз, редактор толстого художественного журнала и председатель правления одной из крупнейших московских литературных ассоциаций, сокращенно именуемой МАССОЛИТ, а молодой спутник его — поэт Иван Николаевич Понырев, пишущий под псевдонимом Бездомный.

Попав в тень чуть зеленеющих лип, писатели первым долгом бросились к пестро раскрашенной будочке с надписью «Пиво и воды».

Да, следует отметить первую странность этого страшного майского вечера. Не только у будочки, но и во всей аллее, параллельной Малой Бронной улице, не оказалось ни одного человека. В тот час, когда уж, кажется, и сил не было дышать, когда солнце, раскалив Москву, в сухом тумане валилось куда-то за Садовое кольцо, — никто не пришел под липы, никто не сел на скамейку, пуста была аллея.`
  },
  {
    id: '2',
    title: 'Преступление и наказание',
    author: { id: '4', name: 'Федор Достоевский' },
    description: 'Психологический роман о нравственных мучениях и преступлении.',
    genres: ['Классика', 'Психология', 'Роман'],
    rating: 4.7,
    reviewCount: 983,
    publishedDate: '1866-01-01',
    content: 'Содержание "Прест��пления и наказания"...'
  },
];

const defaultSettings: ReaderSettings = {
  fontSize: 18,
  fontFamily: 'Inter',
  lineHeight: 1.6,
  theme: 'light',
  margins: 16
};

const Reader: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<ReaderSettings>(defaultSettings);
  const [showControls, setShowControls] = useState(true);
  const [controlTimeout, setControlTimeout] = useState<NodeJS.Timeout | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<'left' | 'right' | null>(null);
  const pageFlipAudioRef = useRef<HTMLAudioElement | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    let fetchedBook = mockBooks.find((b) => b.id === id);
    
    if (!fetchedBook) {
      const authorBooks = JSON.parse(localStorage.getItem('orenkniga-author-books') || '[]');
      fetchedBook = authorBooks.find((b: Book) => b.id === id);
    }
    
    setTimeout(() => {
      setBook(fetchedBook || null);
      setLoading(false);
      if (fetchedBook && fetchedBook.content) {
        const contentLength = fetchedBook.content.length;
        const charsPerPage = 2000;
        setTotalPages(Math.max(1, Math.ceil(contentLength / charsPerPage)));
      }
    }, 500);
    
    const savedSettings = localStorage.getItem('orenkniga-reader-settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
    
    document.addEventListener('selectstart', preventTextSelection);
    pageFlipAudioRef.current = new Audio('/page-flip.mp3');
    
    return () => {
      if (controlTimeout) {
        clearTimeout(controlTimeout);
      }
      document.removeEventListener('selectstart', preventTextSelection);
    };
  }, [id]);
  
  const preventTextSelection = (e: Event) => {
    e.preventDefault();
    return false;
  };
  
  useEffect(() => {
    localStorage.setItem('orenkniga-reader-settings', JSON.stringify(settings));
    
    if (settings.theme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    
    return () => {
      document.body.classList.remove('dark');
    };
  }, [settings]);
  
  const handleScreenTap = () => {
    setShowControls(!showControls);
    
    if (controlTimeout) {
      clearTimeout(controlTimeout);
    }
    
    if (!showControls) {
      const timeout = setTimeout(() => {
        setShowControls(false);
      }, 3000);
      setControlTimeout(timeout);
    }
  };
  
  const updateSettings = (newSettings: Partial<ReaderSettings>) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings
    }));
  };
  
  const addBookmark = () => {
    toast.success('Закладка добавлена');
  };
  
  const flipPage = (direction: 'left' | 'right') => {
    if (isFlipping) return;
    
    setIsFlipping(true);
    setFlipDirection(direction);
    
    if (pageFlipAudioRef.current) {
      pageFlipAudioRef.current.currentTime = 0;
      pageFlipAudioRef.current.play().catch(err => console.error('Error playing page flip sound:', err));
    }
    
    if (direction === 'right' && currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    } else if (direction === 'left' && currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
    
    setTimeout(() => {
      setIsFlipping(false);
      setFlipDirection(null);
    }, 500);
  };
  
  const getContentForPage = (pageNum: number) => {
    if (!book || !book.content) return [];
    
    const charsPerPage = 2000;
    const startIdx = (pageNum - 1) * charsPerPage;
    let endIdx = startIdx + charsPerPage;
    if (endIdx > book.content.length) {
      endIdx = book.content.length;
    }
    
    const pageContent = book.content.substring(startIdx, endIdx);
    return pageContent.split('\n\n').filter(paragraph => paragraph.trim() !== '');
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse space-y-4 w-full max-w-md">
          <div className="h-6 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="h-64 bg-muted rounded w-full"></div>
        </div>
      </div>
    );
  }
  
  if (!book) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Книга не найдена</h1>
        <p className="text-muted-foreground mb-6">Запрошенная книга не существует или была удалена</p>
        <Button onClick={() => navigate('/catalog')}>Вернуться в каталог</Button>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "min-h-screen w-full transition-colors duration-300 select-none",
        settings.theme === 'dark' ? 'bg-background text-foreground' : 
        settings.theme === 'sepia' ? 'bg-amber-50 text-stone-800' : 
        'bg-background text-foreground'
      )}
      onClick={handleScreenTap}
    >
      <div 
        className={cn(
          "fixed top-0 left-0 right-0 flex justify-between items-center px-4 py-3",
          "glass-effect z-50 transition-transform duration-300",
          showControls ? "translate-y-0" : "-translate-y-full"
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full shrink-0"
          onClick={() => navigate(`/book/${book.id}`)}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        <h1 className="text-sm font-medium truncate mx-2">
          {book.title}
        </h1>
        
        <div className="flex items-center gap-1">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Settings className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Настройки чтения</SheetTitle>
              </SheetHeader>
              
              <div className="mt-6 space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Размер шрифта</Label>
                    <span className="text-sm">{settings.fontSize}px</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => updateSettings({ fontSize: Math.max(12, settings.fontSize - 1) })}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Slider 
                      min={12} 
                      max={28} 
                      step={1}
                      value={[settings.fontSize]}
                      onValueChange={(value) => updateSettings({ fontSize: value[0] })}
                    />
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => updateSettings({ fontSize: Math.min(28, settings.fontSize + 1) })}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Межстрочный интервал</Label>
                    <span className="text-sm">{settings.lineHeight}x</span>
                  </div>
                  <Slider 
                    min={1.2} 
                    max={2.2} 
                    step={0.1}
                    value={[settings.lineHeight]}
                    onValueChange={(value) => updateSettings({ lineHeight: value[0] })}
                  />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Отступы</Label>
                    <span className="text-sm">{settings.margins}px</span>
                  </div>
                  <Slider 
                    min={8} 
                    max={32} 
                    step={2}
                    value={[settings.margins]}
                    onValueChange={(value) => updateSettings({ margins: value[0] })}
                  />
                </div>
                
                <div className="space-y-3">
                  <Label>Шрифт</Label>
                  <RadioGroup 
                    value={settings.fontFamily} 
                    onValueChange={(value) => updateSettings({ fontFamily: value })}
                    className="grid grid-cols-2 gap-2"
                  >
                    <div className="flex items-center space-x-2 border rounded p-2">
                      <RadioGroupItem value="Inter" id="inter" />
                      <Label htmlFor="inter" className="font-['Inter']">Inter</Label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded p-2">
                      <RadioGroupItem value="serif" id="serif" />
                      <Label htmlFor="serif" className="font-serif">Serif</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="space-y-3">
                  <Label>Тема</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant="outline"
                      className={cn(
                        "flex flex-col items-center p-3 h-auto",
                        settings.theme === 'light' && "border-primary"
                      )}
                      onClick={() => updateSettings({ theme: 'light' })}
                    >
                      <Sun className="h-5 w-5 mb-1" />
                      <span className="text-xs">Светлая</span>
                    </Button>
                    <Button
                      variant="outline"
                      className={cn(
                        "flex flex-col items-center p-3 h-auto",
                        settings.theme === 'dark' && "border-primary"
                      )}
                      onClick={() => updateSettings({ theme: 'dark' })}
                    >
                      <Moon className="h-5 w-5 mb-1" />
                      <span className="text-xs">Темная</span>
                    </Button>
                    <Button
                      variant="outline"
                      className={cn(
                        "flex flex-col items-center p-3 h-auto bg-amber-50",
                        settings.theme === 'sepia' && "border-primary"
                      )}
                      onClick={() => updateSettings({ theme: 'sepia' })}
                    >
                      <TextQuote className="h-5 w-5 mb-1 text-stone-800" />
                      <span className="text-xs text-stone-800">Сепия</span>
                    </Button>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          
          <Button variant="ghost" size="icon" className="rounded-full" onClick={addBookmark}>
            <Bookmark className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      <div 
        ref={contentRef}
        className={cn(
          "py-16 transition-all duration-300 ease-in-out select-none",
          isFlipping && flipDirection === 'right' && "animate-page-flip-right",
          isFlipping && flipDirection === 'left' && "animate-page-flip-left"
        )}
        style={{
          padding: `64px ${settings.margins}px`,
          fontSize: `${settings.fontSize}px`,
          lineHeight: settings.lineHeight,
          fontFamily: settings.fontFamily === 'serif' ? 'serif' : 'Inter, sans-serif',
          maxWidth: '800px',
          margin: '0 auto',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none'
        }}
      >
        <h1 className="text-xl font-bold mb-4">{book.title}</h1>
        <h2 className="text-lg mb-6">{book.author.name}</h2>
        
        {getContentForPage(currentPage).map((paragraph, index) => (
          <p key={index} className="mb-4 text-balance">
            {paragraph}
          </p>
        ))}
      </div>
      
      <div 
        className={cn(
          "fixed bottom-0 left-0 right-0 flex justify-between items-center px-4 py-3",
          "glass-effect z-50 transition-transform duration-300",
          showControls ? "translate-y-0" : "translate-y-full"
        )}
      >
        <Button variant="ghost" size="sm">
          Глава 1
        </Button>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full"
            onClick={() => flipPage('left')}
            disabled={currentPage <= 1 || isFlipping}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <span className="text-sm">Стр. {currentPage} из {totalPages}</span>
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full"
            onClick={() => flipPage('right')}
            disabled={currentPage >= totalPages || isFlipping}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Reader;
