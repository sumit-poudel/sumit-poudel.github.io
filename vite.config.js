import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import Sitemap from "vite-plugin-sitemap"

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(),react(),Sitemap({hostname: 'https://sumit-poudel.com.np'})],
  server: {
    open: true,
    port: 3000,
  },
});
