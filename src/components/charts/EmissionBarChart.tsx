import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface BarDataItem {
    name: string;
    value: number;
    fill: string;
}

interface EmissionBarChartProps {
    data: BarDataItem[];
    loading: boolean;
    isEmpty: boolean;
}

export function EmissionBarChart({ data, loading, isEmpty }: EmissionBarChartProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base font-semibold text-text-main">
                    Emissions by Scope
                </CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="h-[300px] flex items-center justify-center">
                        <div className="h-8 w-32 rounded bg-bg-section animate-pulse" />
                    </div>
                ) : isEmpty ? (
                    <div className="h-[300px] flex items-center justify-center text-text-muted text-sm">
                        No emission data for the selected period.
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data} barSize={60}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#475569', fontSize: 13, fontWeight: 500 }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94A3B8', fontSize: 12 }}
                                tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : `${v}`}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #E2E8F0',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                                    fontSize: '13px',
                                }}
                                formatter={(value: number | undefined) => [`${(value ?? 0).toFixed(1)} kg CO₂e`, 'Emissions']}
                                cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                            />
                            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                {data.map((entry, index) => (
                                    <Cell key={`bar-${index}`} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
}
