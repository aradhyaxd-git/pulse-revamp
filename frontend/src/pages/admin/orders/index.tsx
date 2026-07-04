import { useEffect, useState } from 'react';
import {
  Box, Heading, Card, CardBody, Button, Flex, Select, Input, Text,
  useDisclosure, useColorModeValue, Divider, Badge, HStack,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  ModalCloseButton, VStack, InputGroup, InputLeftElement,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { Zap, UserPlus, Search, Filter, Plus } from 'lucide-react';
import { ordersApi } from '../../../api/services/orders';
import { agentsApi } from '../../../api/services/agents';
import { useApiToast } from '../../../hooks/useApiToast';
import { Order, Agent } from '../../../types/models';
import { DataTable, Column } from '../../../components/common/datatable';
import { StatusBadge } from '../../../components/common/statusBadge';

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { showSuccess, showError } = useApiToast();
  const navigate = useNavigate();

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await ordersApi.getOrders();
      setOrders(response.orders || []);
    } catch (error) {
      showError(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Pre-fetch agents for the assignment modal
    agentsApi.getAgents().then(res => setAgents(res.agents || [])).catch(console.error);
  }, []);

  const handleOpenAssignModal = (order: Order) => {
    setSelectedOrder(order);
    setSelectedAgentId('');
    onOpen();
  };

  const handleManualAssign = async () => {
    if (!selectedOrder || !selectedAgentId) return;
    setIsAssigning(true);
    try {
      await ordersApi.assignAgent(selectedOrder.id, { agentId: selectedAgentId });
      showSuccess('Agent assigned successfully');
      onClose();
      fetchOrders();
    } catch (error) {
      showError(error);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleAutoAssign = async (orderId: string) => {
    try {
      await ordersApi.autoAssignAgent(orderId);
      showSuccess('Order auto-assigned to best available agent');
      fetchOrders();
    } catch (error) {
      showError(error);
    }
  };

  // Available online agents with capacity
  const availableAgents = agents.filter(a => (a.onShift ?? a.clockedIn) && (a.loadCount ?? a.activeOrderCount ?? 0) < (a.slotLimit ?? a.maxCapacity ?? 5));

  // Color tokens
  const pageBg = useColorModeValue('#F8FAFC', '#0F172A');
  const cardBg = useColorModeValue('white', '#1E293B');
  const borderColor = useColorModeValue('rgba(15,23,42,0.08)', 'rgba(255,255,255,0.06)');
  const headingColor = useColorModeValue('#0F172A', '#F1F5F9');
  const subtitleColor = useColorModeValue('#64748B', '#94A3B8');
  const monoColor = useColorModeValue('#4F46E5', '#818CF8');
  const inputBg = useColorModeValue('#F8FAFC', 'rgba(255,255,255,0.04)');
  const agentRowBg = useColorModeValue('#F8FAFC', 'rgba(255,255,255,0.04)');
  const agentRowHover = useColorModeValue('#EEF2FF', 'rgba(99,102,241,0.12)');
  const agentRowSelected = useColorModeValue('#E0E7FF', 'rgba(99,102,241,0.22)');
  const agentRowBorder = useColorModeValue('rgba(15,23,42,0.06)', 'rgba(255,255,255,0.05)');
  const agentNameColor = useColorModeValue('#1E293B', '#E2E8F0');
  const agentMetaColor = useColorModeValue('#64748B', '#94A3B8');
  const modalBg = useColorModeValue('white', '#1E293B');
  const modalBorder = useColorModeValue('gray.100', 'whiteAlpha.100');

  const columns: Column<Order>[] = [
    {
      key: 'trackingId',
      header: 'Tracking ID',
      render: (o) => (
        <Text
          fontFamily="mono"
          fontWeight="700"
          fontSize="xs"
          color={monoColor}
          letterSpacing="0.05em"
        >
          {o.trackingId || o.id.slice(0, 8).toUpperCase()}
        </Text>
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (o) => (
        <Text fontWeight="500" fontSize="sm" color={headingColor} noOfLines={1}>
          {(o as any).customerName || (o as any).customer?.name || '—'}
        </Text>
      ),
    },
    {
      key: 'pincodes',
      header: 'Pickup \u2192 Drop',
      render: (o) => (
        <HStack spacing={1}>
          <Text fontFamily="mono" fontSize="xs" color={subtitleColor} fontWeight="600">
            {(o as any).pickupPincode || '—'}
          </Text>
          <Text fontSize="xs" color={subtitleColor}>\u2192</Text>
          <Text fontFamily="mono" fontSize="xs" color={subtitleColor} fontWeight="600">
            {(o as any).dropPincode || '—'}
          </Text>
        </HStack>
      ),
    },
    {
      key: 'currentStatus',
      header: 'Status',
      render: (o) => <StatusBadge status={(o.deliveryStage ?? o.currentStatus)!} size="sm" />,
    },
    {
      key: 'agent',
      header: 'Agent',
      render: (o) =>
        o.assignedAgentId ? (
          <Text fontSize="sm" color={headingColor} fontWeight="500" noOfLines={1}>
            {o.assignedAgent?.user?.name || o.assignedAgentId.slice(0, 8)}
          </Text>
        ) : (
          <Badge
            px={2}
            py={0.5}
            borderRadius="full"
            fontSize="10px"
            fontWeight="700"
            textTransform="uppercase"
            letterSpacing="0.05em"
            bg={useColorModeValue('#F1F5F9', 'rgba(100,116,139,0.2)')}
            color={useColorModeValue('#64748B', '#94A3B8')}
          >
            Unassigned
          </Badge>
        ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (o) =>
        !o.assignedAgentId ? (
          <HStack spacing={2}>
            <Button
              size="xs"
              bg="brand.500"
              color="white"
              _hover={{ bg: 'brand.600' }}
              leftIcon={<Zap size={11} />}
              onClick={() => handleAutoAssign(o.id)}
              fontWeight="700"
              fontSize="10px"
              letterSpacing="0.03em"
            >
              Auto Assign
            </Button>
            <Button
              size="xs"
              variant="outline"
              borderColor={useColorModeValue('rgba(15,23,42,0.15)', 'rgba(255,255,255,0.12)')}
              color={headingColor}
              _hover={{ borderColor: 'brand.500', color: 'brand.500' }}
              leftIcon={<UserPlus size={11} />}
              onClick={() => handleOpenAssignModal(o)}
              fontWeight="700"
              fontSize="10px"
              letterSpacing="0.03em"
            >
              Manual
            </Button>
          </HStack>
        ) : (
          <Text fontSize="xs" color={subtitleColor}>Assigned</Text>
        ),
    },
  ];

  return (
    <Box minH="100vh" bg={pageBg} px={{ base: 4, md: 6 }} py={6}>
      {/* Page Header */}
      <Flex mb={6} justify="space-between" align="flex-start">
        <Box>
          <Heading
            fontFamily="heading"
            fontWeight="800"
            fontSize={{ base: '2xl', md: '3xl' }}
            color={headingColor}
            letterSpacing="-0.02em"
            lineHeight="1.1"
          >
            Order Management
          </Heading>
          <Text mt={1} fontSize="sm" color={subtitleColor} fontWeight="500">
            View, filter, and assign all platform orders
          </Text>
        </Box>
        <Button
          bg="brand.500"
          color="white"
          _hover={{ bg: 'brand.600' }}
          leftIcon={<Plus size={16} />}
          onClick={() => navigate('/admin/orders/create')}
          fontWeight="700"
          fontSize="sm"
          borderRadius="lg"
          px={5}
        >
          Create order
        </Button>
      </Flex>

      {/* Filter Bar */}
      <Card
        bg={cardBg}
        border="1px solid"
        borderColor={borderColor}
        borderRadius="2xl"
        mb={4}
        boxShadow={useColorModeValue('0 1px 3px rgba(15,23,42,0.05)', '0 2px 6px rgba(0,0,0,0.25)')}
      >
        <CardBody py={3} px={4}>
          <Flex gap={3} align="center" wrap={{ base: 'wrap', md: 'nowrap' }}>
            <InputGroup size="sm" maxW={{ base: 'full', md: '260px' }} flex={1}>
              <InputLeftElement pointerEvents="none" pl={1}>
                <Search size={13} color={useColorModeValue('#94A3B8', '#64748B')} />
              </InputLeftElement>
              <Input
                placeholder="Search tracking ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                bg={inputBg}
                border="1px solid"
                borderColor={borderColor}
                borderRadius="lg"
                fontSize="sm"
                _placeholder={{ color: subtitleColor }}
                _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px #6366F1' }}
                pl={8}
              />
            </InputGroup>
            <Flex align="center" gap={2} minW="0">
              <Filter size={13} color={useColorModeValue('#94A3B8', '#64748B')} />
              <Select
                size="sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                bg={inputBg}
                border="1px solid"
                borderColor={borderColor}
                borderRadius="lg"
                fontSize="sm"
                color={headingColor}
                _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px #6366F1' }}
                minW="160px"
              >
                <option value="">All Statuses</option>
                <option value="CREATED">Created</option>
                <option value="PICKED_UP">Picked Up</option>
                <option value="IN_TRANSIT">In Transit</option>
                <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                <option value="DELIVERED">Delivered</option>
                <option value="FAILED">Failed</option>
              </Select>
            </Flex>
          </Flex>
        </CardBody>
      </Card>

      {/* Orders DataTable */}
      <Card
        bg={cardBg}
        border="1px solid"
        borderColor={borderColor}
        borderRadius="2xl"
        boxShadow={useColorModeValue('0 1px 4px rgba(15,23,42,0.06)', '0 2px 8px rgba(0,0,0,0.3)')}
        overflow="hidden"
      >
        <CardBody p={0}>
          <DataTable columns={columns} data={orders} isLoading={isLoading} />
        </CardBody>
      </Card>

      {/* Assignment Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent
          bg={modalBg}
          border="1px solid"
          borderColor={modalBorder}
          borderRadius="2xl"
          boxShadow="0 20px 60px rgba(0,0,0,0.3)"
        >
          <ModalHeader
            fontFamily="heading"
            fontWeight="700"
            fontSize="lg"
            color={headingColor}
            pt={6}
            pb={2}
          >
            Assign Agent
          </ModalHeader>
          <Text px={6} pb={4} fontSize="sm" color={subtitleColor}>
            Select an available agent to handle order{' '}
            <Text as="span" fontFamily="mono" fontWeight="700" color={monoColor}>
              {selectedOrder?.trackingId || selectedOrder?.id?.slice(0, 8).toUpperCase()}
            </Text>
          </Text>
          <Divider borderColor={modalBorder} />
          <ModalCloseButton top={4} right={4} color={subtitleColor} />
          <ModalBody py={4} px={4}>
            {availableAgents.length === 0 ? (
              <Box
                textAlign="center"
                py={8}
                px={4}
                bg={agentRowBg}
                borderRadius="xl"
                border="1px dashed"
                borderColor={borderColor}
              >
                <Text fontSize="sm" color={subtitleColor}>
                  No agents are currently online with available capacity.
                </Text>
              </Box>
            ) : (
              <VStack spacing={2} align="stretch">
                {availableAgents.map(agent => (
                  <Box
                    key={agent.id}
                    onClick={() => setSelectedAgentId(agent.id)}
                    cursor="pointer"
                    bg={selectedAgentId === agent.id ? agentRowSelected : agentRowBg}
                    border="1px solid"
                    borderColor={selectedAgentId === agent.id ? 'brand.500' : agentRowBorder}
                    borderRadius="xl"
                    px={4}
                    py={3}
                    transition="all 0.15s"
                    _hover={{ bg: agentRowHover, borderColor: 'brand.400' }}
                  >
                    <Flex justify="space-between" align="center">
                      <Box>
                        <Text fontWeight="700" fontSize="sm" color={agentNameColor}>
                          {agent.user?.name || agent.id}
                        </Text>
                        <Text fontSize="xs" color={agentMetaColor} mt={0.5}>
                          Zone: {agent.zone?.name || '—'}
                        </Text>
                      </Box>
                      <Box textAlign="right">
                        <Badge
                          bg={useColorModeValue('#ECFDF5', 'rgba(16,185,129,0.15)')}
                          color={useColorModeValue('#065F46', '#34D399')}
                          border="1px solid"
                          borderColor={useColorModeValue('#A7F3D0', 'rgba(16,185,129,0.3)')}
                          borderRadius="full"
                          px={2}
                          py={0.5}
                          fontSize="10px"
                          fontWeight="700"
                          textTransform="uppercase"
                          letterSpacing="0.05em"
                        >
                          Online
                        </Badge>
                        <Text fontSize="xs" color={agentMetaColor} mt={1}>
                          {agent.activeOrderCount}/{agent.maxCapacity} orders
                        </Text>
                      </Box>
                    </Flex>
                  </Box>
                ))}
              </VStack>
            )}
          </ModalBody>
          <Divider borderColor={modalBorder} />
          <ModalFooter gap={3} pt={4} pb={5}>
            <Button
              variant="ghost"
              onClick={onClose}
              color={subtitleColor}
              _hover={{ bg: useColorModeValue('#F1F5F9', 'rgba(255,255,255,0.06)') }}
              size="sm"
            >
              Cancel
            </Button>
            <Button
              bg="brand.500"
              color="white"
              _hover={{ bg: 'brand.600' }}
              onClick={handleManualAssign}
              isLoading={isAssigning}
              isDisabled={!selectedAgentId}
              size="sm"
              fontWeight="700"
              borderRadius="lg"
              px={5}
            >
              Confirm Assignment
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}