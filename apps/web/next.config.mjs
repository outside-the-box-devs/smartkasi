/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  transpilePackages: ['@smartkasi/theme', '@astryxdesign/core'],
  turbopack: {},
};

export default nextConfig;

// PWA via @ducanh2912/next-pwa is configured but disabled for Turbopack builds
// For production PWA with Webpack, run: next build --webpack
// Workbox self-generates sw.js on build; manual PWA assets in public/manifest.json handle installability
// To enable full PWA, uncomment:
// import withPWA from '@ducanh2912/next-pwa';
// export default withPWA({ dest: 'public', cacheOnFrontEndNav: true })(nextConfig);
