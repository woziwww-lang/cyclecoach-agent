"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartCard } from "@/features/analytics/components/chart-card";
import { ChartEmptyState } from "@/features/analytics/components/chart-empty-state";

export function ElevationTrendChart({ data }: { data: Array<{ label: string; elevationM: number }> }) {
  return (
    <ChartCard title="Elevation Trend" description="Recent climbing load by ride.">
      {data.length ? (
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="elevation-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip formatter={(value) => [`${value} m`, "Elevation"]} />
              <Area type="monotone" dataKey="elevationM" stroke="#10b981" fill="url(#elevation-fill)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <ChartEmptyState title="No elevation trend yet" description="Outdoor rides with elevation data are needed for this chart." />
      )}
    </ChartCard>
  );
}
