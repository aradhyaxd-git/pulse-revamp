import { useEffect, useState } from 'react';
import {
  Box, Heading, Button, Flex, useDisclosure, Text,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody,
  ModalFooter, ModalCloseButton, Input, FormControl, FormLabel,
  SimpleGrid, Card, CardBody, useColorModeValue, Divider, VStack,
} from '@chakra-ui/react';
import { Plus, Map, Tag } from 'lucide-react';
import { adminApi } from '../../../api/services/admin';
import { useApiToast } from '../../../hooks/useApiToast';
import { Zone } from '../../../types/models';

export default function AdminZones() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newZoneName, setNewZoneName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { showSuccess, showError } = useApiToast();

  const fetchZones = async () => {
    setIsLoading(true);
    try {
      const response = await adminApi.getZones();
      setZones(response.zones || []);
    } catch (error) {
      showError(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchZones(); }, []);

  const handleCreateZone = async () => {
    if (!newZoneName.trim()) return;
    setIsCreating(true);
    try {
      await adminApi.createZone({ name: newZoneName.trim() });
      showSuccess('Zone created successfully');
      setNewZoneName('');
      onClose();
      fetchZones();
    } catch (error) {
      showError(error);
    } finally {
      setIsCreating(false);
    }
  };

  const pageBg  = useColorModeValue('#F8FAFC', '#0F172A');
  const cardBg  = useColorModeValue('white', '#1E293B');
  const border  = useColorModeValue('rgba(15,23,42,0.08)', 'rgba(255,255,255,0.06)');
  const headClr = useColorModeValue('#0F172A', '#F1F5F9');
  const subClr  = useColorModeValue('#64748B', '#94A3B8');
  const monoClr = useColorModeValue('#64748B', '#64748B');
  const chipBg  = useColorModeValue('#EEF2FF', 'rgba(99,102,241,0.12)');
  const chipClr = useColorModeValue('#4338CA', '#818CF8');
  const chipBdr = useColorModeValue('#C7D2FE', 'rgba(99,102,241,0.3)');
  const emptyBg = useColorModeValue('#F8FAFC', '#0F172A');
  const modalBg = useColorModeValue('white', '#1E293B');
  const inputBg = useColorModeValue('white', '#0F172A');
  const divClr  = useColorModeValue('rgba(15,23,42,0.06)', 'rgba(255,255,255,0.05)');

  return (
    <Box minH="100vh" bg={pageBg} px={{ base: 4, md: 6 }} py={6}>
      {/* Page Header */}
      <Flex justify="space-between" align="flex-start" mb={7}>
        <Box>
          <Heading
            fontFamily="heading"
            fontWeight="800"
            fontSize={{ base: '2xl', md: '3xl' }}
            color={headClr}
            letterSpacing="-0.02em"
            lineHeight="1.1"
          >
            Delivery Zones
          </Heading>
          <Text mt={1} fontSize="sm" color={subClr} fontWeight="500">
            Manage service zones and pincode coverage areas
          </Text>
        </Box>
        <Button
          leftIcon={<Plus size={16} strokeWidth={2.5} />}
          onClick={onOpen}
          bg="brand.500"
          color="white"
          _hover={{ bg: 'brand.600', transform: 'translateY(-1px)', boxShadow: '0 6px 20px rgba(99,102,241,0.35)' }}
          _active={{ bg: 'brand.700' }}
          borderRadius="xl"
          fontWeight="700"
          size="md"
          transition="all 0.2s"
        >
          Create Zone
        </Button>
      </Flex>

      {/* Zone cards grid */}
      {isLoading ? (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
          {[1, 2, 3].map(i => (
            <Box
              key={i}
              h="120px"
              bg={cardBg}
              borderRadius="2xl"
              border="1px solid"
              borderColor={border}
              opacity={0.6}
            />
          ))}
        </SimpleGrid>
      ) : zones.length === 0 ? (
        <Box
          textAlign="center"
          py={20}
          bg={emptyBg}
          borderRadius="2xl"
          border="1px dashed"
          borderColor={border}
        >
          <Map size={40} color="#94A3B8" style={{ margin: '0 auto 12px' }} strokeWidth={1.5} />
          <Text fontSize="md" fontWeight="600" color={headClr} mb={1}>No zones yet</Text>
          <Text fontSize="sm" color={subClr} mb={5}>Create your first delivery zone to get started.</Text>
          <Button
            leftIcon={<Plus size={14} />}
            onClick={onOpen}
            bg="brand.500"
            color="white"
            size="sm"
            borderRadius="xl"
            fontWeight="700"
          >
            Create Zone
          </Button>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
          {zones.map((zone) => (
            <Card
              key={zone.id}
              bg={cardBg}
              border="1px solid"
              borderColor={border}
              borderRadius="2xl"
              boxShadow={useColorModeValue('0 1px 3px rgba(15,23,42,0.05)', '0 2px 6px rgba(0,0,0,0.2)')}
              _hover={{
                boxShadow: useColorModeValue('0 4px 12px rgba(15,23,42,0.08)', '0 4px 12px rgba(0,0,0,0.3)'),
                transform: 'translateY(-1px)',
              }}
              transition="all 0.2s"
              overflow="hidden"
            >
              {/* Accent top bar */}
              <Box h="3px" bg="linear-gradient(90deg, #6366F1, #818CF8)" />
              <CardBody p={5}>
                <Flex align="center" gap={3} mb={3}>
                  <Box
                    p={2}
                    bg={chipBg}
                    borderRadius="lg"
                    border="1px solid"
                    borderColor={chipBdr}
                  >
                    <Map size={16} color={chipClr} strokeWidth={2} />
                  </Box>
                  <Box>
                    <Text fontSize="md" fontWeight="700" color={headClr} lineHeight="1.2">
                      {zone.name}
                    </Text>
                    <Text fontSize="xs" color={monoClr} fontFamily="mono" mt={0.5}>
                      {zone.id.slice(0, 8)}…
                    </Text>
                  </Box>
                </Flex>

                <Divider borderColor={divClr} mb={3} />

                <Flex align="center" justify="space-between">
                  <Flex align="center" gap={1.5}>
                    <Tag size={13} color={subClr} strokeWidth={2} />
                    <Text fontSize="xs" color={subClr} fontWeight="600">
                      {zone.areas?.length ?? 0} pincode{(zone.areas?.length ?? 0) !== 1 ? 's' : ''}
                    </Text>
                  </Flex>

                  {(zone.areas?.length ?? 0) > 0 && (
                    <Flex gap={1} flexWrap="wrap" justify="flex-end" maxW="60%">
                      {zone.areas?.slice(0, 3).map((area: any, i: number) => (
                        <Box
                          key={i}
                          px={2}
                          py={0.5}
                          bg={chipBg}
                          border="1px solid"
                          borderColor={chipBdr}
                          borderRadius="md"
                        >
                          <Text fontSize="10px" fontWeight="700" color={chipClr} fontFamily="mono">
                            {area.pincode || area}
                          </Text>
                        </Box>
                      ))}
                      {(zone.areas?.length ?? 0) > 3 && (
                        <Box px={2} py={0.5} bg={chipBg} border="1px solid" borderColor={chipBdr} borderRadius="md">
                          <Text fontSize="10px" fontWeight="700" color={chipClr}>
                            +{(zone.areas?.length ?? 0) - 3}
                          </Text>
                        </Box>
                      )}
                    </Flex>
                  )}
                </Flex>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      )}

      {/* Create Zone Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay bg="rgba(15,23,42,0.6)" backdropFilter="blur(4px)" />
        <ModalContent
          bg={modalBg}
          border="1px solid"
          borderColor={divClr}
          borderRadius="2xl"
          boxShadow="0 20px 60px rgba(0,0,0,0.25)"
          mx={4}
        >
          <ModalHeader
            fontFamily="heading"
            fontWeight="700"
            fontSize="lg"
            color={headClr}
            pt={6}
            pb={3}
          >
            Create New Zone
          </ModalHeader>
          <Divider borderColor={divClr} />
          <ModalCloseButton top={4} right={4} color={subClr} />
          <ModalBody py={6}>
            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="600" color={headClr} mb={2}>
                Zone name
              </FormLabel>
              <Input
                value={newZoneName}
                onChange={(e) => setNewZoneName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateZone()}
                placeholder="e.g. North District"
                bg={inputBg}
                borderRadius="xl"
                borderColor={useColorModeValue('#E2E8F0', '#334155')}
                _focus={{ borderColor: 'brand.400', boxShadow: '0 0 0 3px rgba(99,102,241,0.15)' }}
                fontSize="sm"
                autoFocus
              />
              <Text fontSize="xs" color={subClr} mt={2}>
                Choose a clear geographic name — this will be matched to pincodes.
              </Text>
            </FormControl>
          </ModalBody>
          <Divider borderColor={divClr} />
          <ModalFooter gap={3} pt={4} pb={5}>
            <Button
              variant="ghost"
              onClick={onClose}
              borderRadius="xl"
              fontWeight="600"
              color={subClr}
            >
              Cancel
            </Button>
            <Button
              bg="brand.500"
              color="white"
              _hover={{ bg: 'brand.600' }}
              onClick={handleCreateZone}
              isLoading={isCreating}
              isDisabled={!newZoneName.trim()}
              borderRadius="xl"
              fontWeight="700"
              px={6}
            >
              Save Zone
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}