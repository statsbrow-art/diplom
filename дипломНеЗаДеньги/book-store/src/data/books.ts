import { Book } from '../types';

export const books: Book[] = [
  {
    id: 1,
    title: 'Атомные привычки',
    author: 'Джеймс Клир',
    price: 17.85,
    oldPrice: 21.50,
    discount: 17,
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop',
    category: 'Нехудожественная литература',
    year: 2024,
    rating: 4.8,
    inStock: true
  },
  {
    id: 2,
    title: 'Кафе на краю земли',
    author: 'Джон Стрелеки',
    price: 10.50,
    oldPrice: 13.12,
    discount: 20,
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=400&fit=crop',
    category: 'Художественная литература',
    year: 2018,
    rating: 4.6,
    inStock: true
  },
  {
    id: 3,
    title: 'Мастер и Маргарита',
    author: 'Михаил Булгаков',
    price: 15.00,
    image: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=400&fit=crop',
    category: 'Классическая литература',
    year: 2023,
    rating: 4.9,
    inStock: true
  },
  {
    id: 4,
    title: '1984',
    author: 'Джордж Оруэлл',
    price: 12.30,
    oldPrice: 14.50,
    discount: 15,
    image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=300&h=400&fit=crop',
    category: 'Классическая литература',
    year: 2024,
    rating: 4.7,
    inStock: true
  },
  {
    id: 5,
    title: 'Гарри Поттер и философский камень',
    author: 'Дж. К. Роулинг',
    price: 22.00,
    oldPrice: 27.50,
    discount: 20,
    image: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=300&h=400&fit=crop',
    category: 'Фэнтези',
    year: 2024,
    rating: 4.9,
    inStock: true
  },
  {
    id: 6,
    title: 'Думай медленно... решай быстро',
    author: 'Даниэль Канеман',
    price: 19.90,
    image: 'https://images.unsplash.com/photo-1550399105-c4db5fb85c18?w=300&h=400&fit=crop',
    category: 'Психология',
    year: 2023,
    rating: 4.5,
    inStock: true
  },
  {
    id: 7,
    title: 'Преступление и наказание',
    author: 'Фёдор Достоевский',
    price: 11.50,
    image: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=300&h=400&fit=crop',
    category: 'Классическая литература',
    year: 2023,
    rating: 4.8,
    inStock: true
  },
  {
    id: 8,
    title: 'Война и мир',
    author: 'Лев Толстой',
    price: 25.00,
    oldPrice: 30.00,
    discount: 17,
    image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=300&h=400&fit=crop',
    category: 'Классическая литература',
    year: 2024,
    rating: 4.9,
    inStock: true
  },
  {
    id: 9,
    title: 'Маленький принц',
    author: 'Антуан де Сент-Экзюпери',
    price: 8.50,
    image: 'https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?w=300&h=400&fit=crop',
    category: 'Детская литература',
    year: 2023,
    rating: 4.9,
    inStock: true
  },
  {
    id: 10,
    title: 'Sapiens. Краткая история человечества',
    author: 'Юваль Ной Харари',
    price: 23.00,
    oldPrice: 28.00,
    discount: 18,
    image: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=300&h=400&fit=crop',
    category: 'Научно-популярная литература',
    year: 2024,
    rating: 4.7,
    inStock: true
  },
  {
    id: 11,
    title: 'Над пропастью во ржи',
    author: 'Джером Сэлинджер',
    price: 9.80,
    image: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=300&h=400&fit=crop',
    category: 'Классическая литература',
    year: 2023,
    rating: 4.4,
    inStock: true
  },
  {
    id: 12,
    title: 'Хоббит',
    author: 'Дж. Р. Р. Толкин',
    price: 18.50,
    oldPrice: 22.00,
    discount: 16,
    image: 'https://images.unsplash.com/photo-1629992101753-56d196c8aabb?w=300&h=400&fit=crop',
    category: 'Фэнтези',
    year: 2024,
    rating: 4.8,
    inStock: true
  }
];

export const categories = [
  { id: 1, name: 'Художественная литература', slug: 'fiction' },
  { id: 2, name: 'Нехудожественная литература', slug: 'non-fiction' },
  { id: 3, name: 'Детские книги', slug: 'children' },
  { id: 4, name: 'Бизнес-литература', slug: 'business' },
  { id: 5, name: 'Комиксы и манга', slug: 'comics' },
  { id: 6, name: 'Учебная литература', slug: 'education' },
];

