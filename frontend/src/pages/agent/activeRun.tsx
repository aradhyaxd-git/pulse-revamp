import { useEffect, useState } from 'react';
import {
  Box, Heading, VStack, Card, CardBody, Flex, Text, Button,
  Divider, Spinner, Center, useColorModeValue,
} from '@chakra-ui/react';
import { MapPin, Navigation, ChevronRight, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ordersApi } from '../../api/services/orders';
import { useApiToast } from '../../hooks/useApiToast';
import { Order } from '../../types/models';
import { StatusBadge } from '../../components/common/statusBadge';

export default function ActiveRun() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showError } = useApiToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchActiveOrders = async () => {
      try {
        // Fetch orders currently in progress for this agent.
        // Backend filters by assignedAgentId = current agent (from JWT).
        // These statuses cover all in-progress orders past the pickup stage.
        const [res1, res2, res3] = await Promise.all([
          ordersApi.getOrders({ status: 'PICKED_UP' }),
          ordersApi.getOrders({ status: 'IN_TRANSIT' }),
          ordersApi.getOrders({ status: 'OUT_FOR_DELIVERY' }),
        ]);
        setOrders([
          ...(res1.orders || []),
          ...(res2.orders || []),
          ...(res3.orders || []),
        ]);
      } catch (error) {
        showError(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchActiveOrders();
  }, [showError]);

  // ── Color tokens ──────────────────────────────────────────────────────
  const pageBg = useColorModeValue('#F8FAFC', '#0F172A');
  const headingColor = useColorModeValue('gray.800', 'gray.100');
  const cardBg = useColorModeValue('white', '#1E293B');
  const cardBorder = useColorModeValue('gray.100', 'gray.700');
  const labelColor = useColorModeValue('gray.500', 'gray.400');
  const dividerColor = useColorModeValue('gray.100', 'gray.700');
  const trackingColor = useColorModeValue('gray.800', 'gray.100');
  const pickupIconBg = useColorModeValue('brand.50', 'rgba(99,102,241,0.12)');
  const dropIconBg = useColorModeValue('green.50', 'rgba(34,197,94,0.10)');
  const emptyTextColor = useColorModeValue('gray.500', 'gray.400');

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
      <Box maxW="2xl" mx="auto">
        {/* ── Page Header ───────────────────────────────────────────── */}
        <Flex align="center" gap={3} mb={6}>
          <Box
            p={2}
            bg="brand.500"
            borderRadius="10px"
            color="white"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Zap size={20} strokeWidth={2.5} />
          </Box>
          <Box>
            <Text
              fontSize="xs"
              fontWeight="semibold"
              letterSpacing="widest"
              textTransform="uppercase"
              color="brand.500"
              fontFamily="body"
            >
              In Progress
            </Text>
            <Heading
              size="lg"
              fontFamily="heading"
              color={headingColor}
              fontWeight="800"
              letterSpacing="-0.5px"
            >
              Active Run
            </Heading>
          </Box>
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
              <Text
                fontSize="lg"
                fontWeight="600"
                fontFamily="heading"
                color={emptyTextColor}
                mb={2}
              >
                No Active Deliveries
              </Text>
              <Text fontSize="sm" color={emptyTextColor} fontFamily="body">
                No deliveries in progress right now.
              </Text>
            </CardBody>
          </Card>
        ) : (
          <VStack spacing={4} align="stretch">
            {orders.map((order) => (
              <Card
                key={order.id}
                bg={cardBg}
                border="1.5px solid"
                borderColor={cardBorder}
                borderRadius="16px"
                shadow="sm"
                _hover={{ shadow: 'md', transform: 'translateY(-1px)' }}
                transition="all 0.2s"
                overflow="hidden"
              >
                {/* Status accent bar */}
                <Box
                  h="3px"
                  bg={
                    order.currentStatus === 'PICKED_UP'
                      ? 'linear-gradient(90deg, #6366F1, #818CF8)'
                      : order.currentStatus === 'IN_TRANSIT'
                      ? 'linear-gradient(90deg, #3B82F6, #60A5FA)'
                      : 'linear-gradient(90deg, #F59E0B, #FCD34D)'
                  }
                />
                <CardBody p={{ base: 4, md: 5 }}>
                  {/* ── Card Header ─────────────────────────────────── */}
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

                      {/* Current status prominent label */}
                      <Text
                        fontSize="xs"
                        fontWeight="600"
                        color={labelColor}
                        fontFamily="body"
                        mt={1}
                      >
                        {(order.deliveryStage ?? order.currentStatus ?? '').replace(/_/g, ' ')}
                      </Text>

                      {/* COD amount in large amber */}
                      {order.paymentType === 'COD' ? (
                        <Box mt={2}>
                          <Text
                            fontSize="xl"
                            fontWeight="800"
                            color="#F59E0B"
                            fontFamily="heading"
                            lineHeight="1"
                          >
                            ₹{Number(order.charge).toFixed(2)}
                          </Text>
                          <Text fontSize="10px" color="#F59E0B" fontWeight="600" letterSpacing="wider">
                            COLLECT · COD
                          </Text>
                        </Box>
                      ) : (
                        <Text fontSize="xs" color="green.500" fontWeight="600" mt={1} fontFamily="body">
                          ✓ Prepaid
                        </Text>
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
                        bg={pickupIconBg}
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
                          Pickup
                        </Text>
                        <Text fontSize="sm" fontWeight="600" fontFamily="body" mt={0.5}>
                          {order.pickupAddress}
                        </Text>
                        <Text fontSize="xs" color={labelColor} fontFamily="body">
                          {order.originPincode ?? order.pickupPincode}
                        </Text>
                      </Box>
                    </Flex>

                    <Divider borderColor={dividerColor} />

                    {/* Drop */}
                    <Flex gap={3} align="flex-start" py={3}>
                      <Box
                        color="green.500"
                        mt="2px"
                        flexShrink={0}
                        p={2}
                        bg={dropIconBg}
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
                          Drop
                        </Text>
                        <Text fontSize="sm" fontWeight="600" fontFamily="body" mt={0.5}>
                          {order.dropAddress}
                        </Text>
                        <Text fontSize="xs" color={labelColor} fontFamily="body">
                          {order.destinationPincode ?? order.dropPincode}
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
                    colorScheme="brand"
                    rightIcon={<ChevronRight size={18} />}
                    borderRadius="12px"
                    onClick={() => navigate(`/agent/orders/${order.id}`)}
                    _hover={{ transform: 'translateY(-1px)' }}
                    transition="all 0.2s"
                  >
                    Continue → Update Status
                  </Button>
                </CardBody>
              </Card>
            ))}
          </VStack>
        )}
      </Box>
    </Box>
  );
}