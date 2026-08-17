const path = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: [
        path.join(__dirname, "src/**/*.{html,ts}"),
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
                heading: ['PocketGull VF', 'Outfit', 'Inter', 'sans-serif'],
                marker: ['PocketGull VF', 'Outfit', 'sans-serif'],
                serif: ['Libre Caslon Text', 'Georgia', 'serif'],
                mono: ['PocketGull Mono', 'JetBrains Mono', 'monospace'],
            },
            colors: {
                brand: {
                    blue: {
                        50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd', 400: '#60a5fa',
                        500: '#4285F4', // Google Blue
                        600: '#2563eb', 700: '#1d4ed8', 800: '#1e40af', 900: '#1e3a8a', 950: '#172554',
                    },
                    red: {
                        50: '#fef2f2', 100: '#fee2e2', 200: '#fecaca', 300: '#fca5a5', 400: '#f87171',
                        500: '#EA4335', // Google Red
                        600: '#dc2626', 700: '#b91c1c', 800: '#991b1b', 900: '#7f1d1d', 950: '#450a0a',
                    },
                    amber: {
                        50: '#fefce8', 100: '#fef9c3', 200: '#fef08a', 300: '#fde047', 400: '#facc15',
                        500: '#FBBC05', // Google Yellow
                        600: '#ca8a04', 700: '#a16207', 800: '#854d0e', 900: '#713f12', 950: '#422006',
                    },
                    green: {
                        50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0', 300: '#86efac', 400: '#4ade80',
                        500: '#34A853', // Google Green
                        600: '#16a34a', 700: '#15803d', 800: '#166534', 900: '#14532d', 950: '#052e16',
                    }
                }
            }
        }
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
};
