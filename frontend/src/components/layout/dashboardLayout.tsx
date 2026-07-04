import { Box, Flex, useColorModeValue } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './sidebar';
import { TopNav } from './topNav';

export default function DashboardLayout() {
  const bg = useColorModeValue('#F4F5F7', '#0B1121');

  return (
    <Flex h="100dvh" overflow="hidden" bg={bg}>
      {/* Sidebar — always dark navy, hidden on mobile */}
      <Box display={{ base: 'none', md: 'flex' }} flexShrink={0} zIndex={10}>
        <Sidebar />
      </Box>

      {/* Main content column */}
      <Flex flex={1} direction="column" overflow="hidden" minW={0}>
        <TopNav />

        <Box
          as="main"
          flex={1}
          overflowY="auto"
          overflowX="hidden"
          px={{ base: 4, md: 6, lg: 8 }}
          py={{ base: 5, md: 6 }}
        >
          <Box maxW="1400px" mx="auto">
            <Outlet />
          </Box>
        </Box>
      </Flex>
    </Flex>
  );
}