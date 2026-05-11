export interface Book {
  id: number;
  title: string;
  author: string;
  price: number;
  oldPrice?: number;
  discount?: number;
  image: string;
  category: string;
  year: number;
  rating: number;
  inStock: boolean;
}

export interface CartItem {
  book: Book;
  quantity: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  subcategories?: Category[];
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  book: Book;
  quantity: number;
  price: number;
}

export interface DeliveryInfo {
  method: 'courier' | 'pickup' | 'post';
  city: string;
  address: string;
  apartment?: string;
  phone: string;
  comment?: string;
}

export interface Order {
  id: string;
  userId: number;
  items: OrderItem[];
  totalPrice: number;
  deliveryPrice: number;
  delivery: DeliveryInfo;
  paymentMethod: 'card' | 'cash' | 'erip';
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

