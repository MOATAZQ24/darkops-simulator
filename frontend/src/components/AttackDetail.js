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
  AlertTriangle,
  Trophy
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

const MalwareVisualization = ({ step, isPlaying, animationKey }) => {
  const stepTitle = step.title.toLowerCase();
  
  // Ransomware-specific visualization
  if (stepTitle.includes('ransom') || stepTitle.includes('encryption')) {
    return (
      <motion.div
        key={animationKey}
        className="w-full h-full relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* File system grid */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="grid grid-cols-6 gap-3">
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 1, backgroundColor: "#1f2937", borderColor: "#374151" }}
                animate={{
                  scale: stepTitle.includes('encryption') ? [1, 1.1, 1] : 1,
                  backgroundColor: stepTitle.includes('encryption') ? 
                    ["#1f2937", "#dc2626", "#7f1d1d"] : "#1f2937",
                  borderColor: stepTitle.includes('encryption') ?
                    ["#374151", "#dc2626", "#ef4444"] : "#374151"
                }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.05,
                  repeat: stepTitle.includes('encryption') ? Infinity : 0,
                  repeatDelay: 2
                }}
                className="w-6 h-6 rounded border-2 flex items-center justify-center"
              >
                {stepTitle.includes('encryption') && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="w-2 h-2 bg-red-400 rounded-full"
                  />
                )}
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Overlay text */}
        <div className="absolute inset-0 flex items-center justify-center">
          {stepTitle.includes('encryption') && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1 }}
              className="text-red-400 text-lg font-bold bg-gray-900/80 px-4 py-2 rounded border border-red-500"
            >
              🔒 FILES ENCRYPTED
            </motion.div>
          )}
          {stepTitle.includes('ransom') && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-red-400 text-center bg-gray-900/90 p-4 rounded border border-red-500 max-w-xs"
            >
              <div className="text-xl font-bold mb-2">⚠️ RANSOM DEMAND</div>
              <div className="text-sm">Pay 0.5 BTC to decrypt your files</div>
              <div className="text-xs mt-2 text-red-300">Time remaining: 72:00:00</div>
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  }
  
  // Worm propagation visualization
  if (stepTitle.includes('worm') || stepTitle.includes('propagation') || stepTitle.includes('replication')) {
    return (
      <motion.div
        key={animationKey}
        className="w-full h-full relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Network topology */}
        <div className="absolute inset-0">
          {/* Central infected node */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          >
            <div className="w-16 h-16 bg-red-500/30 border-2 border-red-500 rounded-full flex items-center justify-center animate-pulse">
              <Target className="w-8 h-8 text-red-400" />
            </div>
            <span className="text-red-400 text-xs mt-1 block text-center">Patient Zero</span>
          </motion.div>
          
          {/* Surrounding nodes */}
          {[...Array(8)].map((_, i) => {
            const angle = (i * 45) * Math.PI / 180;
            const radius = 80;
            const x = 50 + (radius * Math.cos(angle)) / 3;
            const y = 50 + (radius * Math.sin(angle)) / 3;
            
            return (
              <motion.div
                key={i}
                initial={{ scale: 0, backgroundColor: "#1f2937" }}
                animate={{ 
                  scale: 1,
                  backgroundColor: stepTitle.includes('propagation') ? 
                    ["#1f2937", "#dc2626"] : "#1f2937"
                }}
                transition={{ 
                  delay: 0.5 + i * 0.2,
                  backgroundColor: { delay: 1 + i * 0.3 }
                }}
                className="absolute w-12 h-12 border-2 border-gray-600 rounded-full flex items-center justify-center"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                
                {/* Connection lines */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1 + i * 0.1 }}
                  className="absolute w-0.5 h-16 bg-gradient-to-r from-red-500 to-transparent origin-bottom"
                  style={{
                    transform: `rotate(${180 + i * 45}deg)`,
                    bottom: '50%'
                  }}
                />
              </motion.div>
            );
          })}
        </div>
        
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-red-400 text-sm font-mono animate-pulse">
          WORM SPREADING...
        </div>
      </motion.div>
    );
  }
  
  // Generic malware visualization
  return (
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
};

const WebVisualization = ({ step, isPlaying, animationKey }) => {
  const stepTitle = step.title.toLowerCase();
  
  // SQL Injection visualization
  if (stepTitle.includes('sql') || stepTitle.includes('query') || stepTitle.includes('database')) {
    return (
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
              https://vulnerable-site.com/login
            </div>
          </div>
          
          {/* Content area */}
          <div className="p-4 space-y-4">
            {/* Login form */}
            <div className="space-y-2">
              <div className="text-white text-sm">Login Form:</div>
              <div className="bg-gray-700 p-2 rounded">
                <input 
                  type="text" 
                  placeholder="Username" 
                  className="w-full bg-gray-600 text-white p-1 rounded text-xs"
                  readOnly
                  value={stepTitle.includes('injection') ? "admin'; DROP TABLE users; --" : "admin"}
                />
              </div>
            </div>
            
            {/* SQL Query display */}
            {stepTitle.includes('injection') && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-900/50 border border-red-500 p-2 rounded"
              >
                <div className="text-red-400 text-xs font-mono">
                  SQL: SELECT * FROM users WHERE username = 'admin'; DROP TABLE users; --'
                </div>
              </motion.div>
            )}
            
            {stepTitle.includes('extraction') && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-green-900/50 border border-green-500 p-2 rounded"
              >
                <div className="text-green-400 text-xs">
                  📊 Database compromised! Extracting user data...
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }
  
  // XSS visualization
  if (stepTitle.includes('xss') || stepTitle.includes('script') || stepTitle.includes('injection')) {
    return (
      <motion.div
        key={animationKey}
        className="w-full h-full relative flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Browser window */}
        <div className="w-80 h-60 bg-gray-800 border border-gray-600 rounded-lg overflow-hidden">
          <div className="bg-gray-700 p-2 flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <div className="flex-1 bg-gray-600 rounded px-2 py-1 text-xs text-gray-300">
              https://social-site.com/comments
            </div>
          </div>
          
          <div className="p-4 space-y-4">
            {/* Comment form */}
            <div className="space-y-2">
              <div className="text-white text-sm">Post Comment:</div>
              <div className="bg-gray-700 p-2 rounded">
                <textarea 
                  className="w-full bg-gray-600 text-white p-1 rounded text-xs h-16 resize-none"
                  readOnly
                  value={stepTitle.includes('script') ? 
                    '<script>alert("XSS Attack!"); document.location="http://evil.com"</script>' : 
                    'This is a normal comment'
                  }
                />
              </div>
            </div>
            
            {/* XSS execution */}
            {stepTitle.includes('exploitation') && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-600 text-white p-4 rounded shadow-2xl border-2 border-red-400"
              >
                <div className="text-center">
                  <div className="text-lg font-bold">⚠️ XSS ALERT!</div>
                  <div className="text-sm mt-1">Malicious script executed!</div>
                  <div className="text-xs mt-2">Stealing cookies...</div>
                </div>
              </motion.div>
            )}
            
            {stepTitle.includes('injection') && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-orange-400 text-xs font-mono bg-orange-900/50 p-2 rounded border border-orange-500"
              >
                &gt; Malicious script injected into page...
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }
  
  // Generic web attack
  return (
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
};

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

// Quiz Component
const QuizComponent = ({ attack, sessionId }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  
  const questions = attack.quiz?.questions || [];
  
  if (!questions.length) {
    return (
      <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Knowledge Quiz</h3>
        <div className="text-center py-12">
          <Target className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <p className="text-gray-400">No quiz questions available for this attack</p>
        </div>
      </div>
    );
  }
  
  const currentQ = questions[currentQuestion];
  
  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswer(answerIndex);
    setShowExplanation(false);
    setShowHint(false);
  };
  
  const submitAnswer = () => {
    const isCorrect = selectedAnswer === currentQ.correct_answer;
    const newAnswers = [...answers, {
      question: currentQuestion,
      selected: selectedAnswer,
      correct: currentQ.correct_answer,
      isCorrect
    }];
    setAnswers(newAnswers);
    setShowExplanation(true);
    
    if (isCorrect) {
      setScore(score + 1);
    }
  };
  
  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setShowHint(false);
    } else {
      completeQuiz();
    }
  };
  
  const completeQuiz = async () => {
    setQuizCompleted(true);
    
    // Submit quiz results to backend
    if (sessionId) {
      try {
        await axios.post(`${API}/quiz`, {
          session_id: sessionId,
          attack_id: attack.id,
          score: Math.round((score / questions.length) * 100),
          answers: answers
        });
      } catch (error) {
        console.error('Failed to submit quiz results:', error);
      }
    }
  };
  
  const restartQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setAnswers([]);
    setShowExplanation(false);
    setQuizCompleted(false);
    setScore(0);
    setShowHint(false);
  };
  
  if (quizCompleted) {
    const percentage = Math.round((score / questions.length) * 100);
    
    return (
      <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="mb-6"
          >
            <Trophy className={`w-16 h-16 mx-auto mb-4 ${
              percentage >= 80 ? 'text-green-400' : 
              percentage >= 60 ? 'text-yellow-400' : 'text-red-400'
            }`} />
            <h3 className="text-2xl font-bold text-white mb-2">Quiz Completed!</h3>
            <div className={`text-3xl font-bold mb-4 ${
              percentage >= 80 ? 'text-green-400' : 
              percentage >= 60 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {percentage}%
            </div>
            <p className="text-gray-400">
              You scored {score} out of {questions.length} questions correctly
            </p>
          </motion.div>
          
          {/* Score breakdown */}
          <div className="bg-gray-800/50 rounded-lg p-4 mb-6 max-w-md mx-auto">
            <h4 className="text-white font-semibold mb-3">Question Breakdown</h4>
            {questions.map((q, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-b-0">
                <span className="text-gray-300 text-sm">Q{index + 1}</span>
                <span className={`text-sm ${
                  answers[index]?.isCorrect ? 'text-green-400' : 'text-red-400'
                }`}>
                  {answers[index]?.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                </span>
              </div>
            ))}
          </div>
          
          <button
            onClick={restartQuiz}
            className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors"
          >
            Retake Quiz
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
      {/* Quiz header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Knowledge Quiz</h3>
        <div className="text-cyan-400 text-sm">
          Question {currentQuestion + 1} of {questions.length}
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-gray-700 rounded-full h-2 mb-6">
        <motion.div
          className="h-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      
      {/* Question */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-white mb-4">
          {currentQ.question}
        </h4>
        
        {/* Answer options */}
        <div className="space-y-3">
          {currentQ.options.map((option, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleAnswerSelect(index)}
              disabled={showExplanation}
              className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                selectedAnswer === index
                  ? showExplanation
                    ? index === currentQ.correct_answer
                      ? 'border-green-500 bg-green-500/20 text-green-400'
                      : 'border-red-500 bg-red-500/20 text-red-400'
                    : 'border-cyan-500 bg-cyan-500/20 text-cyan-400'
                  : showExplanation && index === currentQ.correct_answer
                    ? 'border-green-500 bg-green-500/20 text-green-400'
                    : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500'
              }`}
            >
              <div className="flex items-center">
                <span className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-xs font-bold mr-3">
                  {String.fromCharCode(65 + index)}
                </span>
                {option}
              </div>
            </motion.button>
          ))}
        </div>
      </div>
      
      {/* Hint button */}
      {!showExplanation && (
        <div className="mb-4">
          <button
            onClick={() => setShowHint(!showHint)}
            className="text-yellow-400 hover:text-yellow-300 text-sm underline"
          >
            {showHint ? 'Hide Hint' : 'Show Hint'}
          </button>
          
          {showHint && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-2 p-3 bg-yellow-900/30 border border-yellow-500/40 rounded-lg"
            >
              <p className="text-yellow-300 text-sm">
                💡 Think about the key characteristics of {attack.name} and what makes this attack unique.
              </p>
            </motion.div>
          )}
        </div>
      )}
      
      {/* Explanation */}
      {showExplanation && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 p-4 rounded-lg border ${
            selectedAnswer === currentQ.correct_answer
              ? 'border-green-500/40 bg-green-500/10'
              : 'border-red-500/40 bg-red-500/10'
          }`}
        >
          <div className={`font-semibold mb-2 ${
            selectedAnswer === currentQ.correct_answer ? 'text-green-400' : 'text-red-400'
          }`}>
            {selectedAnswer === currentQ.correct_answer ? '✓ Correct!' : '✗ Incorrect'}
          </div>
          <p className="text-gray-300 text-sm">
            {currentQ.explanation}
          </p>
        </motion.div>
      )}
      
      {/* Action buttons */}
      <div className="flex justify-between">
        <div>
          {currentQuestion > 0 && (
            <button
              onClick={() => {
                setCurrentQuestion(currentQuestion - 1);
                setSelectedAnswer(null);
                setShowExplanation(false);
                setShowHint(false);
              }}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              Previous
            </button>
          )}
        </div>
        
        <div className="space-x-3">
          {!showExplanation ? (
            <button
              onClick={submitAnswer}
              disabled={selectedAnswer === null}
              className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              Submit Answer
            </button>
          ) : (
            <button
              onClick={nextQuestion}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
            >
              {currentQuestion < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

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
            <QuizComponent attack={attack} sessionId={sessionId} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};