import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Book } from '../types';

interface FavoritesContextType {
  favorites: Book[];
  addToFavorites: (book: Book) => void;
  removeFromFavorites: (bookId: number) => void;
  isFavorite: (bookId: number) => boolean;
  toggleFavorite: (book: Book) => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const FAVORITES_KEY = 'bookstore_favorites';

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<Book[]>(() => {
    const saved = localStorage.getItem(FAVORITES_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const addToFavorites = (book: Book) => {
    setFavorites(prev => {
      if (prev.some(b => b.id === book.id)) {
        return prev;
      }
      return [...prev, book];
    });
  };

  const removeFromFavorites = (bookId: number) => {
    setFavorites(prev => prev.filter(book => book.id !== bookId));
  };

  const isFavorite = (bookId: number) => {
    return favorites.some(book => book.id === bookId);
  };

  const toggleFavorite = (book: Book) => {
    if (isFavorite(book.id)) {
      removeFromFavorites(book.id);
    } else {
      addToFavorites(book);
    }
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addToFavorites,
        removeFromFavorites,
        isFavorite,
        toggleFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

