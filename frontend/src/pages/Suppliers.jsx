import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Loading from '../components/Loading';
import { supplierApi } from '../services/api';
import { formatDate } from '../utils/format';

const emptyForm = { name: '', contact: '', address: '' };

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const load = () => {
    supplierApi
      .getAll()
      .then((res) => setSuppliers(res.data.data))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (s) => {
    setEditing(s);
    setForm({ name: s.name, contact: s.contact, address: s.address || '' });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await supplierApi.update(editing.id, form);
        toast.success('Supplier updated');
      } else {
        await supplierApi.create(form);
        toast.success('Supplier created');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this supplier?')) return;
    try {
      await supplierApi.delete(id);
      toast.success('Supplier deleted');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'contact', label: 'Contact' },
    { key: 'address', label: 'Address', render: (r) => r.address || '-' },
    { key: 'created_at', label: 'Added', render: (r) => formatDate(r.created_at) },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <button type="button" onClick={() => openEdit(row)} className="text-pmh-600"><Pencil size={16} /></button>
          <button type="button" onClick={() => handleDelete(row.id)} className="text-red-500"><Trash2 size={16} /></button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[34px] font-bold text-[#0b1f5c] capitalize">Suppliers</h1>
          <p className="mt-1 text-[17px] font-light text-[#0b1f5c]">Manage parts suppliers</p>
        </div>
        <button type="button" className="bg-[#0025ff] text-white rounded-[39px] px-6 py-3 font-bold text-[17px] hover:bg-[#001ed6] transition w-full sm:w-auto" onClick={openCreate}>
          <Plus size={18} className="inline mr-2" /> Add Supplier
        </button>
      </div>

      <div className="bg-white border-4 border-[#0b1f5c] rounded-[24px] p-6 overflow-hidden">
        {loading ? (
          <Loading message="Loading suppliers..." size={40} />
        ) : (
          <div className="overflow-x-auto">
            <DataTable columns={columns} data={suppliers} />
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Supplier' : 'Add Supplier'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Name</label>
            <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="label">Contact</label>
            <input className="input-field" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} required />
          </div>
          <div>
            <label className="label">Address</label>
            <textarea className="input-field" rows={3} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary">{editing ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
