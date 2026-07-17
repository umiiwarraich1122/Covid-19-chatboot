import React from 'react';
import { X, CheckCircle2, XCircle } from 'lucide-react';
import evaluationData from '../data/evaluation_data.json';

export default function EvaluationModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
      <div className="glass w-full max-w-5xl rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[85vh]">
        <div className="px-6 py-4 border-b border-medical-100 flex justify-between items-center bg-white/50">
          <h2 className="text-xl font-bold text-medical-900">Evaluation Data Records</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto bg-white/30 space-y-6">
          <div className="space-y-6">
            {evaluationData.map((item) => (
              <div key={item.id} className="bg-white p-5 rounded-xl border border-medical-100 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-xs font-semibold px-2 py-1 bg-medical-50 text-medical-700 rounded-md mr-2">
                      {item.group}
                    </span>
                    <span className="text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-600 rounded-md">
                      Persona: {item.persona}
                    </span>
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-bold ${item.label === 'Good' ? 'text-green-600' : 'text-red-500'}`}>
                    {item.label === 'Good' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                    {item.label}
                  </div>
                </div>
                
                <h3 className="font-bold text-gray-800 mb-2">Q: {item.question}</h3>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-1">Generated Answer</h4>
                    <p className="text-sm text-gray-700">{item.generated_answer}</p>
                  </div>
                  <div className="bg-medical-50/50 p-3 rounded-lg border border-medical-50">
                    <h4 className="text-xs font-bold text-medical-600 uppercase mb-1">Reference Answer</h4>
                    <p className="text-sm text-gray-700">{item.reference_answer}</p>
                  </div>
                </div>
                
                <div className="mt-3">
                  <span className="text-xs text-gray-500 font-semibold">Retrieved Context: </span>
                  <span className="text-xs text-gray-400">{item.retrieved_context}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
