import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { FileProvider } from "./context/FileContext";  // Gunakan FileProvider
import AprioMarket from "./components/home";
import Upload from "./components/upload";
import Register from "./components/register";
import Login from "./components/login";

function App() {
  return (
    <FileProvider> {/* Bungkus semua dengan FileProvider */}
      <Router>
        <Routes>
          <Route path="/" element={<AprioMarket />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/register" element={<Register/>}/>
          <Route path="/login" element={<Login/>}/>
        </Routes>
      </Router>
    </FileProvider>
  );
}

export default App;
