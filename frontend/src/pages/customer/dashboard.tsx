import { useEffect, useState } from 'react';
import {
  Box, SimpleGrid, Heading, Text, Button, Flex, Card,
  useColorModeValue, Skeleton,
} from '@chakra-ui/react';
import { Package, Truck, CheckCircle, Plus, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ordersApi } from '../../api/services/orders';
import { Order } from '../../types/models';
import { useApiToast } from '../../hooks/useApiToast';
import { MetricCard } from '../../components/common/statcard';
import { StageBadge } from '../../components/common/statusBadge';
import { useAuth } from '../../hooks/useAuth';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function CustomerDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showError } = useApiToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await ordersApi.getOrders({ limit: 5 });
        setOrders(response.orders || []);
      } catch (error: any) {
        showError(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, [showError]);

  const getStage = (o: Order) => o.deliveryStage ?? o.currentStatus ?? 'CREATED';

  const terminalStages = ['DELIVERED', 'FAILED', 'RESCHEDULED'];
  const activeCount    = orders.filter(o => !terminalStages.includes(getStage(o))).length;
  const deliveredCount = orders.filter(o => getStage(o) === 'DELIVERED').length;

  const cardBg      = useColorModeValue('white', '#111E35');
  const border      = useColorModeValue('#DFE1E6', 'rgba(255,255,255,0.07)');
  const headingClr  = useColorModeValue('#172B4D', '#E2E8F0');
  const subClr      = useColorModeValue('#5E6C84', '#8993A4');
  const headBg      = useColorModeValue('#F4F5F7', '#0A1628');
  const rowHoverBg  = useColorModeValue('rgba(0,101,255,0.04)', 'rgba(255,255,255,0.03)');
  const monoClr     = useColorModeValue('#0052CC', '#4C9AFF');

  const SkeletonRow = () => (
    <Box display="grid" gridTemplateColumns="2fr 1.2fr 1fr 1fr" px={5} py={3.5} borderBottom="1px" borderColor={border} gap={4}>
      {[1, 2, 3, 4].map(i => <Skeleton key={i} height="14px" borderRadius="sm" />)}
    </Box>
  );

  return (
    <Box pb={8}>
      <Flex justify="space-between" align="flex-start" mb={6} flexWrap="wrap" gap={4}>
        <Box>
          <Text fontSize="xs" fontWeight="600" color="brand.500" letterSpacing="0.05em" textTransform="uppercase" mb={1}>
            {getGreeting()}, {user?.name?.split(' ')[0]}
          </Text>
          <Heading
            fontFamily="heading"
            fontWeight="800"
            fontSize={{ base: '2xl', md: '2xl' }}
            color={headingClr}
            lineHeight="1.15"
            letterSpacing="-0.02em"
          >
            Your Shipments
          </Heading>
          <Text color={subClr} fontSize="sm" mt={1}>
            Track and manage all your deliveries.
          </Text>
        </Box>

        <Button
          leftIcon={<Plus size={16} />}
          onClick={() => navigate('/customer/orders/create')}
          bg="brand.500"
          color="white"
          _hover={{ bg: 'brand.600', transform: 'translateY(-1px)', boxShadow: 'md' }}
          _active={{ bg: 'brand.700' }}
          size="sm"
          fontWeight="600"
          px={5}
          transition="all 0.15s"
        >
          New Shipment
        </Button>
      </Flex>

      {/* Metric Cards — renamed labels */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={6}>
        <MetricCard
          label="Total Bookings"
          value={orders.length}
          icon={Package}
          accentColor="#0065FF"
        />
        <MetricCard
          label="Active Shipments"
          value={activeCount}
          icon={Truck}
          accentColor="#F59E0B"
        />
        <MetricCard
          label="Delivered"
          value={deliveredCount}
          icon={CheckCircle}
          accentColor="#00875A"
        />
      </SimpleGrid>

      {/* Shipment List */}
      <Card
        bg={cardBg}
        borderRadius="lg"
        border="1px"
        borderColor={border}
        overflow="hidden"
        boxShadow="sm"
      >
        <Flex px={5} py={3.5} borderBottom="1px" borderColor={border} justify="space-between" align="center">
          <Box>
            <Heading size="sm" fontFamily="heading" fontWeight="700" color={headingClr}>
              Recent Shipments
            </Heading>
            <Text fontSize="xs" color={subClr} mt={0.5}>
              Your last {orders.length} bookings
            </Text>
          </Box>
          <Button
            variant="ghost"
            size="sm"
            rightIcon={<ArrowRight size={13} />}
            color="brand.500"
            fontWeight="600"
            onClick={() => navigate('/customer/orders/history')}
            _hover={{ bg: 'brand.50', _dark: { bg: 'rgba(0,101,255,0.1)' } }}
          >
            View all
          </Button>
        </Flex>

        {/* Table header */}
        <Box
          display="grid"
          gridTemplateColumns="2fr 1.2fr 1fr 1fr"
          px={5}
          py={2.5}
          bg={headBg}
          borderBottom="1px"
          borderColor={border}
        >
          {['Shipment Code', 'Booked On', 'Charge', 'Stage'].map(col => (
            <Text
              key={col}
              fontSize="10px"
              fontWeight="700"
              color={subClr}
              textTransform="uppercase"
              letterSpacing="0.07em"
            >
              {col}
            </Text>
          ))}
        </Box>

        {isLoading ? (
          <>{[1, 2, 3, 4, 5].map(i => <SkeletonRow key={i} />)}</>
        ) : orders.length === 0 ? (
          <Box py={14} textAlign="center">
            <Package size={36} color="#DFE1E6" style={{ margin: '0 auto 10px' }} />
            <Text color={subClr} fontWeight="600" fontSize="sm">No shipments yet</Text>
            <Text color={subClr} fontSize="xs" mt={1}>
              Create your first shipment to get started.
            </Text>
            <Button
              mt={4}
              size="sm"
              bg="brand.500"
              color="white"
              _hover={{ bg: 'brand.600' }}
              leftIcon={<Plus size={13} />}
              onClick={() => navigate('/customer/orders/create')}
            >
              Create Shipment
            </Button>
          </Box>
        ) : (
          orders.map((order, idx) => (
            <Box
              key={order.id}
              display="grid"
              gridTemplateColumns="2fr 1.2fr 1fr 1fr"
              px={5}
              py={3.5}
              borderBottom={idx < orders.length - 1 ? '1px' : 'none'}
              borderColor={border}
              _hover={{ bg: rowHoverBg, cursor: 'pointer' }}
              onClick={() => navigate(`/customer/orders/${order.id}`)}
              transition="background 0.1s"
              alignItems="center"
            >
              <Text fontWeight="700" fontFamily="mono" fontSize="xs" color={monoClr} letterSpacing="0.04em">
                {order.shipmentCode ?? order.trackingId ?? order.id.slice(0, 8).toUpperCase()}
              </Text>
              <Text fontSize="sm" color={subClr}>
                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  day: '2-digit', month: 'short', year: 'numeric',
                })}
              </Text>
              <Text fontSize="sm" fontWeight="600" color={headingClr}>
                &#8377;{Number(order.charge).toFixed(2)}
              </Text>
              <Box>
                <StageBadge status={getStage(order)} size="sm" />
              </Box>
            </Box>
          ))
        )}
      </Card>
    </Box>
  );
}