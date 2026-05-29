import type { ConnectedAccount } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";

export function useStravaStatusQuery() {
  return useQuery({
    queryKey: queryKeys.stravaStatus,
    queryFn: () =>
      apiGet<{
        connected: boolean;
        account: Pick<ConnectedAccount, "displayName" | "lastSyncedAt" | "status"> | null;
      }>("/api/strava/status")
  });
}
