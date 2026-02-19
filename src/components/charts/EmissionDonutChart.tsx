import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PieDataItem {
    name: string;
    value: number;
    color: string;
}

interface EmissionDonutChartProps {
    data: PieDataItem[];
    total: number;
    loading: boolean;
    isEmpty: boolean;
}

export function EmissionDonutChart({ data, total, loading, isEmpty }: EmissionDonutChartProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base font-semibold text-text-main">
                    Emission Distribution
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
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={110}
                                paddingAngle={3}
                                dataKey="value"
                                strokeWidth={0}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`pie-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #E2E8F0',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                                    fontSize: '13px',
                                }}
                                formatter={(value: number | undefined) => [`${(value ?? 0).toFixed(1)} kg CO₂e`, 'Emissions']}
                            />
                            <Legend
                                verticalAlign="bottom"
                                iconType="circle"
                                iconSize={10}
                                formatter={(value: string) => (
                                    <span style={{ color: '#475569', fontSize: '13px', fontWeight: 500 }}>
                                        {value}
                                    </span>
                                )}
                            />
                            <text
                                x="50%"
                                y="47%"
                                textAnchor="middle"
                                dominantBaseline="middle"
                                style={{ fill: '#0F172A', fontSize: '22px', fontWeight: 700 }}
                            >
                                {total >= 1000 ? `${(total / 1000).toFixed(1)}k` : total.toFixed(0)}
                            </text>
                            <text
                                x="50%"
                                y="56%"
                                textAnchor="middle"
                                dominantBaseline="middle"
                                style={{ fill: '#94A3B8', fontSize: '11px', fontWeight: 500 }}
                            >
                                kg CO₂e
                            </text>
                        </PieChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
}
