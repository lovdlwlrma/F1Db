import "./styles/App.css";
import { Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Register from "@/pages/Register";
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
        <Route path="/calendar" element={<Main />} />
        <Route path="/tracks" element={<Main />} />
        <Route path="/drivers" element={<Main />} />
        <Route path="/settings" element={<Main />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Home />} />
        <Route path="/main/*" element={<Main />} />
      </Routes>
    </div>
  );
}

export default App;
