import { useEffect, useState } from 'react';
import { Plus, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Loading from '../components/Loading';
import { purchaseApi, supplierApi, productApi } from '../services/api';
import { formatCurrency, formatDate, todayISO } from '../utils/format';

const emptyItem = { product_id: '', quantity: 1, cost_price: '' };

export default function Purchases() {
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ supplier_id: '', date: todayISO(), items: [{ ...emptyItem }] });

  const load = () => {
    purchaseApi
      .getAll()
      .then((res) => setPurchases(res.data.data))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    Promise.all([supplierApi.getAll(), productApi.getAll()])
      .then(([s, p]) => {
        setSuppliers(s.data.data);
        setProducts(p.data.data);
      })
      .catch((err) => toast.error(err.message));
  }, []);

  const addItem = () => setForm({ ...form, items: [...form.items, { ...emptyItem }] });

  const updateItem = (idx, field, value) => {
    const items = [...form.items];
    items[idx] = { ...items[idx], [field]: value };
    setForm({ ...form, items });
  };

  const removeItem = (idx) => {
    if (form.items.length === 1) return;
    setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });
  };

  const lineTotal = form.items.reduce((s, i) => s + (Number(i.quantity) || 0) * (Number(i.cost_price) || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await purchaseApi.create({
        supplier_id: Number(form.supplier_id),
        date: form.date,
        items: form.items.map((i) => ({
          product_id: Number(i.product_id),
          quantity: Number(i.quantity),
          cost_price: Number(i.cost_price),
        })),
      });
      toast.success('Purchase recorded — stock updated');
      setModalOpen(false);
      setForm({ supplier_id: '', date: todayISO(), items: [{ ...emptyItem }] });
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const viewDetail = async (id) => {
    try {
      const res = await purchaseApi.getOne(id);
      setSelected(res.data.data);
      setDetailOpen(true);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const columns = [
    { key: 'id', label: '#', render: (r) => `#${r.id}` },
    { key: 'supplier_name', label: 'Supplier' },
    { key: 'date', label: 'Date', render: (r) => formatDate(r.date) },
    { key: 'total_amount', label: 'Total', render: (r) => formatCurrency(r.total_amount) },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <button type="button" onClick={() => viewDetail(row.id)} className="text-pmh-600 hover:text-pmh-700">
          <Eye size={18} />
        </button>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[34px] font-bold text-[#0b1f5c] capitalize">Purchases</h1>
          <p className="mt-1 text-[17px] font-light text-[#0b1f5c]">Record stock purchases from suppliers</p>
        </div>
        <button type="button" className="bg-[#0025ff] text-white rounded-[39px] px-6 py-3 font-bold text-[17px] hover:bg-[#001ed6] transition w-full sm:w-auto" onClick={() => setModalOpen(true)}>
          <Plus size={18} className="inline mr-2" /> New Purchase
        </button>
      </div>

      <div className="bg-white border-4 border-[#0b1f5c] rounded-[24px] p-6 overflow-hidden">
        {loading ? (
          <Loading message="Loading purchases..." size={40} />
        ) : (
          <div className="overflow-x-auto">
            <DataTable columns={columns} data={purchases} />
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Record Purchase" size="xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Supplier</label>
              <select className="input-field" value={form.supplier_id} onChange={(e) => setForm({ ...form, supplier_id: e.target.value })} required>
                <option value="">Select supplier</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Date</label>
              <input type="date" className="input-field" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-medium text-slate-700">Items</p>
              <button type="button" className="text-sm text-pmh-600" onClick={addItem}>+ Add line</button>
            </div>
            {form.items.map((item, idx) => (
              <div key={idx} className="grid gap-2 rounded-xl border border-slate-100 bg-slate-50/50 p-3 sm:grid-cols-4">
                <select className="input-field sm:col-span-2" value={item.product_id} onChange={(e) => updateItem(idx, 'product_id', e.target.value)} required>
                  <option value="">Product</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} (stock: {p.stock_qty})</option>
                  ))}
                </select>
                <input type="number" min="1" className="input-field" placeholder="Qty" value={item.quantity} onChange={(e) => updateItem(idx, 'quantity', e.target.value)} required />
                <div className="flex gap-2">
                  <input type="number" step="0.01" className="input-field" placeholder="Cost" value={item.cost_price} onChange={(e) => updateItem(idx, 'cost_price', e.target.value)} required />
                  {form.items.length > 1 && (
                    <button type="button" className="btn-secondary px-3" onClick={() => removeItem(idx)}>×</button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <p className="text-right text-lg font-semibold">Total: {formatCurrency(lineTotal)}</p>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Save Purchase</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={detailOpen} onClose={() => setDetailOpen(false)} title={`Purchase #${selected?.id}`} size="lg">
        {selected && (
          <div className="space-y-4">
            <p><span className="text-slate-500">Supplier:</span> {selected.supplier_name}</p>
            <p><span className="text-slate-500">Date:</span> {formatDate(selected.date)}</p>
            <DataTable
              columns={[
                { key: 'product_name', label: 'Product' },
                { key: 'quantity', label: 'Qty' },
                { key: 'cost_price', label: 'Cost', render: (r) => formatCurrency(r.cost_price) },
                { key: 'line', label: 'Line Total', render: (r) => formatCurrency(r.quantity * r.cost_price) },
              ]}
              data={selected.items || []}
            />
            <p className="text-right font-bold">Total: {formatCurrency(selected.total_amount)}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
