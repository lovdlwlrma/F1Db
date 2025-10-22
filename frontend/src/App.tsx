import "./styles/App.css";
import { Routes, Route } from "react-router-dom";
import Main from "@/pages/Main";

function App() {
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
