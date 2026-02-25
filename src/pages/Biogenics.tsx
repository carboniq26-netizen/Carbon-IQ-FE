import { Leaf } from 'lucide-react';

export default function Biogenics() {
    return (
        <div className="space-y-6 p-5">
            <div>
                <div className="flex items-center gap-3">
                    <Leaf className="w-7 h-7 text-green-600" />
                    <h1 className="text-2xl font-bold text-text-main">Biogenics</h1>
                </div>
                <p className="text-text-secondary text-sm leading-relaxed mt-1">
                    Biogenic emissions from renewable biological sources.
                </p>
            </div>

            {/* Placeholder — content will be added when data sheets are provided */}
            <div className="flex flex-col items-center justify-center py-20 rounded-xl border-2 border-dashed border-border bg-bg-section/50">
                <Leaf className="w-12 h-12 text-text-muted mb-4" />
                <h3 className="text-lg font-semibold text-text-main mb-1">Coming Soon</h3>
                <p className="text-sm text-text-muted text-center max-w-md">
                    Biogenic emission data will be displayed here once the data sheets are configured.
                </p>
            </div>
        </div>
    );
}
