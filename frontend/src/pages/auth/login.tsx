import { useState, FormEvent } from 'react';
import {
  Box, Flex, Heading, Text, Input, Button,
  VStack, FormControl, FormLabel, HStack,
  InputGroup, InputRightElement, IconButton, useColorMode, useColorModeValue,
  Link,
} from '@chakra-ui/react';
import { Eye, EyeOff, Zap, ArrowRight, Moon, Sun, Truck, Package, BarChart3 } from 'lucide-react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { authApi } from '../../api/services/auth';
import { useAuth } from '../../hooks/useAuth';
import { useApiToast } from '../../hooks/useApiToast';
import { GoogleAuthButton } from '../../components/common/googleAuthButton';

const LEFT_FEATURES = [
  { icon: BarChart3, title: 'Admin Command Centre', desc: 'Live metrics across orders, agents, zones, and revenue.' },
  { icon: Truck,     title: 'Agent Dispatch Board', desc: 'Clock in, view assigned runs, update stages on the go.' },
  { icon: Package,   title: 'Customer Tracking',    desc: 'Real-time shipment stages from pickup to doorstep.' },
];

const DEMO = [
  { role: 'Admin',    email: 'admin@delivery.com',  pw: 'admin123'    },
  { role: 'Customer', email: 'customer@test.com',   pw: 'customer123' },
  { role: 'Agent',    email: 'agent@delivery.com',  pw: 'agent123'    },
];

export default function Login() {
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);

  const { login }                  = useAuth();
  const { showSuccess, showError } = useApiToast();
  const navigate                   = useNavigate();
  const { colorMode, toggleColorMode } = useColorMode();

  const formBg      = useColorModeValue('white', '#0D1526');
  const inputBg     = useColorModeValue('#F0F4FF', 'rgba(255,255,255,0.05)');
  const inputBorder = useColorModeValue('#C7D7FD', 'rgba(255,255,255,0.1)');
  const labelColor  = useColorModeValue('#1E2A4A', '#E2E8F0');
  const subColor    = useColorModeValue('#64748B', '#94A3B8');

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await authApi.login({ email, password });
      login(response.user, response.token);
      showSuccess('Welcome back!');
      navigate(`/${response.user.role.toLowerCase()}/dashboard`);
    } catch (error) {
      showError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex minH="100dvh" overflow="hidden">

      {/* ── Left Panel ─────────────────────────────────────── */}
      <Flex
        flex="0 0 46%"
        direction="column"
        justify="space-between"
        px={12} py={12}
        display={{ base: 'none', lg: 'flex' }}
        position="relative"
        overflow="hidden"
        bg="linear-gradient(135deg, #1A3FBF 0%, #0D1E8A 50%, #060D3A 100%)"
        color="white"
      >
        {/* Grid texture */}
        <Box
          position="absolute" inset={0} opacity={0.04} pointerEvents="none"
          backgroundImage="linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)"
          backgroundSize="32px 32px"
        />
        {/* Glows */}
        <Box position="absolute" top="-15%" right="-10%" w="380px" h="380px"
          bg="rgba(99,130,255,0.35)" filter="blur(100px)" borderRadius="full" pointerEvents="none" />
        <Box position="absolute" bottom="-10%" left="-5%" w="300px" h="300px"
          bg="rgba(60,80,220,0.25)" filter="blur(90px)" borderRadius="full" pointerEvents="none" />

        {/* Logo */}
        <Flex align="center" gap={3} position="relative" zIndex={1}>
          <Flex w={9} h={9} align="center" justify="center"
            bg="rgba(255,255,255,0.15)" borderRadius="lg"
            border="1px solid rgba(255,255,255,0.25)">
            <Zap size={18} strokeWidth={2.5} color="white" />
          </Flex>
          <Box>
            <Text fontSize="md" fontWeight="800" fontFamily="heading" lineHeight="1">Pulse Delivery</Text>
            <Text fontSize="10px" color="rgba(255,255,255,0.45)" letterSpacing="0.06em" textTransform="uppercase">Logistics Platform</Text>
          </Box>
        </Flex>

        {/* Headline + features */}
        <Box position="relative" zIndex={1}>
          <Text fontSize="xs" fontWeight="700" color="rgba(255,255,255,0.45)"
            letterSpacing="0.1em" textTransform="uppercase" mb={3}>
            Every role. One platform.
          </Text>
          <Heading fontFamily="heading" fontWeight="900"
            fontSize="4xl" lineHeight="1.1" letterSpacing="-0.02em" mb={4}>
            Manage deliveries<br />
            <Text as="span" color="#93C5FD">end to end.</Text>
          </Heading>
          <Text color="rgba(255,255,255,0.5)" fontSize="sm" lineHeight="1.8" maxW="340px" mb={10}>
            Real-time tracking, zone-based dispatch, and smart pricing — all in one place.
          </Text>

          <VStack spacing={3} align="stretch">
            {LEFT_FEATURES.map(f => (
              <Flex
                key={f.title}
                gap={3} p={4} borderRadius="xl"
                bg="rgba(255,255,255,0.06)"
                border="1px solid rgba(255,255,255,0.1)"
                align="flex-start"
                _hover={{ bg: 'rgba(255,255,255,0.09)' }}
                transition="background 0.15s"
              >
                <Box flexShrink={0} p={1.5} bg="rgba(255,255,255,0.1)" borderRadius="md">
                  <f.icon size={15} color="white" strokeWidth={2} />
                </Box>
                <Box>
                  <Text fontWeight="700" fontSize="sm" lineHeight="1.3">{f.title}</Text>
                  <Text color="rgba(255,255,255,0.45)" fontSize="xs" lineHeight="1.6" mt={0.5}>{f.desc}</Text>
                </Box>
              </Flex>
            ))}
          </VStack>
        </Box>

        {/* Demo credentials card */}
        <Box
          position="relative" zIndex={1}
          p={4} borderRadius="xl"
          bg="rgba(255,255,255,0.06)"
          border="1px solid rgba(255,255,255,0.1)"
        >
          <Text fontSize="xs" fontWeight="700" color="rgba(255,255,255,0.4)"
            letterSpacing="0.07em" textTransform="uppercase" mb={2}>
            Demo Credentials
          </Text>
          <HStack spacing={4} flexWrap="wrap">
            {DEMO.map(d => (
              <Box key={d.role}>
                <Text fontSize="10px" color="rgba(255,255,255,0.35)" fontWeight="600"
                  textTransform="uppercase" letterSpacing="0.05em">{d.role}</Text>
                <Text fontSize="xs" color="rgba(255,255,255,0.6)" fontFamily="mono">{d.email}</Text>
              </Box>
            ))}
          </HStack>
          <Text fontSize="10px" color="rgba(255,255,255,0.3)" mt={1.5}>
            Password: role + 123 (e.g. admin123, customer123)
          </Text>
        </Box>
      </Flex>

      {/* ── Right Panel ────────────────────────────────────── */}
      <Flex flex={1} align="center" justify="center" p={8}
        position="relative" bg={formBg}>

        {/* Theme toggle */}
        <IconButton
          aria-label="Toggle theme"
          icon={colorMode === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          onClick={toggleColorMode}
          position="absolute" top={6} right={6}
          variant="ghost" borderRadius="full" size="md"
          color={subColor}
          _hover={{ bg: useColorModeValue('#EEF2FF', 'rgba(255,255,255,0.08)') }}
        />

        <Box w="full" maxW="400px">

          {/* Mobile logo */}
          <Flex align="center" gap={2.5} mb={8} display={{ base: 'flex', lg: 'none' }}>
            <Flex w={8} h={8} align="center" justify="center"
              bg="linear-gradient(135deg,#1A3FBF,#0D1E8A)" borderRadius="md">
              <Zap size={16} color="white" strokeWidth={2.5} />
            </Flex>
            <Text fontWeight="800" fontSize="md" fontFamily="heading" color={labelColor}>
              Pulse Delivery
            </Text>
          </Flex>

          <Heading fontFamily="heading" fontWeight="900" fontSize="2xl"
            color={labelColor} letterSpacing="-0.02em" mb={1}>
            Welcome back
          </Heading>
          <Text fontSize="sm" color={subColor} mb={8}>
            New here?{' '}
            <Link as={RouterLink} to="/register" color="#1A3FBF" fontWeight="700"
              _hover={{ color: '#0D1E8A' }}>
              Create an account
            </Link>
          </Text>

          <form onSubmit={handleLogin}>
            <VStack spacing={4}>

              <FormControl isRequired>
                <FormLabel fontSize="xs" fontWeight="700" color={subColor}
                  textTransform="uppercase" letterSpacing="0.07em" mb={1.5}>
                  Email Address
                </FormLabel>
                <Input
                  type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  bg={inputBg} borderColor={inputBorder} borderRadius="lg"
                  _focus={{ borderColor: '#1A3FBF', boxShadow: '0 0 0 2px rgba(26,63,191,0.2)' }}
                  _placeholder={{ color: useColorModeValue('#CBD5E1', '#334155') }}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="xs" fontWeight="700" color={subColor}
                  textTransform="uppercase" letterSpacing="0.07em" mb={1.5}>
                  Password
                </FormLabel>
                <InputGroup>
                  <Input
                    type={showPw ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    bg={inputBg} borderColor={inputBorder} borderRadius="lg"
                    _focus={{ borderColor: '#1A3FBF', boxShadow: '0 0 0 2px rgba(26,63,191,0.2)' }}
                    _placeholder={{ color: useColorModeValue('#CBD5E1', '#334155') }}
                  />
                  <InputRightElement>
                    <IconButton
                      aria-label={showPw ? 'Hide' : 'Show'}
                      icon={showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                      variant="ghost" size="xs"
                      onClick={() => setShowPw(p => !p)}
                      color={subColor}
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              <Button
                type="submit" w="full" h="44px" mt={2}
                isLoading={isLoading} loadingText="Signing in…"
                bg="linear-gradient(135deg, #1A3FBF 0%, #0D2AE0 100%)"
                color="white" fontWeight="700" borderRadius="lg"
                rightIcon={<ArrowRight size={16} />}
                _hover={{
                  bg: 'linear-gradient(135deg, #1535A8 0%, #0B22BE 100%)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 6px 24px rgba(26,63,191,0.4)',
                }}
                _active={{ transform: 'translateY(0)' }}
                transition="all 0.15s"
              >
                Sign in to Pulse Delivery
              </Button>

            </VStack>
          </form>

          <GoogleAuthButton label="Continue with Google" />

        </Box>
      </Flex>
    </Flex>
  );
}