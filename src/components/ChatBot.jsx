import { useState, useRef, useEffect } from 'react';
import { Send, Menu, Loader, PlusCircle, Trash2, MessageSquare, X, Crown, Sparkles } from 'lucide-react';
import toast from './Toast';
import llmService from '../services/llmService';
import authService from '../services/authService';

/**
 * Composant ChatBot - Interface type ChatGPT
 * Interface plein écran avec historique de conversations
 */
export default function ChatBot({ isOpen, onClose }) {
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    loadUserAndConversations();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputMessage]);

  const loadUserAndConversations = async () => {
    const user = await authService.getCurrentUser();
    setCurrentUser(user);
    
    // Charger les conversations depuis localStorage
    const saved = localStorage.getItem('meetizy_conversations');
    if (saved) {
      const convs = JSON.parse(saved);
      setConversations(convs);
      if (convs.length > 0) {
        loadConversation(convs[0].id);
      }
    } else {
      // Créer une première conversation
      createNewConversation();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
  };

  const createNewConversation = () => {
    const newConv = {
      id: Date.now(),
      title: 'Nouvelle conversation',
      messages: [
        {
          id: 1,
          role: 'assistant',
          content: 'Bonjour ! Je suis votre assistant IA Meetizy. Comment puis-je vous aider aujourd\'hui ?',
          timestamp: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updated = [newConv, ...conversations];
    setConversations(updated);
    saveConversations(updated);
    loadConversation(newConv.id);
    toast.success('Nouvelle conversation créée');
  };

  const loadConversation = (id) => {
    const conv = conversations.find(c => c.id === id);
    if (conv) {
      setCurrentConversationId(id);
      setMessages(conv.messages);
    }
  };

  const deleteConversation = (id) => {
    if (conversations.length === 1) {
      toast.error('Vous devez garder au moins une conversation');
      return;
    }

    const updated = conversations.filter(c => c.id !== id);
    setConversations(updated);
    saveConversations(updated);

    if (currentConversationId === id) {
      loadConversation(updated[0].id);
    }

    toast.success('Conversation supprimée');
  };

  const saveConversations = (convs) => {
    localStorage.setItem('meetizy_conversations', JSON.stringify(convs));
  };

  const updateCurrentConversation = (newMessages) => {
    const updated = conversations.map(conv => {
      if (conv.id === currentConversationId) {
        const firstUserMessage = newMessages.find(m => m.role === 'user');
        const title = firstUserMessage 
          ? firstUserMessage.content.slice(0, 50) + (firstUserMessage.content.length > 50 ? '...' : '')
          : 'Nouvelle conversation';

        return {
          ...conv,
          messages: newMessages,
          title,
          updatedAt: new Date().toISOString()
        };
      }
      return conv;
    });

    setConversations(updated);
    saveConversations(updated);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputMessage('');
    setIsLoading(true);
    updateCurrentConversation(newMessages);

    try {
      const response = await llmService.chat(userMessage.content, messages);
      
      const aiMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      };

      const finalMessages = [...newMessages, aiMessage];
      setMessages(finalMessages);
      updateCurrentConversation(finalMessages);
    } catch (error) {
      console.error('Erreur IA:', error);
      toast.error('Erreur de communication avec l\'IA');
      
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Désolé, une erreur s\'est produite. Les clés API sont fournies automatiquement avec votre abonnement. Si le problème persiste, contactez le support.',
        timestamp: new Date().toISOString()
      };
      
      const finalMessages = [...newMessages, errorMessage];
      setMessages(finalMessages);
      updateCurrentConversation(finalMessages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  const getPlanBadge = (plan) => {
    const badges = {
      free: { text: 'Free', color: '#6b7280' },
      pro: { text: 'Pro', color: '#8b5cf6' },
      business: { text: 'Business', color: '#3b82f6' },
      expert: { text: 'Expert', color: '#f59e0b' }
    };
    return badges[plan] || badges.free;
  };

  const planBadge = currentUser ? getPlanBadge(currentUser.plan) : null;

  return (
    <div style={{
      position: 'fixed',
      top: '5%',
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'min(1200px, 85vw)',
      height: '80vh',
      background: 'var(--bg)',
      zIndex: 9999,
      display: 'flex',
      borderRadius: '16px',
      border: '1px solid var(--border)',
      overflow: 'hidden',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
    }}>
      {/* Sidebar */}
      {showSidebar && (
        <div style={{
          width: '280px',
          background: 'var(--card-bg)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Sidebar Header */}
          <div style={{
            padding: '16px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={20} color="var(--accent)" />
                <span style={{ fontWeight: '600', fontSize: '14px' }}>Assistant Intelligent</span>
              </div>
              <button
                onClick={() => setShowSidebar(false)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={16} />
              </button>
            </div>

            <button
              onClick={createNewConversation}
              style={{
                padding: '10px 14px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <PlusCircle size={16} />
              Nouvelle conversation
            </button>
          </div>

          {/* Conversations List */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '8px'
          }}>
            {conversations.map(conv => (
              <div
                key={conv.id}
                onClick={() => loadConversation(conv.id)}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  background: currentConversationId === conv.id ? 'var(--hover-bg)' : 'transparent',
                  border: currentConversationId === conv.id ? '1px solid var(--accent)' : '1px solid transparent',
                  cursor: 'pointer',
                  marginBottom: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  if (currentConversationId !== conv.id) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  }
                }}
                onMouseOut={(e) => {
                  if (currentConversationId !== conv.id) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <MessageSquare size={16} color="var(--muted)" style={{ flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: currentConversationId === conv.id ? '600' : '400',
                    color: currentConversationId === conv.id ? 'var(--accent)' : 'var(--text)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {conv.title}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                    {new Date(conv.updatedAt).toLocaleDateString('fr-FR')}
                  </div>
                </div>
                {conversations.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(conv.id);
                    }}
                    style={{
                      padding: '4px',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--muted)',
                      cursor: 'pointer',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                      e.currentTarget.style.color = '#ef4444';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--muted)';
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* User Info */}
          {currentUser && (
            <div style={{
              padding: '16px',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                {currentUser.email[0].toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: 'var(--text)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {currentUser.email.split('@')[0]}
                </div>
                {planBadge && (
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 8px',
                    background: `${planBadge.color}20`,
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: '600',
                    color: planBadge.color,
                    marginTop: '4px'
                  }}>
                    {currentUser.plan !== 'free' && <Crown size={10} />}
                    {planBadge.text}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Chat Area */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Top Bar */}
        <div style={{
          height: '64px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          gap: '16px'
        }}>
          {!showSidebar && (
            <button
              onClick={() => setShowSidebar(true)}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: 'var(--card-bg)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <Menu size={20} />
            </button>
          )}

          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sparkles size={22} color="white" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
                Assistant Intelligent Meetizy
              </h3>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--muted)' }}>
                Toujours prêt à vous aider
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: 'var(--card-bg)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages Area */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          {messages.map((message) => (
            <div
              key={message.id}
              style={{
                display: 'flex',
                gap: '16px',
                maxWidth: '800px',
                margin: message.role === 'user' ? '0 0 0 auto' : '0 auto 0 0',
                width: '100%'
              }}
            >
              {message.role === 'assistant' && (
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Sparkles size={20} color="white" />
                </div>
              )}

              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{
                  padding: '16px 20px',
                  borderRadius: '16px',
                  background: message.role === 'user'
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : 'var(--card-bg)',
                  color: message.role === 'user' ? 'white' : 'var(--text)',
                  border: message.role === 'assistant' ? '1px solid var(--border)' : 'none',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  {message.content}
                </div>
                <div style={{
                  fontSize: '11px',
                  color: 'var(--muted)',
                  paddingLeft: message.role === 'assistant' ? '0' : 'auto',
                  textAlign: message.role === 'user' ? 'right' : 'left'
                }}>
                  {new Date(message.timestamp).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>

              {message.role === 'user' && (
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '600',
                  flexShrink: 0
                }}>
                  {currentUser?.email[0].toUpperCase() || 'U'}
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div style={{
              display: 'flex',
              gap: '16px',
              maxWidth: '800px',
              margin: '0 auto 0 0',
              width: '100%'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Sparkles size={20} color="white" />
              </div>
              <div style={{
                padding: '16px 20px',
                borderRadius: '16px',
                background: 'var(--card-bg)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                <span style={{ fontSize: '14px', color: 'var(--muted)' }}>
                  Réflexion en cours...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={{
          borderTop: '1px solid var(--border)',
          padding: '24px',
          background: 'var(--bg)'
        }}>
          <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-end'
            }}>
              <textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Posez votre question..."
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: '14px 18px',
                  background: 'var(--card-bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  color: 'var(--text)',
                  fontSize: '14px',
                  resize: 'none',
                  minHeight: '52px',
                  maxHeight: '200px',
                  fontFamily: 'inherit',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '12px',
                  background: inputMessage.trim() && !isLoading
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : 'var(--card-bg)',
                  border: '1px solid var(--border)',
                  color: inputMessage.trim() && !isLoading ? 'white' : 'var(--muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: inputMessage.trim() && !isLoading ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s',
                  flexShrink: 0
                }}
                onMouseOver={(e) => {
                  if (inputMessage.trim() && !isLoading) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.4)';
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {isLoading ? (
                  <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} />
                ) : (
                  <Send size={20} />
                )}
              </button>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '12px',
              color: 'var(--muted)'
            }}>
              <Sparkles size={14} />
              <span>Propulsé par Claude AI & GPT-4 - Clés API fournies avec votre abonnement</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
