// frontend/pages/index.js
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

export default function ChatApp() {
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const streamingRef = useRef(null);
  const messagesEndRef = useRef(null);
  // Load chats on component mount
  useEffect(() => {
    loadChats();
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadChats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/chats`);
      setChats(response.data);
    } catch (error) {
      console.error('Failed to load chats:', error);
    }
  };

  // const createNewChat = async () => {
  //   try {

  //     const response = await fetch("http://localhost:3001/api/chat", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ query: "Hello world" }),
  //     })


  //     // post(`${API_BASE_URL}/chat`);
  //     const newChat = response.data;
  //     setChats(prev => [newChat, ...prev]);
  //     setCurrentChat(newChat);
  //     setMessages([]);
  //   } catch (error) {
  //     console.error('Failed to create chat:', error);
  //   }
  // };


  const createNewChat = async () => {
    try {

      console.log('Creating new chat...');

      const response = await axios.post(`${API_BASE_URL}/chat`);
      console.log('New chat created:', response.data);

      const newChat = response.data;
      setChats(prev => [newChat, ...prev]);
      setCurrentChat(newChat);
      setMessages([]);

    } catch (error) {
      console.error('Failed to create chat:', error);
      setError(`Failed to create chat: ${error.response?.data?.error || error.message}`);
    }

  };



  const loadChat = async (chatId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/chat/${chatId}`);
      const chatData = response.data;
      setCurrentChat(chatData);
      setMessages(chatData.messages || []);
    } catch (error) {
      console.error('Failed to load chat:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isStreaming) return;

    let chatToUse = currentChat;

    // Create new chat if none exists
    if (!chatToUse) {
      try {
        const response = await axios.post(`${API_BASE_URL}/chat`);
        chatToUse = response.data;
        setCurrentChat(chatToUse);
        setChats(prev => [chatToUse, ...prev]);
      } catch (error) {
        console.error('Failed to create chat:', error);
        return;
      }
    }

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsStreaming(true);
    setIsTyping(true);

    // Add streaming assistant message placeholder
    const assistantMessage = {
      id: Date.now().toString() + '_assistant',
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, assistantMessage]);

    try {
      const response = await fetch(`${API_BASE_URL}/chat/${chatToUse.id}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: userMessage.content }),
      });

      const reader = response.body.getReader();
      streamingRef.current = reader;

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          setIsStreaming(false);
          setIsTyping(false);
          break;
        }

        const chunk = new TextDecoder().decode(value);

        if (chunk.includes('[STOPPED]')) {
          setIsStreaming(false);
          setIsTyping(false);
          break;
        }

        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage.role === 'assistant') {
            lastMessage.content += chunk;
          }
          return newMessages;
        });
      }

      // Refresh chat list to update title
      loadChats();

    } catch (error) {
      console.error('Error sending message:', error);
      setIsStreaming(false);
      setIsTyping(false);
    }
  };

  const stopStreaming = async () => {
    if (streamingRef.current) {
      streamingRef.current.cancel();
    }

    if (currentChat) {
      try {
        await axios.post(`${API_BASE_URL}/chat/${currentChat.id}/stop`);
      } catch (error) {
        console.error('Failed to stop streaming:', error);
      }
    }

    setIsStreaming(false);
    setIsTyping(false);
  };

  // const deleteChat = async (chatId, event) => {
  //   event.stopPropagation();
  //   try {
  //     await axios.delete(`${API_BASE_URL}/chat/${chatId}`);
  //     setChats(prev => prev.filter(chat => chat.id !== chatId));

  //     if (currentChat && currentChat.id === chatId) {
  //       setCurrentChat(null);
  //       setMessages([]);
  //     }
  //   } catch (error) {
  //     console.error('Failed to delete chat:', error);
  //   }
  // };


  const deleteChat = async (chatId, event) => {
    // Prevent event bubbling - handle undefined event
    if (event && typeof event.stopPropagation === 'function') {
      event.stopPropagation();
    }

    // Validate chatId
    if (!chatId || (typeof chatId !== 'string' && typeof chatId !== 'number')) {
      console.error('Invalid chat ID provided for deletion:', chatId);
      return;
    }

    try {
      // Delete from backend
      await axios.delete(`${API_BASE_URL}/chat/${chatId}`);

      // Ultra-safe state update with multiple checks
      setChats(prev => {
        // Ensure prev is an array
        if (!prev || !Array.isArray(prev)) {
          console.warn('Chats state is invalid:', prev);
          return [];
        }

        // Filter with comprehensive safety checks
        return prev.filter(chat => {
          // Check if chat exists and is an object
          if (!chat || typeof chat !== 'object') {
            return false;
          }

          // Check if chat has an id property
          if (!chat.hasOwnProperty('id') || chat.id === undefined || chat.id === null) {
            return false;
          }

          // Return true if this chat should be kept (not deleted)
          return chat.id !== chatId;
        });
      });

      // Safe current chat check
      if (currentChat &&
        typeof currentChat === 'object' &&
        currentChat.hasOwnProperty('id') &&
        currentChat.id === chatId) {
        setCurrentChat(null);
        setMessages([]);
      }

    } catch (error) {
      console.error('Failed to delete chat:', error);
      // Optional: Show user feedback
      // alert('Failed to delete chat. Please try again.');
    }
  };







  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    } else if (e.key === 'Escape') {
      if (isStreaming) {
        stopStreaming();
      }
    }
  };

















  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-4">
          <button
            onClick={createNewChat}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            + New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            {(chats || []).filter(chat => chat && chat.id).map(chat => (
              <div
                key={chat.id}
                onClick={() => loadChat(chat.id)}
                className={`p-3 mb-2 rounded cursor-pointer hover:bg-gray-700 transition-colors group ${currentChat?.id === chat.id ? 'bg-gray-700' : ''
                  }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1 truncate">
                    <div className="text-sm font-medium truncate">
                      {chat.title}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(chat.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    onClick={(e) => deleteChat(chat.id, e)}
                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 ml-2 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentChat ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b px-6 py-4">
              <h1 className="text-xl font-semibold text-gray-800">
                {currentChat.title}
              </h1>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6">
              {messages.map((message, index) => (
                <div
                  key={message.id || index}
                  className={`mb-6 ${message.role === 'user' ? 'text-right' : 'text-left'
                    }`}
                >
                  <div
                    className={`inline-block p-4 rounded-lg max-w-3xl ${message.role === 'user'
                      ? 'bg-gray-600 text-white'
                      : 'bg-black border border-gray-200'
                      }`}
                  >
                    <pre className="whitespace-pre-wrap font-sans">
                      {message.content}
                    </pre>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="text-left mb-6">
                  <div className="inline-block p-4 rounded-lg bg-white border border-gray-200">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white border-t p-4">
              <div className="flex space-x-4">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message here..."
                  className="flex-1 p-3 border border-gray-300 text-black rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="1"
                  disabled={isStreaming}
                />

                {isStreaming ? (
                  <button
                    onClick={stopStreaming}
                    className="bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                  >
                    Stop
                  </button>
                ) : (
                  <button
                    onClick={sendMessage}
                    disabled={!inputValue.trim()}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                  >
                    Send
                  </button>
                )}
              </div>

              <div className="text-xs text-gray-500 mt-2">
                Press Enter to send, Shift+Enter for new line, Esc to stop
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-600 mb-4">
                Welcome to Cointab Chat
              </h2>
              <p className="text-gray-500 mb-6">
                What can I help with
              </p>
              <button
                onClick={createNewChat}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Start New Chat
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
