import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import Admin from "./pages/Admin";
import AuthProvider from "./contexts/AuthContext";
import "./index.css";

const isAdmin = window.location.pathname.startsWith("/admin");
const Root = isAdmin ? Admin : App;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <Root />
    </AuthProvider>
  </React.StrictMode>
);
