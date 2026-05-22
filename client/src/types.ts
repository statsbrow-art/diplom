export interface Sport {
  id: string;
  name: string;
  icon?: string | null;
}

export interface Sector {
  id: string;
  venueId: string;
  name: string;
  rows: number;
  seatsPerRow: number;
}

export interface Venue {
  id: string;
  name: string;
  city: string;
  address: string;
  sectors?: Sector[];
}

export interface TicketType {
  id: string;
  eventId: string;
  sectorId: string;
  name: string;
  price: number | string;
  sector?: Sector;
}

export type EventStatus = 'SCHEDULED' | 'ON_SALE' | 'CANCELLED' | 'FINISHED';

export interface SportEvent {
  id: string;
  title: string;
  description?: string | null;
  source?: string | null;
  sourceUrl?: string | null;
  externalId?: string | null;
  sportId: string;
  sport?: Sport;
  venueId: string;
  venue?: Venue;
  startsAt: string;
  status: EventStatus;
  ticketTypes?: TicketType[];
  minPrice?: number | null;
}

export interface ApiSportEvent {
  externalId: string;
  title: string;
  description: string;
  sportName: string;
  sportIcon: string;
  venueName: string;
  city: string;
  address: string;
  startsAt: string;
  source: string;
  sourceUrl: string;
  minPrice: number;
}

export type OrderStatus = 'PENDING' | 'PAID' | 'CANCELLED' | 'REFUNDED';

export interface OrderItem {
  id: string;
  orderId: string;
  ticketTypeId: string;
  ticketType?: TicketType & { event?: SportEvent };
  seatRow: number;
  seatNumber: number;
  price: number | string;
  ticketCode: string;
  refunded: boolean;
}

export interface PromoCode {
  id: string;
  code: string;
  description?: string | null;
  percentOff: number;
  active: boolean;
  expiresAt?: string | null;
  createdAt: string;
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number | string;
  discount: number | string;
  cardBrand?: string | null;
  cardLast4?: string | null;
  status: 'PAID' | 'REFUNDED';
  createdAt: string;
}

export interface Order {
  id: string;
  userId: string;
  total: number | string;
  discount: number | string;
  status: OrderStatus;
  items: OrderItem[];
  payment?: Payment | null;
  promoCode?: PromoCode | null;
  createdAt: string;
  user?: { email: string; name: string };
}

export interface WaitlistSubscription {
  id: string;
  userId: string;
  eventId: string;
  notifyBy: string;
  active: boolean;
  createdAt: string;
  event?: SportEvent;
  user?: { email: string; name: string };
}

export interface PaymentCard {
  id: string;
  userId: string;
  holder: string;
  brand: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  blocked: boolean;
  createdAt: string;
}
