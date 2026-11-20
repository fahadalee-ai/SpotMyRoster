import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Vercel serves this app at the domain root. Nitro's vercel preset writes
// the Build Output API bundle (`.vercel/output`) that Vercel deploys.
export default defineConfig({
  nitro: {
    preset: "vercel",
  },
  vite: {
    base: "/",
    server: {
      allowedHosts: ["localhost", "127.0.0.1"],
    },
    preview: {
      allowedHosts: ["localhost", "127.0.0.1"],
    },
  },
});
