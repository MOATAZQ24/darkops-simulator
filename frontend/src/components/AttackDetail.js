import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Shield,
  Clock,
  Target,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useSession } from '../contexts/SessionContext';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SimulationPanel = ({ attack, currentStep, isPlaying, onStepChange }) => {
  const [animationKey, setAnimationKey] = useState(0);

  const resetAnimation = () => {
    setAnimationKey(prev => prev + 1);
  };

  useEffect(() => {
    resetAnimation();
  }, [currentStep]);

  const getStepVisualization = (step) => {
    // Different visualization types based on attack category
    const category = attack.category.toLowerCase();
    
    if (category.includes('network')) {
      return <NetworkVisualization step={step} isPlaying={isPlaying} animationKey={animationKey} />;
    } else if (category.includes('malware')) {
      return <MalwareVisualization step={step} isPlaying={isPlaying} animationKey={animationKey} />;
    } else if (category.includes('web')) {
      return <WebVisualization step={step} isPlaying={isPlaying} animationKey={animationKey} />;
    } else {
      return <GenericVisualization step={step} isPlaying={isPlaying} animationKey={animationKey} />;
    }
  };

  if (!attack.steps || attack.steps.length === 0) {
    return (
      <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-8 text-center">
        <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <p className="text-gray-400">No simulation steps available for this attack</p>
      </div>
    );
  }

  const step = attack.steps[currentStep] || attack.steps[0];

  return (
    <div className="bg-gray-900/50 border border-gray-700 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600/20 to-purple-600/20 border-b border-gray-700 p-4">
        <h3 className="text-lg font-semibold text-white">Attack Simulation</h3>
        <p className="text-gray-300 text-sm mt-1">{step.title}</p>
      </div>

      {/* Visualization Area */}
      <div className="relative h-80 bg-gray-950/50 flex items-center justify-center overflow-hidden">
        {getStepVisualization(step)}
        
        {/* Step indicator overlay */}
        <div className="absolute top-4 right-4 bg-gray-800/90 backdrop-blur-sm rounded-lg px-3 py-2">
          <span className="text-cyan-400 text-sm font-mono">
            Step {currentStep + 1}/{attack.steps.length}
          </span>
        </div>
      </div>

      {/* Description */}
      <div className="p-4 border-t border-gray-700">
        <p className="text-gray-300">{step.description}</p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between p-4 bg-gray-900/30 border-t border-gray-700">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onStepChange(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="p-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => onStepChange(Math.min(attack.steps.length - 1, currentStep + 1))}
            disabled={currentStep === attack.steps.length - 1}
            className="p-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={resetAnimation}
          className="flex items-center space-x-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
};

// Visualization Components
const NetworkVisualization = ({ step, isPlaying, animationKey }) => {
  const stepId = step.id;
  
  // DDoS-specific visualization
  if (stepId.includes('ddos') || step.title.toLowerCase().includes('botnet') || step.title.toLowerCase().includes('flood')) {
    return (
      <motion.div
        key={animationKey}
        className="w-full h-full relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Multiple bot nodes for DDoS */}
        <div className="absolute inset-0">
          {/* Botnet nodes */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="absolute"
              style={{
                left: `${15 + (i % 3) * 25}%`,
                top: `${20 + Math.floor(i / 3) * 40}%`,
              }}
            >
              <div className="w-12 h-12 bg-red-500/20 border-2 border-red-500 rounded-full flex items-center justify-center">
                <Target className="w-5 h-5 text-red-400" />
              </div>
              <span className="text-red-400 text-xs mt-1 block text-center">Bot {i + 1}</span>
              
              {/* Traffic flow from bots */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1, 0] }}
                transition={{ duration: 1.5, delay: i * 0.2, repeat: Infinity }}
                className="absolute top-6 left-12 w-2 h-2 bg-red-500 rounded-full"
              />
            </motion.div>
          ))}
          
          {/* Central target server */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.8 }}
            className="absolute right-16 top-1/2 transform -translate-y-1/2 flex flex-col items-center"
          >
            <div className={`w-20 h-20 bg-cyan-500/20 border-2 border-cyan-500 rounded-full flex items-center justify-center ${
              step.title.toLowerCase().includes('disruption') ? 'animate-pulse border-red-500 bg-red-500/20' : ''
            }`}>
              <Shield className={`w-10 h-10 ${step.title.toLowerCase().includes('disruption') ? 'text-red-400' : 'text-cyan-400'}`} />
            </div>
            <span className={`text-sm mt-2 ${step.title.toLowerCase().includes('disruption') ? 'text-red-400' : 'text-cyan-400'}`}>
              Target Server
            </span>
            {step.title.toLowerCase().includes('disruption') && (
              <span className="text-red-400 text-xs animate-pulse">OVERLOADED</span>
            )}
          </motion.div>
          
          {/* Traffic flow lines */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={`flow-${i}`}
              className="absolute h-0.5 bg-gradient-to-r from-red-500 to-cyan-500"
              style={{
                left: `${20 + (i % 3) * 25}%`,
                top: `${25 + Math.floor(i / 3) * 40}%`,
                width: `${50 - (i % 3) * 10}%`,
                transformOrigin: 'left center',
              }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: [0, 1, 0] }}
              transition={{
                duration: 2,
                delay: i * 0.3,
                repeat: Infinity,
                repeatDelay: 1,
              }}
            />
          ))}
        </div>
      </motion.div>
    );
  }
  
  // MITM visualization
  return (
    <motion.div
      key={animationKey}
      className="w-full h-full relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="absolute inset-0 flex items-center justify-between px-8">
        {/* User */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center"
        >
          <div className="w-16 h-16 bg-blue-500/20 border-2 border-blue-500 rounded-full flex items-center justify-center">
            <Target className="w-8 h-8 text-blue-400" />
          </div>
          <span className="text-blue-400 text-sm mt-2">User</span>
        </motion.div>
        
        {/* Attacker in the middle */}
        <motion.div
          initial={{ scale: 0, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col items-center"
        >
          <div className="w-16 h-16 bg-red-500/20 border-2 border-red-500 rounded-full flex items-center justify-center animate-pulse">
            <Target className="w-8 h-8 text-red-400" />
          </div>
          <span className="text-red-400 text-sm mt-2">Attacker</span>
          <span className="text-red-400 text-xs animate-pulse">INTERCEPTING</span>
        </motion.div>
        
        {/* Server */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col items-center"
        >
          <div className="w-16 h-16 bg-green-500/20 border-2 border-green-500 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-green-400" />
          </div>
          <span className="text-green-400 text-sm mt-2">Server</span>
        </motion.div>
      </div>
      
      {/* Data flow paths */}
      <motion.div
        className="absolute top-1/2 left-8 right-8 h-0.5"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.8, duration: 2 }}
      >
        <div className="w-full h-full bg-gradient-to-r from-blue-500 via-red-500 to-green-500 rounded" />
        <motion.div
          className="absolute top-0 left-0 w-2 h-2 bg-white rounded-full -translate-y-1/2"
          animate={{ x: ['0%', '48%', '100%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
      </motion.div>
    </motion.div>
  );
};

const MalwareVisualization = ({ step, isPlaying, animationKey }) => (
  <motion.div
    key={animationKey}
    className="w-full h-full relative"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
  >
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="grid grid-cols-4 gap-4">
        {[...Array(16)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 1, backgroundColor: "#1f2937" }}
            animate={{
              scale: [1, 1.2, 1],
              backgroundColor: ["#1f2937", "#ef4444", "#1f2937"]
            }}
            transition={{
              duration: 0.8,
              delay: i * 0.1,
              repeat: Infinity,
              repeatDelay: 2
            }}
            className="w-8 h-8 rounded border border-gray-600"
          />
        ))}
      </div>
    </div>
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-red-400 text-lg font-bold">
      INFECTION SPREADING
    </div>
  </motion.div>
);

const WebVisualization = ({ step, isPlaying, animationKey }) => (
  <motion.div
    key={animationKey}
    className="w-full h-full relative flex items-center justify-center"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
  >
    {/* Browser window mockup */}
    <div className="w-80 h-60 bg-gray-800 border border-gray-600 rounded-lg overflow-hidden">
      <div className="bg-gray-700 p-2 flex items-center space-x-2">
        <div className="flex space-x-1">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
        <div className="flex-1 bg-gray-600 rounded px-2 py-1 text-xs text-gray-300">
          https://vulnerable-site.com
        </div>
      </div>
      <div className="p-4 space-y-4">
        <motion.div
          initial={{ opacity: 0.5 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="h-4 bg-gradient-to-r from-red-500 to-transparent rounded"
        />
        <div className="text-red-400 text-xs font-mono">
          &gt; Injecting malicious payload...
        </div>
      </div>
    </div>
  </motion.div>
);

const GenericVisualization = ({ step, isPlaying, animationKey }) => (
  <motion.div
    key={animationKey}
    className="w-full h-full relative flex items-center justify-center"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
  >
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      className="w-24 h-24 border-4 border-cyan-500 border-t-transparent rounded-full"
    />
    <div className="absolute text-cyan-400 text-sm font-mono">
      {step.title}
    </div>
  </motion.div>
);

export const AttackDetail = () => {
  const { attackId } = useParams();
  const navigate = useNavigate();
  const { sessionId } = useSession();
  
  const [attack, setAttack] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('simulation');

  useEffect(() => {
    const fetchAttackData = async () => {
      try {
        const response = await axios.get(`${API}/attacks/${attackId}`);
        setAttack(response.data);
        
        // Fetch user progress if session exists
        if (sessionId) {
          try {
            const progressResponse = await axios.get(`${API}/progress/${sessionId}`);
            const attackProgress = progressResponse.data.find(p => p.attack_id === attackId);
            if (attackProgress) {
              setProgress(attackProgress);
              setCurrentStep(attackProgress.current_step);
            }
          } catch (error) {
            console.log('No progress data for this attack');
          }
        }
      } catch (error) {
        console.error('Failed to fetch attack:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchAttackData();
  }, [attackId, sessionId, navigate]);

  const updateProgress = async (step, timeSpent = 0) => {
    if (!sessionId || !attack) return;

    try {
      const response = await axios.post(`${API}/progress`, {
        session_id: sessionId,
        attack_id: attack.id,
        current_step: step,
        time_spent: timeSpent
      });
      setProgress(response.data);
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  const handleStepChange = (newStep) => {
    setCurrentStep(newStep);
    updateProgress(newStep);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto"
          />
          <p className="text-gray-400 mt-4">Loading attack simulation...</p>
        </div>
      </div>
    );
  }

  if (!attack) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Attack Not Found</h2>
          <p className="text-gray-400 mb-4">The requested attack simulation could not be loaded.</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">{attack.name}</h1>
            <div className="flex items-center space-x-4 mt-2">
              <span className="text-cyan-400 text-sm">{attack.category}</span>
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
              {progress && progress.is_completed && (
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Completed
                </span>
              )}
            </div>
          </div>
          
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            ← Back
          </button>
        </div>
        
        <p className="text-gray-400 mt-4">{attack.description}</p>
      </motion.div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6">
        {[
          { id: 'simulation', name: 'Simulation' },
          { id: 'steps', name: 'Step-by-Step' },
          { id: 'defenses', name: 'Defenses' },
          { id: 'quiz', name: 'Quiz' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-cyan-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'simulation' && (
            <SimulationPanel
              attack={attack}
              currentStep={currentStep}
              isPlaying={isPlaying}
              onStepChange={handleStepChange}
            />
          )}

          {activeTab === 'steps' && (
            <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Attack Flow</h3>
              <div className="space-y-4">
                {attack.steps.map((step, index) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      index === currentStep
                        ? 'border-cyan-500 bg-cyan-500/10'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                    onClick={() => handleStepChange(index)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === currentStep
                          ? 'bg-cyan-500 text-white'
                          : 'bg-gray-700 text-gray-400'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{step.title}</h4>
                        <p className="text-gray-400 text-sm mt-1">{step.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'defenses' && (
            <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Defense Strategies</h3>
              <div className="grid gap-4">
                {attack.defenses.map((defense, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-white">{defense.strategy}</h4>
                        <p className="text-gray-400 text-sm mt-1">{defense.description}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        defense.effectiveness === 'High' ? 'bg-green-500/20 text-green-400' :
                        defense.effectiveness === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {defense.effectiveness}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'quiz' && (
            <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Knowledge Quiz</h3>
              <p className="text-gray-400 mb-6">Test your understanding of this attack</p>
              
              {/* Quiz component will be implemented in next phase */}
              <div className="text-center py-12">
                <Target className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
                <p className="text-gray-400">Interactive quiz coming soon!</p>
                <p className="text-gray-500 text-sm mt-2">
                  Quiz functionality will be added in the next development phase
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};