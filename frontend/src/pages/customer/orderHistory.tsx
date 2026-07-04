import { useEffect, useState } from 'react';
import {
  Box, Flex, Heading, Input, Select, InputGroup, InputLeftElement,
  Card, Text, useColorModeValue,
} from '@chakra-ui/react';
import { Search, PackageX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ordersApi } from '../../api/services/orders';
import { useApiToast } from '../../hooks/useApiToast';
import { Order, OrderStatus } from '../../types/models';
import { DataTable, Column } from '../../components/common/datatable';
import { StageBadge } from '../../components/common/statusBadge';

export default function ShipmentLog() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stageFilter, setStageFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const { showError } = useApiToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const params = stageFilter ? { status: stageFilter } : {};
        const response = await ordersApi.getOrders(params);
        setOrders(response.orders || []);
      } catch (error) {
        showError(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, [stageFilter, showError]);

  const getStage = (o: Order) => o.deliveryStage ?? o.currentStatus ?? 'CREATED';

  // Client-side search by shipment code or order id
  const filteredOrders = orders.filter(o => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      o.id.toLowerCase().includes(term) ||
      (o.shipmentCode ?? o.trackingId ?? '').toLowerCase().includes(term)
    );
  });

  const cardBg      = useColorModeValue('white', '#111E35');
  const border      = useColorModeValue('#DFE1E6', 'rgba(255,255,255,0.07)');
  const headingClr  = useColorModeValue('#172B4D', '#E2E8F0');
  const subClr      = useColorModeValue('#5E6C84', '#8993A4');
  const monoClr     = useColorModeValue('#0052CC', '#4C9AFF');

  const columns: Column<Order>[] = [
    {
      key: 'shipmentCode',
      header: 'Shipment Code',
      render: (order) => (
        <Text fontWeight="700" fontFamily="mono" fontSize="xs" color={monoClr} letterSpacing="0.04em">
          {order.shipmentCode ?? order.trackingId ?? order.id.slice(0, 8).toUpperCase()}
        </Text>
      ),
    },
    {
      key: 'route',
      header: 'Route',
      render: (order) => (
        <Flex align="center" gap={1} fontSize="sm">
          <Text color={headingClr} fontWeight="500">
            {(order as any).originPincode ?? (order as any).pickupPincode ?? '—'}
          </Text>
          <Text color={subClr} fontSize="xs">→</Text>
          <Text color={headingClr} fontWeight="500">
            {(order as any).destinationPincode ?? (order as any).dropPincode ?? '—'}
          </Text>
        </Flex>
      ),
    },
    {
      key: 'createdAt',
      header: 'Booked On',
      render: (order) => (
        <Text fontSize="sm" color={subClr}>
          {new Date(order.createdAt).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
          })}
        </Text>
      ),
    },
    {
      key: 'charge',
      header: 'Amount',
      render: (order) => (
        <Text fontSize="sm" fontWeight="600" color={headingClr}>
          &#8377;{Number(order.charge).toFixed(2)}
        </Text>
      ),
    },
    {
      key: 'deliveryStage',
      header: 'Stage',
      render: (order) => <StageBadge status={getStage(order) as OrderStatus} />,
    },
  ];

  return (
    <Box pb={8}>
      <Box mb={6}>
        <Heading
          fontFamily="heading"
          fontWeight="800"
          fontSize={{ base: '2xl', md: '2xl' }}
          color={headingClr}
          letterSpacing="-0.02em"
        >
          Shipment Log
        </Heading>
        <Text color={subClr} fontSize="sm" mt={1}>
          Browse and filter all your past and active shipments.
        </Text>
      </Box>

      {/* Filter Bar */}
      <Card
        bg={cardBg}
        borderRadius="lg"
        border="1px"
        borderColor={border}
        boxShadow="sm"
        p={4}
        mb={4}
      >
        <Flex gap={3} flexDir={{ base: 'column', md: 'row' }} align={{ md: 'center' }}>
          <InputGroup flex={1} maxW={{ md: '400px' }}>
            <InputLeftElement pointerEvents="none" color={subClr}>
              <Search size={15} />
            </InputLeftElement>
            <Input
              placeholder="Search by shipment code…"
              borderRadius="md"
              fontSize="sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>

          <Select
            maxW={{ md: '200px' }}
            borderRadius="md"
            fontSize="sm"
            color={headingClr}
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
          >
            <option value="">All Stages</option>
            <option value="CREATED">Booked</option>
            <option value="PICKED_UP">Collected</option>
            <option value="IN_TRANSIT">En Route</option>
            <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
            <option value="DELIVERED">Delivered</option>
            <option value="FAILED">Undelivered</option>
            <option value="RESCHEDULED">Deferred</option>
          </Select>
        </Flex>
      </Card>

      {/* Shipments Table */}
      <Card
        bg={cardBg}
        borderRadius="lg"
        border="1px"
        borderColor={border}
        overflow="hidden"
        boxShadow="sm"
      >
        {!isLoading && filteredOrders.length === 0 ? (
          <Box py={16} textAlign="center">
            <PackageX size={40} color="#DFE1E6" style={{ margin: '0 auto 10px' }} />
            <Text color={subClr} fontWeight="600" fontSize="sm">No shipments found</Text>
            <Text color={subClr} fontSize="xs" mt={1}>
              {searchTerm || stageFilter
                ? 'Try adjusting your filters or search term.'
                : 'You have no shipments yet.'}
            </Text>
          </Box>
        ) : (
          <DataTable
            columns={columns}
            data={filteredOrders}
            isLoading={isLoading}
            onRowClick={(order) => navigate(`/customer/orders/${order.id}`)}
            emptyLabel="No shipments found"
          />
        )}
      </Card>
    </Box>
  );
}