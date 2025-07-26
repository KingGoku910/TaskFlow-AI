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
    cache: true,
  },
  turbopack: {},
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
    // Exclude Node.js modules from client bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        path: false,
        os: false,
        util: false,
        url: false,
        async_hooks: false,
        perf_hooks: false,
        inspector: false,
        worker_threads: false,
        child_process: false,
        dns: false,
        http: false,
        https: false,
        zlib: false,
        stream: false,
        buffer: require.resolve('buffer'),
      };
      
      // Exclude OpenTelemetry packages from client bundle
      config.externals = [
        ...(config.externals || []),
        {
          '@opentelemetry/api': '@opentelemetry/api',
          '@opentelemetry/context-async-hooks': '@opentelemetry/context-async-hooks',
          '@opentelemetry/sdk-trace-node': '@opentelemetry/sdk-trace-node',
          '@opentelemetry/sdk-node': '@opentelemetry/sdk-node',
          '@genkit-ai/core': '@genkit-ai/core',
          'genkit': 'genkit',
        },
      ];
    }
    
    return config;
  },
};

export default nextConfig;
