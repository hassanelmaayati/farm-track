import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, toQuery } from "../lib/api";

// ---- reads ----

export const useStructures = () =>
  useQuery({ queryKey: ["structures"], queryFn: async () => (await api.get("/structures")).structures });

export const useStructure = (id) =>
  useQuery({ queryKey: ["structure", id], queryFn: () => api.get(`/structures/${id}`) });

// Filters change on every keystroke, so keep the previous rows on screen while refetching.
export const useAnimals = (filters) =>
  useQuery({
    queryKey: ["animals", filters],
    queryFn: async () => (await api.get(`/animals${toQuery(filters)}`)).animals,
    placeholderData: keepPreviousData,
  });

export const useSpecies = () =>
  useQuery({ queryKey: ["species"], queryFn: async () => (await api.get("/animals/species")).species });

export const useAnimal = (id) =>
  useQuery({ queryKey: ["animal", id], queryFn: async () => (await api.get(`/animals/${id}`)).animal });

export const useAnimalLogs = (animalId) =>
  useQuery({ queryKey: ["logs", animalId], queryFn: async () => (await api.get(`/animals/${animalId}/logs`)).logs });

export const useAllLogs = (filters) =>
  useQuery({
    queryKey: ["all-logs", filters],
    queryFn: async () => (await api.get(`/logs${toQuery(filters)}`)).logs,
    placeholderData: keepPreviousData,
  });

export const useAnalytics = () => useQuery({ queryKey: ["analytics"], queryFn: () => api.get("/analytics/summary") });

// ---- writes ----

// Animals, logs, structures and analytics all depend on each other, so refetch whatever is on screen.
const useWrite = (fn) => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: fn, onSuccess: () => qc.invalidateQueries() });
};

export const useSaveStructure = () => useWrite(({ id, ...data }) => (id ? api.put(`/structures/${id}`, data) : api.post("/structures", data)));
export const useDeleteStructure = () => useWrite((id) => api.del(`/structures/${id}`));

export const useSaveAnimal = () => useWrite(({ id, ...data }) => (id ? api.put(`/animals/${id}`, data) : api.post("/animals", data)));
export const useDeleteAnimal = () => useWrite((id) => api.del(`/animals/${id}`));

export const useBulkMove = () => useWrite(({ ids, structure }) => api.post("/animals/bulk/move", { ids, structure }));
export const useBulkStatus = () => useWrite(({ ids, status }) => api.post("/animals/bulk/status", { ids, status }));
export const useBulkDelete = () => useWrite((ids) => api.post("/animals/bulk/delete", { ids }));

export const useSaveLog = () =>
  useWrite(({ id, animalId, ...data }) => (id ? api.put(`/logs/${id}`, data) : api.post(`/animals/${animalId}/logs`, data)));
export const useDeleteLog = () => useWrite((id) => api.del(`/logs/${id}`));
