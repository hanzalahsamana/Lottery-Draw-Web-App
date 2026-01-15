import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    global: {}, // 👈 THIS FIXES sockjs-client
  },
  // server: {
  //   proxy: {
  //     "/MGPE":  {
  //       target: "https://demo.alotsystems.com:8000",
  //       changeOrigin: true,
  //       secure: false,
  //     },
  //   },
  // },
});
