import apiClient from '../client';

export const adminApi = {
  getCustomers: async () => {
    return apiClient.get<any, { customers: any[] }>('/auth/customers');
  },

  // Zone & Area Management
  getZones: async () => {
    return apiClient.get<any, { zones: any[] }>('/zones');
  },

  createZone: async (payload: { name: string }) => {
    return apiClient.post<any, { zone: any }>('/zones', payload);
  },

  updateZone: async (id: string, payload: { name: string }) => {
    return apiClient.put<any, { zone: any }>(`/zones/${id}`, payload);
  },

  createArea: async (payload: { pincode: string; zoneId: string }) => {
    // Backend route is POST /api/zones/areas (NOT /areas)
    return apiClient.post<any, { area: any }>('/zones/areas', payload);
  },

  deleteArea: async (pincode: string) => {
    return apiClient.delete<any, { message: string }>(`/zones/areas/${pincode}`);
  },

  // Pricing & Rate Cards
  getRateCards: async () => {
    return apiClient.get<any, { rateCards: any[] }>('/rate-cards');
  },

  getCodSurcharges: async () => {
    return apiClient.get<any, { codSurcharges: any[] }>('/rate-cards/cod-surcharge');
  },

  createRateCard: async (payload: { fromZoneId: string; toZoneId: string; orderType: string; ratePerKg: number }) => {
    return apiClient.post<any, { rateCard: any }>('/rate-cards', payload);
  },

  updateRateCard: async (id: string, payload: { ratePerKg: number }) => {
    return apiClient.put<any, { rateCard: any }>(`/rate-cards/${id}`, payload);
  },

  // Platform Configurations
  configureCod: async (payload: { orderType: string; type: string; value: number }) => {
    return apiClient.post<any, { codSurcharge: any }>('/rate-cards/cod-surcharge', payload);
  },
};