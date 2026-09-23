import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Os anexos sobem dentro de uma Server Action, e o limite por omissão é 1 MB.
  // Acima de ~4,5 MB a própria Vercel recusa o pedido, por isso não vale a pena
  // subir mais — a ação valida o tamanho e explica.
  experimental: { serverActions: { bodySizeLimit: "4.5mb" } },
};

export default nextConfig;
