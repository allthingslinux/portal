import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { keycloakify } from "keycloakify/vite-plugin";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    keycloakify({
      themeName: "portal-theme",
      accountThemeImplementation: "none",
      environmentVariables: [
        { name: "PORTAL_LOGO_URL", default: "" },
        { name: "PORTAL_THEME_COLOR", default: "#000000" },
        { name: "PORTAL_SITE_URL", default: "http://localhost:3000" },
      ],
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "../../src"),
      "~": path.resolve(__dirname, "../../src"),
      "@/components/ui": path.resolve(__dirname, "../../src/components/ui"),
      "@/lib/utils": path.resolve(__dirname, "../../src/lib/utils"),
    },
  },
});
