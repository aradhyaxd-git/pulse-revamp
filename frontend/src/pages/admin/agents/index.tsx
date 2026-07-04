import { useEffect, useState } from 'react';
import {
  Box, Heading, Card, CardBody, Progress, Flex, Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { agentsApi } from '../../../api/services/agents';
import { useApiToast } from '../../../hooks/useApiToast';
import { Agent } from '../../../types/models';
import { DataTable, Column } from '../../../components/common/datatable';

export default function AdminAgents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showError } = useApiToast();

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await agentsApi.getAgents();
        setAgents(response.agents || []);
      } catch (error) {
        showError(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAgents();
  }, [showError]);

  const headClr  = useColorModeValue('#0F172A', '#F1F5F9');
  const subClr   = useColorModeValue('#64748B', '#94A3B8');
  const pageBg   = useColorModeValue('#F8FAFC', '#0F172A');
  const cardBg   = useColorModeValue('white', '#1E293B');
  const border   = useColorModeValue('rgba(15,23,42,0.08)', 'rgba(255,255,255,0.06)');

  const columns: Column<Agent>[] = [
    {
      key: 'name',
      header: 'Agent',
      render: (a) => (
        <Box>
          <Text fontSize="sm" fontWeight="700" color={headClr}>
            {a.user?.name || '—'}
          </Text>
          <Text fontSize="xs" color={subClr} mt={0.5}>
            {a.user?.email || ''}
          </Text>
        </Box>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (a) => (
        <Text fontSize="sm" color={subClr} fontFamily="mono" fontWeight="500">
          {a.user?.phone || '—'}
        </Text>
      ),
    },
    {
      key: 'zone',
      header: 'Zone',
      render: (a) => (
        <Text fontSize="sm" fontWeight="600" color={headClr}>
          {a.zone?.name || '—'}
        </Text>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (a) => (
        <Box
          display="inline-flex"
          alignItems="center"
          gap="6px"
          px="10px"
          py="4px"
          borderRadius="full"
          bg={(a.onShift ?? a.clockedIn)
            ? useColorModeValue('#E3FCEF', 'rgba(0,135,90,0.15)')
            : useColorModeValue('#F4F5F7', 'rgba(94,108,132,0.15)')
          }
          border="1px solid"
          borderColor={(a.onShift ?? a.clockedIn)
            ? useColorModeValue('#ABF5D1', 'rgba(0,135,90,0.3)')
            : useColorModeValue('#DFE1E6', 'rgba(94,108,132,0.3)')
          }
        >
          <Box
            w="6px"
            h="6px"
            borderRadius="full"
            bg={(a.onShift ?? a.clockedIn) ? '#00875A' : '#8993A4'}
            boxShadow={(a.onShift ?? a.clockedIn) ? '0 0 6px rgba(0,135,90,0.6)' : 'none'}
          />
          <Text
            fontSize="11px"
            fontWeight="700"
            color={(a.onShift ?? a.clockedIn)
              ? useColorModeValue('#006644', '#34D399')
              : useColorModeValue('#5E6C84', '#8993A4')
            }
            textTransform="uppercase"
            letterSpacing="0.05em"
          >
            {(a.onShift ?? a.clockedIn) ? 'On Shift' : 'Off Shift'}
          </Text>
        </Box>
      ),
    },
    {
      key: 'workload',
      header: 'Load',
      render: (a) => {
        const capacity = a.slotLimit ?? a.maxCapacity ?? 5;
        const load     = a.loadCount ?? a.activeOrderCount ?? 0;
        const pct = capacity > 0 ? (load / capacity) * 100 : 0;
        const overloaded = load >= capacity;
        return (
          <Box w="120px">
            <Flex justify="space-between" fontSize="xs" mb={1.5} fontWeight="600">
              <Text color={overloaded ? '#EF4444' : headClr}>{load}</Text>
              <Text color={subClr}>/ {capacity}</Text>
            </Flex>
            <Progress
              value={pct}
              size="sm"
              colorScheme={overloaded ? 'red' : 'brand'}
              borderRadius="full"
              bg={useColorModeValue('#E2E8F0', '#334155')}
            />
          </Box>
        );
      },
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
          Fleet Management
        </Heading>
        <Text mt={1} fontSize="sm" color={subClr} fontWeight="500">
          Monitor agent availability, zone assignments, and order load
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
          <DataTable columns={columns} data={agents} isLoading={isLoading} />
        </CardBody>
      </Card>
    </Box>
  );
}