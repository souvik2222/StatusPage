import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router";

import HomePage from "./components/home";
import Admin from "./components/pages/admin";
import { LoginForm } from "./components/login-form";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/login" element={<LoginForm />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
