import { Route, Routes } from "react-router-dom";
import "./App.css";

import Home from "./pages/Home";
import Game from "./pages/Game";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/main" element={<Game />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
