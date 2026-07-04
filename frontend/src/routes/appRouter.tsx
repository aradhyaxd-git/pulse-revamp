import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './protectedRoute';
import LandingPage from '../pages/landing/index';
import Login from '../pages/auth/login';
import Register from '../pages/auth/register';
import DashboardLayout from '../components/layout/dashboardLayout';

// Admin Pages
import AdminDashboard from '../pages/admin/dashboard';
import AdminOrders from '../pages/admin/orders/index';
import AdminCreateOrder from '../pages/admin/orders/create/index';
import AdminCustomers from '../pages/admin/customers/index';
import AdminAgents from '../pages/admin/agents/index';
import AdminZones from '../pages/admin/zones/index';
import AdminSettings from '../pages/admin/settings/index';

// Customer Pages
import CustomerDashboard from '../pages/customer/dashboard';
import CreateOrder from '../pages/customer/createOrder/index';
import OrderHistory from '../pages/customer/orderHistory';
import TrackingDetails from '../pages/customer/trackingDetails';

// Agent Pages
import AgentDashboard from '../pages/agent/dashboard';
import ActiveRun from '../pages/agent/activeRun';
import AssignedOrders from '../pages/agent/assignedOrders';
import OrderTracking from '../pages/agent/orderTracking';

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/orders/create" element={<AdminCreateOrder />} />
            <Route path="/admin/customers" element={<AdminCustomers />} />
            <Route path="/admin/agents" element={<AdminAgents />} />
            <Route path="/admin/zones" element={<AdminZones />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Route>
        </Route>

        {/* Customer Routes */}
        <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/customer/dashboard" element={<CustomerDashboard />} />
            <Route path="/customer/orders/create" element={<CreateOrder />} />
            <Route path="/customer/orders/history" element={<OrderHistory />} />
            <Route path="/customer/orders/:id" element={<TrackingDetails />} />
          </Route>
        </Route>

        {/* Agent Routes */}
        <Route element={<ProtectedRoute allowedRoles={['agent']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/agent/dashboard" element={<AgentDashboard />} />
            <Route path="/agent/active" element={<ActiveRun />} />
            <Route path="/agent/assigned" element={<AssignedOrders />} />
            <Route path="/agent/orders/:id" element={<OrderTracking />} />
          </Route>
        </Route>

        {/* Fallback → landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};