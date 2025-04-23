// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_ENDPOINTS } from '../utils/config';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar si hay un token almacenado
    const checkTokenAndFetchUser = async () => {
      if (token) {
        try {
          const res = await axios.get(API_ENDPOINTS.me, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(res.data.user);
        } catch (error) {
          console.error('Error al verificar el token:', error);
          logout();
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    checkTokenAndFetchUser();
  }, [token]);

  // Configurar interceptor de Axios para agregar el token a todas las solicitudes
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, [token]);

  const register = async (userData) => {
    try {
      const res = await axios.post(API_ENDPOINTS.register, userData);
      setToken(res.data.token);
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      toast.success('Registro exitoso');
      navigate('/chat');
      return true;
    } catch (error) {
      console.error('Error al registrar:', error);
      toast.error(error.response?.data?.message || 'Error al registrar');
      return false;
    }
  };

  const login = async (credentials) => {
    try {
      const res = await axios.post(API_ENDPOINTS.login, credentials);
      setToken(res.data.token);
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      toast.success('Inicio de sesión exitoso');
      navigate('/chat');
      return true;
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      toast.error(error.response?.data?.message || 'Error al iniciar sesión');
      return false;
    }
  };

  const logout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        register,
        login,
        logout,
        isAuthenticated: !!token
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};