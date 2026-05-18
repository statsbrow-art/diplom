import React, { useState, useEffect } from 'react';
import { Trash2, Shield, ShieldOff } from 'lucide-react';
import { api } from '../../services/api';

interface UserItem {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  created_at: string;
}

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const data = await api.getAdminUsers();
      if (Array.isArray(data)) setUsers(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const toggleRole = async (user: UserItem) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`${newRole === 'admin' ? 'Назначить администратором' : 'Снять права администратора'}?`)) return;
    try {
      const updated = await api.updateUserRole(user.id, newRole);
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: updated.role } : u));
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Удалить пользователя?')) return;
    try {
      await api.deleteUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (e) { console.error(e); }
  };

  if (loading) return <div className="admin-loading">Загрузка...</div>;

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2>Пользователи ({users.length})</h2>
      </div>

      {users.length === 0 ? (
        <p className="empty-text">Нет зарегистрированных пользователей</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Имя</th>
              <th>Email</th>
              <th>Телефон</th>
              <th>Роль</th>
              <th>Дата регистрации</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.phone || '—'}</td>
                <td><span className={`role-badge role-${user.role}`}>{user.role === 'admin' ? 'Админ' : 'Пользователь'}</span></td>
                <td>{new Date(user.created_at).toLocaleDateString('ru-RU')}</td>
                <td>
                  <div className="action-buttons">
                    <button className="action-btn" onClick={() => toggleRole(user)} title={user.role === 'admin' ? 'Снять права' : 'Сделать админом'}>
                      {user.role === 'admin' ? <ShieldOff size={16} /> : <Shield size={16} />}
                    </button>
                    <button className="action-btn delete" onClick={() => handleDelete(user.id)} title="Удалить"><Trash2 size={16} /></button>
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

export default AdminUsers;
