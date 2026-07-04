// Sidebar — indigo-blue brand gradient, matching auth page left panel.
import { Box, VStack, Flex, Text, Icon } from '@chakra-ui/react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, MapPin, Users, Settings,
  Activity, ClipboardList, History, Truck, Zap,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

// ─── Color tokens ──────────────────────────────────────────────────────────────
const ACTIVE_BG     = 'rgba(255,255,255,0.14)';
const ACTIVE_BORDER = 'rgba(255,255,255,0.25)';
const HOVER_BG      = 'rgba(255,255,255,0.07)';
const MUTED         = 'rgba(255,255,255,0.45)';
const DIM           = 'rgba(255,255,255,0.28)';
const BRIGHT        = '#ffffff';
const ACCENT        = '#93C5FD';   // light-blue for active icon
const BORDER        = 'rgba(255,255,255,0.1)';

export const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const getLinks = () => {
    switch (user?.role?.toUpperCase()) {
      case 'ADMIN':
        return [
          {
            group: 'MAIN',
            items: [
              { name: 'Command Center', icon: LayoutDashboard, path: '/admin/dashboard' },
              { name: 'Shipments',      icon: Package,         path: '/admin/orders'    },
              { name: 'Customers',      icon: Users,           path: '/admin/customers' },
            ],
          },
          {
            group: 'OPERATIONS',
            items: [
              { name: 'Fleet',          icon: Truck,    path: '/admin/agents'   },
              { name: 'Coverage Zones', icon: MapPin,   path: '/admin/zones'    },
              { name: 'Settings',       icon: Settings, path: '/admin/settings' },
            ],
          },
        ];
      case 'CUSTOMER':
        return [
          {
            group: 'MY ACCOUNT',
            items: [
              { name: 'Overview',     icon: LayoutDashboard, path: '/customer/dashboard'      },
              { name: 'New Shipment', icon: Package,         path: '/customer/orders/create'  },
              { name: 'Shipment Log', icon: History,         path: '/customer/orders/history' },
            ],
          },
        ];
      case 'AGENT':
        return [
          {
            group: 'DRIVER HUB',
            items: [
              { name: 'Overview',   icon: LayoutDashboard, path: '/agent/dashboard' },
              { name: 'My Queue',   icon: ClipboardList,   path: '/agent/assigned'  },
              { name: 'Active Run', icon: Activity,        path: '/agent/active'    },
            ],
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
      position="relative"
      overflow="hidden"
      display="flex"
      flexDirection="column"
      flexShrink={0}
      borderRight={`1px solid ${BORDER}`}
      // Indigo gradient — same as auth left panel
      bg="linear-gradient(160deg, #1A3FBF 0%, #0D1E8A 45%, #060D3A 100%)"
    >
      {/* Grid texture overlay */}
      <Box
        position="absolute" inset={0} opacity={0.04} pointerEvents="none" zIndex={0}
        backgroundImage="linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)"
        backgroundSize="28px 28px"
      />
      {/* Top glow */}
      <Box
        position="absolute" top="-60px" right="-60px"
        w="220px" h="220px"
        bg="rgba(99,130,255,0.3)" filter="blur(80px)"
        borderRadius="full" pointerEvents="none" zIndex={0}
      />
      {/* Bottom glow */}
      <Box
        position="absolute" bottom="-40px" left="-40px"
        w="180px" h="180px"
        bg="rgba(60,80,220,0.2)" filter="blur(70px)"
        borderRadius="full" pointerEvents="none" zIndex={0}
      />

      {/* ── Brand Header ──────────────────────────────────────────── */}
      <Flex
        align="center" gap={2.5}
        px={4} py={4}
        borderBottom={`1px solid ${BORDER}`}
        flexShrink={0} position="relative" zIndex={1}
      >
        <Flex
          w={8} h={8} align="center" justify="center"
          bg="rgba(255,255,255,0.15)"
          border="1px solid rgba(255,255,255,0.25)"
          borderRadius="md" flexShrink={0}
        >
          <Zap size={16} strokeWidth={2.5} color="white" />
        </Flex>
        <Box>
          <Text
            fontSize="sm" fontWeight="800" fontFamily="heading"
            color="white" lineHeight="1.1" letterSpacing="-0.01em"
          >
            Pulse Delivery
          </Text>
          <Text fontSize="2xs" color={DIM} fontWeight="500" mt={0.5} letterSpacing="0.03em">
            {getRoleLabel()}
          </Text>
        </Box>
      </Flex>

      {/* ── Navigation ────────────────────────────────────────────── */}
      <VStack align="stretch" spacing={0} py={3} flex={1} overflowY="auto" position="relative" zIndex={1}>
        {navGroups.map((group) => (
          <Box key={group.group} mb={2}>
            <Text
              fontSize="2xs" color={DIM} fontWeight="700"
              letterSpacing="0.1em" textTransform="uppercase"
              px={4} py={1.5} mb={0.5}
            >
              {group.group}
            </Text>

            {group.items.map((link) => {
              const dashboardPaths = ['/admin/dashboard', '/customer/dashboard', '/agent/dashboard'];
              const isActive =
                location.pathname === link.path ||
                (!dashboardPaths.includes(link.path) && location.pathname.startsWith(link.path));

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
                  borderRadius="lg"
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
                      position="absolute" left={0}
                      top="20%" bottom="20%"
                      w="3px" bg="#93C5FD"
                      borderRadius="full"
                    />
                  )}
                  <Icon
                    as={link.icon}
                    boxSize={4}
                    color={isActive ? ACCENT : 'rgba(255,255,255,0.35)'}
                    strokeWidth={isActive ? 2.5 : 2}
                    flexShrink={0}
                  />
                  <Text
                    fontSize="sm"
                    fontWeight={isActive ? '700' : '400'}
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

      {/* ── Footer — status ───────────────────────────────────────── */}
      <Box
        px={3} py={3}
        borderTop={`1px solid ${BORDER}`}
        flexShrink={0} position="relative" zIndex={1}
      >
        <Flex align="center" gap={2} px={1}>
          <Box
            w={2} h={2} borderRadius="full"
            bg="#4ADE80"
            boxShadow="0 0 8px rgba(74,222,128,0.6)"
            flexShrink={0}
          />
          <Text fontSize="xs" color="rgba(255,255,255,0.35)" fontWeight="500">
            All systems operational
          </Text>
        </Flex>
      </Box>
    </Box>
  );
};