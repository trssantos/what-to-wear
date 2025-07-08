import React, { useState } from 'react';
import { Shirt } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const AuthScreen = ({ navigateToScreen, openaiApiKey, setShowApiSetup }) => {
  const { signIn, signUp, isLoading } = useAuth();
  const [authMode, setAuthMode] = useState('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    confirmPassword: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (authMode === 'register') {
      if (formData.password !== formData.confirmPassword) {
        alert('As passwords não coincidem');
        return;
      }
      if (formData.password.length < 6) {
        alert('A password deve ter pelo menos 6 caracteres');
        return;
      }
      signUp(formData.email, formData.password, formData.displayName);
    } else {
      signIn(formData.email, formData.password);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-6 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 shadow-xl max-w-md w-full">
        <div className="text-center mb-8">
          <Shirt className="h-16 w-16 text-purple-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">What to Wear</h1>
          <p className="text-gray-600">O teu assistente de moda pessoal</p>
        </div>

        <div className="flex mb-6">
          <button
            onClick={() => setAuthMode('login')}
            className={`flex-1 py-2 px-4 rounded-l-lg font-semibold transition-colors ${
              authMode === 'login'
                ? 'bg-purple-500 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setAuthMode('register')}
            className={`flex-1 py-2 px-4 rounded-r-lg font-semibold transition-colors ${
              authMode === 'register'
                ? 'bg-purple-500 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            Registar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {authMode === 'register' && (
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Nome</label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="O teu nome"
                required
              />
            </div>
          )}
          
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="teu@email.com"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="••••••••"
              required
            />
          </div>

          {authMode === 'register' && (
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Confirmar Password</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'A processar...' : (authMode === 'login' ? 'Entrar' : 'Criar Conta')}
          </button>
        </form>

        {/* API Setup Button */}
        {(!openaiApiKey || openaiApiKey === '') && (
          <div className="mt-6 text-center">
            <button
              onClick={() => setShowApiSetup(true)}
              className="text-purple-600 text-sm underline"
            >
              Configurar OpenAI API
            </button>
          </div>
        )}

        {/* API Status Indicator */}
        {openaiApiKey && !localStorage.getItem('whatToWear_openai_key') && (
          <div className="mt-6 text-center">
            <div className="inline-flex items-center space-x-2 text-green-600 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>OpenAI API configurada ✓</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthScreen;