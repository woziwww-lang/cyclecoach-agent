"use client";

import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip } from "recharts";
import type { RiderProfile } from "@/features/analytics/schemas/rider-profile.schema";

export function RiderTypeRadar({ profile }: { profile: RiderProfile }) {
  const data = Object.entries(profile.scores).map(([metric, value]) => ({
    metric: metric.replace("_", " "),
    value
  }));

  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: "#64748b" }} />
          <Tooltip formatter={(value) => [`${value}/100`, "Score"]} />
          <Radar dataKey="value" stroke="#f97316" fill="#f97316" fillOpacity={0.22} strokeWidth={2} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
