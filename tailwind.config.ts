import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class', 'class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
  	extend: {
  		colors: {
  			loumi: {
  				'50': '#f0fdf9',
  				'100': '#ccfbef',
  				'200': '#9af5de',
  				'300': '#5fe9c9',
  				'400': '#2dd4b0',
  				'500': '#10a37f',
  				'600': '#0d8a6c',
  				'700': '#0f6d57',
  				'800': '#115746',
  				'900': '#12473b',
  				'950': '#052e25'
  			},
  			tier: {
  				community: '#6B7280',
  				'community-light': '#9CA3AF',
  				private: '#3B82F6',
  				'private-light': '#60A5FA',
  				sovereign: '#10B981',
  				'sovereign-light': '#34D399'
  			},
  			provider: {
  				openai: '#10A37F',
  				anthropic: '#D97757',
  				google: '#4285F4'
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		fontFamily: {
  			sans: [
  				'Inter',
  				'system-ui',
  				'-apple-system',
  				'BlinkMacSystemFont',
  				'Segoe UI',
  				'Roboto',
  				'sans-serif'
  			],
  			mono: [
  				'JetBrains Mono',
  				'SFMono-Regular',
  				'Menlo',
  				'Consolas',
  				'Liberation Mono',
  				'monospace'
  			]
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)',
  			'4xl': '2rem'
  		},
  		maxWidth: {
  			chat: '768px'
  		},
  		animation: {
  			'thinking-pulse': 'thinking-pulse 1.5s ease-in-out infinite',
  			'cursor-blink': 'cursor-blink 1s infinite'
  		},
  		keyframes: {
  			'thinking-pulse': {
  				'0%, 100%': {
  					opacity: '0.5'
  				},
  				'50%': {
  					opacity: '1'
  				}
  			},
  			'cursor-blink': {
  				'0%, 50%': {
  					opacity: '1'
  				},
  				'51%, 100%': {
  					opacity: '0'
  				}
  			}
  		}
  	}
  },
  plugins: [require('@tailwindcss/typography'), require("tailwindcss-animate")],
};

export default config;
