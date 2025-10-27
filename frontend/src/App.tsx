import "./styles/App.css";
import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { setupFrontendLogger } from "@/utils/logger";
import Main from "@/pages/Main";

function App() {
	useEffect(() => {
		setupFrontendLogger();
	}, []);

	return (
		<div className="App">
			<Routes>
				<Route path="/" element={<Main />} />
				<Route path="/telemetry" element={<Main />} />
				<Route path="/live-timing" element={<Main />} />
				<Route path="/analytics" element={<Main />} />
				<Route path="/standings" element={<Main />} />
				<Route path="/schedule" element={<Main />} />
				<Route path="/main/*" element={<Main />} />
			</Routes>
		</div>
	);
}

export default App;
