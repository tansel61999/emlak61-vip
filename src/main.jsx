import React from "react";
import ReactDOM from "react-dom/client";
import IlanYonetimi from "./Sayfalar/IlanYonetimi.jsx"; 
import "./index.css"; // <-- Bu satırı ekle!

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <IlanYonetimi />
  </React.StrictMode>
);