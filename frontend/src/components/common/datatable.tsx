// Pulse Delivery — Jira-style compact data table
import {
  Box, Flex, Button, Text, Spinner, Icon, useColorModeValue, Skeleton,
} from '@chakra-ui/react';
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import { ReactNode } from 'react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  onRowClick?: (item: T) => void;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  emptyLabel?: string;
}

// Skeleton shimmer row for loading state
function SkeletonRows({ cols }: { cols: number }) {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <Box as="tr" key={i}>
          {[...Array(cols)].map((__, j) => (
            <Box as="td" key={j} px={4} py={3}>
              <Skeleton h="14px" borderRadius="sm" />
            </Box>
          ))}
        </Box>
      ))}
    </>
  );
}

export function DataTable<T extends { id: string | number }>({
  columns,
  data,
  isLoading = false,
  onRowClick,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  emptyLabel = 'No records found',
}: DataTableProps<T>) {
  const headBg    = useColorModeValue('#F4F5F7', '#0A1628');
  const headText  = useColorModeValue('#5E6C84', '#8993A4');
  const border    = useColorModeValue('#DFE1E6', 'rgba(255,255,255,0.06)');
  const rowHover  = useColorModeValue('rgba(0,101,255,0.04)', 'rgba(255,255,255,0.03)');
  const cellText  = useColorModeValue('#172B4D', '#CBD5E1');
  const emptyText = useColorModeValue('#8993A4', '#5E6C84');
  const bg        = useColorModeValue('white', '#111E35');
  const oddRow    = useColorModeValue('#FAFBFC', 'rgba(255,255,255,0.015)');

  const isEmpty = !isLoading && (!data || data.length === 0);

  return (
    <Box>
      <Box overflowX="auto">
        <Box as="table" w="full" style={{ borderCollapse: 'collapse' }}>
          {/* Header */}
          <Box as="thead" bg={headBg}>
            <Box as="tr">
              {columns.map((col) => (
                <Box
                  as="th"
                  key={col.key}
                  textAlign="left"
                  px={4}
                  py={2.5}
                  fontSize="10.5px"
                  fontWeight="700"
                  color={headText}
                  letterSpacing="0.07em"
                  textTransform="uppercase"
                  borderBottom="1px solid"
                  borderColor={border}
                  whiteSpace="nowrap"
                >
                  {col.header}
                </Box>
              ))}
            </Box>
          </Box>

          {/* Body */}
          <Box as="tbody" bg={bg}>
            {isLoading ? (
              <SkeletonRows cols={columns.length} />
            ) : isEmpty ? null : (
              data.map((row, rowIdx) => (
                <Box
                  as="tr"
                  key={row.id}
                  onClick={() => onRowClick && onRowClick(row)}
                  cursor={onRowClick ? 'pointer' : 'default'}
                  transition="background 0.1s"
                  bg={rowIdx % 2 === 1 ? oddRow : bg}
                  _hover={onRowClick ? { bg: rowHover } : {}}
                >
                  {columns.map((col) => (
                    <Box
                      as="td"
                      key={`${row.id}-${col.key}`}
                      px={4}
                      py={3}
                      fontSize="sm"
                      color={cellText}
                      borderBottom="1px solid"
                      borderColor={border}
                    >
                      {col.render ? col.render(row) : (row as any)[col.key]}
                    </Box>
                  ))}
                </Box>
              ))
            )}
          </Box>
        </Box>
      </Box>

      {/* Empty state */}
      {isEmpty && (
        <Flex direction="column" align="center" justify="center" py={14} color={emptyText} gap={3}>
          <Icon as={Inbox} boxSize={9} strokeWidth={1.5} />
          <Box textAlign="center">
            <Text fontSize="sm" fontWeight="600" mb={0.5}>{emptyLabel}</Text>
            <Text fontSize="xs">Records will appear here once available.</Text>
          </Box>
        </Flex>
      )}

      {/* Pagination */}
      {totalPages > 1 && onPageChange && (
        <Flex justify="space-between" align="center" mt={4} px={1}>
          <Text fontSize="xs" color={emptyText} fontWeight="500">
            Page {currentPage} of {totalPages}
          </Text>
          <Flex gap={2}>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onPageChange(currentPage - 1)}
              isDisabled={currentPage === 1}
              leftIcon={<ChevronLeft size={13} />}
            >
              Prev
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onPageChange(currentPage + 1)}
              isDisabled={currentPage === totalPages}
              rightIcon={<ChevronRight size={13} />}
            >
              Next
            </Button>
          </Flex>
        </Flex>
      )}
    </Box>
  );
}