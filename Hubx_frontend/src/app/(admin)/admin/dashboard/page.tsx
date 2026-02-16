
export default function AdminDashboard() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight">System Overview</h1>
            <div className="grid gap-4 md:grid-cols-4">
                <div className="p-4 bg-white rounded border border-slate-200">
                    <div className="text-xs font-bold text-slate-500 uppercase">Total Users</div>
                    <div className="text-3xl font-black mt-2">45.2k</div>
                </div>
                <div className="p-4 bg-white rounded border border-slate-200">
                    <div className="text-xs font-bold text-slate-500 uppercase">Revenue</div>
                    <div className="text-3xl font-black mt-2">$102k</div>
                </div>
                <div className="p-4 bg-white rounded border border-slate-200">
                    <div className="text-xs font-bold text-slate-500 uppercase">Server Status</div>
                    <div className="text-xl font-bold mt-2 text-green-600">Healthy</div>
                </div>
                <div className="p-4 bg-white rounded border border-slate-200">
                    <div className="text-xs font-bold text-slate-500 uppercase">Alerts</div>
                    <div className="text-xl font-bold mt-2 text-red-600">2 Critical</div>
                </div>
            </div>
        </div>
    );
}
