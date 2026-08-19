/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-ibm-plex-sans)', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['var(--font-ibm-plex-mono)', 'ui-monospace', 'monospace'],
      },
      colors: {
        oliva: {
          DEFAULT: '#365314', // Updated
          secundario: '#4A6800',
          escuro: '#2C3A00',
          hover: '#4A6800',
        },
        ecobrasil: {
          DEFAULT: '#00A651',
          light: '#6BB82D',
        },
        engie: {
          DEFAULT: '#00A3E0',
        },
        grafite: '#17211B',
        mineral: '#F3F4EF',
        areia: '#D8C8A4',
        divisor: '#DCE2DC',
        reservalegal: '#4B8B3B', // Added
        parquesspe: '#A8C98F', // Added
        status: {
          concluido: '#168F55', // Updated
          andamento: '#E5A413', // Updated
          atrasado: '#CE4038', // Updated
          planejado: '#6242B5', // Updated (was suspenso)
          naoiniciado: '#88928B',
        },
      },
      borderRadius: {
        'atlas': '12px',
      },
      boxShadow: {
        'atlas': '0 4px 20px -2px rgba(23, 33, 27, 0.08), 0 2px 6px -1px rgba(23, 33, 27, 0.04)',
        'atlas-hover': '0 10px 25px -3px rgba(23, 33, 27, 0.12), 0 4px 10px -2px rgba(23, 33, 27, 0.06)',
      },
    },
  },
  plugins: [],
};
