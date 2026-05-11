import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

interface OrderItem {
  id: number;
  order_number: string;
  user_name: string;
  user_email: string;
  status: string;
  total_price: number;
  delivery_method: string;
  delivery_city: string;
  delivery_address: string;
  created_at: string;
  items: Array<{ quantity: number; price: number; book?: { title: string } }>;
}

const statusOptions = [
  { value: 'pending', label: 'Ожидает' },
  { value: 'confirmed', label: 'Подтверждён' },
  { value: 'processing', label: 'Собирается' },
  { value: 'shipped', label: 'В доставке' },
  { value: 'delivered', label: 'Доставлен' },
  { value: 'cancelled', label: 'Отменён' },
];

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      const data = await api.getAdminOrders();
      if (Array.isArray(data)) setOrders(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (e) { console.error(e); }
  };

  if (loading) return <div className="admin-loading">Загрузка...</div>;

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2>Заказы ({orders.length})</h2>
      </div>

      {orders.length === 0 ? (
        <p className="empty-text">Нет заказов</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Номер</th>
              <th>Покупатель</th>
              <th>Товары</th>
              <th>Сумма</th>
              <th>Доставка</th>
              <th>Статус</th>
              <th>Дата</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>{order.order_number}</td>
                <td>
                  <div>{order.user_name}</div>
                  <small style={{ color: '#888' }}>{order.user_email}</small>
                </td>
                <td>
                  {order.items.map((item, i) => (
                    <div key={i} style={{ fontSize: '0.85em' }}>
                      {item.book?.title || 'Книга'} x{item.quantity}
                    </div>
                  ))}
                </td>
                <td>{Number(order.total_price).toFixed(2)} р.</td>
                <td>
                  <div>{order.delivery_method === 'pickup' ? 'Самовывоз' : 'Доставка'}</div>
                  <small style={{ color: '#888' }}>{order.delivery_city}</small>
                </td>
                <td>
                  <select
                    className={`status-select status-${order.status}`}
                    value={order.status}
                    onChange={e => handleStatusChange(order.id, e.target.value)}
                  >
                    {statusOptions.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </td>
                <td>{new Date(order.created_at).toLocaleDateString('ru-RU')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminOrders;
