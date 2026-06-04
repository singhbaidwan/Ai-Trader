import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export function Layout() {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="workspace">
        <TopBar />
        <Outlet />
      </main>
    </div>
  );
}
