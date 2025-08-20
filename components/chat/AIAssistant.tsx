'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Bot, User, Sparkles, FileText, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { useTheme } from '../layout/AppLayout';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  context?: {
    astId?: string;
    section?: string;
    action?: string;
  };
  suggestions?: string[];
}

interface AIAssistantProps {
  context?: {
    page?: string;
    astId?: string;
    userId?: string;
    organizationId?: string;
    currentStep?: number;
    formData?: any;
  };
  position?: 'bottom-right' | 'bottom-left' | 'sidebar';
  theme?: 'light' | 'dark';
}

const AIAssistant: React.FC<AIAssistantProps> = ({ 
  context,
  position = 'bottom-right',
  theme
}) => {
  const { isDark } = useTheme();
  const currentTheme = theme || (isDark ? 'dark' : 'light');
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Messages d'accueil contextuels
  const getWelcomeMessage = (): Message => {
    let content = "👋 Bonjour ! Je suis votre assistant IA pour C-SECUR360. Comment puis-je vous aider ?";
    let suggestions: string[] = [];

    if (context?.page === 'ast-form') {
      content = "🔧 Je suis là pour vous aider avec votre AST. Posez-moi des questions sur la sécurité, les procédures ou les exigences provinciales.";
      suggestions = [
        "Quelles sont les exigences pour les espaces clos au Québec ?",
        "Comment remplir la section des dangers ?",
        "Quels EPI sont requis pour ce type de travail ?"
      ];
    } else if (context?.page === 'dashboard') {
      content = "📊 Besoin d'aide avec votre tableau de bord ? Je peux vous expliquer les statistiques et vous guider.";
      suggestions = [
        "Comment interpréter mes statistiques AST ?",
        "Pourquoi ai-je des alertes de conformité ?",
        "Comment améliorer mon score de sécurité ?"
      ];
    } else if (context?.page === 'inspections') {
      content = "🔍 Je peux vous aider avec les inspections d'équipement et la planification.";
      suggestions = [
        "À quelle fréquence inspecter un harnais ?",
        "Que faire si j'identifie un défaut ?",
        "Comment planifier mes inspections ?"
      ];
    }

    return {
      id: `welcome_${Date.now()}`,
      type: 'assistant',
      content,
      timestamp: new Date(),
      suggestions
    };
  };

  // Initialisation avec message d'accueil
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([getWelcomeMessage()]);
    }
  }, [context?.page]);

  // Auto-scroll vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus sur l'input quand le chat s'ouvre
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async (message: string, isQuickAction = false) => {
    if (!message.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      type: 'user',
      content: message,
      timestamp: new Date(),
      context: context
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Appel à l'API d'IA (Claude, OpenAI, ou autre)
      const response = await fetch('/api/chat/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          context: context,
          history: messages.slice(-10), // Derniers 10 messages pour le contexte
          isQuickAction
        }),
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage: Message = {
          id: `assistant_${Date.now()}`,
          type: 'assistant',
          content: data.response,
          timestamp: new Date(),
          suggestions: data.suggestions || []
        };

        setMessages(prev => [...prev, assistantMessage]);

        // Si le chat est fermé, indiquer qu'il y a des messages non lus
        if (!isOpen) {
          setHasUnread(true);
        }
      } else {
        throw new Error(data.error || 'Erreur lors de la communication avec l\'assistant');
      }
    } catch (error) {
      console.error('Erreur assistant IA:', error);
      
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        type: 'assistant',
        content: "Désolé, je rencontre des difficultés techniques. Veuillez réessayer dans un moment ou contacter le support si le problème persiste.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion, true);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setHasUnread(false);
    }
  };

  const clearChat = () => {
    setMessages([getWelcomeMessage()]);
  };

  // Actions rapides contextuelles
  const getQuickActions = () => {
    const actions: { label: string; action: string; icon: React.ReactNode }[] = [];

    if (context?.page === 'ast-form') {
      actions.push(
        { label: 'Valider mon AST', action: 'Peux-tu vérifier si mon AST est complet et conforme ?', icon: <CheckCircle className="w-4 h-4" /> },
        { label: 'Aide sur cette section', action: `J'ai besoin d'aide pour remplir la section ${context.currentStep || 'actuelle'}`, icon: <FileText className="w-4 h-4" /> },
        { label: 'Vérifier conformité', action: 'Quelles sont les exigences légales pour ce type de travail ?', icon: <AlertCircle className="w-4 h-4" /> }
      );
    }

    return actions;
  };

  if (!isOpen) {
    return (
      <div className={`fixed ${position.includes('right') ? 'right-6' : 'left-6'} bottom-6 z-50`}>
        <button
          onClick={toggleChat}
          className={`relative group bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 ${
            hasUnread ? 'animate-bounce' : ''
          }`}
          title="Assistant IA C-SECUR360"
        >
          <MessageCircle className="w-6 h-6" />
          {hasUnread && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          )}
          
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-slate-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Assistant IA
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900" />
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className={`fixed ${position.includes('right') ? 'right-6' : 'left-6'} bottom-6 z-50`}>
      <div className={`w-96 h-[600px] ${currentTheme === 'dark' ? 'bg-slate-900' : 'bg-white'} rounded-2xl shadow-2xl border flex flex-col overflow-hidden`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bot className="w-8 h-8" />
              <Sparkles className="w-4 h-4 absolute -top-1 -right-1 text-yellow-300" />
            </div>
            <div>
              <h3 className="font-semibold">Assistant C-SECUR360</h3>
              <p className="text-xs opacity-90">IA spécialisée en sécurité</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={clearChat}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              title="Nouveau chat"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button
              onClick={toggleChat}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start gap-2 max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.type === 'user' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                }`}>
                  {message.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Content */}
                <div className={`rounded-2xl px-4 py-3 ${
                  message.type === 'user'
                    ? 'bg-blue-500 text-white'
                    : theme === 'dark' 
                    ? 'bg-slate-800 text-slate-100'
                    : 'bg-slate-100 text-slate-900'
                }`}>
                  <div className="text-sm leading-relaxed">
                    {message.content}
                  </div>
                  <div className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Suggestions */}
          {messages.length > 0 && messages[messages.length - 1]?.suggestions && (
            <div className="space-y-2">
              <p className="text-xs text-slate-500 font-medium">Suggestions :</p>
              {messages[messages.length - 1].suggestions!.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`w-full text-left p-3 rounded-xl text-sm transition-colors ${
                    theme === 'dark'
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Quick Actions */}
          {getQuickActions().length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-slate-500 font-medium">Actions rapides :</p>
              <div className="grid grid-cols-1 gap-2">
                {getQuickActions().map((action, index) => (
                  <button
                    key={index}
                    onClick={() => sendMessage(action.action, true)}
                    className={`flex items-center gap-2 p-2 rounded-lg text-sm transition-colors ${
                      theme === 'dark'
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    {action.icon}
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className={`rounded-2xl px-4 py-3 ${
                  theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'
                }`}>
                  <div className="flex items-center gap-2">
                    <Loader className="w-4 h-4 animate-spin text-blue-500" />
                    <span className="text-sm text-slate-500">L'assistant réfléchit...</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className={`p-4 border-t ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(inputValue);
            }}
            className="flex gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Posez votre question sur la sécurité..."
              className={`flex-1 px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                theme === 'dark'
                  ? 'bg-slate-800 border-slate-600 text-slate-100 placeholder-slate-400'
                  : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500'
              }`}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="p-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;