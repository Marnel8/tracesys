/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Fix for face-api.js and other packages that use Node.js modules in browser
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
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
        'fs-extra': false,
        'node-fetch': false,
        'isomorphic-fetch': false,
        'cross-fetch': false,
        'whatwg-fetch': false,
        'whatwg-url': false,
        'url-polyfill': false,
        'node-polyfill-webpack-plugin': false,
        'util': false,
        'buffer': false,
        'process': false,
        'events': false,
        'querystring': false,
        'punycode': false,
        'string_decoder': false,
        'timers': false,
        'constants': false,
        'child_process': false,
        'cluster': false,
        'dgram': false,
        'dns': false,
        'domain': false,
        'module': false,
        'readline': false,
        'repl': false,
        'sys': false,
        'vm': false,
        'worker_threads': false,
      };
    }
    return config;
  },
}

export default nextConfig
