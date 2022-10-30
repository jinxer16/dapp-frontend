const runtimeCaching = require('next-pwa/cache');

const withPWA = require('next-pwa')({
  dest: 'public',
  skipWaiting: true,
  register: true,
  disable: process.env.NODE_ENV !== 'production',
  runtimeCaching
});

/** @type {import('next').NextConfig} */
module.exports = withPWA({
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dex',
        permanent: true
      }
    ];
  },
  webpack(config, options) {
    config.module.rules.push({
      test: /\.mp3$/,
      use: {
        loader: 'url-loader'
      }
    });
    return config;
  }
});
