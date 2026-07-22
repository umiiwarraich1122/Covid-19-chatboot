import { MessageSquare, PlusCircle, Settings, FileText, BarChart2, ClipboardCheck, ShieldCheck, Scale, Stethoscope, Globe } from 'lucide-react';

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
      
      <div className="p-4 border-t border-medical-100 bg-gray-50/50 space-y-6">
        
        {/* Box 0: GraphRAG */}
        <div className="space-y-2">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">GraphRAG Pipeline</h2>
          <div className="bg-white rounded-xl border border-gray-200 p-2 space-y-1 shadow-sm">
            <button 
              onClick={() => setActiveModal('graphrag')}
              className="w-full flex items-center gap-3 p-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-rose-50 hover:text-rose-700 transition-all"
            >
              <div className="p-1.5 bg-rose-100 text-rose-600 rounded-md">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
              </div>
              <span>GraphRAG Studio</span>
            </button>
          </div>
        </div>

        {/* Box 1: Evaluation */}
        <div className="space-y-2">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Evaluation</h2>
          <div className="bg-white rounded-xl border border-gray-200 p-2 space-y-1 shadow-sm">
            <button 
              onClick={() => setActiveModal('mrjudge')}
              className="w-full flex items-center gap-3 p-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-all"
            >
              <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-md"><Scale size={16} /></div>
              <span>Mr. Judge</span>
            </button>
            <button 
              onClick={() => setActiveModal('faithful')}
              className="w-full flex items-center gap-3 p-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all"
            >
              <div className="p-1.5 bg-blue-100 text-blue-600 rounded-md"><ShieldCheck size={16} /></div>
              <span>Faithful Eval</span>
            </button>
            <button 
              onClick={() => setActiveModal('evaluation')}
              className="w-full flex items-center gap-3 p-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-all"
            >
              <div className="p-1.5 bg-purple-100 text-purple-600 rounded-md"><ClipboardCheck size={16} /></div>
              <span>Evaluation Data</span>
            </button>
            <button 
              onClick={() => setActiveModal('diagnose')}
              className="w-full flex items-center gap-3 p-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-all"
            >
              <div className="p-1.5 bg-teal-100 text-teal-600 rounded-md"><Stethoscope size={16} /></div>
              <span>Diagnose</span>
            </button>
          </div>
        </div>

        {/* Box 2: Document Upload */}
        <div className="space-y-2">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Document Upload</h2>
          <div className="bg-white rounded-xl border border-gray-200 p-2 space-y-1 shadow-sm">
            <button 
              onClick={() => setActiveModal('documents')}
              className="w-full flex items-center gap-3 p-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-green-700 transition-all"
            >
              <div className="p-1.5 bg-green-100 text-green-600 rounded-md"><FileText size={16} /></div>
              <span>Documents</span>
            </button>
            <button 
              onClick={() => setActiveModal('analytics')}
              className="w-full flex items-center gap-3 p-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition-all"
            >
              <div className="p-1.5 bg-orange-100 text-orange-600 rounded-md"><BarChart2 size={16} /></div>
              <span>Analytics</span>
            </button>
            <button 
              onClick={() => setActiveModal('settings')}
              className="w-full flex items-center gap-3 p-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all"
            >
              <div className="p-1.5 bg-gray-200 text-gray-600 rounded-md"><Settings size={16} /></div>
              <span>Set the Chunks</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
