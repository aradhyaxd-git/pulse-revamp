import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Card, CardBody, Heading, VStack, Text, Button, Flex,
  Divider, Spinner, Center, useColorModeValue,
} from '@chakra-ui/react';
import {
  CheckCircle, AlertTriangle, Truck, Package, Navigation,
  ArrowLeft, MapPin,
} from 'lucide-react';
import { ordersApi } from '../../api/services/orders';
import { useApiToast } from '../../hooks/useApiToast';
import { Order, OrderStatus } from '../../types/models';
import { StatusBadge } from '../../components/common/statusBadge';

export default function OrderTracking() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSuccess, showError } = useApiToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchDetails = async () => {
    if (!id) return;
    try {
      const response = await ordersApi.getOrderDetails(id);
      setOrder(response.order);
    } catch (error) {
      showError(error);
      navigate('/agent/active');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleUpdateStatus = async (toStatus: OrderStatus) => {
    if (!id) return;
    setIsUpdating(true);
    try {
      await ordersApi.updateStatus(id, { toStatus });
      showSuccess(`Status updated to ${toStatus.replace(/_/g, ' ')}`);
      await fetchDetails();
      if (toStatus === 'DELIVERED' || toStatus === 'FAILED') {
        setTimeout(() => navigate('/agent/active'), 1500);
      }
    } catch (error) {
      showError(error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Color tokens
  const pageBg    = useColorModeValue('#F8FAFC', '#0F172A');
  const cardBg    = useColorModeValue('white', '#1E293B');
  const border    = useColorModeValue('#E2E8F0', '#334155');
  const headClr   = useColorModeValue('#0F172A', '#F1F5F9');
  const subClr    = useColorModeValue('#64748B', '#94A3B8');
  const labelClr  = useColorModeValue('#94A3B8', '#64748B');
  const divClr    = useColorModeValue('#F1F5F9', '#334155');
  const pickupBg  = useColorModeValue('rgba(99,102,241,0.06)', 'rgba(99,102,241,0.12)');
  const dropBg    = useColorModeValue('rgba(16,185,129,0.06)', 'rgba(16,185,129,0.1)');

  if (isLoading) {
    return (
      <Box minH="100vh" bg={pageBg}>
        <Center h="50vh" flexDirection="column" gap={4}>
          <Spinner size="xl" color="brand.500" thickness="4px" speed="0.65s" />
          <Text fontSize="sm" color={subClr} fontWeight="500">Loading order details…</Text>
        </Center>
      </Box>
    );
  }

  if (!order) return null;

  const displayId = order.trackingId || order.id.slice(0, 8).toUpperCase();
  const isCOD = order.paymentType === 'COD';
  const isTerminal = ['DELIVERED', 'FAILED', 'RESCHEDULED'].includes(order.deliveryStage ?? order.currentStatus ?? '');

  return (
    <Box minH="100vh" bg={pageBg} px={{ base: 4, md: 6 }} py={{ base: 5, md: 8 }}>
      <Box maxW="xl" mx="auto">

        {/* Back */}
        <Button
          variant="ghost"
          leftIcon={<ArrowLeft size={15} />}
          size="sm"
          color={subClr}
          px={0}
          mb={5}
          fontWeight="600"
          _hover={{ color: headClr, bg: 'transparent' }}
          onClick={() => navigate(-1)}
        >
          Back
        </Button>

        {/* Header */}
        <Flex justify="space-between" align="flex-start" mb={5}>
          <Box>
            <Text
              fontSize="xs"
              fontWeight="700"
              color={labelClr}
              textTransform="uppercase"
              letterSpacing="0.08em"
              mb={1}
            >
              Order
            </Text>
            <Heading
              fontFamily="mono"
              fontWeight="800"
              fontSize="2xl"
              color="brand.500"
              letterSpacing="0.04em"
            >
              {displayId}
            </Heading>
          </Box>
          <StatusBadge status={(order.deliveryStage ?? order.currentStatus)!} size="lg" />
        </Flex>

        {/* Summary card */}
        <Card
          bg={cardBg}
          border="1px solid"
          borderColor={border}
          borderRadius="2xl"
          mb={5}
          overflow="hidden"
          boxShadow={useColorModeValue('0 1px 4px rgba(15,23,42,0.06)', '0 2px 8px rgba(0,0,0,0.25)')}
        >
          <CardBody p={{ base: 4, md: 5 }}>

            {/* COD Amount — prominent */}
            {isCOD && (
              <Box
                mb={5}
                p={4}
                borderRadius="xl"
                bg={useColorModeValue('#FFFBEB', 'rgba(245,158,11,0.1)')}
                border="1px solid"
                borderColor={useColorModeValue('#FDE68A', 'rgba(245,158,11,0.25)')}
              >
                <Text
                  fontSize="xs"
                  fontWeight="700"
                  color="#D97706"
                  textTransform="uppercase"
                  letterSpacing="0.08em"
                  mb={1}
                >
                  💰 Collect on Delivery
                </Text>
                <Text
                  fontSize="3xl"
                  fontWeight="800"
                  fontFamily="heading"
                  color="#F59E0B"
                  lineHeight="1"
                >
                  ₹{Number(order.charge).toFixed(2)}
                </Text>
              </Box>
            )}

            {/* Addresses */}
            <VStack spacing={0} align="stretch">
              <Flex gap={3} align="flex-start" py={3}>
                <Box p={2} bg={pickupBg} borderRadius="lg" flexShrink={0}>
                  <MapPin size={16} color="#6366F1" strokeWidth={2.5} />
                </Box>
                <Box>
                  <Text fontSize="10px" fontWeight="700" color={labelClr} textTransform="uppercase" letterSpacing="wider">Pickup From</Text>
                  <Text fontSize="sm" fontWeight="600" color={headClr} mt={0.5}>{order.pickupAddress}</Text>
                   <Text fontSize="xs" color={subClr}>{order.originPincode ?? order.pickupPincode}</Text>
                </Box>
              </Flex>

              <Divider borderColor={divClr} />

              <Flex gap={3} align="flex-start" py={3}>
                <Box p={2} bg={dropBg} borderRadius="lg" flexShrink={0}>
                  <Navigation size={16} color="#10B981" strokeWidth={2.5} />
                </Box>
                <Box>
                  <Text fontSize="10px" fontWeight="700" color={labelClr} textTransform="uppercase" letterSpacing="wider">Deliver To</Text>
                  <Text fontSize="sm" fontWeight="600" color={headClr} mt={0.5}>{order.dropAddress}</Text>
                   <Text fontSize="xs" color={subClr}>{order.destinationPincode ?? order.dropPincode}</Text>
                </Box>
              </Flex>
            </VStack>

            <Divider borderColor={divClr} my={1} />

            {/* Package info row */}
            <Flex justify="space-between" pt={3} wrap="wrap" gap={4}>
              <Box>
                <Text fontSize="xs" color={labelClr} fontWeight="600" mb={0.5}>Weight</Text>
                <Text fontSize="sm" fontWeight="700" color={headClr}>{Number(order.actualWeightKg).toFixed(2)} kg</Text>
              </Box>
              <Box>
                <Text fontSize="xs" color={labelClr} fontWeight="600" mb={0.5}>Type</Text>
                <Text fontSize="sm" fontWeight="700" color={headClr}>{order.orderType}</Text>
              </Box>
              {!isCOD && (
                <Box textAlign="right">
                  <Text fontSize="xs" color={labelClr} fontWeight="600" mb={0.5}>Payment</Text>
                  <Text fontSize="sm" fontWeight="700" color="#10B981">Prepaid ✓</Text>
                </Box>
              )}
            </Flex>
          </CardBody>
        </Card>

        {/* Status update buttons */}
        {!isTerminal && (
          <Box>
            <Text
              fontSize="xs"
              fontWeight="700"
              color={labelClr}
              textTransform="uppercase"
              letterSpacing="0.08em"
              mb={4}
            >
              Update Status
            </Text>
            <VStack spacing={3}>

              {/* CREATED → PICKED_UP */}
              {order.currentStatus === 'CREATED' && (
                <Button
                  w="full"
                  h="56px"
                  fontSize="md"
                  fontWeight="700"
                  bg="#7C3AED"
                  color="white"
                  _hover={{ bg: '#6D28D9', transform: 'translateY(-1px)', boxShadow: '0 6px 20px rgba(124,58,237,0.4)' }}
                  _active={{ bg: '#5B21B6', transform: 'none' }}
                  leftIcon={<Package size={20} strokeWidth={2} />}
                  isLoading={isUpdating}
                  onClick={() => handleUpdateStatus('PICKED_UP')}
                  borderRadius="14px"
                  transition="all 0.2s"
                >
                  Mark as Picked Up
                </Button>
              )}

              {/* PICKED_UP → IN_TRANSIT */}
              {order.currentStatus === 'PICKED_UP' && (
                <Button
                  w="full"
                  h="56px"
                  fontSize="md"
                  fontWeight="700"
                  bg="#2563EB"
                  color="white"
                  _hover={{ bg: '#1D4ED8', transform: 'translateY(-1px)', boxShadow: '0 6px 20px rgba(37,99,235,0.4)' }}
                  _active={{ bg: '#1E40AF', transform: 'none' }}
                  leftIcon={<Truck size={20} strokeWidth={2} />}
                  isLoading={isUpdating}
                  onClick={() => handleUpdateStatus('IN_TRANSIT')}
                  borderRadius="14px"
                  transition="all 0.2s"
                >
                  Mark as In Transit
                </Button>
              )}

              {/* IN_TRANSIT → OUT_FOR_DELIVERY */}
              {order.currentStatus === 'IN_TRANSIT' && (
                <Button
                  w="full"
                  h="56px"
                  fontSize="md"
                  fontWeight="700"
                  bg="#D97706"
                  color="white"
                  _hover={{ bg: '#B45309', transform: 'translateY(-1px)', boxShadow: '0 6px 20px rgba(217,119,6,0.4)' }}
                  _active={{ bg: '#92400E', transform: 'none' }}
                  leftIcon={<Navigation size={20} strokeWidth={2} />}
                  isLoading={isUpdating}
                  onClick={() => handleUpdateStatus('OUT_FOR_DELIVERY')}
                  borderRadius="14px"
                  transition="all 0.2s"
                >
                  Mark as Out for Delivery
                </Button>
              )}

              {/* OUT_FOR_DELIVERY → DELIVERED | FAILED */}
              {order.currentStatus === 'OUT_FOR_DELIVERY' && (
                <>
                  <Button
                    w="full"
                    h="56px"
                    fontSize="md"
                    fontWeight="700"
                    bg="#059669"
                    color="white"
                    _hover={{ bg: '#047857', transform: 'translateY(-1px)', boxShadow: '0 6px 20px rgba(5,150,105,0.4)' }}
                    _active={{ bg: '#065F46', transform: 'none' }}
                    leftIcon={<CheckCircle size={20} strokeWidth={2} />}
                    isLoading={isUpdating}
                    onClick={() => handleUpdateStatus('DELIVERED')}
                    borderRadius="14px"
                    transition="all 0.2s"
                  >
                    Mark as Delivered
                  </Button>

                  <Button
                    w="full"
                    h="52px"
                    fontSize="sm"
                    fontWeight="700"
                    variant="outline"
                    borderColor="#EF4444"
                    color="#EF4444"
                    _hover={{ bg: 'rgba(239,68,68,0.06)', borderColor: '#DC2626' }}
                    leftIcon={<AlertTriangle size={18} strokeWidth={2} />}
                    isLoading={isUpdating}
                    onClick={() => handleUpdateStatus('FAILED')}
                    borderRadius="14px"
                    transition="all 0.2s"
                  >
                    Mark as Failed Attempt
                  </Button>
                </>
              )}
            </VStack>
          </Box>
        )}

        {/* Terminal state message */}
        {isTerminal && (
          <Card
            bg={cardBg}
            border="1px solid"
            borderColor={border}
            borderRadius="2xl"
            textAlign="center"
            p={8}
          >
            <VStack spacing={3}>
              {order.currentStatus === 'DELIVERED' ? (
                <>
                  <CheckCircle size={48} color="#10B981" strokeWidth={1.5} />
                  <Text fontSize="lg" fontWeight="700" color="#10B981" fontFamily="heading">
                    Delivery Complete!
                  </Text>
                  <Text fontSize="sm" color={subClr}>
                    Package successfully delivered. Great work!
                  </Text>
                </>
              ) : order.currentStatus === 'FAILED' ? (
                <>
                  <AlertTriangle size={48} color="#EF4444" strokeWidth={1.5} />
                  <Text fontSize="lg" fontWeight="700" color="#EF4444" fontFamily="heading">
                    Delivery Failed
                  </Text>
                  <Text fontSize="sm" color={subClr}>
                    Awaiting customer reschedule request.
                  </Text>
                </>
              ) : (
                <>
                  <Package size={48} color="#94A3B8" strokeWidth={1.5} />
                  <Text fontSize="lg" fontWeight="700" color={headClr} fontFamily="heading">
                    Order Rescheduled
                  </Text>
                  <Text fontSize="sm" color={subClr}>
                    Awaiting new assignment from dispatch.
                  </Text>
                </>
              )}
              <Button
                mt={2}
                variant="outline"
                size="sm"
                borderRadius="xl"
                onClick={() => navigate('/agent/active')}
                fontWeight="600"
              >
                Back to Active Run
              </Button>
            </VStack>
          </Card>
        )}

      </Box>
    </Box>
  );
}