import { useEffect, useState } from 'react';
import {
  Box, Heading, Card, CardBody, Flex, Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { adminApi } from '../../../api/services/admin';
import { useApiToast } from '../../../hooks/useApiToast';
import { DataTable, Column } from '../../../components/common/datatable';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
  _count: {
    ordersAsCustomer: number;
  };
}

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showError } = useApiToast();

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await adminApi.getCustomers();
        setCustomers(response.customers || []);
      } catch (error) {
        showError(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCustomers();
  }, [showError]);

  const headClr  = useColorModeValue('#0F172A', '#F1F5F9');
  const subClr   = useColorModeValue('#64748B', '#94A3B8');
  const pageBg   = useColorModeValue('#F8FAFC', '#0F172A');
  const cardBg   = useColorModeValue('white', '#1E293B');
  const border   = useColorModeValue('rgba(15,23,42,0.08)', 'rgba(255,255,255,0.06)');

  const columns: Column<Customer>[] = [
    {
      key: 'name',
      header: 'Customer',
      render: (c) => (
        <Box>
          <Text fontSize="sm" fontWeight="700" color={headClr}>
            {c.name || '—'}
          </Text>
          <Text fontSize="xs" color={subClr} mt={0.5}>
            {c.email || ''}
          </Text>
        </Box>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (c) => (
        <Text fontSize="sm" color={subClr} fontFamily="mono" fontWeight="500">
          {c.phone || '—'}
        </Text>
      ),
    },
    {
      key: 'joined',
      header: 'Joined',
      render: (c) => (
        <Text fontSize="sm" color={subClr} fontWeight="500">
          {new Date(c.createdAt).toLocaleDateString()}
        </Text>
      ),
    },
    {
      key: 'orders',
      header: 'Total Orders',
      render: (c) => (
        <Box
          display="inline-flex"
          alignItems="center"
          justifyContent="center"
          px="12px"
          py="4px"
          borderRadius="full"
          bg={useColorModeValue('#EEF2FF', 'rgba(99,102,241,0.15)')}
          border="1px solid"
          borderColor={useColorModeValue('#C7D2FE', 'rgba(99,102,241,0.3)')}
        >
          <Text
            fontSize="12px"
            fontWeight="800"
            color={useColorModeValue('#4F46E5', '#818CF8')}
          >
            {c._count?.ordersAsCustomer || 0}
          </Text>
        </Box>
      ),
    },
  ];

  return (
    <Box minH="100vh" bg={pageBg} px={{ base: 4, md: 6 }} py={6}>
      <Box mb={6}>
        <Heading
          fontFamily="heading"
          fontWeight="800"
          fontSize={{ base: '2xl', md: '3xl' }}
          color={headClr}
          letterSpacing="-0.02em"
          lineHeight="1.1"
        >
          Customers
        </Heading>
        <Text mt={1} fontSize="sm" color={subClr} fontWeight="500">
          View all registered customers and their order history
        </Text>
      </Box>

      <Card
        bg={cardBg}
        border="1px solid"
        borderColor={border}
        borderRadius="2xl"
        boxShadow={useColorModeValue('0 1px 4px rgba(15,23,42,0.06)', '0 2px 8px rgba(0,0,0,0.3)')}
        overflow="hidden"
      >
        <CardBody p={0}>
          <DataTable columns={columns} data={customers} isLoading={isLoading} />
        </CardBody>
      </Card>
    </Box>
  );
}
