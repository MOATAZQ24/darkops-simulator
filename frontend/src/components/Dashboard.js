import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Target, 
  Trophy, 
  Clock,
  Activity,
  TrendingUp,
  Zap,
  Eye
} from 'lucide-react';
import { useSession } from '../contexts/SessionContext';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const StatCard = ({ title, value, icon: Icon, color, description, trend }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-cyan-500/40 transition-all duration-300"
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-gray-400 text-sm font-medium">{title}</p>
        <p className="text-3xl font-bold text-white mt-2">{value}</p>
        {description && (
          <p className="text-gray-500 text-xs mt-1">{description}</p>
        )}
        {trend && (
          <div className="flex items-center mt-2 text-xs">
            <TrendingUp className="w-3 h-3 mr-1 text-green-400" />
            <span className="text-green-400">{trend}</span>
          </div>
        )}
      </div>
      <div 
        className="p-3 rounded-lg"
        style={{ backgroundColor: `${color}20`, border: `1px solid ${color}40` }}
      >
        <Icon className="w-6 h-6" style={{ color }} />
      </div>
    </div>
  </motion.div>
);

const AttackPreviewCard = ({ attack, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay }}
    className="bg-gray-900/30 border border-gray-700 rounded-lg p-4 hover:border-cyan-500/40 transition-all duration-300 group"
  >
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <h4 className="font-semibold text-white group-hover:text-cyan-400 transition-colors">
          {attack.name}
        </h4>
        <p className="text-gray-400 text-sm mt-1">{attack.category}</p>
        <p className="text-gray-500 text-xs mt-2 line-clamp-2">{attack.description}</p>
        
        <div className="flex items-center mt-3 space-x-4">
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
      </div>
      
      <Link
        to={`/attack/${attack.id}`}
        className="ml-4 p-2 bg-cyan-500/20 border border-cyan-500/40 rounded-lg hover:bg-cyan-500/30 transition-colors group"
      >
        <Eye className="w-4 h-4 text-cyan-400" />
      </Link>
    </div>
  </motion.div>
);

export const Dashboard = () => {
  const { sessionData, loading } = useSession();
  const [attacks, setAttacks] = useState([]);
  const [userProgress, setUserProgress] = useState([]);
  const [quizScores, setQuizScores] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch attacks
        const attacksResponse = await axios.get(`${API}/attacks`);
        setAttacks(attacksResponse.data);

        // Fetch user progress and quiz scores if session exists
        if (sessionData?.id) {
          try {
            const progressResponse = await axios.get(`${API}/progress/${sessionData.id}`);
            setUserProgress(progressResponse.data);
          } catch (error) {
            console.log('No progress data yet');
          }

          try {
            const scoresResponse = await axios.get(`${API}/quiz/scores/${sessionData.id}`);
            setQuizScores(scoresResponse.data);
          } catch (error) {
            console.log('No quiz scores yet');
          }
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoadingData(false);
      }
    };

    if (!loading) {
      fetchData();
    }
  }, [sessionData, loading]);

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto"
          />
          <p className="text-gray-400 mt-4">Loading DarkOps Lab...</p>
        </div>
      </div>
    );
  }

  const completedAttacks = userProgress.filter(p => p.is_completed).length;
  const totalQuizScore = quizScores.reduce((sum, score) => sum + score.score, 0);
  const averageScore = quizScores.length > 0 ? (totalQuizScore / quizScores.length).toFixed(1) : 0;
  const featuredAttacks = attacks.slice(0, 4);

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
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Welcome to DarkOps Lab
            </h1>
            <p className="text-gray-400 mt-2">
              {sessionData?.nickname ? `Hello, ${sessionData.nickname}` : 'Anonymous Operator'} • 
              Learn cybersecurity through interactive attack simulations
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="px-4 py-2 bg-green-500/20 border border-green-500/40 rounded-lg">
              <span className="text-green-400 text-sm font-medium">System Online</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Attacks Completed"
          value={completedAttacks}
          icon={Target}
          color="#00FFFF"
          description={`of ${attacks.length} total attacks`}
        />
        
        <StatCard
          title="Quiz Average"
          value={`${averageScore}%`}
          icon={Trophy}
          color="#39FF14"
          description={`${quizScores.length} quizzes taken`}
        />
        
        <StatCard
          title="Total Score"
          value={totalQuizScore}
          icon={Zap}
          color="#B100FF"
          description="Points earned"
          trend="+12 this week"
        />
        
        <StatCard
          title="Skill Level"
          value={completedAttacks > 5 ? "Advanced" : completedAttacks > 2 ? "Intermediate" : "Beginner"}
          icon={Activity}
          color="#FF073A"
          description="Based on progress"
        />
      </div>

      {/* Featured Attacks */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Featured Attack Simulations</h2>
          <Link 
            to="/attacks"
            className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
          >
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {featuredAttacks.map((attack, index) => (
            <AttackPreviewCard
              key={attack.id}
              attack={attack}
              delay={index * 0.1}
            />
          ))}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <Link
          to="/quiz"
          className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border border-purple-500/40 rounded-xl p-6 hover:border-purple-500/60 transition-all duration-300 group"
        >
          <Shield className="w-8 h-8 text-purple-400 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-purple-300">
            Quiz Mode
          </h3>
          <p className="text-gray-400 text-sm">
            Test your knowledge with interactive cybersecurity quizzes
          </p>
        </Link>

        <Link
          to="/console"
          className="bg-gradient-to-br from-green-900/50 to-green-800/30 border border-green-500/40 rounded-xl p-6 hover:border-green-500/60 transition-all duration-300 group"
        >
          <Target className="w-8 h-8 text-green-400 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-green-300">
            DarkOps Console
          </h3>
          <p className="text-gray-400 text-sm">
            Practice commands in a simulated hacker terminal
          </p>
        </Link>

        <div className="bg-gradient-to-br from-cyan-900/50 to-cyan-800/30 border border-cyan-500/40 rounded-xl p-6">
          <Activity className="w-8 h-8 text-cyan-400 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            Progress Tracking
          </h3>
          <p className="text-gray-400 text-sm">
            Your learning progress is automatically saved across sessions
          </p>
        </div>
      </motion.div>
    </div>
  );
};