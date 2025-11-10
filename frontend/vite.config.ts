import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
	],
	server: {
		port: 3000,
		open: false,
		proxy: {
			"/api": {
				target: "http://localhost:8080",
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/api/, ""),
			},
			"/livetiming": {
				target: "https://rt-api.f1-dash.com",
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/livetiming/, ""),
				secure: false,
			},
			"/localsse": {
				target: "http://localhost:3031/",
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/localsse/, ""),
				secure: false,
			},
		},
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "src"),
		},
	},
	build: {
		chunkSizeWarningLimit: 1000,
	},
});
