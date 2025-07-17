import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    // Keep Webpack config as fallback for now
    forceSwcTransforms: true,
  },
  turbopack: true,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Permissions-Policy',
            value: 'clipboard-write=*',
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Prevent Node.js modules from being bundled in the client
      config.resolve.fallback = {
        ...config.resolve.fallback,
        async_hooks: false,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
        child_process: false,
        module: false,
      };
      
      // More comprehensive external marking for client bundles
      config.externals = config.externals || [];
      config.externals.push({
        '@opentelemetry/sdk-trace-node': 'commonjs @opentelemetry/sdk-trace-node',
        '@opentelemetry/context-async-hooks': 'commonjs @opentelemetry/context-async-hooks',
        '@opentelemetry/api': 'commonjs @opentelemetry/api',
        '@opentelemetry/core': 'commonjs @opentelemetry/core',
        '@genkit-ai/ai': 'commonjs @genkit-ai/ai',
        '@genkit-ai/core': 'commonjs @genkit-ai/core',
        '@genkit-ai/googleai': 'commonjs @genkit-ai/googleai',
        'genkit': 'commonjs genkit',
      });
    }
    return config;
  },
  serverExternalPackages: [
    '@opentelemetry/sdk-trace-node',
    '@opentelemetry/context-async-hooks',
    '@genkit-ai/ai',
    '@genkit-ai/core',
    '@genkit-ai/googleai',
  ],
};

export default nextConfig;
