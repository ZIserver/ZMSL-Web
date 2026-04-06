/** @type {import('next').NextConfig} */
const nextConfig = {
    // Avoid issues with strict mode for some ant design components if needed, but usually fine
    reactStrictMode: true,
    transpilePackages: ['antd', '@ant-design/icons', '@ant-design/cssinjs', 'rc-util', 'rc-pagination', 'rc-picker', 'rc-notification', 'rc-tooltip', 'rc-tree', 'rc-table'],
};

export default nextConfig;
