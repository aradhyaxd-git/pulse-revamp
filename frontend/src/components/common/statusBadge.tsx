// Pulse Delivery — Delivery Stage Badge
// Supports both new (deliveryStage) and legacy (status) field names.
import { Box, Text, useColorModeValue } from '@chakra-ui/react';
import { OrderStatus } from '../../types/models';

interface StageBadgeProps {
  /** Current delivery stage (new name) or legacy status */
  status: OrderStatus;
  size?: 'sm' | 'md' | 'lg';
}

const STAGE_CONFIG: Record<OrderStatus, {
  label: string;
  light: { bg: string; text: string; border: string };
  dark:  { bg: string; text: string; border: string };
  dot: string;
}> = {
  CREATED: {
    label: 'Booked',
    light: { bg: '#F4F5F7', text: '#5E6C84', border: '#DFE1E6' },
    dark:  { bg: 'rgba(94,108,132,0.18)', text: '#8993A4', border: 'rgba(94,108,132,0.3)' },
    dot: '#8993A4',
  },
  PICKED_UP: {
    label: 'Collected',
    light: { bg: '#EEE6FF', text: '#5243AA', border: '#C0B6F2' },
    dark:  { bg: 'rgba(82,67,170,0.2)', text: '#9B8FE8', border: 'rgba(82,67,170,0.35)' },
    dot: '#7B61FF',
  },
  IN_TRANSIT: {
    label: 'En Route',
    light: { bg: '#E6EEFF', text: '#0052CC', border: '#B3D4FF' },
    dark:  { bg: 'rgba(0,101,255,0.15)', text: '#4C9AFF', border: 'rgba(0,101,255,0.3)' },
    dot: '#0065FF',
  },
  OUT_FOR_DELIVERY: {
    label: 'Out for Delivery',
    light: { bg: '#FFFAE6', text: '#974F0C', border: '#FFE380' },
    dark:  { bg: 'rgba(255,196,0,0.15)', text: '#FBBF24', border: 'rgba(255,196,0,0.3)' },
    dot: '#F59E0B',
  },
  DELIVERED: {
    label: 'Delivered',
    light: { bg: '#E3FCEF', text: '#006644', border: '#ABF5D1' },
    dark:  { bg: 'rgba(0,135,90,0.18)', text: '#34D399', border: 'rgba(0,135,90,0.3)' },
    dot: '#00875A',
  },
  FAILED: {
    label: 'Undelivered',
    light: { bg: '#FFEBE6', text: '#BF2600', border: '#FFBDAD' },
    dark:  { bg: 'rgba(191,38,0,0.18)', text: '#FF8F73', border: 'rgba(191,38,0,0.3)' },
    dot: '#DE350B',
  },
  RESCHEDULED: {
    label: 'Deferred',
    light: { bg: '#F4F5F7', text: '#5E6C84', border: '#DFE1E6' },
    dark:  { bg: 'rgba(94,108,132,0.15)', text: '#8993A4', border: 'rgba(94,108,132,0.28)' },
    dot: '#8993A4',
  },
};

export const StageBadge = ({ status, size = 'md' }: StageBadgeProps) => {
  const isDark = useColorModeValue(false, true);
  const cfg = STAGE_CONFIG[status] ?? STAGE_CONFIG.CREATED;
  const colors = isDark ? cfg.dark : cfg.light;

  const px  = size === 'sm' ? '7px'  : size === 'lg' ? '12px' : '9px';
  const py  = size === 'sm' ? '2px'  : size === 'lg' ? '5px'  : '3px';
  const fs  = size === 'sm' ? '10px' : size === 'lg' ? '12px' : '11px';
  const dot = size === 'sm' ? '5px'  : size === 'lg' ? '7px'  : '6px';

  return (
    <Box
      display="inline-flex"
      alignItems="center"
      gap="5px"
      px={px}
      py={py}
      borderRadius="sm"
      bg={colors.bg}
      border="1px solid"
      borderColor={colors.border}
      flexShrink={0}
    >
      <Box
        w={dot}
        h={dot}
        borderRadius="full"
        bg={cfg.dot}
        flexShrink={0}
      />
      <Text
        fontSize={fs}
        fontWeight="700"
        color={colors.text}
        letterSpacing="0.01em"
        textTransform="uppercase"
        lineHeight="1"
        whiteSpace="nowrap"
      >
        {cfg.label}
      </Text>
    </Box>
  );
};

// Backward-compat alias
export const StatusBadge = StageBadge;