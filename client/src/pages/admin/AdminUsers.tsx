import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../api';
import type { AdminUser } from '../../types';
import { formatDateTime } from '../../utils';

export default function AdminUsers() {
  const { t, i18n } = useTranslation();
  const [users, setUsers] = useState<AdminUser[]>([]);

  function load() {
    api.get('/admin/users').then((res) => setUsers(res.data.users));
  }
  useEffect(load, []);

  async function patch(id: string, data: { role?: 'USER' | 'ADMIN'; blocked?: boolean }) {
    await api.put(`/admin/users/${id}`, data);
    load();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t('admin.users')}</h1>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-white/60 text-left text-slate-800">
            <tr>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2">Blocked</th>
              <th className="px-4 py-2">{t('common.date')}</th>
              <th className="px-4 py-2 text-right">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-brand-200/15">
                <td className="px-4 py-2">{u.email}</td>
                <td className="px-4 py-2">{u.name}</td>
                <td className="px-4 py-2">
                  <span
                    className={`badge ${u.role === 'ADMIN' ? 'bg-brand-600 text-white' : 'bg-brand-50 text-slate-800'}`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-2">
                  {u.blocked ? (
                    <span className="badge bg-red-50 text-red-700">blocked</span>
                  ) : (
                    <span className="text-slate-500">—</span>
                  )}
                </td>
                <td className="px-4 py-2 text-slate-600">{formatDateTime(u.createdAt, i18n.language)}</td>
                <td className="px-4 py-2 text-right space-x-2">
                  <button
                    onClick={() => patch(u.id, { role: u.role === 'ADMIN' ? 'USER' : 'ADMIN' })}
                    className="btn-outline text-xs px-2 py-1"
                  >
                    {u.role === 'ADMIN' ? t('admin.makeUser') : t('admin.makeAdmin')}
                  </button>
                  <button
                    onClick={() => patch(u.id, { blocked: !u.blocked })}
                    className={`text-xs px-2 py-1 ${u.blocked ? 'btn-outline' : 'btn-danger'}`}
                  >
                    {u.blocked ? t('admin.unblock') : t('admin.block')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
