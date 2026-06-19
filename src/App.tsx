import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BrandSelect from '@/pages/BrandSelect';
import Dashboard from '@/pages/Dashboard';
import ExportPreview from '@/pages/ExportPreview';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<BrandSelect />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/export" element={<ExportPreview />} />
      </Routes>
    </Router>
  );
}
