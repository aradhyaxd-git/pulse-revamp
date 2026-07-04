import { useEffect, useState } from 'react';
import {
  Box, SimpleGrid, Heading, Flex, Text, Card, CardHeader, CardBody,
  useColorModeValue, Divider, Badge,
} from '@chakra-ui/react';
import { Package, Truck, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import { ordersApi } from '../../api/services/orders';
import { agentsApi } from '../../api/services/agents';
import { useApiToast } from '../../hooks/useApiToast';
import { MetricCard } from '../../components/common/statcard';
import { DataTable, Column } from '../../components/common/datatable';
import { StageBadge } from '../../components/common/statusBadge';
import { Order } from '../../types/models';

export default function AdminDashboard() {
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({
    totalShipments: 0,
    inTransit: 0,
    revenue: 0,
    onShiftAgents: 0,
    completed: 0,
    undelivered: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const { showError } = useApiToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [ordersRes, agentsRes] = await Promise.all([
          ordersApi.getOrders({ limit: 100 }),
          agentsApi.getAgents(),
        ]);

        const orders = ordersRes.orders || [];
        const agents = agentsRes.agents || [];

        setRecentOrders(orders.slice(0, 5));

        const getStage = (o: Order) => o.deliveryStage ?? o.currentStatus;

        setStats({
          totalShipments: orders.length,
          inTransit: orders.filter(o =>
            ['PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(getStage(o) ?? '')
          ).length,
          completed: orders.filter(o => getStage(o) === 'DELIVERED').length,
          undelivered: orders.filter(o => getStage(o) === 'FAILED').length,
          revenue: orders.reduce((sum, o) => sum + Number(o.charge), 0),
          onShiftAgents: agents.filter(a => a.onShift ?? a.clockedIn).length,
        });
      } catch (error) {
        showError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [showError]);

  const cardBg    = useColorModeValue('white', '#111E35');
  const border    = useColorModeValue('#DFE1E6', 'rgba(255,255,255,0.07)');
  const headingClr= useColorModeValue('#172B4D', '#E2E8F0');
  const subClr    = useColorModeValue('#5E6C84', '#8993A4');
  const monoClr   = useColorModeValue('#0052CC', '#4C9AFF');

  const getStage = (o: Order) => o.deliveryStage ?? o.currentStatus ?? 'CREATED';

  const orderColumns: Column<Order>[] = [
    {
      key: 'shipmentCode',
      header: 'Shipment Code',
      render: (o) => (
        <Text
          fontFamily="mono"
          fontWeight="700"
          fontSize="xs"
          color={monoClr}
          letterSpacing="0.04em"
        >
          {o.shipmentCode ?? o.trackingId ?? o.id.slice(0, 8).toUpperCase()}
        </Text>
      ),
    },
    {
      key: 'deliveryStage',
      header: 'Stage',
      render: (o) => <StageBadge status={getStage(o)} size="sm" />,
    },
    {
      key: 'charge',
      header: 'Charge',
      render: (o) => (
        <Text fontWeight="600" fontSize="sm" color={headingClr}>
          &#8377;{Number(o.charge).toFixed(2)}
        </Text>
      ),
    },
    {
      key: 'orderType',
      header: 'Type',
      render: (o) => (
        <Badge
          fontSize="10px"
          colorScheme={o.orderType === 'B2B' ? 'blue' : 'purple'}
          variant="subtle"
          borderRadius="sm"
        >
          {o.orderType}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      header: 'Booked',
      render: (o) => (
        <Text fontSize="xs" color={subClr}>
          {new Date(o.createdAt).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
          })}
        </Text>
      ),
    },
  ];

  return (
    <Box pb={8}>
      {/* Page Header */}
      <Flex align="flex-start" justify="space-between" mb={6}>
        <Box>
          <Heading
            fontFamily="heading"
            fontWeight="800"
            fontSize={{ base: '2xl', md: '2xl' }}
            color={headingClr}
            letterSpacing="-0.02em"
            lineHeight="1.15"
          >
            Command Center
          </Heading>
          <Text mt={1} fontSize="sm" color={subClr}>
            Platform overview and key performance indicators
          </Text>
        </Box>
      </Flex>

      {/* Metric Cards */}
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 3, xl: 6 }} spacing={4} mb={6}>
        <MetricCard
          label="Total Shipments"
          value={stats.totalShipments}
          icon={Package}
          trend="up"
          helpText="+12% this week"
          accentColor="#0065FF"
        />
        <MetricCard
          label="In Transit"
          value={stats.inTransit}
          icon={Truck}
          accentColor="#F59E0B"
        />
        <MetricCard
          label="Completed"
          value={stats.completed}
          icon={CheckCircle}
          accentColor="#00875A"
        />
        <MetricCard
          label="Undelivered"
          value={stats.undelivered}
          icon={XCircle}
          accentColor="#DE350B"
        />
        <MetricCard
          label="Revenue"
          value={`₹${stats.revenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
          icon={TrendingUp}
          accentColor="#7B61FF"
        />
        <MetricCard
          label="Agents on Shift"
          value={stats.onShiftAgents}
          icon={Truck}
          accentColor="#00B8D9"
        />
      </SimpleGrid>

      {/* Recent Shipments Table */}
      <Card
        bg={cardBg}
        border="1px solid"
        borderColor={border}
        borderRadius="lg"
        boxShadow="sm"
        overflow="hidden"
      >
        <CardHeader pb={3} pt={4} px={5}>
          <Flex align="center" justify="space-between">
            <Box>
              <Heading
                fontFamily="heading"
                fontWeight="700"
                fontSize="md"
                color={headingClr}
                letterSpacing="-0.01em"
              >
                Recent Shipments
              </Heading>
              <Text fontSize="xs" color={subClr} mt={0.5}>
                Last 5 bookings on the platform
              </Text>
            </Box>
          </Flex>
        </CardHeader>
        <Divider borderColor={border} />
        <CardBody p={0}>
          <DataTable
            columns={orderColumns}
            data={recentOrders}
            isLoading={isLoading}
            emptyLabel="No shipments booked yet"
          />
        </CardBody>
      </Card>
    </Box>
  );
}