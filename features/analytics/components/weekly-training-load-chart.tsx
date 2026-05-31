"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { WeeklyTrainingLoadPoint } from "@/features/analytics/schemas/rider-profile.schema";
import { ChartCard } from "@/features/analytics/components/chart-card";
import { ChartEmptyState } from "@/features/analytics/components/chart-empty-state";

export function WeeklyTrainingLoadChart({ data }: { data: WeeklyTrainingLoadPoint[] }) {
  return (
    <ChartCard title="Weekly Training Load" description="Distance with elevation overlay from your recent synced rides.">
      {data.length ? (
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip formatter={(value, name) => [value, name === "distanceKm" ? "Distance km" : "Elevation m"]} />
              <Bar dataKey="distanceKm" fill="#f97316" radius={[8, 8, 0, 0]} />
              <Bar dataKey="elevationM" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <ChartEmptyState title="No weekly load yet" description="Sync a few outdoor cycling activities to build a meaningful load chart." />
      )}
    </ChartCard>
  );
}
