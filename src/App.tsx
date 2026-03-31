import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Scope1SubTab from './pages/Scope1SubTab';
import Scope2SubTab from './pages/Scope2SubTab';
import Scope3SubTab from './pages/Scope3SubTab';
import Biogenics from './pages/Biogenics';
import SolarPower from './pages/SolarPower';
import WindPower from './pages/WindPower';
import EmissionFactors from './pages/EmissionFactors';

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
          {/* Scope 3 sub-tab routes */}
          <Route path="/scope-3" element={<Scope3SubTab />} />
          <Route path="/scope-3/:subTab" element={<Scope3SubTab />} />
          <Route path="/biogenics" element={<Biogenics />} />
          <Route path="/solar-power" element={<SolarPower />} />
          <Route path="/wind-power" element={<WindPower />} />
          <Route path="/emission-factors" element={<EmissionFactors />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
