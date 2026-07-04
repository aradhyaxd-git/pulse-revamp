// Pulse Delivery — Shipment Event Timeline
// Supports both new (nextStage, changedBy) and legacy (toStatus, actor) field names.
import { Box, Flex, Text, VStack, useColorModeValue } from '@chakra-ui/react';
import {
  Package, Truck, CheckCircle, AlertCircle,
  Clock, Navigation, RotateCcw,
} from 'lucide-react';
import { TimelineEvent, OrderStatus } from '../../types/models';
import { StageBadge } from './statusBadge';

interface TimelineProps {
  events: TimelineEvent[];
}

const STAGE_ICON_CONFIG: Record<OrderStatus, { icon: any; color: string; bg: string }> = {
  CREATED:          { icon: Clock,        color: '#5E6C84', bg: '#F4F5F7' },
  PICKED_UP:        { icon: Package,      color: '#7B61FF', bg: '#EEE6FF' },
  IN_TRANSIT:       { icon: Truck,        color: '#0065FF', bg: '#E6EEFF' },
  OUT_FOR_DELIVERY: { icon: Navigation,   color: '#F59E0B', bg: '#FFFAE6' },
  DELIVERED:        { icon: CheckCircle,  color: '#00875A', bg: '#E3FCEF' },
  FAILED:           { icon: AlertCircle,  color: '#DE350B', bg: '#FFEBE6' },
  RESCHEDULED:      { icon: RotateCcw,    color: '#5E6C84', bg: '#F4F5F7' },
};

const STAGE_ICON_DARK: Record<OrderStatus, { color: string; bg: string }> = {
  CREATED:          { color: '#8993A4', bg: 'rgba(94,108,132,0.18)'  },
  PICKED_UP:        { color: '#9B8FE8', bg: 'rgba(123,97,255,0.18)'  },
  IN_TRANSIT:       { color: '#4C9AFF', bg: 'rgba(0,101,255,0.18)'   },
  OUT_FOR_DELIVERY: { color: '#FBBF24', bg: 'rgba(245,158,11,0.18)'  },
  DELIVERED:        { color: '#34D399', bg: 'rgba(0,135,90,0.18)'    },
  FAILED:           { color: '#FF8F73', bg: 'rgba(222,53,11,0.18)'   },
  RESCHEDULED:      { color: '#8993A4', bg: 'rgba(94,108,132,0.15)'  },
};

export const ShipmentTimeline = ({ events }: TimelineProps) => {
  const isDark     = useColorModeValue(false, true);
  const lineColor  = useColorModeValue('#DFE1E6', 'rgba(255,255,255,0.08)');
  const noteColor  = useColorModeValue('#172B4D', '#CBD5E1');
  const metaColor  = useColorModeValue('#8993A4', '#5E6C84');
  const actorColor = useColorModeValue('#5E6C84', '#8993A4');

  if (!events || events.length === 0) {
    return (
      <Flex direction="column" align="center" justify="center" py={10} color={metaColor} gap={3}>
        <Clock size={34} strokeWidth={1.5} />
        <Text fontSize="sm" fontWeight="500">No shipment events yet</Text>
        <Text fontSize="xs" textAlign="center" maxW="220px">
          Updates will appear here as your shipment progresses.
        </Text>
      </Flex>
    );
  }

  const sorted = [...events].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <VStack spacing={0} align="stretch" w="full">
      {sorted.map((event, i) => {
        const isLast = i === sorted.length - 1;
        const isFirst = i === 0;

        // Support both new (nextStage) and legacy (toStatus) field names
        const stage = (event.nextStage ?? event.toStatus ?? 'CREATED') as OrderStatus;
        const baseCfg  = STAGE_ICON_CONFIG[stage] ?? STAGE_ICON_CONFIG.CREATED;
        const darkCfg  = STAGE_ICON_DARK[stage]   ?? STAGE_ICON_DARK.CREATED;
        const iconColor= isDark ? darkCfg.color : baseCfg.color;
        const iconBg   = isDark ? darkCfg.bg    : baseCfg.bg;
        const Ico      = baseCfg.icon;

        // Support both new (changedBy) and legacy (actor) field names
        const actor    = event.changedBy ?? event.actor;
        const actorId  = event.changedById ?? event.actorId ?? '';
        const actorName= actor?.name ?? (actorId ? actorId.slice(0, 8) + '…' : 'System');

        const date    = new Date(event.createdAt);
        const timeStr = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
        const dateStr = date.toLocaleDateString(undefined, {
          month: 'short', day: 'numeric',
          year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
        });

        return (
          <Flex key={event.id} position="relative" pb={isLast ? 0 : 6}>
            {/* Vertical connector line */}
            {!isLast && (
              <Box
                position="absolute"
                left="19px"
                top="40px"
                bottom="-6px"
                w="2px"
                bg={lineColor}
                zIndex={0}
              />
            )}

            {/* Icon node */}
            <Box
              w="40px"
              h="40px"
              borderRadius="lg"
              bg={iconBg}
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexShrink={0}
              zIndex={1}
              border="2px solid"
              borderColor={isFirst ? iconColor + '55' : 'transparent'}
            >
              <Ico size={18} color={iconColor} strokeWidth={2} />
            </Box>

            {/* Content */}
            <Box ml={3.5} pt={0.5} flex={1} minW={0}>
              <Flex justify="space-between" align="flex-start" gap={2} mb={1.5} flexWrap="wrap">
                <StageBadge status={stage} size="sm" />
                <Text fontSize="xs" color={metaColor} fontWeight="500" flexShrink={0}>
                  {dateStr} · {timeStr}
                </Text>
              </Flex>

              <Text fontSize="sm" color={noteColor} lineHeight="1.5" mt={1}>
                {event.notes || `Shipment stage updated to ${stage.replace(/_/g, ' ').toLowerCase()}.`}
              </Text>

              <Text fontSize="xs" color={actorColor} mt={1.5} fontWeight="500">
                Updated by {actorName}
                {actor?.role ? ` · ${actor.role}` : ''}
              </Text>
            </Box>
          </Flex>
        );
      })}
    </VStack>
  );
};

// Backward-compat alias
export const Timeline = ShipmentTimeline;