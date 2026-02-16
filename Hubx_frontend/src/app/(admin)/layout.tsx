
export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-slate-50">
            <aside className="w-[200px] bg-slate-900 text-white hidden md:flex flex-col py-6 px-4">
                <div className="font-bold text-xl mb-8">ADMIN</div>
                <nav className="space-y-4">
                    <div className="p-2 bg-slate-800 rounded">Dashboard</div>
                    <div className="p-2 hover:bg-slate-800 rounded">Users</div>
                    <div className="p-2 hover:bg-slate-800 rounded">Settings</div>
                </nav>
            </aside>
            <div className="flex flex-1 flex-col overflow-hidden">
                <header className="h-16 border-b bg-white flex items-center px-6 justify-between">
                    <h2 className="text-lg font-semibold">Admin Console</h2>
                    <div className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">SECURE AREA</div>
                </header>
                <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
