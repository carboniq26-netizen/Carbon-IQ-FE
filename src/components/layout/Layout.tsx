import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
    return (
        <div className="flex h-screen overflow-hidden bg-bg-main">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-5">
                <div className="mx-auto max-w-7xl">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
