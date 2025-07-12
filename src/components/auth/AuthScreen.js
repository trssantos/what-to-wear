// src/components/auth/AuthScreen.js - Versão atualizada
import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import { Eye, EyeOff, Sparkles, ArrowRight } from 'lucide-react';
import { OPENAI_API_KEY } from '../../utils/constants';

const AuthScreen = ({ onLoginSuccess }) => {
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsRevealed(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setError('');

    try {
      if (authMode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
        console.log('✅ Login successful - App.js will handle navigation');
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        console.log('✅ Registration successful - App.js will handle navigation');
      }
      
      // Não chamamos onLoginSuccess() aqui - deixamos o App.js gerir o fluxo
      
    } catch (error) {
      console.error('Auth error:', error);
      setError(
        error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password'
          ? 'Email ou palavra-passe incorretos'
          : error.code === 'auth/email-already-in-use'
          ? 'Este email já está registado'
          : error.code === 'auth/weak-password'
          ? 'A palavra-passe deve ter pelo menos 6 caracteres'
          : 'Erro de autenticação. Tenta novamente.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center p-6">
      <div className={`bg-white rounded-3xl shadow-2xl w-full max-w-md transform transition-all duration-700 ${
        isRevealed ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'
      }`}>
        
        {/* Header */}
        <div className="text-center p-8 pb-4">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 transform rotate-3">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
          
          <h1 className="text-3xl font-black text-gray-800 mb-2">
            WhatToWear
          </h1>
          <p className="text-gray-600 font-medium">
            {authMode === 'login' ? 'Bem-vindo de volta!' : 'Cria a tua conta'}
          </p>

          {/* AI Status Indicator */}
          {OPENAI_API_KEY && (
            <div className="mt-4 inline-flex items-center space-x-2 text-green-600 text-sm bg-green-50 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>IA Ativada ✓</span>
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-gray-800 font-bold mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 border-2 border-purple-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="teu@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-gray-800 font-bold mb-2">Palavra-passe</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 border-2 border-purple-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-12"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
              className="text-purple-600 font-semibold hover:text-purple-700"
            >
              {authMode === 'login' ? 'Criar conta' : 'Já tenho conta'}
            </button>
          </div>

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 disabled:opacity-50 transform transition-transform active:scale-95"
          >
            <span>
              {isProcessing ? 'A processar...' : (authMode === 'login' ? 'Entrar' : 'Criar Conta')}
            </span>
            {!isProcessing && <ArrowRight className="h-5 w-5" />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthScreen;