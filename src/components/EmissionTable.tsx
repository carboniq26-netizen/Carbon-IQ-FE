import type { EmissionRecord } from '../types/types';

interface EmissionTableProps {
    records: EmissionRecord[];
    loading: boolean;
    error: string | null;
}

export default function EmissionTable({ records, loading, error }: EmissionTableProps) {
    if (loading) {
        return (
            <div className="rounded-xl border border-border bg-card p-12 flex items-center justify-center shadow-sm">
                <div className="flex items-center gap-3 text-text-muted">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm">Loading emission data...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-xl border border-danger/30 bg-danger/5 p-6 shadow-sm">
                <p className="text-danger text-sm font-medium">{error}</p>
            </div>
        );
    }

    if (records.length === 0) {
        return (
            <div className="rounded-xl border border-border bg-card p-12 flex items-center justify-center shadow-sm">
                <p className="text-text-muted text-sm">No emission records found.</p>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-bg-section border-b border-border">
                            <th className="text-left px-4 py-3 font-semibold text-text-secondary">Date</th>
                            <th className="text-left px-4 py-3 font-semibold text-text-secondary">Location</th>
                            <th className="text-left px-4 py-3 font-semibold text-text-secondary">Department</th>
                            <th className="text-left px-4 py-3 font-semibold text-text-secondary">Source</th>
                            <th className="text-left px-4 py-3 font-semibold text-text-secondary">Activity</th>
                            <th className="text-right px-4 py-3 font-semibold text-text-secondary">Quantity</th>
                            <th className="text-left px-4 py-3 font-semibold text-text-secondary">Unit</th>
                            <th className="text-right px-4 py-3 font-semibold text-text-secondary">Factor</th>
                            <th className="text-right px-4 py-3 font-semibold text-text-secondary">Emission (kg CO₂e)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {records.map((r, i) => (
                            <tr
                                key={i}
                                className="border-b border-border last:border-b-0 hover:bg-bg-section/50 transition-colors"
                            >
                                <td className="px-4 py-3 text-text-main">{r.date}</td>
                                <td className="px-4 py-3 text-text-main">{r.location}</td>
                                <td className="px-4 py-3 text-text-secondary">{r.department}</td>
                                <td className="px-4 py-3">
                                    <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-primary-soft text-primary">
                                        {r.sourceType}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-text-secondary">{r.activityType}</td>
                                <td className="px-4 py-3 text-right font-mono text-text-main">{r.quantity}</td>
                                <td className="px-4 py-3 text-text-muted">{r.unit}</td>
                                <td className="px-4 py-3 text-right font-mono text-text-secondary">{r.emissionFactor}</td>
                                <td className="px-4 py-3 text-right font-mono font-semibold text-text-main">
                                    {r.emission.toFixed(1)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="bg-bg-section border-t border-border">
                            <td colSpan={8} className="px-4 py-3 font-semibold text-text-main text-right">
                                Total
                            </td>
                            <td className="px-4 py-3 text-right font-mono font-bold text-primary">
                                {records.reduce((sum, r) => sum + r.emission, 0).toFixed(1)}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
}
