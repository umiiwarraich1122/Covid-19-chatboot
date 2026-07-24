import { useState, useEffect } from 'react';
import { X, Activity, Database, Layers, Brain, LayoutTemplate } from 'lucide-react';

export default function AnalyticsModal({ onClose }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || ''}/analytics`)
      .then(res => res.json())
      .then(d => setData(d))
      .catch(console.error);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
      <div className="glass w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[80vh]">
        <div className="px-6 py-4 border-b border-medical-100 flex justify-between items-center bg-white/50">
          <h2 className="text-xl font-bold text-medical-900">Analytics Dashboard</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto bg-white/30 space-y-6">
          {!data ? (
            <div className="flex justify-center p-8"><Activity className="animate-pulse text-medical-400" /></div>
          ) : (
            <>
              <div>
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">Average Retrieval Metrics</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-medical-100 shadow-sm text-center">
                    <div className="text-xs text-gray-500 uppercase mb-1">Precision</div>
                    <div className="text-2xl font-bold text-medical-700">{data.avg_precision.toFixed(2)}</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-medical-100 shadow-sm text-center">
                    <div className="text-xs text-gray-500 uppercase mb-1">Recall</div>
                    <div className="text-2xl font-bold text-medical-700">{data.avg_recall.toFixed(2)}</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-medical-100 shadow-sm text-center">
                    <div className="text-xs text-gray-500 uppercase mb-1">MRR</div>
                    <div className="text-2xl font-bold text-medical-700">{data.avg_mrr.toFixed(2)}</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-medical-100 shadow-sm text-center">
                    <div className="text-xs text-gray-500 uppercase mb-1">NDCG</div>
                    <div className="text-2xl font-bold text-medical-700">{data.avg_ndcg.toFixed(2)}</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-medical-100 shadow-sm text-center">
                    <div className="text-xs text-gray-500 uppercase mb-1">Latency</div>
                    <div className="text-2xl font-bold text-medical-700">{data.avg_latency.toFixed(2)}s</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">System Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-medical-100 shadow-sm">
                    <div className="p-3 bg-medical-50 text-medical-600 rounded-lg"><Database size={24} /></div>
                    <div>
                      <p className="text-xs text-gray-500">Documents Indexed</p>
                      <p className="text-lg font-semibold text-gray-800">{data.docs_count}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-medical-100 shadow-sm">
                    <div className="p-3 bg-medical-50 text-medical-600 rounded-lg"><Layers size={24} /></div>
                    <div>
                      <p className="text-xs text-gray-500">Total Chunks</p>
                      <p className="text-lg font-semibold text-gray-800">{data.chunks_count}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-medical-100 shadow-sm md:col-span-2">
                    <div className="p-3 bg-medical-50 text-medical-600 rounded-lg"><Brain size={24} /></div>
                    <div className="flex-1 grid grid-cols-3 gap-2">
                      <div>
                        <p className="text-xs text-gray-500">Embed Model</p>
                        <p className="text-sm font-medium text-gray-800">{data.embed_model}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Retriever</p>
                        <p className="text-sm font-medium text-gray-800">{data.retriever}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Reranker</p>
                        <p className="text-sm font-medium text-gray-800">{data.reranker}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
