// NOTE: clockIn, clockOut, updateLocation resolve the agent from the JWT token
// server-side — no agentId needs to be sent in the request body or URL.
import apiClient from '../client';
import { Agent } from '../../types/models';

export const agentsApi = {
  // Admin Journey
  getAgents: async (params?: Record<string, any>) => {
    return apiClient.get<any, { agents: Agent[] }>('/agents', { params });
  },

  getMyProfile: async () => {
    return apiClient.get<any, { agent: Agent }>('/agents/me');
  },

  // Agent Journey (Availability & Tracking)
  // The server resolves the agent from the JWT token — no agentId param needed.
  clockIn: async () => {
    return apiClient.patch<any, { agent: Agent }>('/agents/clock-in');
  },

  clockOut: async () => {
    return apiClient.patch<any, { agent: Agent }>('/agents/clock-out');
  },

  updateLocation: async (payload: { lat: number; lng: number }) => {
    return apiClient.patch<any, { agent: Agent }>('/agents/location', payload);
  },

  getMyOrders: async () => {
    return apiClient.get<any, { orders: any[] }>('/agents/my-orders');
  },
};