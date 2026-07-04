import { useState, FormEvent, useEffect } from 'react';
import {
  Box, Flex, Heading, Text, Input, Button,
  VStack, FormControl, FormLabel, useColorModeValue, Link,
  HStack, PinInput, PinInputField, Center, Spinner, IconButton, useColorMode,
} from '@chakra-ui/react';
import { Zap, Mail, ArrowRight, Moon, Sun, Package, Truck, CheckCircle, BarChart3 } from 'lucide-react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { authApi } from '../../api/services/auth';
import { useApiToast } from '../../hooks/useApiToast';
import { GoogleAuthButton } from '../../components/common/googleAuthButton';

const ROLES = [
  {
    value: 'customer',
    label: 'Customer',
    sub: 'Ship & track packages',
    icon: Package,
  },
  {
    value: 'agent',
    label: 'Delivery Agent',
    sub: 'Deliver & earn',
    icon: Truck,
  },
];

const LEFT_FEATURES = [
  { icon: BarChart3, title: 'Live Command Centre', desc: 'Full visibility across all shipments, zones, and agents in real time.' },
  { icon: Package,   title: 'Smart Order Booking', desc: 'Instant pricing, zone resolution, and COD fee calculation on every order.' },
  { icon: CheckCircle, title: 'Verified Agent Network', desc: 'Shift-tracked, zone-matched agents with automatic workload balancing.' },
];

export default function Register() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'customer' });
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const { showSuccess, showError } = useApiToast();
  const navigate = useNavigate();
  const { colorMode, toggleColorMode } = useColorMode();

  const inputBg     = useColorModeValue('#F0F4FF', 'rgba(255,255,255,0.05)');
  const inputBorder = useColorModeValue('#C7D7FD', 'rgba(255,255,255,0.1)');
  const labelColor  = useColorModeValue('#1E2A4A', '#E2E8F0');
  const subColor    = useColorModeValue('#64748B', '#94A3B8');
  const formBg      = useColorModeValue('white', '#0D1526');
  const pageBg      = useColorModeValue('#F5F7FF', '#07101F');

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (countdown > 0) timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await authApi.register(formData);
      showSuccess('Verification code sent to your email!');
      setStep(2);
      setCountdown(60);
    } catch (error) {
      showError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (otp.length < 6) return;
    setIsLoading(true);
    try {
      const response = await authApi.verifyEmail({ email: formData.email, otp });
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      showSuccess('Welcome to Pulse Delivery!');
      navigate('/customer/dashboard');
    } catch (error) {
      showError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    try {
      await authApi.resendOtp({ email: formData.email });
      showSuccess('New code sent!');
      setCountdown(60);
    } catch (error) {
      showError(error);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Flex minH="100vh" bg={pageBg} overflow="hidden">

      {/* ── Left Panel ─────────────────────────────────────── */}
      <Flex
        flex="0 0 46%"
        direction="column"
        justify="space-between"
        px={12}
        py={12}
        display={{ base: 'none', lg: 'flex' }}
        position="relative"
        overflow="hidden"
        bg="linear-gradient(135deg, #1A3FBF 0%, #0D1E8A 50%, #060D3A 100%)"
        color="white"
      >
        {/* Grid texture overlay */}
        <Box
          position="absolute" inset={0} opacity={0.04} pointerEvents="none"
          backgroundImage="linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)"
          backgroundSize="32px 32px"
        />
        {/* Glows */}
        <Box position="absolute" top="-15%" right="-10%" w="380px" h="380px" bg="rgba(99,130,255,0.35)" filter="blur(100px)" borderRadius="full" pointerEvents="none" />
        <Box position="absolute" bottom="-10%" left="-5%"  w="300px" h="300px" bg="rgba(60,80,220,0.25)"  filter="blur(90px)"  borderRadius="full" pointerEvents="none" />

        {/* Logo */}
        <Flex align="center" gap={3} position="relative" zIndex={1}>
          <Flex w={9} h={9} align="center" justify="center"
            bg="rgba(255,255,255,0.15)" borderRadius="lg"
            border="1px solid rgba(255,255,255,0.25)"
          >
            <Zap size={18} strokeWidth={2.5} color="white" />
          </Flex>
          <Box>
            <Text fontSize="md" fontWeight="800" fontFamily="heading" lineHeight="1">Pulse Delivery</Text>
            <Text fontSize="10px" color="rgba(255,255,255,0.45)" letterSpacing="0.06em" textTransform="uppercase">Logistics Platform</Text>
          </Box>
        </Flex>

        {/* Headline */}
        <Box position="relative" zIndex={1}>
          <Text fontSize="xs" fontWeight="700" color="rgba(255,255,255,0.45)"
            letterSpacing="0.1em" textTransform="uppercase" mb={3}>
            Built for the whole network
          </Text>
          <Heading
            fontFamily="heading" fontWeight="900"
            fontSize="4xl" lineHeight="1.1" letterSpacing="-0.02em" mb={4}
          >
            Deliveries that run<br />
            <Text as="span" color="#93C5FD">at pulse speed.</Text>
          </Heading>
          <Text color="rgba(255,255,255,0.5)" fontSize="sm" lineHeight="1.8" maxW="340px" mb={10}>
            One platform for customers who ship, agents who drive, and operators who command.
          </Text>

          {/* Feature list — card style */}
          <VStack spacing={3} align="stretch">
            {LEFT_FEATURES.map(f => (
              <Flex
                key={f.title}
                gap={3}
                p={4}
                borderRadius="xl"
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

        {/* Bottom demo hint */}
        <Box
          position="relative" zIndex={1}
          p={4} borderRadius="xl"
          bg="rgba(255,255,255,0.06)" border="1px solid rgba(255,255,255,0.1)"
        >
          <Text fontSize="xs" fontWeight="700" color="rgba(255,255,255,0.4)"
            letterSpacing="0.07em" textTransform="uppercase" mb={2}>
            Demo Credentials
          </Text>
          <HStack spacing={4} flexWrap="wrap">
            {[
              { role: 'Admin', cred: 'admin@delivery.com' },
              { role: 'Customer', cred: 'customer@test.com' },
              { role: 'Agent', cred: 'agent@delivery.com' },
            ].map(d => (
              <Box key={d.role}>
                <Text fontSize="10px" color="rgba(255,255,255,0.35)" fontWeight="600" textTransform="uppercase" letterSpacing="0.05em">{d.role}</Text>
                <Text fontSize="xs" color="rgba(255,255,255,0.6)" fontFamily="mono">{d.cred}</Text>
              </Box>
            ))}
          </HStack>
          <Text fontSize="10px" color="rgba(255,255,255,0.3)" mt={1.5}>Password for all: the role + 123 (e.g. admin123)</Text>
        </Box>
      </Flex>

      {/* ── Right Panel ────────────────────────────────────── */}
      <Flex flex={1} align="center" justify="center" p={8} position="relative" bg={formBg}>

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

        <Box w="full" maxW="420px">

          {/* Mobile logo */}
          <Flex align="center" gap={2.5} mb={8} display={{ base: 'flex', lg: 'none' }}>
            <Flex w={8} h={8} align="center" justify="center"
              bg="linear-gradient(135deg,#1A3FBF,#0D1E8A)" borderRadius="md">
              <Zap size={16} color="white" strokeWidth={2.5} />
            </Flex>
            <Text fontWeight="800" fontSize="md" fontFamily="heading" color={labelColor}>Pulse Delivery</Text>
          </Flex>

          {step === 1 ? (
            <>
              <Heading fontFamily="heading" fontWeight="900" fontSize="2xl"
                color={labelColor} letterSpacing="-0.02em" mb={1}>
                Create account
              </Heading>
              <Text fontSize="sm" color={subColor} mb={7}>
                Already have one?{' '}
                <Link as={RouterLink} to="/login" color="#1A3FBF" fontWeight="700"
                  _hover={{ color: '#0D1E8A' }}>
                  Sign in
                </Link>
              </Text>

              {/* ── Role picker ── */}
              <Box mb={6}>
                <Text fontSize="xs" fontWeight="700" color={subColor}
                  textTransform="uppercase" letterSpacing="0.07em" mb={2.5}>
                  I want to join as
                </Text>
                <HStack spacing={3}>
                  {ROLES.map(r => {
                    const selected = formData.role === r.value;
                    return (
                      <Box
                        key={r.value}
                        as="button"
                        type="button"
                        flex={1}
                        py={3.5} px={4}
                        borderRadius="xl"
                        border="2px solid"
                        borderColor={selected
                          ? '#1A3FBF'
                          : useColorModeValue('#E2E8F0', 'rgba(255,255,255,0.1)')}
                        bg={selected
                          ? useColorModeValue('#EEF2FF', 'rgba(26,63,191,0.18)')
                          : useColorModeValue('#F8FAFC', 'rgba(255,255,255,0.03)')}
                        onClick={() => setFormData({ ...formData, role: r.value })}
                        transition="all 0.15s"
                        _hover={{
                          borderColor: '#1A3FBF',
                          bg: useColorModeValue('#EEF2FF', 'rgba(26,63,191,0.12)'),
                        }}
                        cursor="pointer"
                        textAlign="center"
                      >
                        <Box display="flex" justifyContent="center" mb={1.5}>
                          <r.icon
                            size={20}
                            color={selected ? '#1A3FBF' : useColorModeValue('#94A3B8', '#64748B')}
                            strokeWidth={2}
                          />
                        </Box>
                        <Text
                          fontWeight="700" fontSize="sm"
                          color={selected ? '#1A3FBF' : labelColor}
                          lineHeight="1.2"
                        >
                          {r.label}
                        </Text>
                        <Text
                          fontSize="10px"
                          color={selected
                            ? useColorModeValue('#4F46E5', '#93C5FD')
                            : subColor}
                          mt={0.5}
                        >
                          {r.sub}
                        </Text>
                      </Box>
                    );
                  })}
                </HStack>
              </Box>

              {/* ── Form ── */}
              <form onSubmit={handleRegister}>
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel fontSize="xs" fontWeight="700" color={subColor}
                      textTransform="uppercase" letterSpacing="0.07em" mb={1.5}>
                      Full Name
                    </FormLabel>
                    <Input
                      name="name" type="text" value={formData.name}
                      onChange={handleChange} placeholder="Ada Lovelace"
                      bg={inputBg} borderColor={inputBorder} borderRadius="lg"
                      _focus={{ borderColor: '#1A3FBF', boxShadow: '0 0 0 2px rgba(26,63,191,0.2)' }}
                      _placeholder={{ color: useColorModeValue('#CBD5E1', '#334155') }}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontSize="xs" fontWeight="700" color={subColor}
                      textTransform="uppercase" letterSpacing="0.07em" mb={1.5}>
                      Email Address
                    </FormLabel>
                    <Input
                      name="email" type="email" value={formData.email}
                      onChange={handleChange} placeholder="name@company.com"
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
                    <Input
                      name="password" type="password" value={formData.password}
                      onChange={handleChange} placeholder="Minimum 8 characters"
                      bg={inputBg} borderColor={inputBorder} borderRadius="lg"
                      _focus={{ borderColor: '#1A3FBF', boxShadow: '0 0 0 2px rgba(26,63,191,0.2)' }}
                      _placeholder={{ color: useColorModeValue('#CBD5E1', '#334155') }}
                    />
                  </FormControl>

                  <Button
                    type="submit" w="full" h="44px" mt={2}
                    isLoading={isLoading} loadingText="Sending code…"
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
                    Create Account
                  </Button>
                </VStack>
              </form>

              <GoogleAuthButton label="Sign up with Google" />
            </>
          ) : (
            /* ── OTP Step ── */
            <Box textAlign="center">
              <Center mb={5}>
                <Box
                  w={14} h={14} borderRadius="2xl"
                  bg={useColorModeValue('#EEF2FF', 'rgba(26,63,191,0.18)')}
                  display="flex" alignItems="center" justifyContent="center"
                >
                  <Mail size={26} color="#1A3FBF" strokeWidth={1.8} />
                </Box>
              </Center>

              <Heading fontFamily="heading" fontWeight="800" fontSize="xl"
                color={labelColor} letterSpacing="-0.01em" mb={2}>
                Check your inbox
              </Heading>
              <Text color={subColor} fontSize="sm" mb={1}>
                We sent a 6-digit code to
              </Text>
              <Text fontWeight="700" fontSize="sm" color={labelColor} mb={8}>
                {formData.email}
              </Text>

              <form onSubmit={handleVerifyOtp}>
                <VStack spacing={6}>
                  <HStack justify="center">
                    <PinInput otp value={otp} onChange={setOtp} size="lg"
                      focusBorderColor="#1A3FBF">
                      {[...Array(6)].map((_, i) => (
                        <PinInputField
                          key={i}
                          bg={inputBg} borderColor={inputBorder}
                          borderRadius="lg" fontWeight="700"
                          _focus={{ borderColor: '#1A3FBF', boxShadow: '0 0 0 2px rgba(26,63,191,0.2)' }}
                        />
                      ))}
                    </PinInput>
                  </HStack>

                  <Button
                    type="submit" w="full" h="44px"
                    isLoading={isLoading} loadingText="Verifying…"
                    isDisabled={otp.length < 6}
                    bg="linear-gradient(135deg, #1A3FBF 0%, #0D2AE0 100%)"
                    color="white" fontWeight="700" borderRadius="lg"
                    _hover={{
                      bg: 'linear-gradient(135deg, #1535A8 0%, #0B22BE 100%)',
                      boxShadow: '0 6px 24px rgba(26,63,191,0.35)',
                    }}
                    transition="all 0.15s"
                  >
                    Verify & Create Account
                  </Button>
                </VStack>
              </form>

              <Text mt={7} fontSize="sm" color={subColor}>
                Didn't receive it?{' '}
                {countdown > 0 ? (
                  <Text as="span" color={subColor}>Resend in {countdown}s</Text>
                ) : (
                  <Link onClick={handleResendOtp} color="#1A3FBF" fontWeight="700"
                    cursor="pointer" _hover={{ color: '#0D1E8A' }}>
                    {isResending ? <Spinner size="xs" /> : 'Resend code'}
                  </Link>
                )}
              </Text>

              <Text mt={4} fontSize="xs" color={subColor}>
                Wrong email?{' '}
                <Link onClick={() => setStep(1)} color="#1A3FBF" fontWeight="700"
                  cursor="pointer">
                  Go back
                </Link>
              </Text>
            </Box>
          )}
        </Box>
      </Flex>
    </Flex>
  );
}