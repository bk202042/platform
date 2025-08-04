/** @type {import('next').NextConfig} */
const nextConfig = {
  // PERFORMANCE: Advanced optimizations
  experimental: {
    // PPR requires Next.js canary - disabled for stable version
    // ppr: true,
    optimizePackageImports: [
      'lucide-react',
      'date-fns',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-popover',
      '@radix-ui/react-select',
      '@radix-ui/react-avatar',
      '@radix-ui/react-checkbox',
      'embla-carousel-react',
      'react-dropzone',
    ],
  },

  // PERFORMANCE: Turbopack configuration (stable in Next.js 15)
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  // PERFORMANCE: Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
    // Remove React DevTools in production
    reactRemoveProperties: process.env.NODE_ENV === 'production',
  },

  // PERFORMANCE: Advanced webpack configuration
  webpack: (config, { dev }) => {
    // Bundle analyzer (enable with ANALYZE=true)
    if (process.env.ANALYZE === 'true') {
      import('@next/bundle-analyzer').then(({ default: withBundleAnalyzer }) => {
        const analyzer = withBundleAnalyzer({
          enabled: true,
          openAnalyzer: false,
        });
        config.plugins.push(...(analyzer.webpack?.(config, { dev })?.plugins || []));
      });
    }

    // PERFORMANCE: Production optimizations
    if (!dev) {
      // Tree shaking optimization
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        // CRITICAL FIX: Removed sideEffects: false which was causing CSS files 
        // to be treated as JavaScript modules, leading to MIME type errors
        // CSS imports ARE side effects (they modify DOM)
        // Advanced splitting strategy
        splitChunks: {
          ...config.optimization.splitChunks,
          chunks: 'all',
          cacheGroups: {
            ...config.optimization.splitChunks.cacheGroups,
            // Vendor libraries
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10,
            },
            // UI components
            ui: {
              test: /[\\/]node_modules[\\/](@radix-ui|lucide-react)[\\/]/,
              name: 'ui',
              chunks: 'all',
              priority: 20,
            },
            // Common modules
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 5,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }

    // PERFORMANCE: Module resolution optimizations
    config.resolve = {
      ...config.resolve,
      // Faster module resolution
      symlinks: false,
      // Optimize extensions order
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    };

    return config;
  },

  async headers() {
    return [
      {
        // PERFORMANCE: API routes optimization
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' }, // Adjust this for production
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
          // Performance headers
          { key: 'Cache-Control', value: 'public, s-maxage=60, stale-while-revalidate=300' },
        ],
      },
      {
        // PERFORMANCE: Static assets optimization
        source: '/assets/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // PERFORMANCE: Image optimization
        source: '/:path*\\.(jpg|jpeg|png|webp|avif|ico|svg)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=2592000, stale-while-revalidate=86400' },
        ],
      },
      {
        // PERFORMANCE: Font optimization
        source: '/:path*\\.(woff|woff2|ttf|otf)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // PERFORMANCE: General performance headers
        source: '/(.*)',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
          // Compression
          { key: 'Vary', value: 'Accept-Encoding' },
        ],
      },
    ];
  },

  // PERFORMANCE: Advanced image optimization
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "khtcoztdkxhhrudwhhjv.supabase.co",
      },
    ],
    // Modern image formats for better compression
    formats: ['image/avif', 'image/webp'],
    // Aggressive caching for images
    minimumCacheTTL: 60 * 60 * 24 * 90, // 90 days
    // Image sizing optimization
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Security settings
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Optimize loading
    loader: 'default',
    // Unoptimized for development speed
    unoptimized: process.env.NODE_ENV === 'development',
  },

  // PERFORMANCE: Compression and output optimization
  compress: true,
  poweredByHeader: false,
  
  // PERFORMANCE: Output settings for better caching
  generateEtags: true,
  
  // PERFORMANCE: Reduce bundle size in production
  productionBrowserSourceMaps: false,
};

export default nextConfig;
