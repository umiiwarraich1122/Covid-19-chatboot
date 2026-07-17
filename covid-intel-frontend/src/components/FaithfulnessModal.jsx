import React, { useState } from 'react';
import { X, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';
import faithfulnessData from '../data/faithfulness_data.json';

export default function FaithfulnessModal({ onClose }) {
  const [expandedId, setExpandedId] = useState(faithfulnessData[0]?.id);

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 70) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };
  
  const getScoreColorHex = (score) => {
    if (score >= 90) return '#16a34a';
    if (score >= 70) return '#ea580c';
    return '#dc2626';
  };

  const getStatus = (score) => {
    if (score >= 90) return 'Highly Faithful';
    if (score >= 70) return 'Moderately Faithful';
    return 'Hallucinated / Unfaithful';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
      <div className="glass w-full max-w-6xl rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        <div className="px-6 py-4 border-b border-medical-100 flex justify-between items-center bg-white/50">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-medical-600" size={24} />
            <h2 className="text-xl font-bold text-medical-900">Faithfulness Evaluation</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto bg-gray-50/50 space-y-8">
          {faithfulnessData.map((item) => {
            const totalClaims = item.claims.length;
            const supportedClaims = item.claims.filter(c => c.supported).length;
            const unsupportedClaims = totalClaims - supportedClaims;
            const faithfulnessScore = totalClaims > 0 ? Math.round((supportedClaims / totalClaims) * 100) : 0;
            const colorClass = getScoreColor(faithfulnessScore);
            const colorHex = getScoreColorHex(faithfulnessScore);
            const status = getStatus(faithfulnessScore);
            
            const isExpanded = expandedId === item.id;
            
            return (
              <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div 
                  className="p-5 border-b border-gray-100 cursor-pointer flex justify-between items-center hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                >
                  <h3 className="font-bold text-gray-800 text-lg flex-1">Q: {item.question}</h3>
                  <div className={`ml-4 px-3 py-1 rounded-full text-sm font-bold border ${colorClass}`}>
                    Score: {faithfulnessScore}%
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="p-6 space-y-8">
                    {/* Overall Result Summary Card */}
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className={`flex flex-col items-center justify-center p-6 rounded-2xl border ${colorClass} min-w-[200px]`}>
                        <div className="relative w-32 h-32 flex items-center justify-center mb-2">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle cx="64" cy="64" r="56" className="stroke-current opacity-20" strokeWidth="12" fill="transparent" />
                            <circle 
                              cx="64" cy="64" r="56" 
                              className="stroke-current transition-all duration-1000 ease-out" 
                              strokeWidth="12" fill="transparent" 
                              strokeDasharray="351.8" 
                              strokeDashoffset={351.8 - (351.8 * faithfulnessScore) / 100}
                              strokeLinecap="round"
                            />
                          </svg>
                          <span className="absolute text-3xl font-bold">{faithfulnessScore}%</span>
                        </div>
                        <h4 className="font-bold text-lg text-center">{status}</h4>
                      </div>
                      
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                          <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Generated Answer</h4>
                          <p className="text-sm text-gray-700">{item.generated_answer}</p>
                        </div>
                        <div className="bg-medical-50/50 p-4 rounded-xl border border-medical-50">
                          <h4 className="text-xs font-bold text-medical-600 uppercase mb-2">Reference Answer</h4>
                          <p className="text-sm text-gray-700">{item.reference_answer}</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex items-center justify-between">
                          <span className="font-semibold text-green-800">Supported Claims</span>
                          <span className="text-2xl font-bold text-green-600">{supportedClaims}</span>
                        </div>
                        <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex items-center justify-between">
                          <span className="font-semibold text-red-800">Unsupported Claims</span>
                          <span className="text-2xl font-bold text-red-600">{unsupportedClaims}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Progress Bar representation */}
                    <div>
                       <div className="flex justify-between mb-1">
                          <span className="text-sm font-semibold text-gray-600">Faithfulness Progress</span>
                          <span className="text-sm font-bold" style={{ color: colorHex }}>{faithfulnessScore}%</span>
                       </div>
                       <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                          <div className="h-2.5 rounded-full transition-all duration-1000" style={{ width: `${faithfulnessScore}%`, backgroundColor: colorHex }}></div>
                       </div>
                    </div>
                    
                    {/* Hallucination Detection */}
                    <div>
                      <h4 className="font-bold text-gray-800 mb-3 border-b pb-2">Hallucination Detection</h4>
                      {unsupportedClaims === 0 ? (
                        <div className="flex items-center gap-2 text-green-600 font-semibold bg-green-50 p-4 rounded-lg border border-green-100">
                          <CheckCircle2 size={24} />
                          No hallucinations detected.
                        </div>
                      ) : (
                        <div className="bg-red-50 border border-red-100 rounded-xl overflow-hidden">
                          <div className="bg-red-100 px-4 py-3 font-bold text-red-800 border-b border-red-200 flex items-center gap-2">
                            <XCircle size={20} />
                            Hallucinations Found ({unsupportedClaims}):
                          </div>
                          <ul className="list-disc list-inside p-5 space-y-2 text-red-700 font-medium">
                            {item.claims.filter(c => !c.supported).map((c, i) => (
                              <li key={i}>{c.text}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    
                    {/* Claims Verification Table */}
                    <div>
                      <h4 className="font-bold text-gray-800 mb-3 border-b pb-2">Claim Verification Breakdown</h4>
                      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                        <table className="min-w-full text-sm text-left text-gray-600">
                          <thead className="bg-gray-100 text-gray-700 font-bold uppercase text-xs">
                            <tr>
                              <th className="px-4 py-3 border-b">Claim</th>
                              <th className="px-4 py-3 border-b text-center w-36">Supported</th>
                              <th className="px-4 py-3 border-b">Evidence</th>
                            </tr>
                          </thead>
                          <tbody>
                            {item.claims.map((claim, idx) => (
                              <tr key={idx} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-4 font-medium text-gray-800 align-top">{claim.text}</td>
                                <td className="px-4 py-4 text-center align-top">
                                  {claim.supported ? (
                                    <span className="inline-flex items-center gap-1 text-green-700 font-bold bg-green-100 px-2 py-1 rounded-md border border-green-200">
                                      <CheckCircle2 size={16} /> Yes
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-red-700 font-bold bg-red-100 px-2 py-1 rounded-md border border-red-200">
                                      <XCircle size={16} /> No
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-4 text-gray-600 italic align-top">{claim.evidence}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
