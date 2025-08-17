import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SessionContext = createContext();

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};

export const SessionProvider = ({ children }) => {
  const [sessionId, setSessionId] = useState(null);
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize or get session
  useEffect(() => {
    const initializeSession = async () => {
      try {
        // Check if we have a session ID in localStorage
        const storedSessionId = localStorage.getItem('darkops_session_id');
        
        if (storedSessionId) {
          // Try to retrieve existing session
          try {
            const response = await axios.get(`${API}/sessions/${storedSessionId}`);
            setSessionId(storedSessionId);
            setSessionData(response.data);
          } catch (error) {
            // Session doesn't exist, create a new one
            await createNewSession();
          }
        } else {
          // No stored session, create a new one
          await createNewSession();
        }
      } catch (error) {
        console.error('Failed to initialize session:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeSession();
  }, []);

  const createNewSession = async () => {
    try {
      const response = await axios.post(`${API}/sessions`, {});
      const newSessionId = response.data.id;
      setSessionId(newSessionId);
      setSessionData(response.data);
      localStorage.setItem('darkops_session_id', newSessionId);
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  const updateNickname = async (nickname) => {
    if (!sessionId) return;
    
    try {
      // Update the session data locally first
      setSessionData(prev => ({ ...prev, nickname }));
      
      // Note: We could implement a PUT endpoint to update nickname
      // For now, create a new session with nickname if needed
      const response = await axios.post(`${API}/sessions`, { nickname });
      const newSessionId = response.data.id;
      setSessionId(newSessionId);
      setSessionData(response.data);
      localStorage.setItem('darkops_session_id', newSessionId);
    } catch (error) {
      console.error('Failed to update nickname:', error);
    }
  };

  const value = {
    sessionId,
    sessionData,
    loading,
    updateNickname,
    createNewSession
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};