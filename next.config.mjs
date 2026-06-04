if (process.env.EASYSHOW_OPENNEXT_DEV === "true") {
  const { initOpenNextCloudflareForDev } = await import("@opennextjs/cloudflare");
  initOpenNextCloudflareForDev();
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", ".prisma/client"],
    typedRoutes: true
  }
};

export default nextConfig;
