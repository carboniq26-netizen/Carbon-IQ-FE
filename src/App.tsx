import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Scope1 from './pages/Scope1';
import Scope2 from './pages/Scope2';
import Scope3 from './pages/Scope3';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/scope-1" element={<Scope1 />} />
          <Route path="/scope-2" element={<Scope2 />} />
          <Route path="/scope-3" element={<Scope3 />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
