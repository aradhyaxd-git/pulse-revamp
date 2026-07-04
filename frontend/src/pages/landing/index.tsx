import { motion, useReducedMotion } from 'framer-motion';
import {
  Box, Flex, Text, Heading, Button, SimpleGrid, VStack, HStack,
  Container, useColorModeValue, useColorMode, IconButton,
} from '@chakra-ui/react';
import {
  Zap, Package, MapPin, Shield, TrendingUp, ArrowRight,
  Truck, BarChart3, Clock, CheckCircle, Sun, Moon, ChevronRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

// ── Motion helpers ──────────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] },
});

// ── Data ────────────────────────────────────────────────────────────────────
const STATS = [
  { value: '99.2%', label: 'Delivery success rate' },
  { value: '<2 min', label: 'Avg. assignment time' },
  { value: '8', label: 'Coverage zones' },
  { value: '24/7', label: 'Platform uptime' },
];

const FEATURES = [
  {
    icon: BarChart3,
    title: 'Live Command Centre',
    desc: 'Real-time metrics across every order, agent, zone, and revenue stream. Nothing is hidden.',
    accent: '#1A3FBF',
    size: 'large', // spans 2 cols
  },
  {
    icon: Zap,
    title: 'Instant Assignment',
    desc: 'Nearest on-shift agent auto-assigned the moment an order is confirmed.',
    accent: '#0D2AE0',
    size: 'small',
  },
  {
    icon: MapPin,
    title: 'Zone-Based Routing',
    desc: 'Pincode-to-zone mapping with per-route dynamic pricing matrices.',
    accent: '#4F46E5',
    size: 'small',
  },
  {
    icon: Shield,
    title: 'Verified Agent Network',
    desc: 'Shift-tracked, workload-limited agents with full audit trails.',
    accent: '#1A3FBF',
    size: 'small',
  },
  {
    icon: TrendingUp,
    title: 'Smart Pricing Engine',
    desc: 'Auto-calculates charge from weight, volume, zone distance and COD fees — server-side, always accurate.',
    accent: '#0D2AE0',
    size: 'large', // spans 2 cols
  },
];

const STEPS = [
  {
    num: '01',
    icon: Package,
    title: 'Book a Shipment',
    desc: 'Customer creates an order. Pickup & drop pincodes resolve to zones. Pricing is calculated instantly — no manual quoting.',
  },
  {
    num: '02',
    icon: Truck,
    title: 'Agent Auto-Assigned',
    desc: 'Nearest available on-shift agent gets assigned. Workload balanced automatically. Customer notified in real time.',
  },
  {
    num: '03',
    icon: CheckCircle,
    title: 'Track to Doorstep',
    desc: 'Live stage updates: Picked Up → In Transit → Out for Delivery → Delivered. Full immutable history preserved.',
  },
];

const ROLES = [
  {
    role: 'Customer',
    icon: Package,
    headline: 'Ship with confidence.',
    bullets: ['Instant price quotes', 'Real-time tracking', 'Reschedule failed deliveries'],
    cta: 'Start Shipping',
    path: '/register',
    accent: '#1A3FBF',
  },
  {
    role: 'Delivery Agent',
    icon: Truck,
    headline: 'Drive your own schedule.',
    bullets: ['Shift clock-in/out', 'Assigned run queue', 'Live order updates'],
    cta: 'Join as Agent',
    path: '/register',
    accent: '#0D2AE0',
  },
  {
    role: 'Operations Admin',
    icon: BarChart3,
    headline: 'Command the whole network.',
    bullets: ['Fleet & zone management', 'Rate card configuration', 'Customer & order oversight'],
    cta: 'Request Access',
    path: '/login',
    accent: '#4F46E5',
  },
];

export default function LandingPage() {
  const navigate    = useNavigate();
  const { user }    = useAuth();
  const { colorMode, toggleColorMode } = useColorMode();
  const reduce      = useReducedMotion();

  const handleGetStarted = () => navigate(user ? `/${user.role}/dashboard` : '/register');

  // ── Color tokens (light / dark consistent with auth pages) ────────────────
  const pageBg      = useColorModeValue('#F5F7FF', '#07101F');
  const navBg       = useColorModeValue('rgba(245,247,255,0.88)', 'rgba(7,16,31,0.88)');
  const navBorder   = useColorModeValue('rgba(26,63,191,0.1)', 'rgba(99,130,255,0.12)');
  const headingClr  = useColorModeValue('#0D1526', '#F1F5F9');
  const bodyClr     = useColorModeValue('#475569', 'rgba(255,255,255,0.5)');
  const cardBg      = useColorModeValue('white', '#111D32');
  const cardBorder  = useColorModeValue('rgba(26,63,191,0.12)', 'rgba(99,130,255,0.14)');
  const sectionAlt  = useColorModeValue('#EEF2FF', '#0C1729');
  const stepLineBg  = useColorModeValue('rgba(26,63,191,0.15)', 'rgba(99,130,255,0.15)');
  const numClr      = useColorModeValue('rgba(26,63,191,0.12)', 'rgba(99,130,255,0.12)');
  const dimText     = useColorModeValue('#94A3B8', 'rgba(255,255,255,0.25)');
  const statBg      = useColorModeValue('white', '#0E1A2E');
  const statBorder  = useColorModeValue('rgba(26,63,191,0.15)', 'rgba(99,130,255,0.15)');
  const iconHover   = useColorModeValue('rgba(26,63,191,0.08)', 'rgba(99,130,255,0.1)');

  return (
    <Box bg={pageBg} minH="100dvh" overflowX="hidden">

      {/* ── Navbar ──────────────────────────────────────────────────────── */}
      <Box
        position="fixed" top={0} left={0} right={0} zIndex={100}
        bg={navBg} backdropFilter="blur(16px)"
        borderBottom="1px solid" borderColor={navBorder}
      >
        <Container maxW="7xl">
          <Flex h="64px" align="center" justify="space-between">
            <Flex align="center" gap={2.5} cursor="pointer" onClick={() => navigate('/')}>
              <Flex
                w={8} h={8} align="center" justify="center"
                bg="linear-gradient(135deg, #1A3FBF, #0D1E8A)"
                borderRadius="md"
              >
                <Zap size={16} strokeWidth={2.5} color="white" />
              </Flex>
              <Text fontWeight="800" fontSize="md" fontFamily="heading"
                letterSpacing="-0.01em" color={headingClr}>
                Pulse Delivery
              </Text>
            </Flex>

            <HStack spacing={2}>
              <IconButton
                aria-label="Toggle theme"
                icon={colorMode === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                variant="ghost" size="sm" borderRadius="full"
                color={bodyClr}
                _hover={{ bg: iconHover }}
                onClick={toggleColorMode}
              />
              <Button
                variant="ghost" size="sm" fontWeight="600" color={bodyClr}
                _hover={{ bg: iconHover, color: headingClr }}
                onClick={() => navigate('/login')}
              >
                Sign In
              </Button>
              <Button
                size="sm" fontWeight="700" px={5}
                bg="linear-gradient(135deg, #1A3FBF, #0D2AE0)"
                color="white" borderRadius="lg"
                _hover={{ boxShadow: '0 4px 20px rgba(26,63,191,0.45)', transform: 'translateY(-1px)' }}
                _active={{ transform: 'translateY(0)' }}
                transition="all 0.15s"
                onClick={handleGetStarted}
              >
                Get Started
              </Button>
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* ── Hero — LEFT-aligned split ─────────────────────────────────── */}
      <Box pt="96px" pb="80px" position="relative" overflow="hidden">
        {/* Indigo glow bg — top left anchored (not centered blob) */}
        <Box
          position="absolute" top="-120px" left="-80px"
          w="600px" h="600px" borderRadius="full" pointerEvents="none"
          bg="radial-gradient(ellipse, rgba(26,63,191,0.18) 0%, transparent 70%)"
        />
        <Box
          position="absolute" bottom="-80px" right="5%"
          w="400px" h="400px" borderRadius="full" pointerEvents="none"
          bg="radial-gradient(ellipse, rgba(13,42,224,0.1) 0%, transparent 70%)"
        />

        <Container maxW="7xl" position="relative">
          <Flex
            align="center" gap={{ base: 10, lg: 16 }}
            direction={{ base: 'column', lg: 'row' }}
          >
            {/* Left — copy */}
            <Box flex="0 0 auto" maxW={{ base: 'full', lg: '520px' }}>
              <motion.div {...(reduce ? {} : fadeUp(0))}>
                <Flex align="center" gap={2} mb={5}>
                  <Box w={1.5} h={1.5} borderRadius="full"
                    bg="#1A3FBF" boxShadow="0 0 8px rgba(26,63,191,0.8)" />
                  <Text fontSize="xs" fontWeight="700" color="#1A3FBF"
                    textTransform="uppercase" letterSpacing="0.1em">
                    Logistics Platform
                  </Text>
                </Flex>
              </motion.div>

              <motion.div {...(reduce ? {} : fadeUp(0.05))}>
                <Heading
                  fontFamily="heading" fontWeight="900"
                  fontSize={{ base: '4xl', md: '5xl', lg: '6xl' }}
                  lineHeight="1.05" letterSpacing="-0.03em"
                  color={headingClr} mb={5}
                >
                  Deliveries that<br />
                  run at{' '}
                  <Box
                    as="span"
                    bgGradient="linear(to-br, #1A3FBF, #4F46E5)"
                    bgClip="text"
                  >
                    pulse speed.
                  </Box>
                </Heading>
              </motion.div>

              <motion.div {...(reduce ? {} : fadeUp(0.1))}>
                <Text fontSize="lg" color={bodyClr} lineHeight="1.75"
                  mb={8} maxW="440px">
                  One platform for customers who ship, agents who drive,
                  and admins who command the whole network.
                </Text>
              </motion.div>

              <motion.div {...(reduce ? {} : fadeUp(0.15))}>
                <HStack spacing={3} mb={7} flexWrap="wrap">
                  <Button
                    h="50px" px={7} fontWeight="700" fontSize="md"
                    bg="linear-gradient(135deg, #1A3FBF, #0D2AE0)"
                    color="white" borderRadius="xl"
                    rightIcon={<ArrowRight size={18} />}
                    _hover={{
                      boxShadow: '0 8px 30px rgba(26,63,191,0.45)',
                      transform: 'translateY(-2px)',
                    }}
                    _active={{ transform: 'translateY(0)' }}
                    transition="all 0.15s"
                    onClick={handleGetStarted}
                  >
                    Start for free
                  </Button>
                  <Button
                    h="50px" px={6} fontWeight="600" fontSize="md"
                    variant="ghost" borderRadius="xl"
                    border="1.5px solid"
                    borderColor={useColorModeValue('rgba(26,63,191,0.3)', 'rgba(99,130,255,0.3)')}
                    color={useColorModeValue('#1A3FBF', '#93C5FD')}
                    _hover={{ bg: iconHover }}
                    rightIcon={<ChevronRight size={16} />}
                    onClick={() => navigate('/login')}
                  >
                    Sign in
                  </Button>
                </HStack>
              </motion.div>

              <motion.div {...(reduce ? {} : fadeUp(0.2))}>
                <HStack spacing={5} flexWrap="wrap">
                  {['All 3 roles included', 'No credit card needed', 'Open source'].map(t => (
                    <HStack key={t} spacing={1.5}>
                      <CheckCircle size={13} color="#1A3FBF" strokeWidth={2.5} />
                      <Text fontSize="xs" fontWeight="600" color={bodyClr}>{t}</Text>
                    </HStack>
                  ))}
                </HStack>
              </motion.div>
            </Box>

            {/* Right — dashboard screenshot */}
            <Box flex={1} position="relative" display={{ base: 'none', lg: 'block' }}>
              <motion.div
                initial={reduce ? undefined : { opacity: 0, x: 30, scale: 0.97 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Glow behind image */}
                <Box
                  position="absolute" inset="-20px"
                  bg="radial-gradient(ellipse at 60% 50%, rgba(26,63,191,0.25) 0%, transparent 70%)"
                  pointerEvents="none" borderRadius="3xl"
                />
                {/* The frame */}
                <Box
                  borderRadius="2xl"
                  border="1px solid"
                  borderColor={useColorModeValue('rgba(26,63,191,0.2)', 'rgba(99,130,255,0.2)')}
                  overflow="hidden"
                  boxShadow={useColorModeValue(
                    '0 24px 64px rgba(26,63,191,0.18)',
                    '0 24px 64px rgba(0,0,0,0.5)',
                  )}
                  position="relative"
                >
                  {/* Fake browser chrome */}
                  <Box
                    bg={useColorModeValue('#EEF2FF', '#0C1729')}
                    px={4} py={3}
                    borderBottom="1px solid"
                    borderColor={useColorModeValue('rgba(26,63,191,0.1)', 'rgba(99,130,255,0.1)')}
                  >
                    <HStack spacing={2}>
                      <Box w={3} h={3} borderRadius="full" bg="rgba(239,68,68,0.6)" />
                      <Box w={3} h={3} borderRadius="full" bg="rgba(245,158,11,0.6)" />
                      <Box w={3} h={3} borderRadius="full" bg="rgba(34,197,94,0.6)" />
                      <Box
                        flex={1} bg={useColorModeValue('rgba(26,63,191,0.06)', 'rgba(99,130,255,0.08)')}
                        borderRadius="md" h={5} ml={2}
                        border="1px solid"
                        borderColor={useColorModeValue('rgba(26,63,191,0.08)', 'rgba(255,255,255,0.06)')}
                      />
                    </HStack>
                  </Box>
                  <Box as="img"
                    src="/dashboard-preview.png"
                    alt="Pulse Delivery admin dashboard preview"
                    w="full" display="block"
                    style={{ objectFit: 'cover' }}
                  />
                </Box>
              </motion.div>
            </Box>
          </Flex>
        </Container>
      </Box>

      {/* ── Stats strip ─────────────────────────────────────────────────── */}
      <Box py={10} borderTop="1px solid" borderBottom="1px solid"
        borderColor={statBorder} bg={statBg}>
        <Container maxW="5xl">
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={0}>
            {STATS.map((s, i) => (
              <motion.div key={s.label} {...(reduce ? {} : fadeUp(i * 0.05))}>
                <Box
                  textAlign="center" px={4}
                  borderRight={i < STATS.length - 1 ? '1px solid' : 'none'}
                  borderColor={statBorder}
                  py={{ base: 4, md: 0 }}
                >
                  <Text
                    fontFamily="heading" fontWeight="900"
                    fontSize={{ base: '2xl', md: '3xl' }}
                    color="#1A3FBF" letterSpacing="-0.02em" lineHeight="1"
                  >
                    {s.value}
                  </Text>
                  <Text fontSize="xs" fontWeight="600" color={bodyClr}
                    textTransform="uppercase" letterSpacing="0.07em" mt={1.5}>
                    {s.label}
                  </Text>
                </Box>
              </motion.div>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* ── Feature Bento ───────────────────────────────────────────────── */}
      <Box py="90px">
        <Container maxW="7xl">
          <Box mb={14}>
            <motion.div {...(reduce ? {} : fadeUp(0))}>
              <Heading
                fontFamily="heading" fontWeight="900"
                fontSize={{ base: '3xl', md: '4xl' }}
                letterSpacing="-0.02em" color={headingClr}
                mb={3} maxW="480px"
              >
                Everything the network needs.
              </Heading>
              <Text color={bodyClr} fontSize="md" maxW="400px" lineHeight="1.75">
                Purpose-built features for each role — no compromises, no duct tape.
              </Text>
            </motion.div>
          </Box>

          {/* Asymmetric bento: row 1 = large (2col) + small, row 2 = small + small + large (2col) */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>

            {/* Large card 1 — Command Centre */}
            <Box gridColumn={{ md: 'span 2' }}>
              <motion.div {...(reduce ? {} : fadeUp(0.05))} style={{ height: '100%' }}>
                <Box
                  h="full" minH="220px" p={8} borderRadius="2xl"
                  bg="linear-gradient(135deg, #1A3FBF 0%, #0D1E8A 100%)"
                  color="white" position="relative" overflow="hidden"
                  border="1px solid rgba(255,255,255,0.1)"
                  _hover={{ transform: 'translateY(-3px)', boxShadow: '0 20px 60px rgba(26,63,191,0.4)' }}
                  transition="all 0.2s"
                >
                  {/* Grid texture */}
                  <Box
                    position="absolute" inset={0} opacity={0.05} pointerEvents="none"
                    backgroundImage="linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)"
                    backgroundSize="28px 28px"
                  />
                  <Box
                    position="absolute" top="-40px" right="-40px" w="200px" h="200px"
                    bg="rgba(255,255,255,0.08)" borderRadius="full" pointerEvents="none"
                  />
                  <Box position="relative" zIndex={1}>
                    <Flex
                      w={11} h={11} align="center" justify="center"
                      bg="rgba(255,255,255,0.15)" borderRadius="xl"
                      border="1px solid rgba(255,255,255,0.2)" mb={5}
                    >
                      <BarChart3 size={22} color="white" strokeWidth={1.8} />
                    </Flex>
                    <Text fontWeight="800" fontSize="xl" fontFamily="heading" mb={2}>
                      Live Command Centre
                    </Text>
                    <Text color="rgba(255,255,255,0.65)" fontSize="sm" lineHeight="1.7" maxW="360px">
                      Real-time metrics across every order, agent, zone, and revenue stream.
                      Nothing is hidden from the admin.
                    </Text>
                  </Box>
                </Box>
              </motion.div>
            </Box>

            {/* Small card — Instant Assignment */}
            <motion.div {...(reduce ? {} : fadeUp(0.1))} style={{ height: '100%' }}>
              <Box
                h="full" minH="220px" p={7} borderRadius="2xl"
                bg={cardBg} border="1px solid" borderColor={cardBorder}
                _hover={{ borderColor: 'rgba(26,63,191,0.4)', transform: 'translateY(-3px)', boxShadow: useColorModeValue('0 16px 40px rgba(26,63,191,0.12)', '0 16px 40px rgba(0,0,0,0.4)') }}
                transition="all 0.2s"
              >
                <Flex
                  w={10} h={10} align="center" justify="center"
                  bg={useColorModeValue('#EEF2FF', 'rgba(26,63,191,0.18)')}
                  borderRadius="xl" mb={5}
                >
                  <Zap size={20} color="#1A3FBF" strokeWidth={2} />
                </Flex>
                <Text fontWeight="800" fontSize="lg" fontFamily="heading" color={headingClr} mb={2}>
                  Instant Assignment
                </Text>
                <Text color={bodyClr} fontSize="sm" lineHeight="1.7">
                  Nearest on-shift agent assigned automatically. Zero manual dispatch.
                </Text>
              </Box>
            </motion.div>

            {/* Small card — Zone Routing */}
            <motion.div {...(reduce ? {} : fadeUp(0.12))}>
              <Box
                p={7} borderRadius="2xl"
                bg={cardBg} border="1px solid" borderColor={cardBorder}
                _hover={{ borderColor: 'rgba(26,63,191,0.4)', transform: 'translateY(-3px)', boxShadow: useColorModeValue('0 16px 40px rgba(26,63,191,0.12)', '0 16px 40px rgba(0,0,0,0.4)') }}
                transition="all 0.2s"
              >
                <Flex
                  w={10} h={10} align="center" justify="center"
                  bg={useColorModeValue('#EEF2FF', 'rgba(26,63,191,0.18)')}
                  borderRadius="xl" mb={5}
                >
                  <MapPin size={20} color="#1A3FBF" strokeWidth={2} />
                </Flex>
                <Text fontWeight="800" fontSize="lg" fontFamily="heading" color={headingClr} mb={2}>
                  Zone-Based Routing
                </Text>
                <Text color={bodyClr} fontSize="sm" lineHeight="1.7">
                  Pincode-to-zone mapping with dynamic pricing per route pair.
                </Text>
              </Box>
            </motion.div>

            {/* Small card — Verified Agents */}
            <motion.div {...(reduce ? {} : fadeUp(0.14))}>
              <Box
                p={7} borderRadius="2xl"
                bg={cardBg} border="1px solid" borderColor={cardBorder}
                _hover={{ borderColor: 'rgba(26,63,191,0.4)', transform: 'translateY(-3px)', boxShadow: useColorModeValue('0 16px 40px rgba(26,63,191,0.12)', '0 16px 40px rgba(0,0,0,0.4)') }}
                transition="all 0.2s"
              >
                <Flex
                  w={10} h={10} align="center" justify="center"
                  bg={useColorModeValue('#EEF2FF', 'rgba(26,63,191,0.18)')}
                  borderRadius="xl" mb={5}
                >
                  <Shield size={20} color="#1A3FBF" strokeWidth={2} />
                </Flex>
                <Text fontWeight="800" fontSize="lg" fontFamily="heading" color={headingClr} mb={2}>
                  Verified Agents
                </Text>
                <Text color={bodyClr} fontSize="sm" lineHeight="1.7">
                  Shift-tracked, workload-capped agents with complete audit history.
                </Text>
              </Box>
            </motion.div>

            {/* Large card 2 — Smart Pricing */}
            <Box gridColumn={{ md: 'span 2' }}>
              <motion.div {...(reduce ? {} : fadeUp(0.16))} style={{ height: '100%' }}>
                <Box
                  h="full" minH="200px" p={8} borderRadius="2xl"
                  bg={sectionAlt} border="1px solid" borderColor={cardBorder}
                  position="relative" overflow="hidden"
                  _hover={{ borderColor: 'rgba(26,63,191,0.4)', transform: 'translateY(-3px)', boxShadow: useColorModeValue('0 16px 40px rgba(26,63,191,0.12)', '0 16px 40px rgba(0,0,0,0.4)') }}
                  transition="all 0.2s"
                >
                  <Box
                    position="absolute" bottom="-20px" right="-20px"
                    w="140px" h="140px" borderRadius="full" pointerEvents="none"
                    bg="radial-gradient(ellipse, rgba(26,63,191,0.15) 0%, transparent 70%)"
                  />
                  <Flex
                    w={10} h={10} align="center" justify="center"
                    bg={useColorModeValue('#fff', 'rgba(26,63,191,0.18)')}
                    borderRadius="xl" mb={5}
                    border="1px solid" borderColor={cardBorder}
                  >
                    <TrendingUp size={20} color="#1A3FBF" strokeWidth={2} />
                  </Flex>
                  <Text fontWeight="800" fontSize="xl" fontFamily="heading" color={headingClr} mb={2}>
                    Smart Pricing Engine
                  </Text>
                  <Text color={bodyClr} fontSize="sm" lineHeight="1.7" maxW="380px">
                    Auto-calculates charges from weight, volume, zone pair, and COD fees — server-side on every order. No client-side price trust.
                  </Text>
                </Box>
              </motion.div>
            </Box>

          </SimpleGrid>
        </Container>
      </Box>

      {/* ── How It Works — numbered steps ───────────────────────────────── */}
      <Box py="80px" bg={sectionAlt}
        borderTop="1px solid" borderBottom="1px solid" borderColor={statBorder}>
        <Container maxW="6xl">
          <motion.div {...(reduce ? {} : fadeUp(0))}>
            <Heading
              fontFamily="heading" fontWeight="900"
              fontSize={{ base: '3xl', md: '4xl' }}
              color={headingClr} letterSpacing="-0.02em"
              mb={2}
            >
              Three steps. Zero friction.
            </Heading>
            <Text color={bodyClr} fontSize="md" mb={14}>
              From booking to doorstep — the whole flow is automated.
            </Text>
          </motion.div>

          <Flex
            direction={{ base: 'column', md: 'row' }}
            gap={0} position="relative"
          >
            {/* Connecting line behind steps */}
            <Box
              display={{ base: 'none', md: 'block' }}
              position="absolute" top="28px" left="60px" right="60px" h="1px"
              bg={stepLineBg} zIndex={0}
            />

            {STEPS.map((s, i) => (
              <motion.div
                key={s.num}
                style={{ flex: 1 }}
                {...(reduce ? {} : fadeUp(i * 0.12))}
              >
                <Box
                  flex={1} px={{ base: 0, md: 8 }} pb={{ base: 8, md: 0 }}
                  position="relative" zIndex={1}
                  borderLeft={{ base: '2px solid', md: 'none' }}
                  borderColor={useColorModeValue('rgba(26,63,191,0.2)', 'rgba(99,130,255,0.2)')}
                  pl={{ base: 5, md: 8 }}
                  ml={{ base: 0, md: 0 }}
                >
                  {/* Step number circle */}
                  <Flex
                    w={14} h={14} align="center" justify="center"
                    bg={cardBg}
                    border="2px solid"
                    borderColor={useColorModeValue('rgba(26,63,191,0.25)', 'rgba(99,130,255,0.25)')}
                    borderRadius="full" mb={5}
                    flexShrink={0}
                    boxShadow={useColorModeValue('0 0 0 6px #EEF2FF', '0 0 0 6px #0C1729')}
                  >
                    <s.icon size={22} color="#1A3FBF" strokeWidth={1.8} />
                  </Flex>
                  <Text
                    fontFamily="mono" fontWeight="700" fontSize="xs"
                    color={useColorModeValue('#1A3FBF', '#93C5FD')}
                    letterSpacing="0.08em" mb={1}
                  >
                    STEP {s.num}
                  </Text>
                  <Text fontWeight="800" fontSize="lg" fontFamily="heading"
                    color={headingClr} mb={2}>
                    {s.title}
                  </Text>
                  <Text color={bodyClr} fontSize="sm" lineHeight="1.75">
                    {s.desc}
                  </Text>
                </Box>
              </motion.div>
            ))}
          </Flex>
        </Container>
      </Box>

      {/* ── Role portals ────────────────────────────────────────────────── */}
      <Box py="90px">
        <Container maxW="7xl">
          <motion.div {...(reduce ? {} : fadeUp(0))}>
            <Heading
              fontFamily="heading" fontWeight="900"
              fontSize={{ base: '3xl', md: '4xl' }}
              color={headingClr} letterSpacing="-0.02em" mb={3}
            >
              Your role. Your view.
            </Heading>
            <Text color={bodyClr} fontSize="md" mb={14} maxW="420px">
              Pulse gives every user a purpose-built portal — not a watered-down generic interface.
            </Text>
          </motion.div>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5}>
            {ROLES.map((r, i) => (
              <motion.div key={r.role} {...(reduce ? {} : fadeUp(i * 0.1))}>
                <Box
                  p={8} borderRadius="2xl" h="full"
                  bg={cardBg} border="1px solid" borderColor={cardBorder}
                  display="flex" flexDirection="column"
                  _hover={{
                    borderColor: 'rgba(26,63,191,0.45)',
                    transform: 'translateY(-4px)',
                    boxShadow: useColorModeValue('0 20px 50px rgba(26,63,191,0.15)', '0 20px 50px rgba(0,0,0,0.5)'),
                  }}
                  transition="all 0.2s"
                >
                  <Flex
                    w={12} h={12} align="center" justify="center"
                    bg={useColorModeValue('#EEF2FF', 'rgba(26,63,191,0.18)')}
                    borderRadius="xl" mb={5}
                  >
                    <r.icon size={22} color="#1A3FBF" strokeWidth={1.8} />
                  </Flex>

                  <Text fontSize="xs" fontWeight="700" color="#1A3FBF"
                    textTransform="uppercase" letterSpacing="0.08em" mb={1}>
                    {r.role}
                  </Text>
                  <Text fontWeight="800" fontSize="xl" fontFamily="heading"
                    color={headingClr} mb={4} lineHeight="1.2">
                    {r.headline}
                  </Text>

                  <VStack align="flex-start" spacing={2.5} mb={8} flex={1}>
                    {r.bullets.map(b => (
                      <HStack key={b} spacing={2}>
                        <CheckCircle size={14} color="#1A3FBF" strokeWidth={2.5} />
                        <Text fontSize="sm" color={bodyClr} fontWeight="500">{b}</Text>
                      </HStack>
                    ))}
                  </VStack>

                  <Button
                    size="sm" h="38px" fontWeight="700"
                    bg={useColorModeValue('#EEF2FF', 'rgba(26,63,191,0.2)')}
                    color="#1A3FBF"
                    borderRadius="lg"
                    rightIcon={<ArrowRight size={14} />}
                    _hover={{ bg: '#1A3FBF', color: 'white' }}
                    transition="all 0.15s"
                    onClick={() => navigate(r.path)}
                  >
                    {r.cta}
                  </Button>
                </Box>
              </motion.div>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* ── CTA Banner ──────────────────────────────────────────────────── */}
      <Box py="80px" bg={sectionAlt}
        borderTop="1px solid" borderColor={statBorder}>
        <Container maxW="5xl">
          <motion.div {...(reduce ? {} : fadeUp(0))}>
            <Box
              p={{ base: 10, md: 16 }}
              borderRadius="3xl"
              bg="linear-gradient(135deg, #1A3FBF 0%, #0D1E8A 50%, #060D3A 100%)"
              position="relative" overflow="hidden"
              textAlign="center"
            >
              {/* Grid texture */}
              <Box
                position="absolute" inset={0} opacity={0.04} pointerEvents="none"
                backgroundImage="linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)"
                backgroundSize="28px 28px"
              />
              <Box
                position="absolute" top="-60px" right="-60px"
                w="300px" h="300px" bg="rgba(255,255,255,0.06)"
                borderRadius="full" pointerEvents="none"
              />

              <VStack spacing={5} position="relative" zIndex={1}>
                <Heading
                  fontFamily="heading" fontWeight="900"
                  fontSize={{ base: '2xl', md: '4xl' }}
                  color="white" letterSpacing="-0.02em"
                >
                  Ready to run at pulse speed?
                </Heading>
                <Text color="rgba(255,255,255,0.6)" fontSize="md"
                  maxW="380px" lineHeight="1.7">
                  Set up your account in under 2 minutes. All three roles included from day one.
                </Text>
                <HStack spacing={3} flexWrap="wrap" justify="center">
                  <Button
                    h="50px" px={8} fontWeight="700" fontSize="md"
                    bg="white" color="#1A3FBF" borderRadius="xl"
                    rightIcon={<ArrowRight size={18} />}
                    _hover={{ bg: '#F0F4FF', transform: 'translateY(-2px)', boxShadow: '0 8px 30px rgba(0,0,0,0.3)' }}
                    _active={{ transform: 'translateY(0)' }}
                    transition="all 0.15s"
                    onClick={handleGetStarted}
                  >
                    Get started free
                  </Button>
                  <Button
                    h="50px" px={6} fontWeight="600" fontSize="md"
                    variant="ghost" borderRadius="xl" color="rgba(255,255,255,0.7)"
                    border="1.5px solid rgba(255,255,255,0.2)"
                    _hover={{ bg: 'rgba(255,255,255,0.08)', color: 'white' }}
                    onClick={() => navigate('/login')}
                  >
                    Sign in
                  </Button>
                </HStack>
              </VStack>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <Box borderTop="1px solid" borderColor={navBorder} py={8}>
        <Container maxW="7xl">
          <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
            <Flex align="center" gap={2.5}>
              <Flex w={7} h={7} align="center" justify="center"
                bg="linear-gradient(135deg, #1A3FBF, #0D1E8A)"
                borderRadius="md">
                <Zap size={13} strokeWidth={2.5} color="white" />
              </Flex>
              <Text fontSize="sm" fontWeight="700" fontFamily="heading" color={bodyClr}>
                Pulse Delivery
              </Text>
            </Flex>

            <Text fontSize="xs" color={dimText}>
              © 2025 Pulse Delivery. Built with TypeScript, React & Prisma.
            </Text>

            <HStack spacing={4}>
              <Button variant="ghost" size="xs" color={dimText}
                _hover={{ color: headingClr }} onClick={() => navigate('/login')}>
                Sign In
              </Button>
              <Button variant="ghost" size="xs" color={dimText}
                _hover={{ color: headingClr }} onClick={() => navigate('/register')}>
                Register
              </Button>
            </HStack>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
}
