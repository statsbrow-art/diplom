import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { api } from '../../services/api';

interface PromoItem {
  id: number;
  code: string;
  discount_percent: number | null;
  discount_amount: number | null;
  min_order_amount: number;
  max_uses: number;
  current_uses: number;
  is_active: boolean;
  valid_from: string;
  valid_until: string;
}

const emptyForm = {
  code: '', discount_percent: '', discount_amount: '', min_order_amount: '0',
  max_uses: '100', is_active: true, valid_from: '', valid_until: '',
};

const AdminPromos: React.FC = () => {
  const [promos, setPromos] = useState<PromoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<PromoItem | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { fetchPromos(); }, []);

  const fetchPromos = async () => {
    try {
      const data = await api.getAdminPromos();
      if (Array.isArray(data)) setPromos(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const openModal = (promo?: PromoItem) => {
    if (promo) {
      setEditing(promo);
      setForm({
        code: promo.code,
        discount_percent: promo.discount_percent ? String(promo.discount_percent) : '',
        discount_amount: promo.discount_amount ? String(promo.discount_amount) : '',
        min_order_amount: String(promo.min_order_amount),
        max_uses: String(promo.max_uses),
        is_active: promo.is_active,
        valid_from: promo.valid_from ? promo.valid_from.split('T')[0] : '',
        valid_until: promo.valid_until ? promo.valid_until.split('T')[0] : '',
      });
    } else {
      setEditing(null);
      setForm(emptyForm);
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.code) return;
    const data = {
      code: form.code.toUpperCase(),
      discount_percent: form.discount_percent ? Number(form.discount_percent) : null,
      discount_amount: form.discount_amount ? Number(form.discount_amount) : null,
      min_order_amount: Number(form.min_order_amount) || 0,
      max_uses: Number(form.max_uses) || 100,
      is_active: form.is_active,
      valid_from: form.valid_from,
      valid_until: form.valid_until,
    };
    try {
      if (editing) {
        const updated = await api.updatePromo(editing.id, data);
        setPromos(prev => prev.map(p => p.id === editing.id ? updated : p));
      } else {
        const created = await api.createPromo(data);
        setPromos(prev => [...prev, created]);
      }
      setShowModal(false);
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Удалить промокод?')) return;
    try {
      await api.deletePromo(id);
      setPromos(prev => prev.filter(p => p.id !== id));
    } catch (e) { console.error(e); }
  };

  if (loading) return <div className="admin-loading">Загрузка...</div>;

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2>Промокоды ({promos.length})</h2>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={18} /> Добавить промокод
        </button>
      </div>

      {promos.length === 0 ? (
        <p className="empty-text">Нет промокодов</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Код</th>
              <th>Скидка</th>
              <th>Мин. сумма</th>
              <th>Использований</th>
              <th>Статус</th>
              <th>Действителен</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {promos.map(promo => (
              <tr key={promo.id}>
                <td><code className="promo-code">{promo.code}</code></td>
                <td>
                  {promo.discount_percent ? `${promo.discount_percent}%` : ''}
                  {promo.discount_amount ? `${promo.discount_amount} р.` : ''}
                </td>
                <td>{promo.min_order_amount} р.</td>
                <td>{promo.current_uses} / {promo.max_uses}</td>
                <td><span className={`status-badge ${promo.is_active ? 'status-confirmed' : 'status-cancelled'}`}>{promo.is_active ? 'Активен' : 'Неактивен'}</span></td>
                <td>{promo.valid_from ? new Date(promo.valid_from).toLocaleDateString('ru-RU') : '—'} — {promo.valid_until ? new Date(promo.valid_until).toLocaleDateString('ru-RU') : '—'}</td>
                <td>
                  <div className="action-buttons">
                    <button className="action-btn" onClick={() => openModal(promo)} title="Редактировать"><Edit2 size={16} /></button>
                    <button className="action-btn delete" onClick={() => handleDelete(promo.id)} title="Удалить"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal admin-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Редактировать промокод' : 'Новый промокод'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={24} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Код *</label>
                <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="WELCOME10" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Скидка %</label>
                  <input type="number" value={form.discount_percent} onChange={e => setForm({ ...form, discount_percent: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Скидка (руб.)</label>
                  <input type="number" step="0.01" value={form.discount_amount} onChange={e => setForm({ ...form, discount_amount: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Мин. сумма заказа</label>
                  <input type="number" step="0.01" value={form.min_order_amount} onChange={e => setForm({ ...form, min_order_amount: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Макс. использований</label>
                  <input type="number" value={form.max_uses} onChange={e => setForm({ ...form, max_uses: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Действует с</label>
                  <input type="date" value={form.valid_from} onChange={e => setForm({ ...form, valid_from: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Действует до</label>
                  <input type="date" value={form.valid_until} onChange={e => setForm({ ...form, valid_until: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} />
                  Активен
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Отмена</button>
              <button className="btn btn-primary" onClick={handleSave}>Сохранить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPromos;
