import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Order, OrderItem, DeliveryInfo, OrderStatus } from '../types';

interface OrderContextType {
  orders: Order[];
  createOrder: (
    items: OrderItem[],
    delivery: DeliveryInfo,
    paymentMethod: 'card' | 'cash' | 'erip',
    userId: number
  ) => Order;
  getOrderById: (orderId: string) => Order | undefined;
  getUserOrders: (userId: number) => Order[];
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

const ORDERS_KEY = 'bookstore_orders';

const generateOrderId = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `ORD-${timestamp}-${random}`.toUpperCase();
};

const calculateDeliveryPrice = (method: string, totalPrice: number): number => {
  if (method === 'pickup') return 0;
  if (totalPrice >= 50) return 0;
  if (method === 'courier') return 5;
  if (method === 'post') return 3;
  return 5;
};

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(ORDERS_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  }, [orders]);

  const createOrder = (
    items: OrderItem[],
    delivery: DeliveryInfo,
    paymentMethod: 'card' | 'cash' | 'erip',
    userId: number
  ): Order => {
    const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryPrice = calculateDeliveryPrice(delivery.method, totalPrice);

    const newOrder: Order = {
      id: generateOrderId(),
      userId,
      items,
      totalPrice,
      deliveryPrice,
      delivery,
      paymentMethod,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setOrders(prev => [newOrder, ...prev]);

    setTimeout(() => {
      updateOrderStatus(newOrder.id, 'confirmed');
    }, 3000);

    return newOrder;
  };

  const getOrderById = (orderId: string): Order | undefined => {
    return orders.find(order => order.id === orderId);
  };

  const getUserOrders = (userId: number): Order[] => {
    return orders.filter(order => order.userId === userId);
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev =>
      prev.map(order =>
        order.id === orderId
          ? { ...order, status, updatedAt: new Date().toISOString() }
          : order
      )
    );
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        createOrder,
        getOrderById,
        getUserOrders,
        updateOrderStatus,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};

