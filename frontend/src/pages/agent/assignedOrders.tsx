import { useEffect, useState } from 'react';
import {
  Box, Heading, VStack, Card, CardBody, Flex, Text, Button,
  Divider, Spinner, Center, Badge, IconButton, useColorModeValue,
} from '@chakra-ui/react';
import { MapPin, Navigation, ArrowRight, PackageOpen, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ordersApi } from '../../api/services/orders';
import { useApiToast } from '../../hooks/useApiToast';
import { Order } from '../../types/models';
import { StatusBadge } from '../../components/common/statusBadge';

export default function AssignedOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showError } = useApiToast();
  const navigate = useNavigate();

  const fetchAssignedOrders = async () => {
    setIsLoading(true);
    try {
      // Fetch ALL orders assigned to this agent (backend filters by JWT).
      // No status filter — agent should see pending pickup + in-progress orders.
      // Terminal orders (DELIVERED, FAILED, RESCHEDULED) are excluded client-side.
      const response = await ordersApi.getOrders();
      const activeOrders = (response.orders || []).filter(o =>
        !['DELIVERED', 'FAILED', 'RESCHEDULED'].includes(o.deliveryStage ?? o.currentStatus ?? '')
      );
      setOrders(activeOrders);
    } catch (error) {
      showError(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedOrders();
  }, []);

  // ── Color tokens ──────────────────────────────────────────────────────
  const pageBg = useColorModeValue('#F8FAFC', '#0F172A');
  const headingColor = useColorModeValue('gray.800', 'gray.100');
  const cardBg = useColorModeValue('white', '#1E293B');
  const cardBorder = useColorModeValue('gray.100', 'gray.700');
  const pendingBorder = useColorModeValue('brand.200', 'brand.700');
  const labelColor = useColorModeValue('gray.500', 'gray.400');
  const emptyBg = useColorModeValue('gray.50', 'gray.800');
  const dividerColor = useColorModeValue('gray.100', 'gray.700');
  const countBadgeBg = useColorModeValue('brand.50', 'rgba(99,102,241,0.15)');
  const countBadgeColor = useColorModeValue('brand.600', 'brand.300');
  const trackingColor = useColorModeValue('gray.800', 'gray.100');

  if (isLoading) {
    return (
      <Box minH="100vh" bg={pageBg}>
        <Center h="50vh">
          <Spinner size="xl" color="brand.500" thickness="4px" speed="0.65s" />
        </Center>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg={pageBg} px={{ base: 4, md: 6 }} py={{ base: 5, md: 8 }}>
      <Box maxW="2xl" mx="auto" pb={8}>
        {/* ── Page Header ───────────────────────────────────────────── */}
        <Flex justify="space-between" align="center" mb={6}>
          <Box>
            <Text
              fontSize="xs"
              fontWeight="semibold"
              letterSpacing="widest"
              textTransform="uppercase"
              color="brand.500"
              fontFamily="body"
              mb={1}
            >
              Deliveries
            </Text>
            <Heading
              size="lg"
              fontFamily="heading"
              color={headingColor}
              fontWeight="800"
              letterSpacing="-0.5px"
            >
              Assigned to You
            </Heading>
          </Box>

          <Flex align="center" gap={3}>
            <Box
              px={3}
              py={1}
              borderRadius="full"
              bg={countBadgeBg}
              border="1px solid"
              borderColor={useColorModeValue('brand.100', 'brand.800')}
            >
              <Text fontSize="sm" fontWeight="700" color={countBadgeColor} fontFamily="body">
                {orders.length} Active
              </Text>
            </Box>
            <IconButton
              aria-label="Refresh orders"
              icon={<RefreshCw size={16} />}
              variant="ghost"
              size="md"
              colorScheme="brand"
              borderRadius="10px"
              onClick={fetchAssignedOrders}
            />
          </Flex>
        </Flex>

        {/* ── Empty State ───────────────────────────────────────────── */}
        {orders.length === 0 ? (
          <Card
            bg={cardBg}
            border="1px solid"
            borderColor={cardBorder}
            borderRadius="16px"
            shadow="sm"
          >
            <CardBody py={16} textAlign="center">
              <Flex direction="column" align="center" gap={4} color={labelColor}>
                <PackageOpen size={52} strokeWidth={1.2} />
                <Box>
                  <Text fontSize="lg" fontWeight="600" fontFamily="heading" color={headingColor} mb={1}>
                    No Active Tasks
                  </Text>
                  <Text fontSize="sm" fontFamily="body" color={labelColor}>
                    Check back after the admin assigns new orders.
                  </Text>
                </Box>
              </Flex>
            </CardBody>
          </Card>
        ) : (
          <VStack spacing={4} align="stretch">
            {orders.map((order) => {
              const isPickupPending = order.currentStatus === 'CREATED';
              return (
                <Card
                  key={order.id}
                  bg={cardBg}
                  border="1.5px solid"
                  borderColor={isPickupPending ? pendingBorder : cardBorder}
                  borderRadius="16px"
                  shadow="sm"
                  _hover={{ shadow: 'md', transform: 'translateY(-1px)' }}
                  transition="all 0.2s"
                  overflow="hidden"
                >
                  {/* Accent bar at top for pickup-pending */}
                  {isPickupPending && (
                    <Box h="3px" bg="linear-gradient(90deg, #6366F1, #818CF8)" />
                  )}
                  <CardBody p={{ base: 4, md: 5 }}>
                    {/* ── Card Header ───────────────────────────────── */}
                    <Flex justify="space-between" align="flex-start" mb={4}>
                      <Box>
                        <Text
                          fontWeight="800"
                          fontSize="md"
                          fontFamily="mono"
                          color={trackingColor}
                          letterSpacing="0.5px"
                        >
                          {order.trackingId || order.id.slice(0, 8).toUpperCase()}
                        </Text>
                        {order.paymentType === 'COD' && (
                          <Flex align="center" gap={2} mt={2}>
                            <Box
                              px={3}
                              py={1}
                              borderRadius="full"
                              bg="amber.50"
                              border="1px solid"
                              borderColor="#F59E0B40"
                              _dark={{ bg: 'rgba(245,158,11,0.12)', borderColor: 'rgba(245,158,11,0.3)' }}
                            >
                              <Text
                                fontSize="sm"
                                fontWeight="700"
                                color="#F59E0B"
                                fontFamily="body"
                              >
                                💰 COD — Collect ₹{Number(order.charge).toFixed(2)}
                              </Text>
                            </Box>
                          </Flex>
                        )}
                      </Box>
                      <StatusBadge status={(order.deliveryStage ?? order.currentStatus)!} />
                    </Flex>

                    {/* ── Address Rows ──────────────────────────────── */}
                    <VStack align="stretch" spacing={0}>
                      {/* Pickup */}
                      <Flex gap={3} align="flex-start" py={3}>
                        <Box
                          color="brand.500"
                          mt="2px"
                          flexShrink={0}
                          p={2}
                          bg={useColorModeValue('brand.50', 'rgba(99,102,241,0.12)')}
                          borderRadius="8px"
                        >
                          <MapPin size={16} strokeWidth={2.5} />
                        </Box>
                        <Box>
                          <Text
                            fontSize="10px"
                            fontWeight="700"
                            color={labelColor}
                            textTransform="uppercase"
                            letterSpacing="wider"
                            fontFamily="body"
                          >
                            Pickup From
                          </Text>
                          <Text fontSize="sm" fontWeight="600" fontFamily="body" mt={0.5}>
                            {order.pickupAddress}
                          </Text>
                          <Text fontSize="xs" color={labelColor} fontFamily="body">
                            {order.originPincode ?? order.pickupPincode}{order.pickupZone ? ` · ${order.pickupZone.name}` : ''}
                          </Text>
                        </Box>
                      </Flex>

                      <Divider borderColor={dividerColor} />

                      {/* Drop */}
                      <Flex gap={3} align="flex-start" py={3}>
                        <Box
                          color="blue.500"
                          mt="2px"
                          flexShrink={0}
                          p={2}
                          bg={useColorModeValue('blue.50', 'rgba(59,130,246,0.12)')}
                          borderRadius="8px"
                        >
                          <Navigation size={16} strokeWidth={2.5} />
                        </Box>
                        <Box>
                          <Text
                            fontSize="10px"
                            fontWeight="700"
                            color={labelColor}
                            textTransform="uppercase"
                            letterSpacing="wider"
                            fontFamily="body"
                          >
                            Deliver To
                          </Text>
                          <Text fontSize="sm" fontWeight="600" fontFamily="body" mt={0.5}>
                            {order.dropAddress}
                          </Text>
                          <Text fontSize="xs" color={labelColor} fontFamily="body">
                            {order.destinationPincode ?? order.dropPincode}{order.dropZone ? ` · ${order.dropZone.name}` : ''}
                          </Text>
                        </Box>
                      </Flex>
                    </VStack>

                    {/* ── CTA Button ────────────────────────────────── */}
                    <Button
                      w="full"
                      h="52px"
                      mt={4}
                      fontSize="sm"
                      fontWeight="700"
                      fontFamily="body"
                      colorScheme={isPickupPending ? 'brand' : 'blue'}
                      rightIcon={<ArrowRight size={18} />}
                      borderRadius="12px"
                      onClick={() => navigate(`/agent/orders/${order.id}`)}
                      _hover={{ transform: 'translateY(-1px)' }}
                      transition="all 0.2s"
                    >
                      {isPickupPending ? 'Start — Mark Picked Up' : 'Update Status'}
                    </Button>
                  </CardBody>
                </Card>
              );
            })}
          </VStack>
        )}
      </Box>
    </Box>
  );
}