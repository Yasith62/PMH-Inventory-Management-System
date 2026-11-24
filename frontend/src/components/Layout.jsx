import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#f8fafc] overflow-x-hidden">
      <Sidebar />
      <main className="lg:pl-[348px] md:pl-[80px] pl-0 min-h-screen">
        <div className="px-4 pb-8 pt-16 lg:px-8 lg:pt-8 md:pt-8 max-w-full overflow-x-hidden">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
