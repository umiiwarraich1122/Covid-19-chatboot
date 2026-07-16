import { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import SettingsModal from './components/SettingsModal';
import DocumentModal from './components/DocumentModal';
import AnalyticsModal from './components/AnalyticsModal';

export default function App() {
  const [activeModal, setActiveModal] = useState(null); // 'settings', 'documents', 'analytics'
  const [chats, setChats] = useState([{ id: 1, title: 'New COVID Consultation', messages: [] }]);
  const [activeChatId, setActiveChatId] = useState(1);

  const activeChat = chats.find(c => c.id === activeChatId);

  const updateChatMessages = (id, messages) => {
    setChats(prev => prev.map(c => {
      if (c.id === id) {
        // Auto-generate title if it's the first user message and title is default
        let newTitle = c.title;
        if (messages.length === 1 && c.title === 'New COVID Consultation') {
          const firstMsg = messages[0].content;
          newTitle = firstMsg.length > 30 ? firstMsg.substring(0, 30) + '...' : firstMsg;
        }
        return { ...c, messages, title: newTitle };
      }
      return c;
    }));
  };

  const createNewChat = () => {
    const newId = Date.now();
    setChats([{ id: newId, title: 'New COVID Consultation', messages: [] }, ...chats]);
    setActiveChatId(newId);
  };

  return (
    <div className="flex h-screen bg-medical-50 overflow-hidden font-sans">
      <Sidebar 
        chats={chats} 
        activeChatId={activeChatId} 
        setActiveChatId={setActiveChatId} 
        createNewChat={createNewChat}
        setActiveModal={setActiveModal} 
      />
      
      <main className="flex-1 flex flex-col relative">
        <header className="h-16 flex items-center justify-between px-6 border-b border-medical-100 bg-white/50 backdrop-blur-sm z-10">
          <div>
            <h1 className="text-xl font-bold text-medical-900">COVIDIntel AI</h1>
            <p className="text-xs text-medical-600">Intelligent COVID-19 Clinical Assistant</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm font-medium text-medical-700">System Ready</span>
          </div>
        </header>

        <ChatArea 
          messages={activeChat?.messages || []} 
          setMessages={(msgs) => updateChatMessages(activeChatId, msgs)} 
        />
        
        <footer className="text-center p-2 text-xs text-medical-400 bg-white/30 backdrop-blur-sm">
          Powered by RAG + Hybrid Retrieval + Cross Encoder Reranker • Version 2.0
        </footer>
      </main>

      {activeModal === 'settings' && <SettingsModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'documents' && <DocumentModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'analytics' && <AnalyticsModal onClose={() => setActiveModal(null)} />}
    </div>
  );
}
