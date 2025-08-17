import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SessionProvider } from './contexts/SessionContext';
import { DarkOpsLayout } from './components/DarkOpsLayout';
import { Dashboard } from './components/Dashboard';
import { AttackDetail } from './components/AttackDetail';
import { AttackCategory } from './components/AttackCategory';

function App() {
  return (
    <div className="App">
      <SessionProvider>
        <BrowserRouter>
          <DarkOpsLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/attack/:attackId" element={<AttackDetail />} />
              <Route path="/category/:categoryId" element={<AttackCategory />} />
              {/* Placeholder routes for future features */}
              <Route path="/quiz" element={<ComingSoon feature="Quiz Mode" />} />
              <Route path="/console" element={<ComingSoon feature="DarkOps Console" />} />
            </Routes>
          </DarkOpsLayout>
        </BrowserRouter>
      </SessionProvider>
    </div>
  );
}

// Temporary component for features under development
const ComingSoon = ({ feature }) => (
  <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
        <span className="text-2xl">🚀</span>
      </div>
      <h2 className="text-3xl font-bold text-white mb-4">{feature}</h2>
      <p className="text-gray-400 mb-6">This feature is under development and will be available soon!</p>
      <p className="text-gray-500 text-sm">Stay tuned for interactive features and enhanced functionality.</p>
    </div>
  </div>
);

export default App;

export default App;
