import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@config": resolve(__dirname, "src/config"),
      "@utils": resolve(__dirname, "src/utils"),
      "@theme": resolve(__dirname, "src/theme"),
      "@component": resolve(__dirname, "src/component"),
      "@app": resolve(__dirname, "src/app"),
      "@view": resolve(__dirname, "src/view"),
      "@context": resolve(__dirname, "src/context"),
      "@slices": resolve(__dirname, "src/slices"),
      "@types": resolve(__dirname, "src/types"),
    },
  },
  define:{
    global: "window"
  }
});
