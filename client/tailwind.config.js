/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                darkBg: '#0B1A10',
                deepCard: '#0D2818',
                primaryGreen: '#1A6B30',
                neonGreen: '#22C55E',
                accentGreen: '#4ADE80',
                lightBg: '#F0FDF4',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['Space Grotesk', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
