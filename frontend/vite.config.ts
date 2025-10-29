import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
		{
			name: "frontend-log-to-terminal",
			configureServer(server) {
				server.middlewares.use("/__log", async (req, res) => {
					if (req.method !== "POST") return res.end();

					let body = "";
					req.on("data", (chunk) => (body += chunk));
					req.on("end", () => {
						try {
							const parsed = JSON.parse(body);
							const level: string = parsed.level ?? "INFO";
							const message: string = parsed.message ?? "";
							const timestamp: string = parsed.timestamp ?? "";
							const caller: string = parsed.caller ?? "unknown";
							const shortcut = caller.includes("/src/")
								? caller.slice(caller.indexOf("/src/"))
								: caller;

							const logObject = {
								level: level.toUpperCase(),
								timestamp: timestamp,
								caller: shortcut,
								msg: message,
							};

							console.log(JSON.stringify(logObject));
						} catch (err) {
							console.log(
								JSON.stringify({
									level: "ERROR",
									timestamp: new Date().toISOString(),
									caller: "frontend/logger.ts",
									msg: "<invalid log payload>",
									error: err instanceof Error ? err.message : err,
								})
							);
						}

						res.end();
					});
				});
			},
		},
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
