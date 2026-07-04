import { useState, FormEvent } from 'react';
import {
  Box, Flex, Heading, Text, Input, Button,
  VStack, FormControl, FormLabel,
  InputGroup, InputRightElement, IconButton, useColorMode, useColorModeValue,
  Link,
} from '@chakra-ui/react';
import { Eye, EyeOff, Zap, ArrowRight, Moon, Sun, ShieldCheck, MapPin } from 'lucide-react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { authApi } from '../../api/services/auth';
import { useAuth } from '../../hooks/useAuth';
import { useApiToast } from '../../hooks/useApiToast';
import { GoogleAuthButton } from '../../components/common/googleAuthButton';

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPw, setShowPw]     = useState(false);

  const { login }                = useAuth();
  const { showSuccess, showError } = useApiToast();
  const navigate                 = useNavigate();
  const { colorMode, toggleColorMode } = useColorMode();

  // Right-panel colors
  const panelBg    = useColorModeValue('white', '#0B1121');
  const inputBg    = useColorModeValue('#F4F5F7', 'rgba(255,255,255,0.05)');
  const inputBorder= useColorModeValue('#DFE1E6', 'rgba(255,255,255,0.12)');
  const labelColor = useColorModeValue('#172B4D', '#CBD5E1');
  const titleColor = useColorModeValue('#172B4D', '#E2E8F0');
  const subColor   = useColorModeValue('#5E6C84', '#8993A4');
  const hintBg     = useColorModeValue('#F4F5F7', 'rgba(255,255,255,0.04)');
  const hintBorder = useColorModeValue('#DFE1E6', 'rgba(255,255,255,0.08)');

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await authApi.login({ email, password });
      login(response.user, response.token);
      showSuccess('Welcome back to Pulse Delivery!');
      const role = response.user.role.toLowerCase();
      navigate(`/${role}/dashboard`);
    } catch (error) {
      showError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex minH="100dvh" overflow="hidden">
      {/* ── Left panel — deep navy brand showcase ───────────────── */}
      <Flex
        flex="0 0 44%"
        direction="column"
        justify="center"
        px={14}
        display={{ base: 'none', lg: 'flex' }}
        bg="#0A1628"
        color="white"
        position="relative"
        overflow="hidden"
      >
        {/* Subtle background glow */}
        <Box
          position="absolute"
          top="-20%"
          left="-10%"
          w="500px"
          h="500px"
          bg="#0065FF"
          filter="blur(180px)"
          opacity="0.12"
          borderRadius="full"
          pointerEvents="none"
        />
        <Box
          position="absolute"
          bottom="-15%"
          right="-15%"
          w="400px"
          h="400px"
          bg="#4C9AFF"
          filter="blur(160px)"
          opacity="0.08"
          borderRadius="full"
          pointerEvents="none"
        />

        <Box position="relative" zIndex={1}>
          {/* Brand mark */}
          <Flex align="center" gap={3} mb={14}>
            <Flex
              w={10}
              h={10}
              align="center"
              justify="center"
              bg="#0065FF"
              borderRadius="lg"
              boxShadow="0 0 0 1px rgba(0,101,255,0.6), 0 4px 16px rgba(0,101,255,0.3)"
            >
              <Zap size={20} strokeWidth={2.5} color="white" />
            </Flex>
            <Box>
              <Text fontSize="lg" fontWeight="800" fontFamily="heading" letterSpacing="-0.01em" lineHeight="1">
                Pulse Delivery
              </Text>
              <Text fontSize="xs" color="rgba(255,255,255,0.35)" mt={0.5}>
                Logistics Command Center
              </Text>
            </Box>
          </Flex>

          <Heading
            fontSize="3xl"
            fontWeight="800"
            fontFamily="heading"
            lineHeight="1.2"
            letterSpacing="-0.02em"
            mb={4}
          >
            Manage deliveries<br />
            <Text as="span" color="#4C9AFF">end to end.</Text>
          </Heading>

          <Text fontSize="md" color="rgba(255,255,255,0.55)" maxW="380px" lineHeight="1.7" mb={10}>
            Real-time shipment tracking, fleet visibility, and automated dispatch — all in one place.
          </Text>

          {/* Feature list */}
          <VStack align="flex-start" spacing={3}>
            {[
              { icon: Zap,         text: 'Live shipment stage updates'  },
              { icon: MapPin,      text: 'Zone-based fleet management'  },
              { icon: ShieldCheck, text: 'Role-based access control'    },
            ].map(({ icon: Ico, text }) => (
              <Flex
                key={text}
                align="center"
                gap={3}
                bg="rgba(255,255,255,0.04)"
                border="1px solid rgba(255,255,255,0.07)"
                px={4}
                py={3}
                borderRadius="md"
                w="full"
                maxW="360px"
              >
                <Box
                  w={7}
                  h={7}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  bg="rgba(0,101,255,0.25)"
                  borderRadius="sm"
                  flexShrink={0}
                >
                  <Ico size={15} color="#4C9AFF" strokeWidth={2.5} />
                </Box>
                <Text fontSize="sm" fontWeight="500" color="rgba(255,255,255,0.75)">
                  {text}
                </Text>
              </Flex>
            ))}
          </VStack>
        </Box>
      </Flex>

      {/* ── Right panel — sign-in form ───────────────────────────── */}
      <Flex
        flex={1}
        align="center"
        justify="center"
        p={8}
        bg={panelBg}
        position="relative"
      >
        {/* Dark mode toggle */}
        <IconButton
          aria-label="Toggle dark mode"
          icon={colorMode === 'light' ? <Moon size={17} /> : <Sun size={17} />}
          onClick={toggleColorMode}
          position="absolute"
          top={6}
          right={6}
          variant="ghost"
          color={subColor}
          borderRadius="md"
          size="sm"
        />

        <Box w="full" maxW="400px">
          {/* Mobile brand header */}
          <Flex align="center" gap={2.5} mb={8} display={{ base: 'flex', lg: 'none' }}>
            <Flex w={8} h={8} align="center" justify="center" bg="#0065FF" borderRadius="md">
              <Zap size={16} strokeWidth={2.5} color="white" />
            </Flex>
            <Text fontSize="md" fontWeight="800" fontFamily="heading" color={titleColor}>
              Pulse Delivery
            </Text>
          </Flex>

          <Heading
            fontSize="2xl"
            fontWeight="800"
            fontFamily="heading"
            color={titleColor}
            letterSpacing="-0.02em"
            mb={1}
          >
            Sign in
          </Heading>
          <Text color={subColor} mb={7} fontSize="sm">
            New here?{' '}
            <Link as={RouterLink} to="/register" color="brand.500" fontWeight="600" _hover={{ color: 'brand.600' }}>
              Create an account
            </Link>
          </Text>

          <form onSubmit={handleLogin}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel color={labelColor} fontSize="sm" fontWeight="600" mb={1.5}>
                  Email address
                </FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  size="md"
                  bg={inputBg}
                  borderColor={inputBorder}
                  _focus={{ borderColor: 'brand.500', boxShadow: 'brand-glow' }}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel color={labelColor} fontSize="sm" fontWeight="600" mb={1.5}>
                  Password
                </FormLabel>
                <InputGroup size="md">
                  <Input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    bg={inputBg}
                    borderColor={inputBorder}
                    _focus={{ borderColor: 'brand.500', boxShadow: 'brand-glow' }}
                  />
                  <InputRightElement>
                    <IconButton
                      aria-label={showPw ? 'Hide password' : 'Show password'}
                      icon={showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                      variant="ghost"
                      size="xs"
                      onClick={() => setShowPw(p => !p)}
                      color={subColor}
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              <Button
                type="submit"
                w="full"
                size="md"
                isLoading={isLoading}
                loadingText="Signing in…"
                bg="#0065FF"
                color="white"
                fontWeight="600"
                _hover={{ bg: '#0052CC', transform: 'translateY(-1px)', boxShadow: 'md' }}
                _active={{ bg: '#0043A4', transform: 'translateY(0)' }}
                transition="all 0.15s"
                rightIcon={<ArrowRight size={16} />}
                mt={1}
              >
                Sign in to Pulse Delivery
              </Button>
            </VStack>
          </form>

          {/* Google Sign-In */}
          <GoogleAuthButton label="Continue with Google" />

          {/* Demo credentials */}
          <Box
            mt={7}
            p={4}
            borderRadius="md"
            bg={hintBg}
            border="1px solid"
            borderColor={hintBorder}
          >
            <Text
              fontSize="xs"
              fontWeight="700"
              color={subColor}
              mb={2.5}
              textTransform="uppercase"
              letterSpacing="0.06em"
            >
              Demo Credentials
            </Text>
            <VStack align="flex-start" spacing={1.5}>
              {[
                { role: 'Admin',    email: 'admin@delivery.com',  pw: 'admin123'    },
                { role: 'Customer', email: 'customer@test.com',   pw: 'customer123' },
                { role: 'Agent',    email: 'agent@delivery.com',  pw: 'agent123'    },
              ].map(c => (
                <Text key={c.role} fontSize="xs" color={subColor} fontFamily="mono">
                  <Box as="span" fontWeight="700" color={titleColor}>{c.role}:</Box>{' '}
                  {c.email} / {c.pw}
                </Text>
              ))}
            </VStack>
          </Box>
        </Box>
      </Flex>
    </Flex>
  );
}