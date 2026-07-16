import { MessageSquare, PlusCircle, Settings, FileText, BarChart2 } from 'lucide-react';

export default function Sidebar({ chats, activeChatId, setActiveChatId, createNewChat, setActiveModal }) {
  return (
    <div className="w-64 bg-white/80 backdrop-blur-xl border-r border-medical-100 flex flex-col shadow-sm z-20">
      <div className="p-4">
        <button 
          onClick={createNewChat}
          className="w-full flex items-center justify-center gap-2 bg-medical-600 hover:bg-medical-700 text-white py-2 px-4 rounded-xl font-medium transition-colors shadow-sm"
        >
          <PlusCircle size={18} />
          <span>New Consultation</span>
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 scrollbar-hide">
        <h2 className="text-xs font-semibold text-medical-400 uppercase tracking-wider mb-2 ml-2">Recent Consultations</h2>
        {chats.map(chat => (
          <button
            key={chat.id}
            onClick={() => setActiveChatId(chat.id)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-left transition-colors ${
              activeChatId === chat.id 
                ? 'bg-medical-100 text-medical-900 font-medium' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <MessageSquare size={16} className={activeChatId === chat.id ? 'text-medical-600' : 'text-gray-400'} />
            <span className="truncate">{chat.title}</span>
          </button>
        ))}
      </div>
      
      <div className="p-4 border-t border-medical-100 space-y-2">
        <button 
          onClick={() => setActiveModal('documents')}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <FileText size={18} className="text-medical-500" />
          <span>Documents</span>
        </button>
        <button 
          onClick={() => setActiveModal('analytics')}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <BarChart2 size={18} className="text-medical-500" />
          <span>Analytics</span>
        </button>
        <button 
          onClick={() => setActiveModal('settings')}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <Settings size={18} className="text-gray-500" />
          <span>Settings</span>
        </button>
      </div>
    </div>
  );
}
