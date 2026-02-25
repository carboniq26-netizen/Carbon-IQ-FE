import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Scope1SubTab from './pages/Scope1SubTab';
import Scope2SubTab from './pages/Scope2SubTab';
import Scope3 from './pages/Scope3';
import Biogenics from './pages/Biogenics';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          {/* Scope 1 sub-tab routes */}
          <Route path="/scope-1" element={<Scope1SubTab />} />
          <Route path="/scope-1/:subTab" element={<Scope1SubTab />} />
          {/* Scope 2 sub-tab routes */}
          <Route path="/scope-2" element={<Scope2SubTab />} />
          <Route path="/scope-2/:subTab" element={<Scope2SubTab />} />
          <Route path="/scope-3" element={<Scope3 />} />
          <Route path="/biogenics" element={<Biogenics />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
