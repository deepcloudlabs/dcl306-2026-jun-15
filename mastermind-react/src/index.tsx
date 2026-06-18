import React from "react";
import ReactDOM from "react-dom/client";
import "bootstrap/dist/css/bootstrap.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import PlayerLoses from "./components/loses/Loses";
import PlayerWins from "./components/wins/Wins";
import MastermindProvider from "./provider/MastermindProvider";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element with id 'root' was not found");
}

const root = ReactDOM.createRoot(rootElement);

root.render(
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MastermindProvider />} />
        <Route path="/loses" element={<PlayerLoses />} />
        <Route path="/wins" element={<PlayerWins />} />
      </Routes>
    </BrowserRouter>
);
