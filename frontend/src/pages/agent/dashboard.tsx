import { useEffect, useState } from 'react';
import {
  Box, Flex, Heading, Button, SimpleGrid, Text, Spinner,
  Alert, AlertIcon, AlertDescription, useColorModeValue,
} from '@chakra-ui/react';
import { Package, CheckCircle, Power, PowerOff, Activity } from 'lucide-react';
import { useApiToast } from '../../hooks/useApiToast';
import { agentsApi } from '../../api/services/agents';
import { ordersApi } from '../../api/services/orders';
import { MetricCard } from '../../components/common/statcard';
import { Order } from '../../types/models';

export default function AgentDashboard() {
  const { showSuccess, showError } = useApiToast();

  const [isOnShift, setIsOnShift] = useState<boolean | null>(null);
  const [isToggling, setIsToggling] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await agentsApi.getMyProfile();
        // Support both new (onShift) and legacy (clockedIn) field names
        setIsOnShift(res.agent.onShift ?? res.agent.clockedIn ?? false);
      } catch {
        setIsOnShift(false);
      }
    };

    const fetchOrders = async () => {
      try {
        const response = await ordersApi.getOrders();
        setOrders(response.orders || []);
      } catch {
        // Non-critical
      } finally {
        setIsLoadingOrders(false);
      }
    };

    fetchProfile();
    fetchOrders();
  }, []);

  const toggleShift = async () => {
    setIsToggling(true);
    try {
      if (isOnShift) {
        await agentsApi.clockOut();
        setIsOnShift(false);
        showSuccess('You are now off-shift. Rest up!');
      } else {
        await agentsApi.clockIn();
        setIsOnShift(true);
        showSuccess('You are now on shift and ready for assignments.');
      }
    } catch (error) {
      showError(error);
    } finally {
      setIsToggling(false);
    }
  };

  const getStage = (o: Order) => o.deliveryStage ?? o.currentStatus ?? 'CREATED';

  const activeQueue = orders.filter(o =>
    ['CREATED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(getStage(o))
  ).length;

  const completedToday = orders.filter(o => {
    if (getStage(o) !== 'DELIVERED') return false;
    return new Date(o.updatedAt).toDateString() === new Date().toDateString();
  }).length;

  const pageBg      = useColorModeValue('#F4F5F7', '#0B1121');
  const headingClr  = useColorModeValue('#172B4D', '#E2E8F0');
  const subClr      = useColorModeValue('#5E6C84', '#8993A4');
  const warnBg      = useColorModeValue('#FFFBEB', 'rgba(245,158,11,0.08)');
  const warnBorder  = useColorModeValue('#FDE68A', 'rgba(245,158,11,0.3)');
  const warnText    = useColorModeValue('#92400E', '#FCD34D');

  if (isOnShift === null) {
    return (
      <Box minH="100vh" bg={pageBg}>
        <Flex h="50vh" align="center" justify="center" direction="column" gap={3}>
          <Spinner size="lg" color="brand.500" thickness="3px" speed="0.7s" />
          <Text color={subClr} fontSize="sm" fontWeight="500">Loading your profile…</Text>
        </Flex>
      </Box>
    );
  }

  return (
    <Box pb={8}>
      {/* Page Header */}
      <Flex
        justify="space-between"
        align={{ base: 'flex-start', md: 'center' }}
        direction={{ base: 'column', md: 'row' }}
        gap={4}
        mb={6}
      >
        <Box>
          <Heading
            fontSize={{ base: 'xl', md: '2xl' }}
            fontFamily="heading"
            fontWeight="800"
            color={headingClr}
            letterSpacing="-0.02em"
          >
            Driver Overview
          </Heading>
          <Text fontSize="sm" color={subClr} mt={1}>
            Manage your shift and track assigned deliveries.
          </Text>
        </Box>

        {/* Shift toggle button */}
        <Button
          w={{ base: 'full', md: 'auto' }}
          h="42px"
          px={6}
          fontSize="sm"
          fontWeight="600"
          colorScheme={isOnShift ? 'red' : 'green'}
          leftIcon={isOnShift ? <PowerOff size={18} strokeWidth={2.5} /> : <Power size={18} strokeWidth={2.5} />}
          onClick={toggleShift}
          isLoading={isToggling}
          loadingText="Updating…"
          borderRadius="md"
          transition="all 0.15s"
        >
          {isOnShift ? 'End Shift' : 'Start Shift'}
        </Button>
      </Flex>

      {/* Offline alert */}
      {!isOnShift && (
        <Alert
          status="warning"
          borderRadius="md"
          mb={5}
          border="1px solid"
          borderColor={warnBorder}
          bg={warnBg}
        >
          <AlertIcon />
          <AlertDescription fontSize="sm" fontWeight="500" color={warnText}>
            You are currently <strong>off-shift</strong>. Start your shift to receive delivery assignments.
          </AlertDescription>
        </Alert>
      )}

      {/* Metric Cards — renamed labels */}
      <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={4}>
        <MetricCard
          label="Queue Size"
          value={isLoadingOrders ? '—' : activeQueue}
          icon={Package}
          accentColor="#0065FF"
        />
        <MetricCard
          label="Delivered Today"
          value={isLoadingOrders ? '—' : completedToday}
          icon={CheckCircle}
          accentColor="#00875A"
        />
        <MetricCard
          label="Shift Status"
          value={isOnShift ? 'On Shift' : 'Off Shift'}
          icon={Activity}
          accentColor={isOnShift ? '#00875A' : '#DE350B'}
        />
      </SimpleGrid>
    </Box>
  );
}