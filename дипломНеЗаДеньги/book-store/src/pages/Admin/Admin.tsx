import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Book, Users, ShoppingBag, Tag, Star, LogOut, TrendingUp, Package, DollarSign, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import AdminBooks from './AdminBooks';
import AdminUsers from './AdminUsers';
import AdminOrders from './AdminOrders';
import AdminPromos from './AdminPromos';
import AdminReviews from './AdminReviews';
import './Admin.css';

interface Stats {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalBooks: number;
  activeOrders: number;
  ordersByStatus: Record<string, number>;
  topBooks: Array<{ id: number; title: string; sales_count: number; price: number }>;
  recentOrders: Array<{ id: number; order_number: string; status: string; total_price: number; created_at: string }>;
}

const Admin: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!user || (user as any).role !== 'admin') {
      navigate('/');
      return;
    }
    fetchStats();
  }, [user, navigate]);

  const fetchStats = async () => {
    try {
      const data = await api.getAdminStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    api.logout();
    logout();
    navigate('/');
  };

  const statusLabels: Record<string, string> = {
    pending: 'Ожидает',
    confirmed: 'Подтверждён',
    processing: 'Собирается',
    shipped: 'В доставке',
    delivered: 'Доставлен',
    cancelled: 'Отменён',
  };

  const tabs = [
    { id: 'dashboard', label: 'Дашборд', icon: <BarChart3 size={20} /> },
    { id: 'books', label: 'Книги', icon: <Book size={20} /> },
    { id: 'orders', label: 'Заказы', icon: <ShoppingBag size={20} /> },
    { id: 'users', label: 'Пользователи', icon: <Users size={20} /> },
    { id: 'promos', label: 'Промокоды', icon: <Tag size={20} /> },
    { id: 'reviews', label: 'Отзывы', icon: <Star size={20} /> },
  ];

  const renderDashboard = () => {
    if (loading || !stats) return <div className="admin-loading">Загрузка...</div>;

    return (
      <div className="admin-dashboard">
        <h2>Дашборд</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#e8f5e9' }}>
              <DollarSign size={24} color="#2e7d32" />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.totalRevenue.toFixed(2)} р.</span>
              <span className="stat-label">Выручка</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#e3f2fd' }}>
              <ShoppingBag size={24} color="#1565c0" />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.totalOrders}</span>
              <span className="stat-label">Заказов</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#fce4ec' }}>
              <Users size={24} color="#c62828" />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.totalUsers}</span>
              <span className="stat-label">Пользователей</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#fff3e0' }}>
              <Book size={24} color="#e65100" />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.totalBooks}</span>
              <span className="stat-label">Книг в каталоге</span>
            </div>
          </div>
        </div>

        <div className="dashboard-row">
          <div className="dashboard-card">
            <h3><TrendingUp size={20} /> Топ продаж</h3>
            <div className="top-books-list">
              {stats.topBooks.map((book, i) => (
                <div key={book.id} className="top-book-item">
                  <span className="top-rank">#{i + 1}</span>
                  <span className="top-title">{book.title}</span>
                  <span className="top-sales">{book.sales_count} продаж</span>
                </div>
              ))}
              {stats.topBooks.length === 0 && <p className="empty-text">Нет данных</p>}
            </div>
          </div>

          <div className="dashboard-card">
            <h3><Package size={20} /> Заказы по статусам</h3>
            <div className="status-list">
              {Object.entries(stats.ordersByStatus).map(([status, count]) => (
                <div key={status} className="status-item">
                  <span className="status-name">{statusLabels[status] || status}</span>
                  <span className="status-count">{count}</span>
                </div>
              ))}
              {Object.keys(stats.ordersByStatus).length === 0 && <p className="empty-text">Нет заказов</p>}
            </div>
          </div>
        </div>

        <div className="dashboard-card full-width">
          <h3><ShoppingBag size={20} /> Последние заказы</h3>
          {stats.recentOrders.length > 0 ? (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Номер</th>
                  <th>Статус</th>
                  <th>Сумма</th>
                  <th>Дата</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map(order => (
                  <tr key={order.id}>
                    <td>{order.order_number}</td>
                    <td><span className={`status-badge status-${order.status}`}>{statusLabels[order.status] || order.status}</span></td>
                    <td>{Number(order.total_price).toFixed(2)} р.</td>
                    <td>{new Date(order.created_at).toLocaleDateString('ru-RU')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="empty-text">Нет заказов</p>
          )}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return renderDashboard();
      case 'books': return <AdminBooks />;
      case 'orders': return <AdminOrders />;
      case 'users': return <AdminUsers />;
      case 'promos': return <AdminPromos />;
      case 'reviews': return <AdminReviews />;
      default: return renderDashboard();
    }
  };

  return (
    <div className="admin-page">
      <button className="admin-menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-logo">
          <BarChart3 size={28} />
          <span>Админ-панель</span>
        </div>
        <nav className="admin-nav">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`admin-nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
        <div className="admin-user-info">
          <span>{user?.name}</span>
          <button className="admin-logout" onClick={handleLogout}>
            <LogOut size={18} />
            Выйти
          </button>
        </div>
      </aside>
      <main className="admin-content">
        {renderContent()}
      </main>
    </div>
  );
};

export default Admin;
