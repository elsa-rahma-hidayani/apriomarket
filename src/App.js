// src/App.js
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { DataProvider } from './context/DataContext';
import Home from "./components/home";
import Upload from "./components/upload";
import Promotion from './components/promotion'; 
import Register from "./components/register";
import Login from "./components/login";
import Profile from "./components/profile"; // Import Profile component
import Forgotpassword from "./components/forgotpassword";
import Newpassword from "./components/newpassword"; // Import Newpassword component
import ResetPasswordPopup from "./components/resetpasswordpopup"; // Import ResetPasswordPopup component
import DeleteAccountPopup from "./components/deleteaccountpopup";

function App() {
  return (
    <Router>
      <DataProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/promotion" element={<Promotion />} />
          { <Route path="/register" element={<Register/>}/>}
          {<Route path="/login" element={<Login/>}/>}
          {<Route path="/profile" element={<Profile />} /> /* Add Profile route */}
          {< Route path="/forgotpassword" element={<Forgotpassword />} />}
          {<Route path="/newpassword" element={<Newpassword />} />} {/* Add Newpassword route */}
          {<Route path="/resetpassword" element={<ResetPasswordPopup />} />} {/* Add ResetPasswordPopup route */}
          { <Route path="/deleteaccount" element={<DeleteAccountPopup />} />} {/* Add DeleteAccountPopup route */}
        </Routes>
      </DataProvider>
    </Router>
  );
}

export default App;