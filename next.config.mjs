/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // IGNORA errores de TypeScript al construir
    ignoreBuildErrors: true,
  },
  eslint: {
    // IGNORA errores de ESLint al construir
    ignoreDuringBuilds: true,
  },
}

export default nextConfig;
