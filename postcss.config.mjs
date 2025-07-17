/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    // Tailwind CSS plugin processes Tailwind directives and features.
    tailwindcss: {},
    // Autoprefixer adds vendor prefixes to CSS rules.
    // It's crucial for cross-browser compatibility and should run after Tailwind.
    autoprefixer: {},
    // PostCSS Merge Rules optimizes CSS by merging redundant rules.
    // It's typically only needed for production builds to reduce file size.
    ...(process.env.NODE_ENV === 'production' ? { 'postcss-merge-rules': {} } : {}),
  },
};

export default config;
