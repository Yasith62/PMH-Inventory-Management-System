import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Loading from '../components/Loading';
import { productApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/format';

const emptyForm = {
  name: '',
  brand: '',
  vehicle_type: '',
  part_type: 'Aftermarket',
  genuine_status: false,
  cost_price: '',
  selling_price: '',
  discount_price: '',
  stock_qty: 0,
  reorder_level: 5,
};

const partTypes = ['Genuine', 'OEM', 'Aftermarket', 'Used'];

export default function Products() {
  const { isAdmin } = useAuth();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(searchParams.get('low_stock') === 'true');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const load = () => {
    setLoading(true);
    productApi
      .getAll({ search: search || undefined, low_stock: lowStockOnly ? 'true' : undefined })
      .then((res) => setProducts(res.data.data))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [lowStockOnly]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setForm({
      name: product.name,
      brand: product.brand,
      vehicle_type: product.vehicle_type,
      part_type: product.part_type,
      genuine_status: Boolean(product.genuine_status),
      cost_price: product.cost_price,
      selling_price: product.selling_price,
      discount_price: product.discount_price ?? '',
      stock_qty: product.stock_qty,
      reorder_level: product.reorder_level,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      genuine_status: Boolean(form.genuine_status),
      cost_price: Number(form.cost_price),
      selling_price: Number(form.selling_price),
      discount_price: form.discount_price ? Number(form.discount_price) : null,
      stock_qty: Number(form.stock_qty),
      reorder_level: Number(form.reorder_level),
    };
    try {
      if (editing) {
        await productApi.update(editing.id, payload);
        toast.success('Product updated');
      } else {
        await productApi.create(payload);
        toast.success('Product created');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await productApi.delete(id);
      toast.success('Product deleted');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'brand', label: 'Brand' },
    { key: 'vehicle_type', label: 'Vehicle' },
    { key: 'part_type', label: 'Type' },
    {
      key: 'genuine_status',
      label: 'Genuine',
      render: (row) => (row.genuine_status ? 'Yes' : 'No'),
    },
    {
      key: 'selling_price',
      label: 'Selling',
      render: (row) => formatCurrency(row.selling_price),
    },
    {
      key: 'discount_price',
      label: 'Discount',
      render: (row) =>
        row.discount_price != null && Number(row.discount_price) > 0
          ? formatCurrency(row.discount_price)
          : '—',
    },
    {
      key: 'stock_qty',
      label: 'Stock',
      render: (row) => (
        <span className={row.stock_qty <= row.reorder_level ? 'font-semibold text-amber-600' : ''}>
          {row.stock_qty}
        </span>
      ),
    },
    ...(isAdmin
      ? [
          {
            key: 'actions',
            label: 'Actions',
            render: (row) => (
              <div className="flex gap-2">
                <button type="button" onClick={() => openEdit(row)} className="text-pmh-600 hover:text-pmh-700">
                  <Pencil size={16} />
                </button>
                <button type="button" onClick={() => handleDelete(row.id)} className="text-red-500 hover:text-red-600">
                  <Trash2 size={16} />
                </button>
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[34px] font-bold text-[#0b1f5c] capitalize">Products</h1>
          <p className="mt-1 text-[17px] font-light text-[#0b1f5c]">Manage spare parts inventory</p>
        </div>
        {isAdmin && (
          <button type="button" className="bg-[#0025ff] text-white rounded-[39px] px-6 py-3 font-bold text-[17px] hover:bg-[#001ed6] transition w-full sm:w-auto" onClick={openCreate}>
            <Plus size={18} className="inline mr-2" /> Add Products
          </button>
        )}
      </div>

      <div className="bg-white border-4 border-[#0b1f5c] rounded-[24px] p-6 mb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0b1f5c]" size={20} />
            <input
              className="w-full border-2 border-[#0b1f5c] rounded-[19px] h-[53px] pl-12 pr-4 text-[17px] placeholder-[#727c8f] focus:outline-none focus:border-[#0025ff] transition"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && load()}
            />
          </div>
          <label className="flex items-center gap-2 text-[17px] font-medium text-[#0b1f5c]">
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={(e) => setLowStockOnly(e.target.checked)}
              className="w-5 h-5 rounded border-2 border-[#0b1f5c] text-[#0025ff] focus:ring-[#0025ff]"
            />
            Low stock only
          </label>
          <button type="button" className="bg-[#0025ff] text-white rounded-[39px] h-[53px] px-8 font-bold text-[17px] hover:bg-[#001ed6] transition shadow-lg" onClick={load}>
            Search
          </button>
        </div>
      </div>

      <div className="bg-white border-4 border-[#0b1f5c] rounded-[24px] p-6 overflow-hidden">
        {loading ? (
          <Loading message="Loading products..." size={40} />
        ) : (
          <div className="overflow-x-auto">
            <DataTable columns={columns} data={products} />
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Product' : 'Add Product'} size="lg">
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label">Name</label>
            <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="label">Brand</label>
            <input className="input-field" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} required />
          </div>
          <div>
            <label className="label">Part Type</label>
            <select className="input-field" value={form.part_type} onChange={(e) => setForm({ ...form, part_type: e.target.value })}>
              {partTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label">Vehicle Type</label>
            <input className="input-field" value={form.vehicle_type} onChange={(e) => setForm({ ...form, vehicle_type: e.target.value })} required />
          </div>
          <div>
            <label className="label flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.genuine_status}
                onChange={(e) => setForm({ ...form, genuine_status: e.target.checked })}
                className="rounded border-slate-300 text-pmh-600"
              />
              Genuine Part
            </label>
          </div>
          <div>
            <label className="label">Cost Price (LKR)</label>
            <input type="number" step="0.01" className="input-field" value={form.cost_price} onChange={(e) => setForm({ ...form, cost_price: e.target.value })} required />
          </div>
          <div>
            <label className="label">Selling Price (LKR)</label>
            <input type="number" step="0.01" className="input-field" value={form.selling_price} onChange={(e) => setForm({ ...form, selling_price: e.target.value })} required />
          </div>
          <div>
            <label className="label">Discount Price (LKR)</label>
            <input type="number" step="0.01" className="input-field" value={form.discount_price} onChange={(e) => setForm({ ...form, discount_price: e.target.value })} />
          </div>
          <div>
            <label className="label">Stock Qty</label>
            <input type="number" className="input-field" value={form.stock_qty} onChange={(e) => setForm({ ...form, stock_qty: e.target.value })} required />
          </div>
          <div>
            <label className="label">Reorder Level</label>
            <input type="number" className="input-field" value={form.reorder_level} onChange={(e) => setForm({ ...form, reorder_level: e.target.value })} required />
          </div>
          <div className="flex justify-end gap-2 sm:col-span-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary">{editing ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
