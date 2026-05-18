import React, { useState, useEffect } from 'react';
import { Trash2, Star } from 'lucide-react';
import { api } from '../../services/api';

interface ReviewItem {
  id: number;
  book_id: number;
  user_id: number;
  rating: number;
  comment: string;
  user_name: string;
  book_title: string;
  created_at: string;
}

const AdminReviews: React.FC = () => {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchReviews(); }, []);

  const fetchReviews = async () => {
    try {
      const data = await api.getAdminReviews();
      if (Array.isArray(data)) setReviews(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Удалить отзыв?')) return;
    try {
      await api.deleteReview(id);
      setReviews(prev => prev.filter(r => r.id !== id));
    } catch (e) { console.error(e); }
  };

  if (loading) return <div className="admin-loading">Загрузка...</div>;

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2>Отзывы ({reviews.length})</h2>
      </div>

      {reviews.length === 0 ? (
        <p className="empty-text">Нет отзывов</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Книга</th>
              <th>Пользователь</th>
              <th>Рейтинг</th>
              <th>Комментарий</th>
              <th>Дата</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map(review => (
              <tr key={review.id}>
                <td>{review.id}</td>
                <td>{review.book_title}</td>
                <td>{review.user_name}</td>
                <td>
                  <div className="stars-display">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} size={14} fill={s <= review.rating ? '#f59e0b' : 'none'} color={s <= review.rating ? '#f59e0b' : '#d1d5db'} />
                    ))}
                  </div>
                </td>
                <td className="review-comment">{review.comment || '—'}</td>
                <td>{new Date(review.created_at).toLocaleDateString('ru-RU')}</td>
                <td>
                  <div className="action-buttons">
                    <button className="action-btn delete" onClick={() => handleDelete(review.id)} title="Удалить"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminReviews;
