/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        NEXT_PUBLIC_NUTRITIONIX_APP_ID: process.env.NEXT_PUBLIC_NUTRITIONIX_APP_ID,
        NEXT_PUBLIC_NUTRITIONIX_APP_KEY: process.env.NEXT_PUBLIC_NUTRITIONIX_APP_KEY,
        NEXT_PUBLIC_TEST: "Why"
    }
};

export default nextConfig;
