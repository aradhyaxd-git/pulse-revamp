// src/pages/Customer/CreateOrder/index.tsx
import { useState } from 'react';
import {
  Box, Card, CardBody, VStack, HStack,
  FormControl, FormLabel, Input, Select, Button, Text, Divider,
  Flex, SimpleGrid, useColorModeValue,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Check, Package, MapPin, Ruler, CreditCard } from 'lucide-react';
import { ordersApi } from '../../../api/services/orders';
import { useApiToast } from '../../../hooks/useApiToast';
import { PriceBreakdown } from '../../../types/models';

const STEPS = [
  { label: 'Addresses',  sub: 'Pickup & Drop',      icon: MapPin   },
  { label: 'Package',    sub: 'Details & Options',   icon: Ruler    },
  { label: 'Confirm',    sub: 'Review & Place',      icon: Check    },
];

// Custom horizontal stepper
function Stepper({ activeStep }: { activeStep: number }) {
  const doneClr    = 'brand.500';
  const activeClr  = 'brand.500';
  const inactiveClr= useColorModeValue('#CBD5E1', '#334155');
  const doneText   = 'white';
  const activeText = 'white';
  const inactText  = useColorModeValue('#94A3B8', '#475569');
  const labelClr   = useColorModeValue('#0F172A', '#F1F5F9');
  const subClr     = useColorModeValue('#94A3B8', '#64748B');
  const lineClr    = useColorModeValue('#E2E8F0', '#334155');

  return (
    <Flex justify="space-between" align="flex-start" mb={8} position="relative">
      {/* Connector lines */}
      <Box
        position="absolute"
        top="17px"
        left="calc(16.66% + 8px)"
        right="calc(16.66% + 8px)"
        h="2px"
        bg={lineClr}
        zIndex={0}
      />
      {activeStep >= 1 && (
        <Box
          position="absolute"
          top="17px"
          left="calc(16.66% + 8px)"
          w={activeStep >= 2 ? 'calc(66.66% - 16px)' : 'calc(33.33% - 8px)'}
          h="2px"
          bg="brand.500"
          zIndex={0}
          transition="width 0.3s ease"
        />
      )}

      {STEPS.map((step, i) => {
        const done   = i < activeStep;
        const active = i === activeStep;
        const Ic = step.icon;

        return (
          <Flex key={i} direction="column" align="center" flex={1} position="relative" zIndex={1}>
            <Flex
              w="36px"
              h="36px"
              borderRadius="full"
              bg={done ? 'brand.500' : active ? 'brand.500' : inactiveClr}
              align="center"
              justify="center"
              mb={2}
              boxShadow={active ? '0 0 0 4px rgba(99,102,241,0.2)' : 'none'}
              transition="all 0.2s"
              border="2px solid"
              borderColor={done || active ? 'brand.500' : inactiveClr}
            >
              {done
                ? <Check size={16} color="white" strokeWidth={3} />
                : <Ic size={16} color={active ? 'white' : inactText} strokeWidth={2} />
              }
            </Flex>
            <Text fontSize="xs" fontWeight="700" color={done || active ? labelClr : subClr} textAlign="center">
              {step.label}
            </Text>
            <Text fontSize="10px" color={subClr} textAlign="center">{step.sub}</Text>
          </Flex>
        );
      })}
    </Flex>
  );
}

// Labelled info row for pricing preview
function PriceRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  const subClr = useColorModeValue('#64748B', '#94A3B8');
  const valClr = useColorModeValue('#0F172A', '#F1F5F9');
  return (
    <Flex justify="space-between" align="center">
      <Text fontSize="sm" color={subClr}>{label}</Text>
      <Text fontSize="sm" fontWeight={highlight ? '800' : '600'} color={highlight ? 'brand.500' : valClr}>
        {value}
      </Text>
    </Flex>
  );
}

export default function CreateOrder() {
  const navigate = useNavigate();
  const { showError, showSuccess } = useApiToast();

  // Manual stepper state (avoids Chakra useSteps which requires v2.4+)
  const [activeStep, setActiveStep] = useState(0);
  const goToNext     = () => setActiveStep(s => Math.min(s + 1, 2));
  const goToPrevious = () => setActiveStep(s => Math.max(s - 1, 0));

  // Form State
  const [formData, setFormData] = useState({
    pickupAddress:  '',
    pickupPincode:  '',
    dropAddress:    '',
    dropPincode:    '',
    actualWeightKg: '',
    lengthCm:       '10',
    breadthCm:      '10',
    heightCm:       '10',
    orderType:      'B2C',
    paymentType:    'PREPAID',
  });

  // Pricing State
  const [pricing, setPricing] = useState<PriceBreakdown | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const buildPayload = () => ({
    pickupAddress:  formData.pickupAddress,
    pickupPincode:  formData.pickupPincode,
    dropAddress:    formData.dropAddress,
    dropPincode:    formData.dropPincode,
    orderType:      formData.orderType,
    paymentType:    formData.paymentType,
    actualWeightKg: Number(formData.actualWeightKg),
    lengthCm:       Number(formData.lengthCm),
    breadthCm:      Number(formData.breadthCm),
    heightCm:       Number(formData.heightCm),
  });

  const handlePreview = async () => {
    setIsLoading(true);
    try {
      const response = await ordersApi.previewPricing(buildPayload());
      setPricing(response.breakdown);
      goToNext();
    } catch (error: any) {
      showError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmOrder = async () => {
    setIsLoading(true);
    try {
      const response = await ordersApi.confirmOrder(buildPayload());
      const displayId = response.order.trackingId || response.order.id.slice(0, 8).toUpperCase();
      showSuccess(`Order created! Tracking ID: ${displayId}`);
      navigate(`/customer/orders/${response.order.id}`);
    } catch (error: any) {
      showError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Color tokens
  const pageBg   = useColorModeValue('#F8FAFC', '#0F172A');
  const cardBg   = useColorModeValue('white', '#1E293B');
  const border   = useColorModeValue('#E2E8F0', '#334155');
  const headClr  = useColorModeValue('#0F172A', '#F1F5F9');
  const subClr   = useColorModeValue('#64748B', '#94A3B8');
  const labelClr = useColorModeValue('#475569', '#94A3B8');
  const inputBg  = useColorModeValue('white', '#0F172A');
  const sectionBg= useColorModeValue('#F8FAFC', '#0F172A');
  const divClr   = useColorModeValue('#F1F5F9', '#334155');

  const inputProps = {
    bg: inputBg,
    borderRadius: 'xl' as any,
    borderColor: border,
    fontSize: 'sm' as any,
    _focus: { borderColor: 'brand.400', boxShadow: '0 0 0 3px rgba(99,102,241,0.15)' },
    _placeholder: { color: useColorModeValue('#CBD5E1', '#475569') },
  };

  const labelProps = {
    fontSize: 'sm' as any,
    fontWeight: '600' as any,
    color: labelClr,
    mb: 1.5,
  };

  return (
    <Box minH="100vh" bg={pageBg} pb={12}>
      <Box maxW="2xl" mx="auto">
        {/* Page heading */}
        <Box mb={8}>
          <Text fontSize="xs" fontWeight="700" color="brand.500" textTransform="uppercase" letterSpacing="0.08em" mb={1}>
            New Shipment
          </Text>
          <Text
            fontFamily="heading"
            fontWeight="800"
            fontSize={{ base: '2xl', md: '3xl' }}
            color={headClr}
            letterSpacing="-0.02em"
          >
            Create Order
          </Text>
          <Text fontSize="sm" color={subClr} mt={1}>
            Fill in the details to get an instant price estimate.
          </Text>
        </Box>

        {/* Custom Stepper */}
        <Stepper activeStep={activeStep} />

        {/* Step Card */}
        <Card
          bg={cardBg}
          border="1px solid"
          borderColor={border}
          borderRadius="2xl"
          boxShadow={useColorModeValue('0 4px 24px rgba(15,23,42,0.07)', '0 4px 24px rgba(0,0,0,0.3)')}
          overflow="hidden"
        >
          <CardBody p={{ base: 6, md: 8 }}>

            {/* ─── STEP 1: Addresses ─── */}
            {activeStep === 0 && (
              <VStack spacing={7} align="stretch">
                {/* Pickup section */}
                <Box>
                  <Flex align="center" gap={2} mb={4}>
                    <Box w={7} h={7} bg={useColorModeValue('brand.50', 'rgba(99,102,241,0.12)')} borderRadius="lg" display="flex" alignItems="center" justifyContent="center">
                      <MapPin size={14} color="#6366F1" strokeWidth={2.5} />
                    </Box>
                    <Text fontSize="sm" fontWeight="700" color={headClr}>Pickup Location</Text>
                  </Flex>
                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                    <Box gridColumn={{ md: 'span 2' }}>
                      <FormControl isRequired>
                        <FormLabel {...labelProps}>Address</FormLabel>
                        <Input
                          name="pickupAddress"
                          value={formData.pickupAddress}
                          onChange={handleInputChange}
                          placeholder="Full pickup address"
                          {...inputProps}
                        />
                      </FormControl>
                    </Box>
                    <FormControl isRequired>
                      <FormLabel {...labelProps}>Pincode</FormLabel>
                      <Input
                        name="pickupPincode"
                        value={formData.pickupPincode}
                        onChange={handleInputChange}
                        placeholder="110001"
                        {...inputProps}
                        fontFamily="mono"
                      />
                    </FormControl>
                  </SimpleGrid>
                </Box>

                <Divider borderColor={divClr} />

                {/* Drop section */}
                <Box>
                  <Flex align="center" gap={2} mb={4}>
                    <Box w={7} h={7} bg={useColorModeValue('green.50', 'rgba(16,185,129,0.1)')} borderRadius="lg" display="flex" alignItems="center" justifyContent="center">
                      <MapPin size={14} color="#10B981" strokeWidth={2.5} />
                    </Box>
                    <Text fontSize="sm" fontWeight="700" color={headClr}>Delivery Destination</Text>
                  </Flex>
                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                    <Box gridColumn={{ md: 'span 2' }}>
                      <FormControl isRequired>
                        <FormLabel {...labelProps}>Address</FormLabel>
                        <Input
                          name="dropAddress"
                          value={formData.dropAddress}
                          onChange={handleInputChange}
                          placeholder="Full delivery address"
                          {...inputProps}
                        />
                      </FormControl>
                    </Box>
                    <FormControl isRequired>
                      <FormLabel {...labelProps}>Pincode</FormLabel>
                      <Input
                        name="dropPincode"
                        value={formData.dropPincode}
                        onChange={handleInputChange}
                        placeholder="110002"
                        {...inputProps}
                        fontFamily="mono"
                      />
                    </FormControl>
                  </SimpleGrid>
                </Box>

                <Flex justify="flex-end" pt={2}>
                  <Button
                    rightIcon={<ArrowRight size={16} />}
                    onClick={goToNext}
                    isDisabled={!formData.pickupAddress || !formData.dropAddress || !formData.pickupPincode || !formData.dropPincode}
                    bg="brand.500"
                    color="white"
                    _hover={{ bg: 'brand.600' }}
                    borderRadius="xl"
                    fontWeight="700"
                    px={7}
                    h="44px"
                  >
                    Next: Package Details
                  </Button>
                </Flex>
              </VStack>
            )}

            {/* ─── STEP 2: Package Details ─── */}
            {activeStep === 1 && (
              <VStack spacing={7} align="stretch">
                {/* Weight */}
                <Box>
                  <Flex align="center" gap={2} mb={4}>
                    <Box w={7} h={7} bg={useColorModeValue('violet.50', 'rgba(139,92,246,0.1)')} borderRadius="lg" display="flex" alignItems="center" justifyContent="center">
                      <Package size={14} color="#8B5CF6" strokeWidth={2.5} />
                    </Box>
                    <Text fontSize="sm" fontWeight="700" color={headClr}>Package Weight</Text>
                  </Flex>
                  <FormControl isRequired maxW="280px">
                    <FormLabel {...labelProps}>Actual Weight (kg)</FormLabel>
                    <Input
                      name="actualWeightKg"
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={formData.actualWeightKg}
                      onChange={handleInputChange}
                      placeholder="e.g. 2.5"
                      {...inputProps}
                    />
                  </FormControl>
                </Box>

                <Divider borderColor={divClr} />

                {/* Dimensions */}
                <Box>
                  <Flex align="center" gap={2} mb={4}>
                    <Box w={7} h={7} bg={useColorModeValue('blue.50', 'rgba(59,130,246,0.1)')} borderRadius="lg" display="flex" alignItems="center" justifyContent="center">
                      <Ruler size={14} color="#3B82F6" strokeWidth={2.5} />
                    </Box>
                    <Text fontSize="sm" fontWeight="700" color={headClr}>Dimensions (cm)</Text>
                  </Flex>
                  <SimpleGrid columns={3} spacing={4}>
                    {(['lengthCm', 'breadthCm', 'heightCm'] as const).map((field, i) => (
                      <FormControl key={field} isRequired>
                        <FormLabel {...labelProps}>{['Length', 'Breadth', 'Height'][i]}</FormLabel>
                        <Input
                          name={field}
                          type="number"
                          value={formData[field]}
                          onChange={handleInputChange}
                          placeholder={['L', 'B', 'H'][i]}
                          {...inputProps}
                          textAlign="center"
                        />
                      </FormControl>
                    ))}
                  </SimpleGrid>
                </Box>

                <Divider borderColor={divClr} />

                {/* Order & Payment type */}
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                  <FormControl isRequired>
                    <FormLabel {...labelProps}>Order Type</FormLabel>
                    <Select
                      name="orderType"
                      value={formData.orderType}
                      onChange={handleInputChange}
                      bg={inputBg}
                      borderRadius="xl"
                      borderColor={border}
                      fontSize="sm"
                      _focus={{ borderColor: 'brand.400', boxShadow: '0 0 0 3px rgba(99,102,241,0.15)' }}
                    >
                      <option value="B2C">B2C — Business to Consumer</option>
                      <option value="B2B">B2B — Business to Business</option>
                    </Select>
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel {...labelProps}>Payment Method</FormLabel>
                    <Select
                      name="paymentType"
                      value={formData.paymentType}
                      onChange={handleInputChange}
                      bg={inputBg}
                      borderRadius="xl"
                      borderColor={border}
                      fontSize="sm"
                      _focus={{ borderColor: 'brand.400', boxShadow: '0 0 0 3px rgba(99,102,241,0.15)' }}
                    >
                      <option value="PREPAID">Prepaid</option>
                      <option value="COD">Cash on Delivery (COD)</option>
                    </Select>
                  </FormControl>
                </SimpleGrid>

                <Flex justify="space-between" pt={2}>
                  <Button
                    variant="ghost"
                    leftIcon={<ArrowLeft size={16} />}
                    onClick={goToPrevious}
                    borderRadius="xl"
                    fontWeight="600"
                    color={subClr}
                  >
                    Back
                  </Button>
                  <Button
                    rightIcon={<ArrowRight size={16} />}
                    onClick={handlePreview}
                    isLoading={isLoading}
                    loadingText="Calculating…"
                    isDisabled={!formData.actualWeightKg || Number(formData.actualWeightKg) <= 0}
                    bg="brand.500"
                    color="white"
                    _hover={{ bg: 'brand.600' }}
                    borderRadius="xl"
                    fontWeight="700"
                    px={7}
                    h="44px"
                  >
                    Get Price
                  </Button>
                </Flex>
              </VStack>
            )}

            {/* ─── STEP 3: Pricing Preview & Confirm ─── */}
            {activeStep === 2 && pricing && (
              <VStack spacing={6} align="stretch">
                <Box>
                  <Text fontSize="sm" fontWeight="700" color={headClr} mb={1}>Pricing Breakdown</Text>
                  <Text fontSize="xs" color={subClr}>Review the charges before confirming your order.</Text>
                </Box>

                {/* Pricing card */}
                <Box
                  bg={sectionBg}
                  border="1px solid"
                  borderColor={border}
                  borderRadius="2xl"
                  p={6}
                >
                  <VStack spacing={4} align="stretch" divider={<Divider borderColor={divClr} />}>
                    <PriceRow label="Route" value={`${pricing.fromZoneName} → ${pricing.toZoneName}`} />
                    <PriceRow label="Rate per kg" value={`₹${pricing.ratePerKg}`} />
                    <PriceRow label="Billable weight" value={`${pricing.billableWeight} kg`} />
                    <PriceRow label="Base charge" value={`₹${pricing.base}`} />
                    {pricing.codSurcharge > 0 && (
                      <PriceRow label="COD surcharge" value={`₹${pricing.codSurcharge}`} />
                    )}
                  </VStack>

                  {/* Total */}
                  <Box
                    mt={5}
                    pt={5}
                    borderTop="2px solid"
                    borderColor={useColorModeValue('#C7D2FE', 'rgba(99,102,241,0.3)')}
                    bg={useColorModeValue('#EEF2FF', 'rgba(99,102,241,0.08)')}
                    mx={-6}
                    mb={-6}
                    px={6}
                    py={5}
                    borderBottomRadius="2xl"
                  >
                    <Flex justify="space-between" align="center">
                      <Flex align="center" gap={2}>
                        <CreditCard size={16} color="#6366F1" strokeWidth={2} />
                        <Text fontSize="md" fontWeight="700" color={headClr}>Total Amount</Text>
                      </Flex>
                      <Text
                        fontSize="3xl"
                        fontWeight="900"
                        fontFamily="heading"
                        color="brand.500"
                        letterSpacing="-0.03em"
                      >
                        ₹{pricing.total}
                      </Text>
                    </Flex>
                    {formData.paymentType === 'COD' && (
                      <Text fontSize="xs" color="brand.500" fontWeight="600" mt={1} textAlign="right">
                        To be collected on delivery
                      </Text>
                    )}
                  </Box>
                </Box>

                <Flex justify="space-between" pt={2}>
                  <Button
                    variant="ghost"
                    leftIcon={<ArrowLeft size={16} />}
                    onClick={goToPrevious}
                    isDisabled={isLoading}
                    borderRadius="xl"
                    fontWeight="600"
                    color={subClr}
                  >
                    Edit Details
                  </Button>
                  <Button
                    rightIcon={<Check size={16} strokeWidth={3} />}
                    onClick={handleConfirmOrder}
                    isLoading={isLoading}
                    loadingText="Placing Order…"
                    bg="#059669"
                    color="white"
                    _hover={{ bg: '#047857', boxShadow: '0 6px 20px rgba(5,150,105,0.35)' }}
                    _active={{ bg: '#065F46' }}
                    borderRadius="xl"
                    fontWeight="700"
                    px={7}
                    h="46px"
                    transition="all 0.2s"
                  >
                    Confirm Order
                  </Button>
                </Flex>
              </VStack>
            )}

          </CardBody>
        </Card>
      </Box>
    </Box>
  );
}