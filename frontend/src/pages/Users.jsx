import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Loading from '../components/Loading';
import { authApi } from '../services/api';
import { formatDate } from '../utils/format';

const emptyForm = { name: '', email: '', password: '', role: 'staff' };

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = () => {
    authApi
      .getUsers()
      .then((res) => setUsers(res.data.data))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await authApi.register(form);
      toast.success('User created');
      setModalOpen(false);
      setForm(emptyForm);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this user?')) return;
    try {
      await authApi.deleteUser(id);
      toast.success('User deleted');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (r) => <span className="capitalize">{r.role}</span> },
    { key: 'created_at', label: 'Created', render: (r) => formatDate(r.created_at) },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <button type="button" onClick={() => handleDelete(row.id)} className="text-red-500 hover:text-red-600">
          <Trash2 size={16} />
        </button>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[34px] font-bold text-[#0b1f5c] capitalize">Users</h1>
          <p className="mt-1 text-[17px] font-light text-[#0b1f5c]">Manage system users and roles</p>
        </div>
        <button type="button" className="bg-[#0025ff] text-white rounded-[39px] px-6 py-3 font-bold text-[17px] hover:bg-[#001ed6] transition w-full sm:w-auto" onClick={() => setModalOpen(true)}>
          <Plus size={18} className="inline mr-2" /> New User
        </button>
      </div>

      <div className="bg-white border-4 border-[#0b1f5c] rounded-[24px] p-6 overflow-hidden">
        {loading ? (
          <Loading message="Loading users..." size={40} />
        ) : (
          <div className="overflow-x-auto">
            <DataTable columns={columns} data={users} />
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add User">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Name</label>
            <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" className="input-field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <label className="label">Password</label>
            <input type="password" className="input-field" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} minLength={6} required />
          </div>
          <div>
            <label className="label">Role</label>
            <select className="input-field" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Create User</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
