import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'Figtree', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                navy: {
                    50: '#f2f7fb',
                    100: '#e4eef7',
                    200: '#c3dbee',
                    300: '#91bede',
                    400: '#589bc9',
                    500: '#357eb0',
                    600: '#266594',
                    700: '#1e4f77',
                    800: '#163a59',
                    900: '#0d2942',
                    950: '#081a2e',
                },
            },
            boxShadow: {
                card: '0 1px 2px rgba(8, 26, 46, 0.04), 0 4px 12px rgba(8, 26, 46, 0.06)',
                lift: '0 8px 24px rgba(8, 26, 46, 0.1)',
            },
        },
    },

    plugins: [forms],
};
