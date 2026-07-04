import { useEffect, useState } from 'react';
import {
  Box, Heading, Card, Tabs, TabList, TabPanels, Tab, TabPanel,
  FormControl, FormLabel, Input, Button, VStack, Flex, Text, Divider,
  Table, Thead, Tbody, Tr, Th, Td, Select,
  useColorModeValue,
} from '@chakra-ui/react';
import { Settings, CreditCard, PercentCircle, Plus } from 'lucide-react';
import { adminApi } from '../../../api/services/admin';
import { useApiToast } from '../../../hooks/useApiToast';

export default function AdminSettings() {
  const { showSuccess, showError } = useApiToast();

  const [zones, setZones] = useState<any[]>([]);
  const [rateCards, setRateCards] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Rate Card Form State
  const [fromZoneId, setFromZoneId] = useState('');
  const [toZoneId, setToZoneId] = useState('');
  const [orderType, setOrderType] = useState('B2C');
  const [ratePerKg, setRatePerKg] = useState('');
  const [isSavingRateCard, setIsSavingRateCard] = useState(false);

  // COD State
  const [codFlatFee, setCodFlatFee] = useState('50');
  const [codPercentage, setCodPercentage] = useState('0');
  const [isSavingCod, setIsSavingCod] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [zonesRes, ratesRes, codRes] = await Promise.all([
        adminApi.getZones(),
        adminApi.getRateCards(),
        adminApi.getCodSurcharges()
      ]);
      setZones(zonesRes.zones || []);
      setRateCards(ratesRes.rateCards || []);

      const b2cCod = codRes.codSurcharges?.find((c: any) => c.orderType === 'B2C');
      if (b2cCod) {
        if (b2cCod.type === 'PERCENTAGE') setCodPercentage(b2cCod.value.toString());
        else setCodFlatFee(b2cCod.value.toString());
      }
    } catch (error) {
      showError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRateCard = async () => {
    if (!fromZoneId || !toZoneId || !ratePerKg) {
      showError('Please select both zones and enter a rate per kg.');
      return;
    }
    setIsSavingRateCard(true);
    try {
      await adminApi.createRateCard({
        fromZoneId,
        toZoneId,
        orderType,
        ratePerKg: Number(ratePerKg),
      });
      showSuccess('Rate card saved successfully');
      // Reset form
      setRatePerKg('');
      // Refresh list
      const ratesRes = await adminApi.getRateCards();
      setRateCards(ratesRes.rateCards || []);
    } catch (error) {
      showError(error);
    } finally {
      setIsSavingRateCard(false);
    }
  };

  const handleSaveCod = async () => {
    setIsSavingCod(true);
    try {
      const type = Number(codPercentage) > 0 ? 'PERCENTAGE' : 'FLAT';
      const value = type === 'PERCENTAGE' ? Number(codPercentage) : Number(codFlatFee);
      await Promise.all([
        adminApi.configureCod({ orderType: 'B2C', type, value }),
        adminApi.configureCod({ orderType: 'B2B', type, value }),
      ]);
      showSuccess('COD configuration updated');
    } catch (error) {
      showError(error);
    } finally {
      setIsSavingCod(false);
    }
  };

  const pageBg   = useColorModeValue('#F8FAFC', '#0F172A');
  const cardBg   = useColorModeValue('white', '#1E293B');
  const border   = useColorModeValue('rgba(15,23,42,0.08)', 'rgba(255,255,255,0.06)');
  const headClr  = useColorModeValue('#0F172A', '#F1F5F9');
  const subClr   = useColorModeValue('#64748B', '#94A3B8');
  const divClr   = useColorModeValue('#E2E8F0', '#334155');
  const inputBg  = useColorModeValue('white', '#0F172A');
  const labelClr = useColorModeValue('#475569', '#94A3B8');

  return (
    <Box minH="100vh" bg={pageBg} px={{ base: 4, md: 6 }} py={6}>
      {/* Page Header */}
      <Box mb={7}>
        <Heading
          fontFamily="heading"
          fontWeight="800"
          fontSize={{ base: '2xl', md: '3xl' }}
          color={headClr}
          letterSpacing="-0.02em"
          lineHeight="1.1"
        >
          Platform Settings
        </Heading>
        <Text mt={1} fontSize="sm" color={subClr} fontWeight="500">
          Configure pricing rules and COD surcharges
        </Text>
      </Box>

      <Card
        bg={cardBg}
        border="1px solid"
        borderColor={border}
        borderRadius="2xl"
        boxShadow={useColorModeValue('0 1px 4px rgba(15,23,42,0.06)', '0 2px 8px rgba(0,0,0,0.3)')}
        overflow="hidden"
        maxW="4xl"
      >
        <Tabs colorScheme="brand" isLazy>
          <TabList
            px={6}
            pt={5}
            borderBottom="1px solid"
            borderColor={divClr}
            gap={2}
          >
            <Tab
              fontSize="sm"
              fontWeight="600"
              pb={4}
              _selected={{ color: 'brand.500', borderColor: 'brand.500', borderBottomWidth: '2px' }}
              color={subClr}
              _hover={{ color: headClr }}
            >
              <Flex align="center" gap={2}>
                <Settings size={14} strokeWidth={2} />
                Pricing & Rate Cards
              </Flex>
            </Tab>
            <Tab
              fontSize="sm"
              fontWeight="600"
              pb={4}
              _selected={{ color: 'brand.500', borderColor: 'brand.500', borderBottomWidth: '2px' }}
              color={subClr}
              _hover={{ color: headClr }}
            >
              <Flex align="center" gap={2}>
                <CreditCard size={14} strokeWidth={2} />
                COD Configuration
              </Flex>
            </Tab>
          </TabList>

          <TabPanels>
            {/* Rate Cards Tab */}
            <TabPanel p={8}>
              <Box mb={6}>
                <Text fontSize="sm" fontWeight="700" color={headClr} mb={1}>
                  Add New Rate Card
                </Text>
                <Text fontSize="sm" color={subClr} lineHeight="1.6">
                  Define custom intra-zone or inter-zone pricing rules.
                </Text>
              </Box>

              <Flex gap={4} mb={8} flexWrap="wrap">
                <FormControl w="150px">
                  <FormLabel fontSize="xs" color={labelClr}>From Zone</FormLabel>
                  <Select
                    value={fromZoneId}
                    onChange={(e) => setFromZoneId(e.target.value)}
                    bg={inputBg} borderColor={divClr} fontSize="sm"
                  >
                    <option value="">Select...</option>
                    {zones.map((z) => (
                      <option key={z.id} value={z.id}>{z.name}</option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl w="150px">
                  <FormLabel fontSize="xs" color={labelClr}>To Zone</FormLabel>
                  <Select
                    value={toZoneId}
                    onChange={(e) => setToZoneId(e.target.value)}
                    bg={inputBg} borderColor={divClr} fontSize="sm"
                  >
                    <option value="">Select...</option>
                    {zones.map((z) => (
                      <option key={z.id} value={z.id}>{z.name}</option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl w="120px">
                  <FormLabel fontSize="xs" color={labelClr}>Order Type</FormLabel>
                  <Select
                    value={orderType}
                    onChange={(e) => setOrderType(e.target.value)}
                    bg={inputBg} borderColor={divClr} fontSize="sm"
                  >
                    <option value="B2C">B2C</option>
                    <option value="B2B">B2B</option>
                  </Select>
                </FormControl>

                <FormControl w="120px">
                  <FormLabel fontSize="xs" color={labelClr}>Rate Per Kg (₹)</FormLabel>
                  <Input
                    type="number"
                    value={ratePerKg}
                    onChange={(e) => setRatePerKg(e.target.value)}
                    bg={inputBg} borderColor={divClr} fontSize="sm"
                  />
                </FormControl>

                <Flex align="flex-end">
                  <Button
                    onClick={handleSaveRateCard}
                    isLoading={isSavingRateCard}
                    bg="brand.500" color="white"
                    _hover={{ bg: 'brand.600' }}
                    leftIcon={<Plus size={16} />}
                  >
                    Save
                  </Button>
                </Flex>
              </Flex>

              <Divider borderColor={divClr} mb={6} />

              <Text fontSize="sm" fontWeight="700" color={headClr} mb={4}>
                Existing Rate Cards
              </Text>

              {rateCards.length === 0 && !isLoading ? (
                <Text fontSize="sm" color={subClr}>No rate cards configured yet.</Text>
              ) : (
                <Box overflowX="auto">
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th color={labelClr}>From Zone</Th>
                        <Th color={labelClr}>To Zone</Th>
                        <Th color={labelClr}>Order Type</Th>
                        <Th color={labelClr} isNumeric>Rate / Kg (₹)</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {rateCards.map((rc) => (
                        <Tr key={rc.id}>
                          <Td fontSize="sm" fontWeight="500">{rc.fromZone?.name}</Td>
                          <Td fontSize="sm" fontWeight="500">{rc.toZone?.name}</Td>
                          <Td fontSize="sm">{rc.orderType}</Td>
                          <Td fontSize="sm" isNumeric fontWeight="600">₹{Number(rc.ratePerKg).toFixed(2)}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              )}
            </TabPanel>

            {/* COD Config Tab */}
            <TabPanel p={8}>
              <Box mb={6}>
                <Text fontSize="sm" fontWeight="700" color={headClr} mb={1}>
                  Cash on Delivery Surcharges
                </Text>
                <Text fontSize="sm" color={subClr} lineHeight="1.6">
                  Configure the additional fees applied to COD orders across both B2C and B2B order types.
                  Either a flat fee or a percentage — not both simultaneously.
                </Text>
              </Box>

              <Divider borderColor={divClr} mb={7} />

              <VStack align="stretch" spacing={5} maxW="md">
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="600" color={labelClr} mb={1.5}>
                    <Flex align="center" gap={2}>
                      <CreditCard size={14} strokeWidth={2} />
                      Flat Fee (₹)
                    </Flex>
                  </FormLabel>
                  <Input
                    type="number"
                    value={codFlatFee}
                    onChange={(e) => setCodFlatFee(e.target.value)}
                    bg={inputBg}
                    borderRadius="xl"
                    borderColor={useColorModeValue('#E2E8F0', '#334155')}
                    _focus={{ borderColor: 'brand.400', boxShadow: '0 0 0 3px rgba(99,102,241,0.15)' }}
                    fontSize="sm"
                    size="lg"
                  />
                  <Text fontSize="xs" color={subClr} mt={1.5}>
                    Applied as a fixed rupee amount on top of the delivery charge.
                  </Text>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="600" color={labelClr} mb={1.5}>
                    <Flex align="center" gap={2}>
                      <PercentCircle size={14} strokeWidth={2} />
                      Additional Percentage (%)
                    </Flex>
                  </FormLabel>
                  <Input
                    type="number"
                    value={codPercentage}
                    onChange={(e) => setCodPercentage(e.target.value)}
                    bg={inputBg}
                    borderRadius="xl"
                    borderColor={useColorModeValue('#E2E8F0', '#334155')}
                    _focus={{ borderColor: 'brand.400', boxShadow: '0 0 0 3px rgba(99,102,241,0.15)' }}
                    fontSize="sm"
                    size="lg"
                  />
                  <Text fontSize="xs" color={subClr} mt={1.5}>
                    If set &gt; 0, overrides the flat fee and uses percentage-based surcharge instead.
                  </Text>
                </FormControl>

                <Flex pt={3}>
                  <Button
                    onClick={handleSaveCod}
                    isLoading={isSavingCod}
                    loadingText="Saving…"
                    bg="brand.500"
                    color="white"
                    _hover={{ bg: 'brand.600', boxShadow: '0 6px 20px rgba(99,102,241,0.35)' }}
                    _active={{ bg: 'brand.700' }}
                    borderRadius="xl"
                    fontWeight="700"
                    px={8}
                    size="lg"
                    h="46px"
                    transition="all 0.2s"
                  >
                    Save COD Rules
                  </Button>
                </Flex>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Card>
    </Box>
  );
}