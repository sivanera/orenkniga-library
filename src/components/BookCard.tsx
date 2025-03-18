
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Book } from '@/lib/types';
import { Heart, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface BookCardProps {
  book: Book;
  className?: string;
  isFavorite?: boolean;
  onFavoriteToggle?: () => void;
}

const BookCard: React.FC<BookCardProps> = ({ 
  book, 
  className,
  isFavorite = false,
  onFavoriteToggle 
}) => {
  const navigate = useNavigate();
  
  const navigateToBook = () => {
    navigate(`/book/${book.id}`);
  };

  return (
    <Card 
      className={cn(
        "overflow-hidden bg-card transition-all duration-300 h-full",
        "hover:shadow-lg hover:scale-[1.02] cursor-pointer", 
        className
      )}
      onClick={navigateToBook}
    >
      <div className="relative h-48 w-full overflow-hidden bg-muted">
        {book.cover ? (
          <img 
            src={book.cover} 
            alt={book.title} 
            className="h-full w-full object-cover transition-transform duration-300"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-primary/10">
            <span className="text-primary/50 text-lg font-medium">OrenKniga</span>
          </div>
        )}
        
        {onFavoriteToggle && (
          <button
            className={cn(
              "absolute top-2 right-2 p-1.5 rounded-full",
              "transition-all duration-300 z-10",
              isFavorite ? "bg-primary text-white" : "bg-background/50 backdrop-blur-sm text-foreground"
            )}
            onClick={(e) => {
              e.stopPropagation();
              onFavoriteToggle();
            }}
          >
            <Heart className={cn(
              "h-4 w-4",
              isFavorite ? "fill-current" : ""
            )} />
          </button>
        )}
      </div>
      
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <h3 className="font-medium line-clamp-1 text-sm">{book.title}</h3>
            <p className="text-xs text-muted-foreground">{book.author.name}</p>
          </div>
          
          <div className="flex items-center space-x-1 bg-secondary rounded-full px-2 py-0.5">
            <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
            <span className="text-xs font-medium">{book.rating.toFixed(1)}</span>
          </div>
        </div>
        
        <div className="mt-2 flex flex-wrap gap-1">
          {book.genres.slice(0, 2).map((genre) => (
            <span 
              key={genre} 
              className="text-[10px] bg-secondary px-2 py-0.5 rounded-full"
            >
              {genre}
            </span>
          ))}
          {book.genres.length > 2 && (
            <span className="text-[10px] bg-secondary px-2 py-0.5 rounded-full">
              +{book.genres.length - 2}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BookCard;
