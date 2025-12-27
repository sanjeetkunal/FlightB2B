import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import { ThemeProvider } from "./styles/ThemeProvider.jsx";
import ThemeSwitcher from "./styles/ThemeSwitcher.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <App />
           <ThemeSwitcher />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>

);
