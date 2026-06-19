import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BrandSelect from '@/pages/BrandSelect';
import Dashboard from '@/pages/Dashboard';
import ExportPreview from '@/pages/ExportPreview';
import Archive from '@/pages/Archive';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<BrandSelect />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/export" element={<ExportPreview />} />
        <Route path="/archive" element={<Archive />} />
        <Route path="/archive/:id" element={<Archive />} />
      </Routes>
    </Router>
  );
}
