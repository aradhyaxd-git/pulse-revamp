import {
  Flex, IconButton, useColorMode, Menu, MenuButton,
  MenuList, MenuItem, Avatar, Text, Box, useColorModeValue, Divider,
} from '@chakra-ui/react';
import { Moon, Sun, LogOut, ChevronDown, Bell } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useLocation } from 'react-router-dom';

const ROUTE_LABELS: Record<string, string> = {
  // Admin
  '/admin/dashboard': 'Command Center',
  '/admin/orders':    'Shipment Management',
  '/admin/agents':    'Fleet Management',
  '/admin/zones':     'Coverage Zones',
  '/admin/settings':  'Platform Settings',
  '/admin/customers': 'Customer Accounts',
  // Customer
  '/customer/dashboard':     'Overview',
  '/customer/orders/create': 'New Shipment',
  '/customer/orders/history':'Shipment Log',
  // Agent
  '/agent/dashboard': 'Driver Overview',
  '/agent/assigned':  'My Queue',
  '/agent/active':    'Active Run',
};

export const TopNav = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { user, logout } = useAuth();
  const location = useLocation();

  const bg        = useColorModeValue('white', 'rgba(13,21,38,0.85)');
  const border    = useColorModeValue('#DFE1E6', 'rgba(99,130,255,0.15)');
  const titleClr  = useColorModeValue('#172B4D', '#E2E8F0');
  const subClr    = useColorModeValue('#5E6C84', '#64748B');
  const iconHover = useColorModeValue('rgba(9,30,66,0.06)', 'rgba(99,130,255,0.12)');
  const menuBorder= useColorModeValue('#DFE1E6', 'rgba(99,130,255,0.15)');

  const pageLabel = ROUTE_LABELS[location.pathname]
    ?? (location.pathname.includes('/orders/') ? 'Shipment Details' : 'Overview');

  const roleColor = () => {
    switch (user?.role?.toLowerCase()) {
      case 'admin':    return '#0065FF';
      case 'agent':    return '#10B981';
      case 'customer': return '#F59E0B';
      default:         return '#8993A4';
    }
  };

  const roleLabel = () => {
    switch (user?.role?.toLowerCase()) {
      case 'admin':    return 'Administrator';
      case 'agent':    return 'Delivery Agent';
      case 'customer': return 'Customer';
      default:         return user?.role ?? '';
    }
  };

  return (
    <Flex
      px={{ base: 4, md: 6 }}
      h="56px"
      align="center"
      justify="space-between"
      bg={bg}
      backdropFilter="blur(12px)"
      borderBottom="1px solid"
      borderColor={border}
      flexShrink={0}
    >
      {/* Left — Page title */}
      <Box>
        <Text
          fontFamily="heading"
          fontWeight="700"
          fontSize="md"
          color={titleClr}
          letterSpacing="-0.01em"
          lineHeight="1"
        >
          {pageLabel}
        </Text>
      </Box>

      {/* Right — Actions */}
      <Flex align="center" gap={1}>
        {/* Dark mode toggle */}
        <IconButton
          aria-label="Toggle color mode"
          icon={colorMode === 'light'
            ? <Moon size={16} strokeWidth={2} />
            : <Sun  size={16} strokeWidth={2} />
          }
          onClick={toggleColorMode}
          variant="ghost"
          size="sm"
          borderRadius="md"
          color={subClr}
          _hover={{ bg: iconHover, color: titleClr }}
        />

        {/* Notifications bell */}
        <IconButton
          aria-label="Notifications"
          icon={<Bell size={16} strokeWidth={2} />}
          variant="ghost"
          size="sm"
          borderRadius="md"
          color={subClr}
          _hover={{ bg: iconHover, color: titleClr }}
        />

        <Box w="1px" h={5} bg={border} mx={1} />

        {/* User menu */}
        <Menu placement="bottom-end">
          <MenuButton>
            <Flex
              align="center"
              gap={2}
              px={2}
              py={1.5}
              borderRadius="md"
              border="1px solid"
              borderColor={menuBorder}
              _hover={{ bg: iconHover }}
              transition="all 0.13s"
              cursor="pointer"
            >
              <Avatar
                size="xs"
                name={user?.name}
                bg={roleColor()}
                color="white"
                fontWeight="700"
                w={6}
                h={6}
                fontSize="xs"
              />
              <Box display={{ base: 'none', md: 'block' }} textAlign="left">
                <Text
                  fontSize="xs"
                  fontWeight="600"
                  color={titleClr}
                  lineHeight="1.2"
                >
                  {user?.name}
                </Text>
                <Text
                  fontSize="2xs"
                  color={subClr}
                  lineHeight="1.2"
                >
                  {roleLabel()}
                </Text>
              </Box>
              <ChevronDown size={12} color={subClr} />
            </Flex>
          </MenuButton>

          <MenuList minW="180px" py={1.5}>
            <Box px={3} py={2}>
              <Text fontSize="xs" fontWeight="700" color={titleClr}>{user?.name}</Text>
              <Text fontSize="xs" color={subClr}>{user?.email}</Text>
            </Box>
            <Divider borderColor={menuBorder} my={1} />
            <MenuItem
              icon={<LogOut size={13} />}
              color="red.500"
              onClick={logout}
              fontSize="sm"
              fontWeight="500"
              _hover={{ bg: 'red.50', _dark: { bg: 'rgba(244,63,94,0.1)' } }}
            >
              Sign Out
            </MenuItem>
          </MenuList>
        </Menu>
      </Flex>
    </Flex>
  );
};