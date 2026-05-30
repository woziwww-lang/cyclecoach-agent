import { useQuery } from "@tanstack/react-query";
import type { TrainingMemory } from "@/features/agent/schemas/training-memory.schema";
import { apiGet } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";

export function useTrainingMemoryQuery() {
  return useQuery({
    queryKey: queryKeys.trainingMemory,
    queryFn: () => apiGet<{ trainingMemory: TrainingMemory; authenticated: boolean }>("/api/agent/training-memory")
  });
}
