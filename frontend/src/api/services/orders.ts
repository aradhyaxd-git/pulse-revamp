import apiClient from '../client';
import { Order } from '../../types/models';

export const ordersApi = {
  // Customer & Admin
  getOrders: async (params?: Record<string, any>) => {
    return apiClient.get<any, { orders: Order[] }>('/orders', { params });
  },

  getOrderDetails: async (id: string) => {
    return apiClient.get<any, { order: Order }>(`/orders/${id}`);
  },

  getOrderTimeline: async (id: string) => {
    return apiClient.get<any, { timeline: any[] }>(`/orders/${id}/timeline`);
  },

  // Customer Journey
  previewPricing: async (payload: any) => {
    return apiClient.post<any, { breakdown: any }>('/orders/preview', payload);
  },

  confirmOrder: async (payload: any) => {
    return apiClient.post<any, { order: Order }>('/orders/confirm', payload);
  },

  rescheduleOrder: async (id: string, payload: { rescheduleDate: string }) => {
    // Backend reads req.body.rescheduleDate (not "date")
    return apiClient.post<any, { success: boolean }>(`/orders/${id}/reschedule`, payload);
  },

  // Agent Journey
  updateStatus: async (id: string, payload: { toStatus: string; notes?: string }) => {
    // Backend reads req.body.toStatus (not "status")
    return apiClient.patch<any, { success: boolean; newStatus: string }>(`/orders/${id}/status`, payload);
  },

  // Admin Journey
  assignAgent: async (id: string, payload: { agentId: string }) => {
    return apiClient.patch<any, { order: Order }>(`/orders/${id}/assign`, payload);
  },

  autoAssignAgent: async (id: string) => {
    return apiClient.post<any, { agentId: string }>(`/orders/${id}/auto-assign`);
  },
};