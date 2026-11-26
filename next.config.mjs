// WEALTH_DEV_HOST: this machine's address when the app is opened by IP in development (lets hot reload through). Unset on Vercel.
const devHost = process.env.WEALTH_DEV_HOST;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  ...(devHost ? { allowedDevOrigins: [devHost] } : {}),
};

export default nextConfig;
