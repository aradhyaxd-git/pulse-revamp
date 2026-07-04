// Sidebar — always deep navy regardless of color mode (spatial permanence).
// Jira-inspired: compact nav groups, user footer, electric-blue active state.
import { Box, VStack, Flex, Text, Icon } from '@chakra-ui/react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, MapPin, Users, Settings,
  Activity, ClipboardList, History, Truck, Zap,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

// ─── Color tokens (all hard-coded — sidebar never changes with color mode) ───
const NAVY   = '#0A1628';
const ACTIVE_BG  = 'rgba(0,101,255,0.18)';
const ACTIVE_BORDER = 'rgba(0,101,255,0.45)';
const HOVER_BG   = 'rgba(255,255,255,0.05)';
const MUTED  = 'rgba(255,255,255,0.35)';
const DIM    = 'rgba(255,255,255,0.18)';
const BRIGHT = '#E2E8F0';
const ACCENT = '#4C9AFF';   // sky-blue for active icon
const BORDER = 'rgba(255,255,255,0.06)';

export const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const getLinks = () => {
    switch (user?.role?.toUpperCase()) {
      case 'ADMIN':
        return [
          { group: 'MAIN',
            items: [
              { name: 'Command Center', icon: LayoutDashboard, path: '/admin/dashboard' },
              { name: 'Shipments',      icon: Package,         path: '/admin/orders'    },
              { name: 'Customers',      icon: Users,           path: '/admin/customers' },
            ]
          },
          { group: 'OPERATIONS',
            items: [
              { name: 'Fleet',          icon: Truck,           path: '/admin/agents'    },
              { name: 'Coverage Zones', icon: MapPin,          path: '/admin/zones'     },
              { name: 'Settings',       icon: Settings,        path: '/admin/settings'  },
            ]
          },
        ];
      case 'CUSTOMER':
        return [
          { group: 'MY ACCOUNT',
            items: [
              { name: 'Overview',      icon: LayoutDashboard, path: '/customer/dashboard'      },
              { name: 'New Shipment',  icon: Package,         path: '/customer/orders/create'  },
              { name: 'Shipment Log',  icon: History,         path: '/customer/orders/history' },
            ]
          },
        ];
      case 'AGENT':
        return [
          { group: 'DRIVER HUB',
            items: [
              { name: 'Overview',       icon: LayoutDashboard, path: '/agent/dashboard' },
              { name: 'My Queue',       icon: ClipboardList,   path: '/agent/assigned'  },
              { name: 'Active Run',     icon: Activity,        path: '/agent/active'    },
            ]
          },
        ];
      default:
        return [];
    }
  };

  const navGroups = getLinks();

  const getRoleLabel = () => {
    switch (user?.role?.toUpperCase()) {
      case 'ADMIN':    return 'Admin Console';
      case 'CUSTOMER': return 'Customer Portal';
      case 'AGENT':    return 'Driver Portal';
      default:         return 'Pulse Delivery';
    }
  };

  return (
    <Box
      w="230px"
      h="full"
      bg={NAVY}
      borderRight={`1px solid ${BORDER}`}
      display="flex"
      flexDirection="column"
      flexShrink={0}
    >
      {/* ── Brand Header ─────────────────────────────────────────── */}
      <Flex
        align="center"
        gap={2.5}
        px={4}
        py={4}
        borderBottom={`1px solid ${BORDER}`}
        flexShrink={0}
      >
        <Flex
          w={8}
          h={8}
          align="center"
          justify="center"
          bg="brand.500"
          borderRadius="md"
          flexShrink={0}
          boxShadow="0 0 0 1px rgba(0,101,255,0.6), 0 2px 8px rgba(0,101,255,0.3)"
        >
          <Zap size={16} strokeWidth={2.5} color="white" />
        </Flex>
        <Box>
          <Text
            fontSize="sm"
            fontWeight="800"
            fontFamily="heading"
            color="white"
            lineHeight="1.1"
            letterSpacing="-0.01em"
          >
            Pulse Delivery
          </Text>
          <Text
            fontSize="2xs"
            color={DIM}
            fontWeight="500"
            mt={0.5}
            letterSpacing="0.03em"
          >
            {getRoleLabel()}
          </Text>
        </Box>
      </Flex>

      {/* ── Navigation ───────────────────────────────────────────── */}
      <VStack align="stretch" spacing={0} py={3} flex={1} overflowY="auto">
        {navGroups.map((group) => (
          <Box key={group.group} mb={2}>
            {/* Group label */}
            <Text
              fontSize="2xs"
              color={DIM}
              fontWeight="700"
              letterSpacing="0.09em"
              textTransform="uppercase"
              px={4}
              py={1.5}
              mb={0.5}
            >
              {group.group}
            </Text>

            {group.items.map((link) => {
              const dashboardPaths = ['/admin/dashboard', '/customer/dashboard', '/agent/dashboard'];
              const isActive =
                location.pathname === link.path ||
                (!dashboardPaths.includes(link.path) &&
                  location.pathname.startsWith(link.path));

              return (
                <Flex
                  as={NavLink}
                  key={link.name}
                  to={link.path}
                  align="center"
                  gap={2.5}
                  mx={2}
                  px={3}
                  py={2}
                  borderRadius="md"
                  color={isActive ? BRIGHT : MUTED}
                  bg={isActive ? ACTIVE_BG : 'transparent'}
                  boxShadow={isActive ? `inset 0 0 0 1px ${ACTIVE_BORDER}` : 'none'}
                  _hover={{
                    bg: isActive ? ACTIVE_BG : HOVER_BG,
                    color: BRIGHT,
                    textDecoration: 'none',
                  }}
                  transition="all 0.13s ease"
                  textDecoration="none"
                  style={{ textDecoration: 'none' }}
                  position="relative"
                >
                  {/* Active left-rail indicator */}
                  {isActive && (
                    <Box
                      position="absolute"
                      left={0}
                      top="20%"
                      bottom="20%"
                      w="3px"
                      bg="brand.400"
                      borderRadius="full"
                    />
                  )}
                  <Icon
                    as={link.icon}
                    boxSize={4}
                    color={isActive ? ACCENT : 'rgba(255,255,255,0.32)'}
                    strokeWidth={isActive ? 2.5 : 2}
                    flexShrink={0}
                  />
                  <Text
                    fontSize="sm"
                    fontWeight={isActive ? '600' : '400'}
                    lineHeight="1"
                    letterSpacing="0"
                  >
                    {link.name}
                  </Text>
                </Flex>
              );
            })}
          </Box>
        ))}
      </VStack>

      {/* ── Footer — user + status ─────────────────────────────── */}
      <Box
        px={3}
        py={3}
        borderTop={`1px solid ${BORDER}`}
        flexShrink={0}
      >
        <Flex align="center" gap={2} px={1}>
          <Box
            w={2}
            h={2}
            borderRadius="full"
            bg="#22C55E"
            boxShadow="0 0 6px rgba(34,197,94,0.55)"
            flexShrink={0}
          />
          <Text fontSize="xs" color="rgba(255,255,255,0.3)" fontWeight="500">
            All systems operational
          </Text>
        </Flex>
      </Box>
    </Box>
  );
};