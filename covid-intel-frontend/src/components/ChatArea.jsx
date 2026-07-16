import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Send, User, Bot, Loader2, Activity } from 'lucide-react';

export default function ChatArea({ messages, setMessages }) {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg = { role: 'user', content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    let assistantMsg = { role: 'assistant', content: '', metrics: null, chunks: [] };
    setMessages([...newMessages, assistantMsg]);

    try {
      const response = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.content })
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let done = false;
      let textBuffer = '';

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          textBuffer += chunk;
          
          if (textBuffer.includes('__JSON_PAYLOAD__')) {
            const parts = textBuffer.split('__JSON_PAYLOAD__');
            assistantMsg.content = parts[0];
            try {
              const payload = JSON.parse(parts[1]);
              assistantMsg.metrics = payload.metrics;
              assistantMsg.latency = payload.latency;
              assistantMsg.chunks = payload.chunks;
            } catch (e) {
              console.error("Failed to parse metrics payload", e);
            }
          } else {
            assistantMsg.content = textBuffer;
          }
          
          setMessages([...newMessages, { ...assistantMsg }]);
        }
      }
    } catch (err) {
      assistantMsg.content = "Error connecting to server.";
      setMessages([...newMessages, assistantMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <Bot size={48} className="mb-4 text-medical-200" />
            <p className="text-lg font-medium text-medical-800">How can I assist you today?</p>
            <p className="text-sm">Ask any question related to the uploaded COVID-19 documents.</p>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-4 max-w-4xl mx-auto ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-medical-600 text-white' : 'bg-white shadow-sm border border-medical-100 text-medical-600'}`}>
              {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
            </div>
            
            <div className={`flex flex-col gap-2 max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`p-4 rounded-2xl ${msg.role === 'user' ? 'bg-medical-600 text-white rounded-tr-none shadow-md' : 'bg-white text-gray-800 rounded-tl-none shadow-sm border border-medical-50'}`}>
                {msg.role === 'user' ? (
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                ) : (
                  <div className="prose prose-sm max-w-none prose-blue">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content || '...'}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
              
              {/* Metrics Panel */}
              {msg.metrics && (
                <div className="mt-2 glass rounded-xl p-4 w-full text-sm">
                  <div className="flex items-center gap-2 text-medical-700 font-semibold mb-3 border-b border-medical-100 pb-2">
                    <Activity size={16} />
                    <span>Retrieval Metrics</span>
                    <span className="ml-auto text-xs font-normal text-gray-500">{msg.latency}</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="bg-white/50 rounded-lg p-2">
                      <div className="text-xs text-gray-500 uppercase">Precision@K</div>
                      <div className="font-semibold text-medical-800">{msg.metrics.precision.toFixed(2)}</div>
                    </div>
                    <div className="bg-white/50 rounded-lg p-2">
                      <div className="text-xs text-gray-500 uppercase">Recall@K</div>
                      <div className="font-semibold text-medical-800">{msg.metrics.recall.toFixed(2)}</div>
                    </div>
                    <div className="bg-white/50 rounded-lg p-2">
                      <div className="text-xs text-gray-500 uppercase">MRR</div>
                      <div className="font-semibold text-medical-800">{msg.metrics.mrr.toFixed(2)}</div>
                    </div>
                    <div className="bg-white/50 rounded-lg p-2">
                      <div className="text-xs text-gray-500 uppercase">NDCG@K</div>
                      <div className="font-semibold text-medical-800">{msg.metrics.ndcg.toFixed(2)}</div>
                    </div>
                  </div>
                  {msg.chunks && msg.chunks.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-medical-100">
                      <div className="text-xs text-gray-500 mb-2">Sources Used</div>
                      <div className="flex flex-wrap gap-2">
                        {Array.from(new Set(msg.chunks.map(c => c.source))).map((src, i) => (
                          <span key={i} className="px-2 py-1 bg-medical-50 text-medical-700 rounded-md text-xs border border-medical-100">
                            {src}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isTyping && !messages[messages.length-1]?.content && (
          <div className="flex gap-4 max-w-4xl mx-auto">
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-white shadow-sm border border-medical-100 text-medical-600">
              <Loader2 size={20} className="animate-spin" />
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white/50 backdrop-blur-md border-t border-medical-100">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a medical question..."
            className="w-full bg-white shadow-sm border border-medical-200 rounded-full py-4 pl-6 pr-14 focus:outline-none focus:ring-2 focus:ring-medical-500 focus:border-transparent transition-shadow text-gray-800"
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-medical-600 hover:bg-medical-700 text-white rounded-full transition-colors disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
