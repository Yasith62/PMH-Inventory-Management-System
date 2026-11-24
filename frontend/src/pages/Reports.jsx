import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import Loading from '../components/Loading';
import { reportApi } from '../services/api';
import { formatCurrency, formatDate } from '../utils/format';

export default function Reports() {
  const [tab, setTab] = useState('daily');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [daily, setDaily] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [profit, setProfit] = useState({ items: [], summary: {} });
  const [loading, setLoading] = useState(false);

  const loadDaily = () => {
    setLoading(true);
    reportApi
      .dailySales({ from: from || undefined, to: to || undefined })
      .then((res) => setDaily(res.data.data))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  const loadMonthly = () => {
    setLoading(true);
    reportApi
      .monthlyRevenue({ year })
      .then((res) => setMonthly(res.data.data))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  const loadProfit = () => {
    setLoading(true);
    reportApi
      .profit({ from: from || undefined, to: to || undefined })
      .then((res) => setProfit(res.data.data))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (tab === 'daily') loadDaily();
    else if (tab === 'monthly') loadMonthly();
    else loadProfit();
  }, [tab]);

  const tabs = [
    { id: 'daily', label: 'Daily Sales' },
    { id: 'monthly', label: 'Monthly Revenue' },
    { id: 'profit', label: 'Profit Analysis' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-[34px] font-bold text-[#0b1f5c] capitalize">Reports</h1>
        <p className="mt-1 text-[17px] font-light text-[#0b1f5c]">Sales analytics and profit insights</p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-[39px] px-6 py-2 text-[19px] font-bold transition flex-1 sm:flex-none ${
              tab === t.id ? 'bg-[#0025ff] text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white border-4 border-[#0b1f5c] rounded-[24px] p-6 mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          {(tab === 'daily' || tab === 'profit') && (
            <>
              <div className="flex-1 sm:flex-none">
                <label className="label">From</label>
                <input type="date" className="input-field w-full" value={from} onChange={(e) => setFrom(e.target.value)} />
              </div>
              <div className="flex-1 sm:flex-none">
                <label className="label">To</label>
                <input type="date" className="input-field w-full" value={to} onChange={(e) => setTo(e.target.value)} />
              </div>
            </>
          )}
          {tab === 'monthly' && (
            <div className="flex-1 sm:flex-none">
              <label className="label">Year</label>
              <input type="number" className="input-field w-full sm:w-32" value={year} onChange={(e) => setYear(e.target.value)} />
            </div>
          )}
          <button
            type="button"
            className="bg-[#0025ff] text-white rounded-[39px] h-[53px] w-full sm:w-[186px] font-bold text-[19px] hover:bg-[#001ed6] transition"
            onClick={() => (tab === 'daily' ? loadDaily() : tab === 'monthly' ? loadMonthly() : loadProfit())}
          >
            Apply Filters
          </button>
        </div>
      </div>

      {loading ? (
        <Loading message="Loading reports..." size={40} />
      ) : (
        <>
          {tab === 'daily' && (
            <div className="bg-white border-4 border-[#0b1f5c] rounded-[24px] p-6 overflow-hidden">
              <div className="overflow-x-auto">
                <DataTable
                  columns={[
                    { key: 'date', label: 'Date', render: (r) => formatDate(r.date) },
                    { key: 'transaction_count', label: 'Transactions' },
                    { key: 'revenue', label: 'Revenue', render: (r) => formatCurrency(r.revenue) },
                  ]}
                  data={daily}
                />
              </div>
            </div>
          )}

          {tab === 'monthly' && (
            <div className="bg-white border-4 border-[#0b1f5c] rounded-[24px] p-6 overflow-hidden">
              <div className="overflow-x-auto">
                <DataTable
                  columns={[
                    { key: 'month_name', label: 'Month' },
                    { key: 'transaction_count', label: 'Transactions' },
                    { key: 'revenue', label: 'Revenue', render: (r) => formatCurrency(r.revenue) },
                  ]}
                  data={monthly}
                />
              </div>
            </div>
          )}

          {tab === 'profit' && (
            <>
              <div className="mb-6 grid gap-4 sm:grid-cols-3">
                {[
                  { label: 'Total Revenue', value: profit.summary?.total_revenue },
                  { label: 'Est. Cost', value: profit.summary?.total_cost },
                  { label: 'Est. Profit', value: profit.summary?.total_profit },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-white border-4 border-[#0b1f5c] rounded-[24px] p-6 h-[112px]">
                    <p className="text-sm text-slate-500">{label}</p>
                    <p className="mt-1 text-2xl font-bold text-slate-900">{formatCurrency(value)}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white border-4 border-[#0b1f5c] rounded-[24px] p-6 overflow-hidden">
                <div className="overflow-x-auto">
                  <DataTable
                    columns={[
                      { key: 'date', label: 'Date', render: (r) => formatDate(r.date) },
                      { key: 'product_name', label: 'Product' },
                      { key: 'qty_sold', label: 'Qty' },
                      { key: 'revenue', label: 'Revenue', render: (r) => formatCurrency(r.revenue) },
                      { key: 'estimated_cost', label: 'Cost', render: (r) => formatCurrency(r.estimated_cost) },
                      { key: 'profit', label: 'Profit', render: (r) => formatCurrency(r.profit) },
                    ]}
                    data={profit.items || []}
                  />
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
