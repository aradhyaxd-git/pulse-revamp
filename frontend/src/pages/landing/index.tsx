import {
  Box, Flex, Text, Heading, Button, SimpleGrid, VStack,
  HStack, Badge, useColorModeValue, Container, Icon,
  chakra, shouldForwardProp,
} from '@chakra-ui/react';
import { isValidMotionProp, motion } from 'framer-motion';
import {
  Zap, Package, MapPin, Clock, Shield, TrendingUp,
  ArrowRight, CheckCircle, Truck, BarChart3, Globe,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

// Chakra + Framer Motion bridge
const MotionBox = chakra(motion.div, {
  shouldForwardProp: (p) => isValidMotionProp(p) || shouldForwardProp(p),
});

const features = [
  {
    icon: MapPin,
    title: 'Live Shipment Tracking',
    desc: 'Real-time stage-by-stage visibility on every parcel. Customers, agents, and admins always in sync.',
    color: '#0065FF',
    bg: 'rgba(0,101,255,0.1)',
  },
  {
    icon: Zap,
    title: 'Instant Assignment',
    desc: 'Smart auto-assignment picks the nearest available agent the moment an order is placed.',
    color: '#00B8D9',
    bg: 'rgba(0,184,217,0.1)',
  },
  {
    icon: BarChart3,
    title: 'Command Center',
    desc: 'Admin dashboard with live revenue, fleet status, and zone-level performance metrics.',
    color: '#7B61FF',
    bg: 'rgba(123,97,255,0.1)',
  },
  {
    icon: Shield,
    title: 'Verified Agents',
    desc: 'Zone-based agent management with shift tracking, workload limits, and audit trails.',
    color: '#00875A',
    bg: 'rgba(0,135,90,0.1)',
  },
  {
    icon: Globe,
    title: 'Multi-Zone Coverage',
    desc: 'Configurable pincode-to-zone mapping with dynamic pricing matrices per zone pair.',
    color: '#FF7452',
    bg: 'rgba(255,116,82,0.1)',
  },
  {
    icon: TrendingUp,
    title: 'Smart Pricing',
    desc: 'Automated charge calculation based on weight, volume, zone distance, and COD fees.',
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.1)',
  },
];

const steps = [
  { num: '01', title: 'Book a Shipment', desc: 'Customer creates an order with pickup & drop details. Pricing is calculated instantly.' },
  { num: '02', title: 'Agent Assigned', desc: 'Nearest available agent is auto-assigned. Customer gets notified in real time.' },
  { num: '03', title: 'Track & Deliver', desc: 'Live stage updates from Picked Up → In Transit → Delivered with full audit history.' },
];

const stats = [
  { value: '99.2%', label: 'Delivery Success Rate' },
  { value: '<2min', label: 'Avg. Assignment Time' },
  { value: '8 Zones', label: 'Coverage Areas' },
  { value: '24/7', label: 'Platform Uptime' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // If already logged in, redirect to their dashboard
  const handleGetStarted = () => {
    if (user) {
      navigate(`/${user.role}/dashboard`);
    } else {
      navigate('/register');
    }
  };

  return (
    <Box bg="#0A1628" minH="100vh" color="white" overflowX="hidden">

      {/* ── Navbar ─────────────────────────────────────────────── */}
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        zIndex={100}
        borderBottom="1px solid rgba(255,255,255,0.07)"
        backdropFilter="blur(20px)"
        bg="rgba(10,22,40,0.85)"
      >
        <Container maxW="7xl">
          <Flex h="64px" align="center" justify="space-between">
            {/* Logo */}
            <Flex align="center" gap={2.5}>
              <Flex
                w={8} h={8} align="center" justify="center"
                bg="#0065FF" borderRadius="md"
                boxShadow="0 0 20px rgba(0,101,255,0.5)"
              >
                <Zap size={16} strokeWidth={2.5} color="white" />
              </Flex>
              <Text fontWeight="800" fontSize="lg" fontFamily="heading" letterSpacing="-0.01em">
                Pulse Delivery
              </Text>
            </Flex>

            {/* Nav actions */}
            <HStack spacing={3}>
              <Button
                variant="ghost"
                size="sm"
                color="rgba(255,255,255,0.7)"
                fontWeight="600"
                _hover={{ color: 'white', bg: 'rgba(255,255,255,0.06)' }}
                onClick={() => navigate('/login')}
              >
                Sign In
              </Button>
              <Button
                size="sm"
                bg="#0065FF"
                color="white"
                fontWeight="700"
                px={5}
                _hover={{ bg: '#0052CC', transform: 'translateY(-1px)', boxShadow: '0 4px 20px rgba(0,101,255,0.4)' }}
                _active={{ bg: '#003D99' }}
                transition="all 0.15s"
                onClick={handleGetStarted}
              >
                Get Started
              </Button>
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <Box pt="120px" pb="100px" position="relative" overflow="hidden">
        {/* Background glows */}
        <Box position="absolute" top="-200px" left="50%" transform="translateX(-50%)"
          w="900px" h="600px" bg="radial-gradient(ellipse, rgba(0,101,255,0.18) 0%, transparent 70%)"
          pointerEvents="none" />
        <Box position="absolute" bottom="-100px" right="-200px"
          w="600px" h="600px" bg="radial-gradient(ellipse, rgba(123,97,255,0.12) 0%, transparent 70%)"
          pointerEvents="none" />

        <Container maxW="6xl" position="relative">
          <VStack spacing={6} textAlign="center">
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 } as any}
            >
              <Badge
                bg="rgba(0,101,255,0.15)"
                color="#4C9AFF"
                border="1px solid rgba(0,101,255,0.3)"
                px={4} py={1.5}
                borderRadius="full"
                fontSize="xs"
                fontWeight="700"
                letterSpacing="0.08em"
                textTransform="uppercase"
              >
                ⚡ Last-Mile Delivery Platform
              </Badge>
            </MotionBox>

            <MotionBox
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 } as any}
            >
              <Heading
                fontFamily="heading"
                fontWeight="900"
                fontSize={{ base: '4xl', md: '6xl', lg: '7xl' }}
                lineHeight="1.05"
                letterSpacing="-0.03em"
                maxW="800px"
              >
                Deliveries that move at{' '}
                <Text
                  as="span"
                  bgGradient="linear(to-r, #4C9AFF, #7B61FF)"
                  bgClip="text"
                >
                  pulse speed.
                </Text>
              </Heading>
            </MotionBox>

            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 } as any}
            >
              <Text
                fontSize={{ base: 'md', md: 'xl' }}
                color="rgba(255,255,255,0.55)"
                maxW="560px"
                lineHeight="1.7"
              >
                A unified platform for customers, delivery agents, and operations teams.
                Book, track, and manage shipments — all in one place.
              </Text>
            </MotionBox>

            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 } as any}
            >
              <HStack spacing={3} flexWrap="wrap" justify="center">
                <Button
                  size="lg"
                  bg="#0065FF"
                  color="white"
                  fontWeight="700"
                  px={8}
                  h="52px"
                  fontSize="md"
                  rightIcon={<ArrowRight size={18} />}
                  _hover={{ bg: '#0052CC', transform: 'translateY(-2px)', boxShadow: '0 8px 30px rgba(0,101,255,0.45)' }}
                  transition="all 0.2s"
                  onClick={handleGetStarted}
                >
                  Start Shipping Free
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  color="rgba(255,255,255,0.7)"
                  fontWeight="600"
                  px={8}
                  h="52px"
                  fontSize="md"
                  border="1px solid rgba(255,255,255,0.12)"
                  _hover={{ bg: 'rgba(255,255,255,0.06)', color: 'white' }}
                  transition="all 0.2s"
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </Button>
              </HStack>
            </MotionBox>

            {/* Trust badges */}
            <HStack spacing={6} pt={2} flexWrap="wrap" justify="center">
              {['No credit card required', 'Free to get started', 'All roles included'].map(t => (
                <HStack key={t} spacing={1.5}>
                  <CheckCircle size={14} color="#00875A" />
                  <Text fontSize="xs" color="rgba(255,255,255,0.45)" fontWeight="500">{t}</Text>
                </HStack>
              ))}
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* ── Stats Bar ──────────────────────────────────────────── */}
      <Box borderTop="1px solid rgba(255,255,255,0.06)" borderBottom="1px solid rgba(255,255,255,0.06)"
        bg="rgba(255,255,255,0.02)" py={8}>
        <Container maxW="5xl">
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
            {stats.map(s => (
              <VStack key={s.label} spacing={1} textAlign="center">
                <Text fontFamily="heading" fontWeight="900" fontSize="3xl" color="#4C9AFF"
                  letterSpacing="-0.02em">
                  {s.value}
                </Text>
                <Text fontSize="xs" color="rgba(255,255,255,0.4)" fontWeight="600"
                  textTransform="uppercase" letterSpacing="0.07em">
                  {s.label}
                </Text>
              </VStack>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* ── Features Grid ──────────────────────────────────────── */}
      <Box py="90px">
        <Container maxW="7xl">
          <VStack spacing={3} textAlign="center" mb={14}>
            <Text fontSize="xs" fontWeight="700" color="#4C9AFF" letterSpacing="0.1em"
              textTransform="uppercase">
              Everything you need
            </Text>
            <Heading fontFamily="heading" fontWeight="800" fontSize={{ base: '3xl', md: '4xl' }}
              letterSpacing="-0.02em" maxW="500px">
              Built for every role in the chain.
            </Heading>
            <Text color="rgba(255,255,255,0.45)" fontSize="md" maxW="440px" lineHeight="1.7">
              Whether you're shipping, driving, or running operations — Pulse has a purpose-built view for you.
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={5}>
            {features.map((f, i) => (
              <MotionBox
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07 } as any}
              >
                <Box
                  bg="rgba(255,255,255,0.03)"
                  border="1px solid rgba(255,255,255,0.07)"
                  borderRadius="xl"
                  p={6}
                  h="full"
                  _hover={{
                    bg: 'rgba(255,255,255,0.055)',
                    borderColor: 'rgba(255,255,255,0.13)',
                    transform: 'translateY(-3px)',
                    boxShadow: `0 12px 40px ${f.color}22`,
                  }}
                  transition="all 0.2s"
                  cursor="default"
                >
                  <Box
                    w={10} h={10} borderRadius="lg" bg={f.bg}
                    display="flex" alignItems="center" justifyContent="center" mb={4}
                  >
                    <f.icon size={20} color={f.color} strokeWidth={2} />
                  </Box>
                  <Text fontWeight="700" fontSize="md" mb={2} fontFamily="heading">
                    {f.title}
                  </Text>
                  <Text color="rgba(255,255,255,0.45)" fontSize="sm" lineHeight="1.7">
                    {f.desc}
                  </Text>
                </Box>
              </MotionBox>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* ── How It Works ───────────────────────────────────────── */}
      <Box py="80px" bg="rgba(255,255,255,0.015)"
        borderTop="1px solid rgba(255,255,255,0.06)" borderBottom="1px solid rgba(255,255,255,0.06)">
        <Container maxW="6xl">
          <VStack spacing={3} textAlign="center" mb={14}>
            <Text fontSize="xs" fontWeight="700" color="#4C9AFF" letterSpacing="0.1em"
              textTransform="uppercase">
              How it works
            </Text>
            <Heading fontFamily="heading" fontWeight="800" fontSize={{ base: '3xl', md: '4xl' }}
              letterSpacing="-0.02em">
              Three steps. Zero friction.
            </Heading>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} position="relative">
            {steps.map((s, i) => (
              <Box key={s.num} textAlign={{ base: 'left', md: 'center' }} position="relative">
                <Text
                  fontFamily="heading" fontWeight="900" fontSize="5xl"
                  color="rgba(0,101,255,0.15)" lineHeight="1" mb={4} letterSpacing="-0.03em"
                >
                  {s.num}
                </Text>
                <Text fontWeight="700" fontSize="lg" fontFamily="heading" mb={2}>{s.title}</Text>
                <Text color="rgba(255,255,255,0.45)" fontSize="sm" lineHeight="1.7">{s.desc}</Text>
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* ── CTA Banner ─────────────────────────────────────────── */}
      <Box py="90px">
        <Container maxW="4xl">
          <Box
            bg="linear-gradient(135deg, rgba(0,101,255,0.15) 0%, rgba(123,97,255,0.15) 100%)"
            border="1px solid rgba(0,101,255,0.25)"
            borderRadius="2xl"
            p={{ base: 8, md: 14 }}
            textAlign="center"
            position="relative"
            overflow="hidden"
          >
            <Box position="absolute" top="-50%" left="50%" transform="translateX(-50%)"
              w="400px" h="300px"
              bg="radial-gradient(ellipse, rgba(0,101,255,0.2) 0%, transparent 70%)"
              pointerEvents="none" />
            <VStack spacing={5} position="relative">
              <Heading fontFamily="heading" fontWeight="800"
                fontSize={{ base: '2xl', md: '4xl' }} letterSpacing="-0.02em">
                Ready to move faster?
              </Heading>
              <Text color="rgba(255,255,255,0.55)" fontSize="md" maxW="380px" lineHeight="1.7">
                Join Pulse Delivery today. Set up your account in under 2 minutes.
              </Text>
              <HStack spacing={3}>
                <Button
                  size="lg" bg="#0065FF" color="white" fontWeight="700"
                  px={8} h="52px" fontSize="md"
                  rightIcon={<ArrowRight size={16} />}
                  _hover={{ bg: '#0052CC', transform: 'translateY(-2px)', boxShadow: '0 8px 30px rgba(0,101,255,0.45)' }}
                  transition="all 0.2s"
                  onClick={handleGetStarted}
                >
                  Get Started Free
                </Button>
                <Button
                  size="lg" variant="ghost" color="rgba(255,255,255,0.65)"
                  fontWeight="600" px={6} h="52px"
                  border="1px solid rgba(255,255,255,0.12)"
                  _hover={{ bg: 'rgba(255,255,255,0.06)', color: 'white' }}
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </Button>
              </HStack>
            </VStack>
          </Box>
        </Container>
      </Box>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <Box borderTop="1px solid rgba(255,255,255,0.06)" py={8}>
        <Container maxW="7xl">
          <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
            <Flex align="center" gap={2}>
              <Flex w={6} h={6} align="center" justify="center" bg="#0065FF" borderRadius="sm">
                <Zap size={12} strokeWidth={2.5} color="white" />
              </Flex>
              <Text fontSize="sm" fontWeight="700" fontFamily="heading" color="rgba(255,255,255,0.6)">
                Pulse Delivery
              </Text>
            </Flex>
            <Text fontSize="xs" color="rgba(255,255,255,0.25)">
              © 2025 Pulse Delivery. All rights reserved.
            </Text>
            <HStack spacing={4}>
              <Button variant="ghost" size="xs" color="rgba(255,255,255,0.35)"
                _hover={{ color: 'white' }} onClick={() => navigate('/login')}>
                Sign In
              </Button>
              <Button variant="ghost" size="xs" color="rgba(255,255,255,0.35)"
                _hover={{ color: 'white' }} onClick={() => navigate('/register')}>
                Register
              </Button>
            </HStack>
          </Flex>
        </Container>
      </Box>

    </Box>
  );
}
