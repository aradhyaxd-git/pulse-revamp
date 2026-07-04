import { useState } from 'react';
import {
  Box, Button, Divider, Flex, Text, Modal, ModalOverlay, ModalContent,
  ModalHeader, ModalBody, ModalCloseButton, useDisclosure, VStack,
  useColorModeValue, HStack, Icon,
} from '@chakra-ui/react';
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { Package, Truck } from 'lucide-react';
import { authApi } from '../../api/services/auth';
import { useApiToast } from '../../hooks/useApiToast';

interface GoogleAuthButtonProps {
  label?: string;
  /** If provided, skips role picker and uses this role directly */
  defaultRole?: 'customer' | 'agent';
}

type Role = 'customer' | 'agent';

const ROLES: { value: Role; label: string; desc: string; icon: any; color: string }[] = [
  {
    value: 'customer',
    label: 'Customer',
    desc: 'Book and track shipments',
    icon: Package,
    color: '#0065FF',
  },
  {
    value: 'agent',
    label: 'Delivery Agent',
    desc: 'Manage and deliver orders',
    icon: Truck,
    color: '#7B61FF',
  },
];

export const GoogleAuthButton = ({ label = 'Continue with Google', defaultRole }: GoogleAuthButtonProps) => {
  const { showError } = useApiToast();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [pendingToken, setPendingToken] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<Role>('customer');
  const [isLoading, setIsLoading] = useState(false);

  // Color tokens
  const dividerClr = useColorModeValue('#DFE1E6', 'rgba(255,255,255,0.1)');
  const orColor    = useColorModeValue('#8993A4', '#5E6C84');
  const bg         = useColorModeValue('white', 'rgba(255,255,255,0.04)');
  const hoverBg    = useColorModeValue('#F4F5F7', 'rgba(255,255,255,0.08)');
  const borderColor= useColorModeValue('#DFE1E6', 'rgba(255,255,255,0.12)');
  const textColor  = useColorModeValue('#172B4D', '#E2E8F0');
  const cardBg     = useColorModeValue('#F8FAFC', 'rgba(255,255,255,0.04)');
  const modalBg    = useColorModeValue('white', '#1E293B');

  const finishLogin = async (accessToken: string, role: Role) => {
    setIsLoading(true);
    try {
      const res = await authApi.googleLogin(accessToken, role);
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      navigate(`/${res.user.role}/dashboard`);
    } catch (err) {
      showError(err);
    } finally {
      setIsLoading(false);
      onClose();
    }
  };

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      if (defaultRole) {
        // Role already known — skip picker
        await finishLogin(tokenResponse.access_token, defaultRole);
      } else {
        // Show role picker modal
        setPendingToken(tokenResponse.access_token);
        onOpen();
      }
    },
    onError: () => showError({ message: 'Google sign-in was cancelled or failed.' }),
  });

  return (
    <>
      {/* OR divider */}
      <Flex align="center" gap={3} my={5}>
        <Divider borderColor={dividerClr} />
        <Text fontSize="xs" fontWeight="600" color={orColor} whiteSpace="nowrap" flexShrink={0}>
          OR
        </Text>
        <Divider borderColor={dividerClr} />
      </Flex>

      {/* Google Button */}
      <Button
        w="full"
        h="44px"
        bg={bg}
        border="1px solid"
        borderColor={borderColor}
        color={textColor}
        fontWeight="600"
        fontSize="sm"
        _hover={{ bg: hoverBg, borderColor: '#0065FF', transform: 'translateY(-1px)' }}
        _active={{ transform: 'translateY(0)' }}
        transition="all 0.15s"
        onClick={() => login()}
        leftIcon={
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        }
      >
        {label}
      </Button>

      {/* Role Picker Modal — shown only for new sign-ups */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="sm">
        <ModalOverlay backdropFilter="blur(8px)" bg="rgba(10,22,40,0.6)" />
        <ModalContent bg={modalBg} borderRadius="2xl" border="1px solid"
          borderColor={useColorModeValue('rgba(0,0,0,0.08)', 'rgba(255,255,255,0.08)')}
          mx={4}
        >
          <ModalHeader pb={0} pt={6} fontSize="lg" fontWeight="800" fontFamily="heading"
            letterSpacing="-0.01em">
            How will you use Pulse?
          </ModalHeader>
          <ModalCloseButton top={4} />
          <ModalBody py={6}>
            <Text fontSize="sm" color={orColor} mb={5}>
              Choose your role. You can only pick one — this affects which dashboard you'll see.
            </Text>

            <VStack spacing={3} mb={6}>
              {ROLES.map((r) => {
                const isSelected = selectedRole === r.value;
                return (
                  <Box
                    key={r.value}
                    as="button"
                    w="full"
                    p={4}
                    borderRadius="xl"
                    border="2px solid"
                    borderColor={isSelected ? r.color : borderColor}
                    bg={isSelected ? `${r.color}11` : cardBg}
                    textAlign="left"
                    onClick={() => setSelectedRole(r.value)}
                    transition="all 0.15s"
                    _hover={{ borderColor: r.color, bg: `${r.color}0D` }}
                  >
                    <HStack spacing={3}>
                      <Box
                        p={2} borderRadius="lg"
                        bg={isSelected ? r.color : useColorModeValue('#F1F5F9', 'rgba(255,255,255,0.06)')}
                      >
                        <r.icon
                          size={18}
                          color={isSelected ? 'white' : r.color}
                          strokeWidth={2}
                        />
                      </Box>
                      <Box>
                        <Text fontWeight="700" fontSize="sm" color={textColor}>{r.label}</Text>
                        <Text fontSize="xs" color={orColor}>{r.desc}</Text>
                      </Box>
                    </HStack>
                  </Box>
                );
              })}
            </VStack>

            <Button
              w="full"
              bg="#0065FF"
              color="white"
              fontWeight="700"
              borderRadius="xl"
              h="44px"
              isLoading={isLoading}
              loadingText="Signing in…"
              _hover={{ bg: '#0052CC' }}
              onClick={() => finishLogin(pendingToken, selectedRole)}
            >
              Continue as {selectedRole === 'customer' ? 'Customer' : 'Agent'}
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
