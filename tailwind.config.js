const colors = require('tailwindcss/colors')

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    colors: {
      ...colors,
    },
    boxShadow: {
      baseShadow: '0px 0px 56px 0px rgba(0,0,0,0.1);',
    },
    extend: {},
    container: {
      center: true,
      padding: '.75rem',
      margin: '0 auto',
      screens: {
        xs: '1200px',
        sm: '1200px',
        md: '1200px',
        lg: '1200px',
        xl: '1200px',
        xxl: '1200px',
      },
    },
    screens: {
      xs: '375px',
      sm: '600px',
      md: '900px',
      lg: '1200px',
      xl: '1536px',
      xxl: '1850px',
    },
  },
  plugins: [],
}

