import './App.css';
import { useEffect, useMemo, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import AllPosts from './components/AllPosts';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Create from './components/Create';
import Navbar from './components/Navbar';
import Edit from './components/Edit';

function App() {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setInit(true));
  }, []);

  const options = useMemo(
    () => ({
      fullScreen: { enable: true, zIndex: 0 },
      background: { color: { value: "transparent" } },
      fpsLimit: 60,
      particles: {
        color: { value: "#90a4ae" },
        links: { enable: true, color: "#90a4ae", distance: 150, opacity: 0.4 },
        move: { enable: true, speed: 1 },
        number: { value: 50 },
        opacity: { value: 0.5 },
        size: { value: { min: 1, max: 3 } },
      },
    }),
    []
  );

  return (
    <BrowserRouter>
      {init && <Particles id="tsparticles" options={options} />}
      <div style={{ position: "relative", zIndex: 1, minHeight: "100vh" }}>
        {/* Navbar lives inside the router so NavLink can show the active route. */}
        <Navbar />
        <Routes>
          <Route path='/' element={<AllPosts />} />
          <Route path="/create" element={<Create />} />
          <Route path="/edit" element={<Edit />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
