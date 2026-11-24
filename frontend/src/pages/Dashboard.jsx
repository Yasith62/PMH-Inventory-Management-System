import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import Loading from '../components/Loading';
import { dashboardApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/format';

export default function Dashboard() {
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi
      .getStats()
      .then((res) => setStats(res.data.data))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <Loading message="Loading dashboard..." />;
  }

  const cards = [
    {
      label: 'Total Products',
      value: stats?.total_products ?? 0,
      icon: Package,
      color: 'bg-blue-500',
      link: '/products',
    },
    {
      label: "Today's Sales",
      value: formatCurrency(stats?.today_sales_amount),
      sub: `${stats?.today_sales_count ?? 0} transactions`,
      icon: TrendingUp,
      color: 'bg-emerald-500',
      link: '/sales',
      adminOnly: true,
    },
    {
      label: 'Low Stock Items',
      value: stats?.low_stock_count ?? 0,
      icon: AlertTriangle,
      color: 'bg-amber-500',
      link: '/products?low_stock=true',
    },
    {
      label: 'This Month Revenue',
      value: formatCurrency(stats?.month_revenue),
      icon: DollarSign,
      color: 'bg-pmh-500',
      link: '/reports',
      adminOnly: true,
    },
  ].filter((card) => isAdmin || !card.adminOnly);

  const lowStockColumns = [
    { key: 'name', label: 'Product' },
    { key: 'brand', label: 'Brand' },
    {
      key: 'stock_qty',
      label: 'Stock',
      render: (row) => (
        <span className={row.stock_qty <= row.reorder_level ? 'font-semibold text-red-600' : ''}>
          {row.stock_qty} / {row.reorder_level}
        </span>
      ),
    },
    {
      key: 'selling_price',
      label: 'Price',
      render: (row) => formatCurrency(row.selling_price),
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-[34px] font-bold text-[#0b1f5c] capitalize">Dashboard</h1>
        <p className="mt-1 text-[17px] font-light text-[#0b1f5c]">Overview of your spare parts inventory and sales</p>
      </div>

      <div
        className={`grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ${isAdmin ? 'xl:grid-cols-4' : 'xl:grid-cols-2'}`}
      >
        {cards.map(({ label, value, sub, icon: Icon, color, link }) => (
          <Link key={label} to={link} className="relative bg-white rounded-[28px] p-6 h-[176px] shadow-card hover:shadow-glow transition group flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[17px] font-semibold text-[#939eac]">{label}</p>
                <p className="mt-2 text-[34px] font-black text-[#0b1f5c] uppercase">{value}</p>
                {sub && <p className="mt-1 text-[17px] font-semibold text-[#939eac]">{sub}</p>}
              </div>
              <div className={`rounded-[14px] h-[55px] w-[56px] ${color} p-3 text-white shadow-lg transition group-hover:scale-105 flex items-center justify-center`}>
                <Icon size={24} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-white border-4 border-[#0b1f5c] rounded-[24px] p-6 mt-8 shadow-card min-h-[323px] overflow-hidden">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#0b1f5c]">Low Stock Alerts</h2>
          <Link to="/products" className="text-sm font-medium text-pmh-600 hover:text-pmh-700">
            View all products →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <DataTable
            columns={lowStockColumns}
            data={stats?.low_stock ?? []}
            emptyMessage="All products are above reorder level"
          />
        </div>
      </div>
    </div>
  );
}
