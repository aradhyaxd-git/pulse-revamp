import { extendTheme, StyleFunctionProps } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';

// ─── Pulse Delivery — Jira-Inspired Blue Design System ───────────────────────
// Primary: Electric Blue (#0052CC / #0065FF)
// Sidebar:  Deep Navy (#0A1628)
// Surface:  White / Slate-900
// Typography: Inter + Plus Jakarta Sans

const theme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },

  colors: {
    // Jira-blue primary palette
    brand: {
      50:  '#E6EEFF',
      100: '#CCE0FF',
      200: '#99C0FF',
      300: '#4C9AFF',
      400: '#2684FF',
      500: '#0065FF', // Electric blue — primary CTA
      600: '#0052CC', // Jira flagship blue
      700: '#0043A4',
      800: '#003480',
      900: '#002766',
    },
    // Deep navy — sidebar, dark surfaces
    navy: {
      50:  '#E8EEF8',
      100: '#C5D3EC',
      200: '#8EA8D6',
      300: '#5679B8',
      400: '#2B4FA0',
      500: '#0A2464',
      600: '#091D52',
      700: '#071640',
      800: '#050F2E',
      900: '#02081C',
      950: '#010510',
    },
    slate: {
      50:  '#F8FAFC',
      100: '#F1F5F9',
      200: '#E2E8F0',
      300: '#CBD5E1',
      400: '#94A3B8',
      500: '#64748B',
      600: '#475569',
      700: '#334155',
      800: '#1E293B',
      900: '#0F172A',
      950: '#020617',
    },
    emerald: {
      50:  '#ECFDF5',
      100: '#D1FAE5',
      400: '#34D399',
      500: '#10B981',
      600: '#059669',
      900: '#064E3B',
    },
    amber: {
      50:  '#FFFBEB',
      100: '#FEF3C7',
      400: '#FBBF24',
      500: '#F59E0B',
      600: '#D97706',
      900: '#78350F',
    },
    rose: {
      50:  '#FFF1F2',
      100: '#FFE4E6',
      400: '#FB7185',
      500: '#F43F5E',
      600: '#E11D48',
      900: '#881337',
    },
  },

  semanticTokens: {
    colors: {
      'page.bg':        { default: '#F4F5F7',  _dark: '#0F172A' },
      'surface':        { default: 'white',    _dark: '#1E293B' },
      'surface.subtle': { default: '#F4F5F7',  _dark: '#0F1E30' },
      'border.muted':   { default: '#DFE1E6', _dark: 'rgba(255,255,255,0.08)' },
      'text.primary':   { default: '#172B4D',  _dark: '#E2E8F0' },
      'text.secondary': { default: '#5E6C84',  _dark: '#94A3B8' },
      'text.muted':     { default: '#8993A4',  _dark: '#64748B' },
      'sidebar.bg':     { default: '#0A1628',  _dark: '#0A1628' },
      'sidebar.active': { default: 'rgba(0,101,255,0.18)', _dark: 'rgba(0,101,255,0.22)' },
    },
  },

  fonts: {
    heading: `'Plus Jakarta Sans', 'Inter', system-ui, sans-serif`,
    body:    `'Inter', system-ui, sans-serif`,
    mono:    `ui-monospace, 'SFMono-Regular', Menlo, Monaco, Consolas, monospace`,
  },

  fontSizes: {
    '2xs': '0.625rem',
    xs:   '0.75rem',
    sm:   '0.875rem',
    md:   '1rem',
    lg:   '1.125rem',
    xl:   '1.25rem',
    '2xl':'1.5rem',
    '3xl':'1.875rem',
    '4xl':'2.25rem',
    '5xl':'3rem',
  },

  lineHeights: {
    normal: 'normal',
    none:   '1',
    shorter:'1.25',
    short:  '1.375',
    base:   '1.5',
    tall:   '1.625',
    taller: '2',
  },

  radii: {
    none: '0',
    sm:   '0.25rem',
    base: '0.375rem',
    md:   '0.5rem',
    lg:   '0.625rem',
    xl:   '0.75rem',
    '2xl':'1rem',
    '3xl':'1.25rem',
    full: '9999px',
  },

  shadows: {
    xs:   '0 1px 2px 0 rgba(9,30,66,0.04)',
    sm:   '0 1px 3px 0 rgba(9,30,66,0.08), 0 1px 2px -1px rgba(9,30,66,0.04)',
    md:   '0 4px 8px -2px rgba(9,30,66,0.10), 0 2px 4px -2px rgba(9,30,66,0.06)',
    lg:   '0 8px 16px -4px rgba(9,30,66,0.10), 0 4px 6px -4px rgba(9,30,66,0.05)',
    xl:   '0 20px 30px -8px rgba(9,30,66,0.12), 0 8px 12px -6px rgba(9,30,66,0.06)',
    'dark-xs': '0 1px 2px 0 rgba(0,0,0,0.3)',
    'dark-sm': '0 2px 4px 0 rgba(0,0,0,0.35)',
    'dark-md': '0 4px 12px 0 rgba(0,0,0,0.4)',
    'brand-glow': '0 0 0 3px rgba(0,101,255,0.22)',
    'brand-ring': '0 0 0 2px rgba(0,101,255,0.4)',
    inner: 'inset 0 2px 4px 0 rgba(9,30,66,0.05)',
  },

  styles: {
    global: (props: StyleFunctionProps) => ({
      'html, body': {
        bg: mode('#F4F5F7', '#0F172A')(props),
        color: mode('#172B4D', '#E2E8F0')(props),
        fontSize: '14px',
        lineHeight: '1.6',
        WebkitFontSmoothing: 'antialiased',
      },
      '::selection': {
        bg: 'rgba(0,101,255,0.15)',
      },
      '::-webkit-scrollbar': { w: '6px', h: '6px' },
      '::-webkit-scrollbar-track': { bg: 'transparent' },
      '::-webkit-scrollbar-thumb': {
        bg: mode('#DFE1E6', '#334155')(props),
        borderRadius: 'full',
      },
    }),
  },

  components: {
    Button: {
      baseStyle: {
        fontFamily: 'body',
        fontWeight: '500',
        borderRadius: 'md',
        letterSpacing: '0',
        transition: 'all 0.15s ease',
        _focusVisible: { boxShadow: 'brand-glow' },
      },
      sizes: {
        xs: { h: '28px', minW: '28px', fontSize: 'xs', px: 3 },
        sm: { h: '32px', minW: '32px', fontSize: 'sm', px: 3 },
        md: { h: '36px', minW: '36px', fontSize: 'sm', px: 4 },
        lg: { h: '42px', minW: '42px', fontSize: 'md', px: 5 },
        xl: { h: '52px', minW: '52px', fontSize: 'md', px: 7 },
      },
      variants: {
        solid: (props: StyleFunctionProps) => ({
          bg: props.colorScheme === 'brand' ? 'brand.500' : undefined,
          color: 'white',
          _hover: {
            bg: props.colorScheme === 'brand' ? 'brand.600' : undefined,
            transform: 'translateY(-1px)',
            boxShadow: 'md',
          },
          _active: { transform: 'translateY(0)', boxShadow: 'sm' },
        }),
        outline: (props: StyleFunctionProps) => ({
          borderColor: props.colorScheme === 'brand' ? 'brand.500' : undefined,
          color: props.colorScheme === 'brand' ? 'brand.600' : undefined,
          _hover: { bg: props.colorScheme === 'brand' ? 'brand.50' : undefined },
          _dark: {
            borderColor: props.colorScheme === 'brand' ? 'brand.400' : undefined,
            color: 'brand.300',
            _hover: { bg: 'rgba(0,101,255,0.12)' },
          },
        }),
        ghost: {
          _hover: { bg: mode('rgba(9,30,66,0.06)', 'rgba(255,255,255,0.06)') },
        },
        // Jira-style subtle button
        subtle: (props: StyleFunctionProps) => ({
          bg: mode('rgba(9,30,66,0.05)', 'rgba(255,255,255,0.06)')(props),
          color: mode('#172B4D', '#E2E8F0')(props),
          _hover: {
            bg: mode('rgba(9,30,66,0.08)', 'rgba(255,255,255,0.10)')(props),
          },
        }),
      },
      defaultProps: { colorScheme: 'brand', variant: 'solid' },
    },

    Card: {
      baseStyle: (props: StyleFunctionProps) => ({
        container: {
          bg: mode('white', '#1A2744')(props),
          borderRadius: 'lg',
          boxShadow: mode('sm', 'dark-sm')(props),
          border: '1px solid',
          borderColor: mode('#DFE1E6', 'rgba(255,255,255,0.08)')(props),
          overflow: 'hidden',
          transition: 'box-shadow 0.15s',
        },
      }),
      variants: {
        elevated: (props: StyleFunctionProps) => ({
          container: {
            boxShadow: mode('md', 'dark-md')(props),
            border: 'none',
          },
        }),
        outline: (props: StyleFunctionProps) => ({
          container: {
            bg: mode('white', '#1E293B')(props),
            boxShadow: 'none',
            border: '1px solid',
            borderColor: mode('#DFE1E6', 'rgba(255,255,255,0.08)')(props),
          },
        }),
        subtle: (props: StyleFunctionProps) => ({
          container: {
            bg: mode('#F4F5F7', 'rgba(255,255,255,0.04)')(props),
            border: '1px solid',
            borderColor: mode('#DFE1E6', 'rgba(255,255,255,0.06)')(props),
            boxShadow: 'none',
          },
        }),
      },
    },

    Input: {
      variants: {
        outline: (props: StyleFunctionProps) => ({
          field: {
            bg: mode('white', '#0F172A')(props),
            borderColor: mode('#DFE1E6', 'rgba(255,255,255,0.12)')(props),
            borderRadius: 'md',
            fontSize: 'sm',
            _placeholder: { color: mode('#8993A4', '#64748B')(props) },
            _hover: { borderColor: mode('#B0B7C3', 'rgba(255,255,255,0.2)')(props) },
            _focus: {
              borderColor: 'brand.500',
              boxShadow: 'brand-glow',
              bg: mode('white', '#0F172A')(props),
            },
          },
        }),
        filled: (props: StyleFunctionProps) => ({
          field: {
            bg: mode('#F4F5F7', 'rgba(255,255,255,0.06)')(props),
            borderColor: 'transparent',
            borderRadius: 'md',
            _hover: { bg: mode('#EBECF0', 'rgba(255,255,255,0.10)')(props) },
            _focus: {
              bg: mode('white', '#0F172A')(props),
              borderColor: 'brand.500',
              boxShadow: 'brand-glow',
            },
          },
        }),
      },
      defaultProps: { variant: 'outline', focusBorderColor: 'brand.500' },
    },

    Select: {
      variants: {
        outline: (props: StyleFunctionProps) => ({
          field: {
            bg: mode('white', '#0F172A')(props),
            borderColor: mode('#DFE1E6', 'rgba(255,255,255,0.12)')(props),
            borderRadius: 'md',
            fontSize: 'sm',
            _hover: { borderColor: mode('#B0B7C3', 'rgba(255,255,255,0.2)')(props) },
            _focus: { borderColor: 'brand.500', boxShadow: 'brand-glow' },
          },
        }),
      },
      defaultProps: { variant: 'outline', focusBorderColor: 'brand.500' },
    },

    Textarea: {
      variants: {
        outline: (props: StyleFunctionProps) => ({
          bg: mode('white', '#0F172A')(props),
          borderColor: mode('#DFE1E6', 'rgba(255,255,255,0.12)')(props),
          borderRadius: 'md',
          fontSize: 'sm',
          _focus: { borderColor: 'brand.500', boxShadow: 'brand-glow' },
        }),
      },
    },

    Badge: {
      baseStyle: {
        fontFamily: 'body',
        fontWeight: '700',
        letterSpacing: '0.01em',
        borderRadius: 'sm',
        fontSize: '0.65rem',
        textTransform: 'uppercase',
      },
    },

    Table: {
      variants: {
        simple: (props: StyleFunctionProps) => ({
          th: {
            bg: mode('#F4F5F7', '#0A1628')(props),
            color: mode('#5E6C84', '#8993A4')(props),
            fontSize: '0.68rem',
            fontWeight: '700',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            py: 3,
            borderColor: mode('#DFE1E6', 'rgba(255,255,255,0.06)')(props),
          },
          td: {
            fontSize: 'sm',
            color: mode('#172B4D', '#CBD5E1')(props),
            borderColor: mode('#EBECF0', 'rgba(255,255,255,0.05)')(props),
            py: 3,
          },
          tr: {
            _hover: { bg: mode('#F4F5F7', 'rgba(255,255,255,0.03)')(props) },
          },
        }),
      },
    },

    Modal: {
      baseStyle: (props: StyleFunctionProps) => ({
        dialog: {
          bg: mode('white', '#1A2744')(props),
          borderRadius: 'xl',
          boxShadow: 'xl',
          border: '1px solid',
          borderColor: mode('#DFE1E6', 'rgba(255,255,255,0.08)')(props),
        },
        header: {
          fontSize: 'lg',
          fontWeight: '700',
          fontFamily: 'heading',
          color: mode('#172B4D', '#E2E8F0')(props),
        },
        overlay: { bg: 'rgba(9,30,66,0.54)', backdropFilter: 'blur(4px)' },
      }),
    },

    Menu: {
      baseStyle: (props: StyleFunctionProps) => ({
        list: {
          bg: mode('white', '#1A2744')(props),
          borderColor: mode('#DFE1E6', 'rgba(255,255,255,0.08)')(props),
          boxShadow: 'lg',
          borderRadius: 'lg',
          py: 1.5,
        },
        item: {
          fontSize: 'sm',
          color: mode('#172B4D', '#CBD5E1')(props),
          bg: 'transparent',
          _hover: { bg: mode('#F4F5F7', 'rgba(255,255,255,0.06)')(props) },
        },
      }),
    },

    Tabs: {
      variants: {
        line: (props: StyleFunctionProps) => ({
          tab: {
            fontSize: 'sm',
            fontWeight: '500',
            color: mode('#5E6C84', '#8993A4')(props),
            _selected: { color: 'brand.500', borderColor: 'brand.500', fontWeight: '600' },
          },
          tablist: { borderColor: mode('#DFE1E6', 'rgba(255,255,255,0.08)')(props) },
        }),
        'soft-rounded': (props: StyleFunctionProps) => ({
          tab: {
            fontSize: 'sm',
            fontWeight: '500',
            borderRadius: 'md',
            color: mode('#5E6C84', '#8993A4')(props),
            _selected: {
              color: 'brand.600',
              bg: mode('brand.50', 'rgba(0,101,255,0.15)')(props),
              fontWeight: '600',
            },
          },
        }),
      },
    },

    Progress: {
      baseStyle: {
        track: { borderRadius: 'full' },
        filledTrack: { borderRadius: 'full', transition: 'width 0.4s ease' },
      },
    },

    Alert: {
      variants: {
        'left-accent': (props: StyleFunctionProps) => ({
          container: {
            borderRadius: 'md',
            bg: mode(
              props.status === 'error' ? '#FFF1F2' :
              props.status === 'warning' ? '#FFFBEB' :
              props.status === 'success' ? '#ECFDF5' : '#E6EEFF',
              props.status === 'error' ? 'rgba(244,63,94,0.1)' :
              props.status === 'warning' ? 'rgba(245,158,11,0.1)' :
              props.status === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(0,101,255,0.1)',
            )(props),
          },
        }),
      },
    },
  },
});

export default theme;