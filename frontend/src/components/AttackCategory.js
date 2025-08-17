import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Eye, Target, ArrowRight } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AttackCard = ({ attack, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-gray-900/50 border border-gray-700 rounded-xl p-6 hover:border-cyan-500/40 transition-all duration-300 group"
  >
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">
        <h3 className="text-xl font-semibold text-white group-hover:text-cyan-400 transition-colors">
          {attack.name}
        </h3>
        <p className="text-gray-400 text-sm mt-2 line-clamp-3">{attack.description}</p>
      </div>
    </div>

    <div className="flex items-center space-x-4 mb-4">
      <span className={`text-xs px-2 py-1 rounded ${
        attack.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
        attack.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
        'bg-red-500/20 text-red-400'
      }`}>
        {attack.difficulty}
      </span>
      <span className="text-xs text-gray-500 flex items-center">
        <Clock className="w-3 h-3 mr-1" />
        {attack.estimated_time}m
      </span>
    </div>

    <Link
      to={`/attack/${attack.id}`}
      className="flex items-center justify-between w-full p-3 bg-cyan-600/20 border border-cyan-500/40 rounded-lg hover:bg-cyan-600/30 transition-colors group-hover:border-cyan-500/60"
    >
      <span className="text-cyan-400 font-medium">Start Simulation</span>
      <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
    </Link>
  </motion.div>
);

export const AttackCategory = () => {
  const { categoryId } = useParams();
  const [attacks, setAttacks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Category mappings
  const categoryNames = {
    'network': 'Network',
    'web-app': 'Web/App',
    'malware': 'Malware',
    'social-engineering': 'Social Engineering',
    'wireless-iot': 'Wireless/IoT',
    'cryptographic': 'Cryptographic',
    'insider-apt': 'Insider/APT',
    'cloud': 'Cloud Attacks'
  };

  const categoryDescriptions = {
    'network': 'Attacks targeting network infrastructure and protocols',
    'web-app': 'Vulnerabilities in web applications and services',
    'malware': 'Malicious software designed to damage or compromise systems',
    'social-engineering': 'Psychological manipulation to gain unauthorized access',
    'wireless-iot': 'Attacks on wireless networks and IoT devices',
    'cryptographic': 'Breaking or bypassing cryptographic protections',
    'insider-apt': 'Advanced persistent threats and insider attacks',
    'cloud': 'Attacks targeting cloud infrastructure and services'
  };

  useEffect(() => {
    const fetchAttacks = async () => {
      try {
        const response = await axios.get(`${API}/attacks`);
        const allAttacks = response.data;
        
        // Filter attacks by category
        const categoryName = categoryNames[categoryId];
        const filteredAttacks = allAttacks.filter(attack => 
          attack.category.toLowerCase() === categoryName?.toLowerCase()
        );
        
        setAttacks(filteredAttacks);
      } catch (error) {
        console.error('Failed to fetch attacks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttacks();
  }, [categoryId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto"
          />
          <p className="text-gray-400 mt-4">Loading attacks...</p>
        </div>
      </div>
    );
  }

  const categoryName = categoryNames[categoryId] || 'Unknown Category';
  const categoryDescription = categoryDescriptions[categoryId] || 'Attack category description not available';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              {categoryName} Attacks
            </h1>
            <p className="text-gray-400 mt-2">{categoryDescription}</p>
            <p className="text-gray-500 text-sm mt-1">
              {attacks.length} attack{attacks.length !== 1 ? 's' : ''} available in this category
            </p>
          </div>
          
          <Link
            to="/"
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </motion.div>

      {/* Attacks Grid */}
      {attacks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {attacks.map((attack, index) => (
            <AttackCard
              key={attack.id}
              attack={attack}
              delay={index * 0.1}
            />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Attacks Available</h3>
          <p className="text-gray-400 mb-6">
            There are currently no attack simulations in the {categoryName} category.
          </p>
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4 mr-2" />
            Explore Other Categories
          </Link>
        </motion.div>
      )}
    </div>
  );
};