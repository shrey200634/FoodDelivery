import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            fontFamily: '"Plus Jakarta Sans", sans-serif',
            borderRadius: "12px",
            padding: "14px 20px",
            fontSize: "0.9rem",
            fontWeight: 500,
            boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
          },
        }}
      />
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
