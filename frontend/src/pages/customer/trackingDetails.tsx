import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Grid, GridItem, Card, CardBody, CardHeader, Heading,
  Text, VStack, Flex, Divider, Button, Alert, AlertIcon,
  AlertDescription, Select, FormControl, FormLabel,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody,
  ModalFooter, ModalCloseButton, useDisclosure, useColorModeValue,
  Badge,
} from '@chakra-ui/react';
import {
  PackageOpen, MapPin, Calendar, CreditCard, RefreshCw,
  ArrowLeft, User, Truck,
} from 'lucide-react';
import { ordersApi } from '../../api/services/orders';
import { useApiToast } from '../../hooks/useApiToast';
import { Order, TimelineEvent } from '../../types/models';
import { StatusBadge } from '../../components/common/statusBadge';
import { Timeline } from '../../components/common/timeline';

export default function TrackingDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSuccess, showError } = useApiToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [order, setOrder] = useState<Order | null>(null);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');

  const fetchOrderData = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const [orderRes, timelineRes] = await Promise.all([
        ordersApi.getOrderDetails(id),
        ordersApi.getOrderTimeline(id),
      ]);
      setOrder(orderRes.order);
      setEvents(timelineRes.timeline || []);
    } catch (error) {
      showError(error);
      navigate('/customer/orders/history');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderData();
  }, [id]);

  const handleReschedule = async () => {
    if (!id || !rescheduleDate) return;
    setIsRescheduling(true);
    try {
      await ordersApi.rescheduleOrder(id, { rescheduleDate });
      showSuccess('Delivery successfully rescheduled.');
      onClose();
      fetchOrderData();
    } catch (error) {
      showError(error);
    } finally {
      setIsRescheduling(false);
    }
  };

  const pageBg = useColorModeValue('#F8FAFC', '#0F172A');
  const cardBg = useColorModeValue('white', '#1E293B');
  const borderColor = useColorModeValue('gray.100', 'whiteAlpha.100');
  const headingColor = useColorModeValue('gray.800', 'white');
  const subColor = useColorModeValue('gray.500', 'gray.400');
  const labelColor = useColorModeValue('gray.400', 'gray.500');
  const heroBg = useColorModeValue('brand.50', 'whiteAlpha.50');
  const dividerColor = useColorModeValue('gray.100', 'whiteAlpha.100');
  const dateBorderColor = useColorModeValue('#E2E8F0', '#2D3748');
  const dateBg = useColorModeValue('white', '#1E293B');
  const dateColor = useColorModeValue('#1A202C', '#E2E8F0');

  if (isLoading || !order) {
    return (
      <Box minH="100vh" bg={pageBg} display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={3}>
          <Truck size={36} color="#6366F1" />
          <Text color={subColor} fontWeight="500" fontSize="sm">
            Loading tracking details…
          </Text>
        </VStack>
      </Box>
    );
  }

  const displayTrackingId = order.trackingId || order.id.slice(0, 8).toUpperCase();

  // Minimum reschedule date is tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <Box minH="100vh" bg={pageBg} pb={12}>
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        leftIcon={<ArrowLeft size={15} />}
        color={subColor}
        _hover={{ color: headingColor, bg: 'transparent' }}
        mb={5}
        px={0}
        fontWeight="600"
        onClick={() => navigate('/customer/orders/history')}
      >
        Back to Orders
      </Button>

      {/* Hero Section */}
      <Card
        bg={heroBg}
        border="1px"
        borderColor={borderColor}
        borderRadius="2xl"
        shadow="sm"
        mb={6}
        overflow="hidden"
      >
        <CardBody px={{ base: 5, md: 8 }} py={6}>
          <Flex
            justify="space-between"
            align={{ base: 'flex-start', md: 'center' }}
            flexWrap="wrap"
            gap={4}
          >
            <Box>
              <Text
                fontSize="xs"
                fontWeight="700"
                color={labelColor}
                textTransform="uppercase"
                letterSpacing="widest"
                mb={1}
              >
                Tracking ID
              </Text>
              <Heading
                fontFamily="'Plus Jakarta Sans', sans-serif"
                fontWeight="800"
                fontSize={{ base: '2xl', md: '3xl' }}
                color="brand.500"
                letterSpacing="wider"
              >
                {displayTrackingId}
              </Heading>
              <Text fontSize="sm" color={subColor} mt={1}>
                Placed on{' '}
                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
            </Box>
            <Box>
              <StatusBadge status={(order.deliveryStage ?? order.currentStatus)!} size="lg" />
            </Box>
          </Flex>
        </CardBody>
      </Card>

      {/* FAILED Alert */}
      {order.currentStatus === 'FAILED' && (
        <Alert
          status="error"
          borderRadius="2xl"
          mb={5}
          variant="left-accent"
          alignItems="flex-start"
          py={4}
          px={5}
        >
          <AlertIcon mt={0.5} />
          <Box flex="1">
            <Text fontWeight="700" fontSize="sm">Delivery Attempt Failed</Text>
            <AlertDescription fontSize="sm" color="red.700">
              We were unable to deliver your package. You can schedule another attempt below.
            </AlertDescription>
          </Box>
          <Button
            colorScheme="red"
            size="sm"
            leftIcon={<RefreshCw size={14} />}
            onClick={onOpen}
            borderRadius="lg"
            flexShrink={0}
            ml={2}
            fontWeight="600"
          >
            Schedule Reschedule
          </Button>
        </Alert>
      )}

      {/* RESCHEDULED Alert */}
      {order.currentStatus === 'RESCHEDULED' && (
        <Alert
          status="info"
          borderRadius="2xl"
          mb={5}
          variant="left-accent"
          py={4}
          px={5}
        >
          <AlertIcon />
          <Box flex="1">
            <Text fontWeight="700" fontSize="sm">Delivery Rescheduled</Text>
            <AlertDescription fontSize="sm">
              Your order has been rescheduled
              {order.rescheduleDate
                ? ` for ${new Date(order.rescheduleDate).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}`
                : ''}
              .
            </AlertDescription>
          </Box>
        </Alert>
      )}

      {/* Two-column Grid */}
      <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
        {/* Left Column: Info Cards */}
        <GridItem>
          <VStack spacing={5} align="stretch">

            {/* Route Card */}
            <Card
              bg={cardBg}
              border="1px"
              borderColor={borderColor}
              borderRadius="2xl"
              shadow="sm"
              overflow="hidden"
            >
              <CardHeader pb={3} pt={5} px={6}>
                <Flex align="center" gap={2}>
                  <Box color="brand.500">
                    <MapPin size={18} />
                  </Box>
                  <Heading
                    size="sm"
                    fontFamily="'Plus Jakarta Sans', sans-serif"
                    fontWeight="700"
                    color={headingColor}
                  >
                    Route
                  </Heading>
                </Flex>
              </CardHeader>
              <CardBody pt={0} px={6} pb={6}>
                <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={6}>
                  <Box>
                    <Text
                      fontSize="xs"
                      fontWeight="700"
                      color={labelColor}
                      textTransform="uppercase"
                      letterSpacing="wider"
                      mb={2}
                    >
                      Pickup
                    </Text>
                    <Text fontWeight="600" color={headingColor} fontSize="sm">
                      {order.pickupAddress}
                    </Text>
                    <Text color={subColor} fontSize="sm" mt={0.5}>
                      {order.originPincode ?? order.pickupPincode}
                      {order.pickupZone ? ` · ${order.pickupZone.name}` : ''}
                    </Text>
                  </Box>
                  <Box>
                    <Text
                      fontSize="xs"
                      fontWeight="700"
                      color={labelColor}
                      textTransform="uppercase"
                      letterSpacing="wider"
                      mb={2}
                    >
                      Destination
                    </Text>
                    <Text fontWeight="600" color={headingColor} fontSize="sm">
                      {order.dropAddress}
                    </Text>
                    <Text color={subColor} fontSize="sm" mt={0.5}>
                      {order.destinationPincode ?? order.dropPincode}
                      {order.dropZone ? ` · ${order.dropZone.name}` : ''}
                    </Text>
                  </Box>
                </Grid>
              </CardBody>
            </Card>

            {/* Package Card */}
            <Card
              bg={cardBg}
              border="1px"
              borderColor={borderColor}
              borderRadius="2xl"
              shadow="sm"
              overflow="hidden"
            >
              <CardHeader pb={3} pt={5} px={6}>
                <Flex align="center" gap={2}>
                  <Box color="brand.500">
                    <PackageOpen size={18} />
                  </Box>
                  <Heading
                    size="sm"
                    fontFamily="'Plus Jakarta Sans', sans-serif"
                    fontWeight="700"
                    color={headingColor}
                  >
                    Package Details
                  </Heading>
                </Flex>
              </CardHeader>
              <CardBody pt={0} px={6} pb={6}>
                <VStack align="stretch" spacing={3} divider={<Divider borderColor={dividerColor} />}>
                  <Flex justify="space-between">
                    <Text fontSize="sm" color={subColor}>Order Type</Text>
                    <Badge
                      colorScheme="purple"
                      borderRadius="md"
                      px={2}
                      py={0.5}
                      fontSize="xs"
                      fontWeight="600"
                    >
                      {order.orderType}
                    </Badge>
                  </Flex>
                  <Flex justify="space-between">
                    <Text fontSize="sm" color={subColor}>Actual Weight</Text>
                    <Text fontSize="sm" fontWeight="600" color={headingColor}>
                      {Number(order.actualWeightKg).toFixed(2)} kg
                    </Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text fontSize="sm" color={subColor}>Billable Weight</Text>
                    <Text fontSize="sm" fontWeight="600" color={headingColor}>
                      {Number(order.billableWeightKg).toFixed(3)} kg
                    </Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text fontSize="sm" color={subColor}>Date Created</Text>
                    <Flex align="center" gap={1} fontSize="sm" fontWeight="600" color={headingColor}>
                      <Calendar size={13} />
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </Flex>
                  </Flex>
                </VStack>
              </CardBody>
            </Card>

            {/* Payment Card */}
            <Card
              bg={cardBg}
              border="1px"
              borderColor={borderColor}
              borderRadius="2xl"
              shadow="sm"
              overflow="hidden"
            >
              <CardHeader pb={3} pt={5} px={6}>
                <Flex align="center" gap={2}>
                  <Box color="brand.500">
                    <CreditCard size={18} />
                  </Box>
                  <Heading
                    size="sm"
                    fontFamily="'Plus Jakarta Sans', sans-serif"
                    fontWeight="700"
                    color={headingColor}
                  >
                    Payment
                  </Heading>
                </Flex>
              </CardHeader>
              <CardBody pt={0} px={6} pb={6}>
                <VStack align="stretch" spacing={3}>
                  <Flex justify="space-between">
                    <Text fontSize="sm" color={subColor}>Payment Type</Text>
                    <Badge
                      colorScheme={order.paymentType === 'COD' ? 'orange' : 'green'}
                      borderRadius="md"
                      px={2}
                      py={0.5}
                      fontSize="xs"
                      fontWeight="600"
                    >
                      {order.paymentType}
                    </Badge>
                  </Flex>
                  {Number(order.codSurcharge) > 0 && (
                    <Flex justify="space-between">
                      <Text fontSize="sm" color={subColor}>COD Surcharge</Text>
                      <Text fontSize="sm" fontWeight="600" color={headingColor}>
                        &#8377;{Number(order.codSurcharge).toFixed(2)}
                      </Text>
                    </Flex>
                  )}
                  <Divider borderColor={dividerColor} />
                  <Flex justify="space-between" align="center">
                    <Text fontSize="sm" color={subColor} fontWeight="700">Total Amount</Text>
                    <Flex align="center" gap={1} color="brand.500" fontWeight="800" fontSize="lg">
                      <CreditCard size={16} />
                      &#8377;{Number(order.charge).toFixed(2)}
                    </Flex>
                  </Flex>
                </VStack>
              </CardBody>
            </Card>

            {/* Agent Card (if assigned) */}
            {order.assignedAgent && (
              <Card
                bg={cardBg}
                border="1px"
                borderColor={borderColor}
                borderRadius="2xl"
                shadow="sm"
                overflow="hidden"
              >
                <CardHeader pb={3} pt={5} px={6}>
                  <Flex align="center" gap={2}>
                    <Box color="brand.500">
                      <User size={18} />
                    </Box>
                    <Heading
                      size="sm"
                      fontFamily="'Plus Jakarta Sans', sans-serif"
                      fontWeight="700"
                      color={headingColor}
                    >
                      Assigned Agent
                    </Heading>
                  </Flex>
                </CardHeader>
                <CardBody pt={0} px={6} pb={6}>
                  <Flex justify="space-between" align="center">
                    <Box>
                      <Text fontWeight="600" fontSize="sm" color={headingColor}>
                        {order.assignedAgent.user.name}
                      </Text>
                      <Text color={subColor} fontSize="sm">
                        {order.assignedAgent.user.email}
                      </Text>
                    </Box>
                    {order.assignedAgent.user.phone && (
                      <Badge
                        colorScheme="blue"
                        borderRadius="lg"
                        px={3}
                        py={1}
                        fontSize="sm"
                        fontWeight="600"
                      >
                        {order.assignedAgent.user.phone}
                      </Badge>
                    )}
                  </Flex>
                </CardBody>
              </Card>
            )}
          </VStack>
        </GridItem>

        {/* Right Column: Timeline */}
        <GridItem>
          <Card
            bg={cardBg}
            border="1px"
            borderColor={borderColor}
            borderRadius="2xl"
            shadow="sm"
            h="100%"
            overflow="hidden"
          >
            <CardHeader pb={3} pt={5} px={6}>
              <Heading
                size="sm"
                fontFamily="'Plus Jakarta Sans', sans-serif"
                fontWeight="700"
                color={headingColor}
              >
                Tracking Timeline
              </Heading>
            </CardHeader>
            <CardBody px={6} pb={6}>
              <Timeline events={events} />
            </CardBody>
          </Card>
        </GridItem>
      </Grid>

      {/* Reschedule Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent borderRadius="2xl" shadow="2xl" mx={4}>
          <ModalHeader
            fontFamily="'Plus Jakarta Sans', sans-serif"
            fontWeight="700"
            color={headingColor}
            borderBottom="1px"
            borderColor={borderColor}
            pb={4}
          >
            Reschedule Delivery
          </ModalHeader>
          <ModalCloseButton mt={1} />
          <ModalBody py={6}>
            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="600" color={headingColor} mb={2}>
                Select a new delivery date
              </FormLabel>
              <input
                type="date"
                min={minDate}
                value={rescheduleDate}
                onChange={(e) => setRescheduleDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  border: `1px solid ${dateBorderColor}`,
                  background: dateBg,
                  color: dateColor,
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter borderTop="1px" borderColor={borderColor} pt={4} gap={3}>
            <Button
              variant="ghost"
              onClick={onClose}
              borderRadius="xl"
              fontWeight="600"
              color={subColor}
            >
              Cancel
            </Button>
            <Button
              bg="brand.500"
              color="white"
              _hover={{ bg: 'brand.600' }}
              _active={{ bg: 'brand.700' }}
              onClick={handleReschedule}
              isLoading={isRescheduling}
              isDisabled={!rescheduleDate}
              borderRadius="xl"
              fontWeight="600"
              px={6}
            >
              Confirm Reschedule
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}