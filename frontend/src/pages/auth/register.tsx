import { useState, FormEvent, useEffect } from 'react';
import {
  Box, Flex, Heading, Text, Input, Button,
  VStack, FormControl, FormLabel, useColorModeValue, Link, Select,
  HStack, PinInput, PinInputField, Center, Spinner, IconButton, useColorMode
} from '@chakra-ui/react';
import { Zap, ShieldCheck, Mail, ArrowRight, Moon, Sun, MapPin } from 'lucide-react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { authApi } from '../../api/services/auth';
import { useApiToast } from '../../hooks/useApiToast';
import { GoogleAuthButton } from '../../components/common/googleAuthButton';

export default function Register() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer'
  });
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const { showSuccess, showError } = useApiToast();
  const navigate = useNavigate();
  const { colorMode, toggleColorMode } = useColorMode();

  // Pulse Delivery — Jira-inspired colors
  const bgColor = useColorModeValue('white', '#0B1121');
  const panelBg = useColorModeValue('white', '#0B1121');
  const inputBg = useColorModeValue('#F4F5F7', 'rgba(255,255,255,0.05)');
  const inputBorder = useColorModeValue('#DFE1E6', 'rgba(255,255,255,0.12)');
  const labelColor = useColorModeValue('#172B4D', '#CBD5E1');
  const subColor = useColorModeValue('#5E6C84', '#8993A4');

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      showSuccess('Account created successfully!');
      navigate(response.user.role === 'admin' ? '/admin/dashboard' : '/customer/dashboard');
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
      showSuccess('A new verification code has been sent!');
      setCountdown(60);
    } catch (error) {
      showError(error);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Flex minH="100vh" bg={bgColor} overflow="hidden">
      {/* Left Section - Premium Showcase */}
      <Flex
        flex="0 0 44%"
        position="relative"
        direction="column"
        justify="center"
        px={14}
        display={{ base: 'none', lg: 'flex' }}
        bg="#0A1628"
        color="white"
        overflow="hidden"
      >
        {/* Subtle background glow */}
        <Box position="absolute" top="-20%" left="-10%" w="500px" h="500px" bg="#0065FF" filter="blur(180px)" opacity="0.12" borderRadius="full" pointerEvents="none" />
        <Box position="absolute" bottom="-15%" right="-15%" w="400px" h="400px" bg="#4C9AFF" filter="blur(160px)" opacity="0.08" borderRadius="full" pointerEvents="none" />

        <Box position="relative" zIndex={1}>
          <Flex align="center" gap={3} mb={14}>
            <Flex w={10} h={10} align="center" justify="center" bg="#0065FF" borderRadius="lg" boxShadow="0 0 0 1px rgba(0,101,255,0.6), 0 4px 16px rgba(0,101,255,0.3)">
              <Zap size={20} strokeWidth={2.5} color="white" />
            </Flex>
            <Box>
              <Text fontSize="lg" fontWeight="800" fontFamily="heading" letterSpacing="-0.01em" lineHeight="1">Pulse Delivery</Text>
              <Text fontSize="xs" color="rgba(255,255,255,0.35)" mt={0.5}>Logistics Command Center</Text>
            </Box>
          </Flex>

          <Heading fontSize="3xl" fontWeight="800" fontFamily="heading" lineHeight="1.2" letterSpacing="-0.02em" mb={4}>
            Join the<br />
            <Text as="span" color="#4C9AFF">delivery network.</Text>
          </Heading>

          <Text fontSize="md" color="rgba(255,255,255,0.55)" maxW="380px" lineHeight="1.7" mb={10}>
            Fast, transparent, and smart last-mile delivery operations for customers, agents, and operators.
          </Text>

          <VStack align="flex-start" spacing={3}>
            {[
              { icon: Zap,         text: 'Same-day booking confirmation'  },
              { icon: MapPin,      text: 'Real-time shipment tracking'    },
              { icon: ShieldCheck, text: 'Verified delivery agents'       },
            ].map(({ icon: Ico, text }) => (
              <Flex key={text} align="center" gap={3} bg="rgba(255,255,255,0.04)" border="1px solid rgba(255,255,255,0.07)" px={4} py={3} borderRadius="md" w="full" maxW="360px">
                <Box w={7} h={7} display="flex" alignItems="center" justifyContent="center" bg="rgba(0,101,255,0.25)" borderRadius="sm" flexShrink={0}>
                  <Ico size={15} color="#4C9AFF" strokeWidth={2.5} />
                </Box>
                <Text fontSize="sm" fontWeight="500" color="rgba(255,255,255,0.75)">{text}</Text>
              </Flex>
            ))}
          </VStack>
        </Box>
      </Flex>

      {/* Right Section - Glassmorphism Auth Panel */}
      <Flex flex={1} align="center" justify="center" p={8} position="relative">
        {/* Dark Mode Toggle */}
        <IconButton
          aria-label="Toggle dark mode"
          icon={colorMode === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          onClick={toggleColorMode}
          position="absolute"
          top={8}
          right={8}
          variant="ghost"
          color={useColorModeValue('gray.600', 'gray.300')}
          _hover={{ bg: useColorModeValue('gray.100', 'whiteAlpha.200') }}
          borderRadius="full"
          size="lg"
        />

        <Box w="full" maxW="400px" position="relative" zIndex={1}>

          {/* Mobile brand header */}
          <Flex align="center" gap={2.5} mb={8} display={{ base: 'flex', lg: 'none' }}>
            <Flex w={8} h={8} align="center" justify="center" bg="#0065FF" borderRadius="md"><Zap size={16} strokeWidth={2.5} color="white" /></Flex>
            <Text fontSize="md" fontWeight="800" fontFamily="heading" color={labelColor}>Pulse Delivery</Text>
          </Flex>

          {step === 1 ? (
            <Box bg={panelBg}>
              <Heading fontSize="2xl" mb={1} fontWeight="800" letterSpacing="-0.02em" color={labelColor} fontFamily="heading">
                Create account
              </Heading>
              <Text color={subColor} mb={7} fontSize="sm">
                Already a member?{' '}
                <Link as={RouterLink} to="/login" color="brand.500" fontWeight="600" _hover={{ color: 'brand.600' }}>
                  Sign in
                </Link>
              </Text>

              <form onSubmit={handleRegister}>
                <VStack spacing={5}>
                  <FormControl isRequired>
                    <FormLabel color={labelColor} fontSize="sm" fontWeight="600">I want to join as a</FormLabel>
                    <Select 
                      name="role"
                      value={formData.role} 
                      onChange={handleChange}
                      size="lg"
                      bg={inputBg}
                      borderColor={inputBorder}
                      borderRadius="xl"
                      _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)' }}
                      fontWeight="600"
                    >
                      <option value="customer">Customer (Ship Packages)</option>
                      <option value="agent">Delivery Agent (Earn Money)</option>
                    </Select>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel color={labelColor} fontSize="sm" fontWeight="600">Full Name</FormLabel>
                    <Input 
                      name="name"
                      type="text" 
                      value={formData.name} 
                      onChange={handleChange} 
                      placeholder="John Doe" 
                      size="lg"
                      bg={inputBg}
                      borderColor={inputBorder}
                      borderRadius="xl"
                      _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)' }}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel color={labelColor} fontSize="sm" fontWeight="600">Email Address</FormLabel>
                    <Input 
                      name="email"
                      type="email" 
                      value={formData.email} 
                      onChange={handleChange} 
                      placeholder="name@company.com" 
                      size="lg"
                      bg={inputBg}
                      borderColor={inputBorder}
                      borderRadius="xl"
                      _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)' }}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel color={labelColor} fontSize="sm" fontWeight="600">Password</FormLabel>
                    <Input 
                      name="password"
                      type="password" 
                      value={formData.password} 
                      onChange={handleChange} 
                      placeholder="••••••••" 
                      size="lg"
                      bg={inputBg}
                      borderColor={inputBorder}
                      borderRadius="xl"
                      _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)' }}
                    />
                  </FormControl>

                  <Button 
                    type="submit" 
                    w="full" 
                    size="lg" 
                    isLoading={isLoading} 
                    loadingText="Sending Code..."
                    mt={4}
                    bg="brand.500"
                    color="white"
                    borderRadius="xl"
                    fontWeight="700"
                    _hover={{ bg: 'brand.600', transform: 'translateY(-2px)', boxShadow: 'lg' }}
                    _active={{ bg: 'brand.700', transform: 'translateY(0)' }}
                    transition="all 0.2s"
                    rightIcon={<ArrowRight size={18} />}
                  >
                    Continue
                  </Button>
                </VStack>
              </form>

              {/* Google Sign-Up */}
              <GoogleAuthButton label="Sign up with Google" />

            </Box>
          ) : (
            /* OTP VERIFICATION STEP */
            <Box 
              bg={panelBg} 
              p={10} 
              borderRadius="3xl" 
              boxShadow="0 20px 40px -15px rgba(0,0,0,0.1)"
              border="1px solid"
              borderColor={useColorModeValue('white', 'whiteAlpha.100')}
              backdropFilter="blur(20px)"
              textAlign="center"
            >
              <Center mb={6}>
                <Box p={4} bg="brand.50" borderRadius="full">
                  <Mail size={32} color="var(--chakra-colors-brand-500)" />
                </Box>
              </Center>
              <Heading size="lg" mb={3} fontWeight="800" letterSpacing="-0.02em" color={useColorModeValue('gray.800', 'white')}>
                Check your email
              </Heading>
              <Text color="gray.500" mb={8} fontSize="sm" fontWeight="500">
                We've sent a 6-digit verification code to <br/>
                <Text as="span" fontWeight="700" color={useColorModeValue('gray.700', 'gray.300')}>{formData.email}</Text>
              </Text>

              <form onSubmit={handleVerifyOtp}>
                <VStack spacing={6}>
                  <HStack justify="center">
                    <PinInput otp value={otp} onChange={setOtp} size="lg" focusBorderColor="brand.500">
                      <PinInputField bg={inputBg} borderColor={inputBorder} borderRadius="xl" fontWeight="700" />
                      <PinInputField bg={inputBg} borderColor={inputBorder} borderRadius="xl" fontWeight="700" />
                      <PinInputField bg={inputBg} borderColor={inputBorder} borderRadius="xl" fontWeight="700" />
                      <PinInputField bg={inputBg} borderColor={inputBorder} borderRadius="xl" fontWeight="700" />
                      <PinInputField bg={inputBg} borderColor={inputBorder} borderRadius="xl" fontWeight="700" />
                      <PinInputField bg={inputBg} borderColor={inputBorder} borderRadius="xl" fontWeight="700" />
                    </PinInput>
                  </HStack>

                  <Button 
                    type="submit" 
                    w="full" 
                    size="lg" 
                    isLoading={isLoading} 
                    loadingText="Verifying..."
                    isDisabled={otp.length < 6}
                    bg="brand.500"
                    color="white"
                    borderRadius="xl"
                    fontWeight="700"
                    _hover={{ bg: 'brand.600', transform: 'translateY(-2px)', boxShadow: 'lg' }}
                    _active={{ bg: 'brand.700', transform: 'translateY(0)' }}
                    transition="all 0.2s"
                  >
                    Verify & Create Account
                  </Button>
                </VStack>
              </form>

              <Text mt={8} fontSize="sm" color="gray.500" fontWeight="500">
                Didn't receive the code?{' '}
                {countdown > 0 ? (
                  <Text as="span" color="gray.400">Resend in {countdown}s</Text>
                ) : (
                  <Link onClick={handleResendOtp} color="brand.500" fontWeight="700" _hover={{ color: 'brand.600' }}>
                    {isResending ? <Spinner size="xs" /> : 'Resend now'}
                  </Link>
                )}
              </Text>
            </Box>
          )}

        </Box>
      </Flex>
    </Flex>
  );
}