import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { api } from '../../services/api';

interface BookItem {
  id: number;
  title: string;
  author_name: string;
  price: number;
  old_price: number | null;
  discount: number;
  image_url: string;
  category_id: number;
  category_slug: string;
  year: number;
  stock: number;
  is_active: boolean;
  sales_count: number;
}

const emptyForm = {
  title: '', author_name: '', price: '', old_price: '', discount: '0',
  image_url: '', category_id: '1', year: new Date().getFullYear().toString(), stock: '0',
};

const categories = [
  { id: 1, name: 'Художественная литература' },
  { id: 2, name: 'Нехудожественная литература' },
  { id: 3, name: 'Детские книги' },
  { id: 4, name: 'Бизнес-литература' },
  { id: 5, name: 'Комиксы и манга' },
  { id: 6, name: 'Учебная литература' },
];

const AdminBooks: React.FC = () => {
  const [books, setBooks] = useState<BookItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<BookItem | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { fetchBooks(); }, []);

  const fetchBooks = async () => {
    try {
      const data = await api.getAdminBooks();
      if (Array.isArray(data)) setBooks(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const openModal = (book?: BookItem) => {
    if (book) {
      setEditing(book);
      setForm({
        title: book.title, author_name: book.author_name,
        price: String(book.price), old_price: book.old_price ? String(book.old_price) : '',
        discount: String(book.discount || 0), image_url: book.image_url || '',
        category_id: String(book.category_id), year: String(book.year), stock: String(book.stock),
      });
    } else {
      setEditing(null);
      setForm(emptyForm);
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.author_name || !form.price) return;
    const data = {
      title: form.title, author_name: form.author_name,
      price: Number(form.price), old_price: form.old_price ? Number(form.old_price) : null,
      discount: Number(form.discount) || 0, image_url: form.image_url,
      category_id: Number(form.category_id), year: Number(form.year), stock: Number(form.stock),
    };
    try {
      if (editing) {
        const updated = await api.updateBook(editing.id, data);
        setBooks(prev => prev.map(b => b.id === editing.id ? updated : b));
      } else {
        const created = await api.createBook(data);
        setBooks(prev => [...prev, created]);
      }
      setShowModal(false);
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Удалить книгу?')) return;
    try {
      await api.deleteBook(id);
      setBooks(prev => prev.filter(b => b.id !== id));
    } catch (e) { console.error(e); }
  };

  if (loading) return <div className="admin-loading">Загрузка...</div>;

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2>Управление книгами ({books.length})</h2>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={18} /> Добавить книгу
        </button>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Название</th>
            <th>Автор</th>
            <th>Цена</th>
            <th>Скидка</th>
            <th>Остаток</th>
            <th>Продажи</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {books.map(book => (
            <tr key={book.id}>
              <td>{book.id}</td>
              <td>{book.title}</td>
              <td>{book.author_name}</td>
              <td>{Number(book.price).toFixed(2)} р.</td>
              <td>{book.discount > 0 ? `-${book.discount}%` : '—'}</td>
              <td>{book.stock}</td>
              <td>{book.sales_count}</td>
              <td>
                <div className="action-buttons">
                  <button className="action-btn" onClick={() => openModal(book)} title="Редактировать"><Edit2 size={16} /></button>
                  <button className="action-btn delete" onClick={() => handleDelete(book.id)} title="Удалить"><Trash2 size={16} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal admin-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Редактировать книгу' : 'Новая книга'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={24} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Название *</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Автор *</label>
                <input value={form.author_name} onChange={e => setForm({ ...form, author_name: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Цена *</label>
                  <input type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Старая цена</label>
                  <input type="number" step="0.01" value={form.old_price} onChange={e => setForm({ ...form, old_price: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Скидка %</label>
                  <input type="number" value={form.discount} onChange={e => setForm({ ...form, discount: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Категория</label>
                  <select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })}>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Год</label>
                  <input type="number" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Остаток</label>
                  <input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>URL изображения</label>
                <input value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
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

export default AdminBooks;
