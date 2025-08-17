import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Wifi, 
  Globe, 
  Bug, 
  Users, 
  Radio, 
  Key, 
  Cloud,
  Terminal,
  Search,
  Menu,
  X,
  User,
  Clock,
  Target
} from 'lucide-react';
import axios from 'axios';

const attackCategories = [
  { id: 'network', name: 'Network', icon: Wifi, color: '#00FFFF' },
  { id: 'web-app', name: 'Web/App', icon: Globe, color: '#39FF14' },
  { id: 'malware', name: 'Malware', icon: Bug, color: '#FF073A' },
  { id: 'social-engineering', name: 'Social Engineering', icon: Users, color: '#B100FF' },
  { id: 'wireless-iot', name: 'Wireless/IoT', icon: Radio, color: '#FFFF00' },
  { id: 'cryptographic', name: 'Cryptographic', icon: Key, color: '#FF6B00' },
  { id: 'insider-apt', name: 'Insider/APT', icon: User, color: '#FF1493' },
  { id: 'cloud', name: 'Cloud Attacks', icon: Cloud, color: '#00BFFF' }
];

export const DarkOpsLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  const sidebarVariants = {
    open: {
      x: 0,
      transition: { type: "spring", stiffness: 300, damping: 30 }
    },
    closed: {
      x: "-100%",
      transition: { type: "spring", stiffness: 300, damping: 30 }
    }
  };

  const overlayVariants = {
    open: { opacity: 1, pointerEvents: "auto" },
    closed: { opacity: 0, pointerEvents: "none" }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-green-400 font-mono">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 bg-gray-900 border border-cyan-500/30 rounded-lg hover:border-cyan-500/60 transition-colors"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile overlay */}
      <motion.div
        className="lg:hidden fixed inset-0 bg-black/80 z-40"
        variants={overlayVariants}
        animate={sidebarOpen ? "open" : "closed"}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <motion.div
        className="fixed inset-y-0 left-0 z-40 w-80 bg-gray-900/95 backdrop-blur-sm border-r border-cyan-500/20 lg:relative lg:translate-x-0"
        variants={sidebarVariants}
        animate={sidebarOpen ? "open" : "closed"}
        initial={false}
      >
        {/* Header */}
        <div className="p-6 border-b border-cyan-500/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                DarkOps Lab
              </h1>
              <p className="text-xs text-gray-400">Cyber Attack Simulator</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search attacks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 text-white placeholder-gray-400"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 pb-4 space-y-1">
          {/* Dashboard */}
          <Link
            to="/"
            className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
              location.pathname === '/' 
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' 
                : 'text-gray-300 hover:bg-gray-800 hover:text-cyan-400'
            }`}
          >
            <Terminal className="w-5 h-5 mr-3" />
            Dashboard
          </Link>

          {/* Attack Categories */}
          <div className="pt-4">
            <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Attack Categories
            </h3>
            <div className="space-y-1">
              {attackCategories
                .filter(category => 
                  searchQuery === '' || 
                  category.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((category) => {
                const IconComponent = category.icon;
                const isActive = location.pathname.includes(`/category/${category.id}`);
                
                return (
                  <Link
                    key={category.id}
                    to={`/category/${category.id}`}
                    className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 group ${
                      isActive
                        ? 'bg-gray-800 border-l-4'
                        : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                    }`}
                    style={{
                      borderLeftColor: isActive ? category.color : 'transparent'
                    }}
                  >
                    <IconComponent 
                      className="w-5 h-5 mr-3 transition-colors" 
                      style={{ color: isActive ? category.color : '' }}
                    />
                    <span className="group-hover:translate-x-1 transition-transform">
                      {category.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Special Features */}
          <div className="pt-6">
            <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Special Features
            </h3>
            <div className="space-y-1">
              <Link
                to="/quiz"
                className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                  location.pathname === '/quiz' 
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-purple-400'
                }`}
              >
                <Shield className="w-5 h-5 mr-3" />
                Quiz Mode
              </Link>
              
              <Link
                to="/console"
                className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                  location.pathname === '/console' 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/40' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-green-400'
                }`}
              >
                <Terminal className="w-5 h-5 mr-3" />
                DarkOps Console
              </Link>
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800">
          <div className="text-xs text-gray-500">
            <p>© 2025 DarkOps Lab</p>
            <p>Educational Use Only</p>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="lg:ml-80 min-h-screen">
        <main className="relative">
          {children}
        </main>
      </div>
    </div>
  );
};