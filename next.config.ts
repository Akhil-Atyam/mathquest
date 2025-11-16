import type {NextConfig} from 'next';

/**
 * @type {import('next').NextConfig}
 *
 * @description
 * This is the main configuration file for the Next.js application.
 * It allows customization of various settings like build options, image optimization, and more.
 */
const nextConfig: NextConfig = {
  /* config options here */

  /**
   * TypeScript configuration.
   * `ignoreBuildErrors` is set to true to prevent TypeScript errors from failing the production build.
   * This is useful for rapid prototyping but should be used with caution in production environments.
   */
  typescript: {
    ignoreBuildErrors: true,
  },

  /**
   * ESLint configuration.
   * `ignoreDuringBuilds` is set to true to prevent ESLint errors from failing the production build.
   */
  eslint: {
    ignoreDuringBuilds: true,
  },

  /**
   * Image optimization configuration.
   * `remotePatterns` specifies a list of allowed external domains for optimized images using `next/image`.
   * This is a security measure to prevent arbitrary image hosting.
   */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
