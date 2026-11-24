import { useEffect, useMemo, useState } from 'react';
import { Plus, FileText, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Invoice from '../components/Invoice';
import Loading from '../components/Loading';
import { saleApi, productApi } from '../services/api';
import { formatCurrency, formatDate, todayISO } from '../utils/format';

const emptyItem = { product_id: '', quantity: 1, selling_price: '' };

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [invoiceSale, setInvoiceSale] = useState(null);
  const [form, setForm] = useState({ date: todayISO(), items: [{ ...emptyItem }] });
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = useMemo(
    () => {
      if (!searchQuery) return products;
      const query = searchQuery.toLowerCase();
      return products.filter((p) => 
        p.name.toLowerCase().includes(query) || 
        p.brand.toLowerCase().includes(query) ||
        p.vehicle_type.toLowerCase().includes(query)
      );
    },
    [products, searchQuery]
  );

  const openNewSale = () => {
    setSearchQuery('');
    setForm({ date: todayISO(), items: [{ ...emptyItem }] });
    setModalOpen(true);
  };

  const load = () => {
    saleApi
      .getAll()
      .then((res) => setSales(res.data.data))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    productApi.getAll().then((res) => setProducts(res.data.data)).catch((err) => toast.error(err.message));
  }, []);

  const getProduct = (id) => products.find((p) => p.id === Number(id));

  const getDefaultPrice = (productId) => {
    const p = getProduct(productId);
    if (!p) return '';
    return p.discount_price || p.selling_price;
  };

  const addItem = () => setForm({ ...form, items: [...form.items, { ...emptyItem }] });

  const updateItem = (idx, field, value) => {
    const items = [...form.items];
    items[idx] = { ...items[idx], [field]: value };
    if (field === 'product_id') {
      items[idx].selling_price = getDefaultPrice(value);
    }
    setForm({ ...form, items });
  };

  const removeItem = (idx) => {
    if (form.items.length === 1) return;
    setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });
  };

  const lineTotal = form.items.reduce((s, i) => {
    const price = i.selling_price || getDefaultPrice(i.product_id);
    return s + (Number(i.quantity) || 0) * (Number(price) || 0);
  }, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await saleApi.create({
        date: form.date,
        items: form.items.map((i) => ({
          product_id: Number(i.product_id),
          quantity: Number(i.quantity),
          selling_price: i.selling_price ? Number(i.selling_price) : undefined,
        })),
      });
      toast.success('Sale recorded — stock updated');
      setModalOpen(false);
      setForm({ date: todayISO(), items: [{ ...emptyItem }] });
      load();
      await openInvoice(res.data.data);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const openInvoice = async (sale) => {
    try {
      if (sale?.items?.length) {
        setInvoiceSale(sale);
      } else {
        const res = await saleApi.getOne(sale.id);
        setInvoiceSale(res.data.data);
      }
      setInvoiceOpen(true);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const viewInvoice = (id) => openInvoice({ id });

  const columns = [
    { key: 'id', label: '#', render: (r) => `#${String(r.id).padStart(6, '0')}` },
    { key: 'date', label: 'Date', render: (r) => formatDate(r.date) },
    { key: 'staff_name', label: 'Staff', render: (r) => r.staff_name || '-' },
    { key: 'total_amount', label: 'Total', render: (r) => formatCurrency(r.total_amount) },
    {
      key: 'actions',
      label: 'Invoice',
      render: (row) => (
        <button type="button" onClick={() => viewInvoice(row.id)} className="flex items-center gap-1 text-pmh-600 hover:text-pmh-700">
          <FileText size={18} /> View
        </button>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[34px] font-bold text-[#0b1f5c] capitalize">Sales</h1>
          <p className="mt-1 text-[17px] font-light text-[#0b1f5c]">Record sales and generate invoices</p>
        </div>
        <button type="button" className="bg-[#0025ff] text-white rounded-[39px] px-6 py-3 font-bold text-[17px] hover:bg-[#001ed6] transition w-full sm:w-auto" onClick={openNewSale}>
          <Plus size={18} className="inline mr-2" /> New Sale
        </button>
      </div>

      <div className="bg-white border-4 border-[#0b1f5c] rounded-[24px] p-6 overflow-hidden">
        {loading ? (
          <Loading message="Loading sales..." size={40} />
        ) : (
          <div className="overflow-x-auto">
            <DataTable columns={columns} data={sales} />
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Record Sale" size="xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Date</label>
              <input type="date" className="input-field" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            </div>
            <div>
              <label className="label">Search Products</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  className="input-field pl-10"
                  placeholder="Name, brand, vehicle..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-medium text-slate-700">
                Items
                {searchQuery && (
                  <span className="ml-2 text-sm font-normal text-slate-500">
                    ({filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''})
                  </span>
                )}
              </p>
              <button type="button" className="text-sm text-pmh-600" onClick={addItem}>+ Add line</button>
            </div>
            {form.items.map((item, idx) => {
              const product = getProduct(item.product_id);
              return (
                <div key={idx} className="grid gap-2 rounded-xl border border-slate-100 bg-slate-50/50 p-3 sm:grid-cols-4">
                  <select className="input-field sm:col-span-2" value={item.product_id} onChange={(e) => updateItem(idx, 'product_id', e.target.value)} required>
                    <option value="">Product</option>
                    {filteredProducts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.brand}) — stock: {p.stock_qty}
                      </option>
                    ))}
                  </select>
                  <input type="number" min="1" max={product?.stock_qty} className="input-field" placeholder="Qty" value={item.quantity} onChange={(e) => updateItem(idx, 'quantity', e.target.value)} required />
                  <div className="flex gap-2">
                    <input type="number" step="0.01" className="input-field" placeholder="Price" value={item.selling_price} onChange={(e) => updateItem(idx, 'selling_price', e.target.value)} />
                    {form.items.length > 1 && (
                      <button type="button" className="btn-secondary px-3" onClick={() => removeItem(idx)}>×</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-right text-lg font-semibold">Total: {formatCurrency(lineTotal)}</p>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Complete Sale</button>
          </div>
        </form>
      </Modal>

      {invoiceOpen && (
        <Invoice sale={invoiceSale} onClose={() => { setInvoiceOpen(false); setInvoiceSale(null); }} />
      )}
    </div>
  );
}
