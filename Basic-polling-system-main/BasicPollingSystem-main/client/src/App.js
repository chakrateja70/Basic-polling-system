import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { STDashBoard } from "./pages/STDashBoard";
import { SignupPage } from "./pages/SignupPage";
import { LandingPage } from "./pages/LandingPage";
import { ProfilePage } from "./pages/ProfilePage";
import { ADashBoard } from "./pages/ADashBoard";
import { CreatePollPage } from "./pages/CreatePollPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" index element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashBoard/:email" element={<STDashBoard />} />
        <Route path="/adminDashBoard/:email" element={<ADashBoard />} />
        <Route path="/profile/:email" element={<ProfilePage />} />
        <Route path="/createPoll" element={<CreatePollPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
