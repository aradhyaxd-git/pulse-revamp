// Pulse Delivery — Jira-inspired flat stat card
// No gradient blobs, no heavy shadows. Clean left-accent bar design.
import { Box, Flex, Text, Icon, useColorModeValue } from '@chakra-ui/react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  helpText?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  /** Accent color for the left border rail and icon */
  accentColor?: string;
}

export const MetricCard = ({
  label,
  value,
  helpText,
  icon,
  trend,
  accentColor = '#0065FF',
}: MetricCardProps) => {
  const bg      = useColorModeValue('white', '#111E35');
  const border  = useColorModeValue('#DFE1E6', 'rgba(255,255,255,0.07)');
  const labelClr= useColorModeValue('#5E6C84', '#8993A4');
  const valueClr= useColorModeValue('#172B4D', '#E2E8F0');
  const iconBg  = `${accentColor}14`;

  const trendColor = trend === 'up' ? '#22C55E' : trend === 'down' ? '#EF4444' : '#8993A4';
  const TrendIcon  = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : null;

  return (
    <Box
      bg={bg}
      border="1px solid"
      borderColor={border}
      borderRadius="lg"
      overflow="hidden"
      position="relative"
      transition="box-shadow 0.15s, transform 0.15s"
      _hover={{
        boxShadow: useColorModeValue(
          '0 4px 12px rgba(9,30,66,0.10)',
          '0 4px 12px rgba(0,0,0,0.3)'
        ),
        transform: 'translateY(-1px)',
      }}
    >
      {/* Left accent rail — the Jira-style marker */}
      <Box
        position="absolute"
        left={0}
        top={0}
        bottom={0}
        w="3px"
        bg={accentColor}
      />

      <Box px={5} py={4} pl={6}>
        <Flex justify="space-between" align="flex-start">
          <Box flex={1}>
            <Text
              fontSize="xs"
              fontWeight="600"
              color={labelClr}
              textTransform="uppercase"
              letterSpacing="0.06em"
              mb={2}
            >
              {label}
            </Text>

            <Text
              fontSize="2xl"
              fontWeight="700"
              fontFamily="heading"
              color={valueClr}
              lineHeight="1"
              letterSpacing="-0.02em"
            >
              {value}
            </Text>

            {helpText && (
              <Flex align="center" gap={1} mt={2}>
                {TrendIcon && <Icon as={TrendIcon} boxSize={3} color={trendColor} />}
                <Text fontSize="xs" color={trendColor} fontWeight="600">
                  {helpText}
                </Text>
              </Flex>
            )}
          </Box>

          {/* Icon bubble */}
          <Flex
            w={9}
            h={9}
            align="center"
            justify="center"
            borderRadius="md"
            bg={iconBg}
            flexShrink={0}
            ml={3}
          >
            <Icon as={icon} boxSize={4.5} color={accentColor} strokeWidth={2} />
          </Flex>
        </Flex>
      </Box>
    </Box>
  );
};

// Backward-compat alias so existing imports of StatCard still work
export const StatCard = MetricCard;