import React, { useState, useMemo } from 'react';
import { X, Stethoscope, Download, Info, AlertCircle, CheckCircle2, ShieldAlert, FileWarning, Search, Filter } from 'lucide-react';
import evaluationData from '../data/evaluation_data.json';
import faithfulnessData from '../data/faithfulness_data.json';

export default function DiagnoseModal({ onClose }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDiagnosis, setFilterDiagnosis] = useState('All');
  const [selectedResult, setSelectedResult] = useState(null);

  // 1. Diagnosis Engine: Process the data
  const data = useMemo(() => {
    const faithfulnessMap = {};
    faithfulnessData.forEach(item => {
      const supported = item.claims.filter(c => c.supported).length;
      const total = item.claims.length;
      faithfulnessMap[item.id] = {
        score: total > 0 ? Math.round((supported / total) * 100) : 0,
        hasHallucination: item.claims.some(c => !c.supported)
      };
    });

    return evaluationData.map(item => {
      const fData = faithfulnessMap[item.id] || { score: 100, hasHallucination: false };
      const ansLower = item.generated_answer.toLowerCase();
      
      const isFalseRefusal = ansLower.includes("i cannot find") || ansLower.includes("i don't know") || ansLower.includes("insufficient information");
      const isHallucination = fData.hasHallucination || item.label.toLowerCase() === 'hallucinated';

      let contextRel = 'High';
      let answerRel = 'High';
      let diagnosis = 'Healthy';
      let recommendation = 'Current pipeline is performing well for this query.';
      let badgeType = 'healthy';

      if (item.retrieved_context.length < 50 || item.label.toLowerCase() === 'irrelevant') {
        contextRel = 'Low';
        diagnosis = 'Retriever Issue';
        recommendation = 'Improve embeddings, chunking, reranking or retrieval strategy.';
        badgeType = 'retriever';
      } else if (isHallucination) {
        contextRel = 'High';
        diagnosis = 'Prompt / LLM Issue';
        recommendation = 'Improve prompt, lower temperature, or use a stronger model.';
        badgeType = 'prompt';
      } else if (isFalseRefusal) {
        contextRel = 'High';
        answerRel = 'Low';
        diagnosis = 'Prompt / Answer Generation Issue';
        recommendation = 'Improve prompt instructions or answer generation logic.';
        badgeType = 'refusal';
      } else if (item.generated_answer.length < item.reference_answer.length * 0.5) {
        contextRel = 'High';
        answerRel = 'High';
        diagnosis = 'Document Issue';
        recommendation = 'Update or replace the document.';
        badgeType = 'document';
      }

      return {
        id: item.id,
        query: item.question,
        context: item.retrieved_context,
        generatedAnswer: item.generated_answer,
        goldenAnswer: item.reference_answer,
        humanLabel: item.label,
        contextRelevance: contextRel,
        faithfulness: fData.score,
        answerRelevance: answerRel,
        isHallucination,
        isFalseRefusal,
        diagnosis,
        recommendation,
        badgeType
      };
    });
  }, []);

  // 2. Compute Analytics
  const totalQueries = data.length;
  const totalHallucinations = data.filter(d => d.isHallucination).length;
  const totalFalseRefusals = data.filter(d => d.isFalseRefusal).length;
  
  const halRate = Math.round((totalHallucinations / totalQueries) * 100);
  const refRate = Math.round((totalFalseRefusals / totalQueries) * 100);

  const issueCounts = {
    retriever: data.filter(d => d.badgeType === 'retriever').length,
    prompt: data.filter(d => d.badgeType === 'prompt').length,
    document: data.filter(d => d.badgeType === 'document').length,
    healthy: data.filter(d => d.badgeType === 'healthy').length,
    refusal: data.filter(d => d.badgeType === 'refusal').length,
  };

  const getPercentage = (count) => Math.round((count / totalQueries) * 100);

  // 3. Product Recommendation Logic
  let prodRec = {
    title: 'Balanced System',
    desc: 'Current refusal policy is acceptable.',
    color: 'bg-green-50 text-green-800 border-green-200'
  };
  if (halRate > refRate && halRate > 10) {
    prodRec = {
      title: 'Hallucinations Elevated',
      desc: 'Increase the refusal threshold and make the model more conservative.',
      color: 'bg-red-50 text-red-800 border-red-200'
    };
  } else if (refRate > halRate && refRate > 10) {
    prodRec = {
      title: 'Overly Conservative',
      desc: 'Reduce unnecessary refusals and allow the model to answer more often.',
      color: 'bg-orange-50 text-orange-800 border-orange-200'
    };
  }

  // Filtered Data
  const filteredData = data.filter(d => {
    const matchesSearch = d.query.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterDiagnosis === 'All' || d.diagnosis === filterDiagnosis;
    return matchesSearch && matchesFilter;
  });

  // Badge Styling
  const getBadgeStyle = (type) => {
    switch(type) {
      case 'healthy': return 'bg-green-100 text-green-700 border-green-200';
      case 'retriever': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'prompt': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'document': return 'bg-red-100 text-red-700 border-red-200';
      case 'refusal': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const exportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "rag_diagnosis.json");
    dlAnchorElem.click();
  };

  const exportCSV = () => {
    const header = ["ID", "Query", "Context Relevance", "Faithfulness", "Answer Relevance", "Hallucination", "False Refusal", "Diagnosis", "Recommendation"];
    const rows = data.map(r => [
      r.id, `"${r.query.replace(/"/g, '""')}"`, r.contextRelevance, r.faithfulness, r.answerRelevance, 
      r.isHallucination ? 'Yes' : 'No', r.isFalseRefusal ? 'Yes' : 'No', 
      r.diagnosis, `"${r.recommendation.replace(/"/g, '""')}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [header.join(","), ...rows.map(e => e.join(","))].join("\n");
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", encodeURI(csvContent));
    dlAnchorElem.setAttribute("download", "rag_diagnosis.csv");
    dlAnchorElem.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
      <div className="glass w-full max-w-7xl rounded-2xl shadow-2xl flex flex-col overflow-hidden h-[95vh] animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-teal-100 flex justify-between items-center bg-white/70">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-teal-100 text-teal-600 rounded-lg"><Stethoscope size={24} /></div>
            <h2 className="text-xl font-bold text-gray-900">RAG Diagnosis Dashboard</h2>
          </div>
          <div className="flex gap-3">
            <button onClick={exportCSV} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-white border border-gray-200 hover:bg-gray-50 rounded-lg font-medium text-gray-700 transition-colors">
              <Download size={16} /> CSV
            </button>
            <button onClick={exportJSON} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-white border border-gray-200 hover:bg-gray-50 rounded-lg font-medium text-gray-700 transition-colors">
              <Download size={16} /> JSON
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 ml-2">
              <X size={20} />
            </button>
          </div>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto bg-gray-50/50 space-y-6">
          
          {/* Section 1 & 6: Guardrails & Product Recommendation */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
                <span className="text-gray-500 font-semibold text-xs uppercase">Total Queries</span>
                <span className="text-3xl font-bold text-gray-800">{totalQueries}</span>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
                <span className="text-gray-500 font-semibold text-xs uppercase flex items-center gap-1"><ShieldAlert size={14}/> Hallucinations</span>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold text-red-600">{totalHallucinations}</span>
                  <span className="text-sm text-red-400 font-medium mb-1">({halRate}%)</span>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
                <span className="text-gray-500 font-semibold text-xs uppercase flex items-center gap-1"><FileWarning size={14}/> False Refusals</span>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold text-gray-600">{totalFalseRefusals}</span>
                  <span className="text-sm text-gray-400 font-medium mb-1">({refRate}%)</span>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
                <span className="text-gray-500 font-semibold text-xs uppercase">Avg Faithfulness</span>
                <span className="text-3xl font-bold text-teal-600">
                  {Math.round(data.reduce((acc, d) => acc + d.faithfulness, 0) / totalQueries)}%
                </span>
              </div>
            </div>
            
            <div className={`p-5 rounded-xl border shadow-sm flex flex-col justify-center ${prodRec.color}`}>
              <h3 className="font-bold text-sm uppercase mb-1 flex items-center gap-2">
                <AlertCircle size={16} /> Product Recommendation
              </h3>
              <p className="font-medium">{prodRec.desc}</p>
            </div>
          </div>

          {/* Section 5: Root Cause Analytics */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4">Root Cause Analytics</h3>
            <div className="flex h-6 rounded-full overflow-hidden w-full bg-gray-100 mb-3">
              <div style={{ width: `${getPercentage(issueCounts.healthy)}%` }} className="bg-green-500 h-full"></div>
              <div style={{ width: `${getPercentage(issueCounts.prompt)}%` }} className="bg-yellow-400 h-full"></div>
              <div style={{ width: `${getPercentage(issueCounts.refusal)}%` }} className="bg-gray-400 h-full"></div>
              <div style={{ width: `${getPercentage(issueCounts.retriever)}%` }} className="bg-orange-500 h-full"></div>
              <div style={{ width: `${getPercentage(issueCounts.document)}%` }} className="bg-red-500 h-full"></div>
            </div>
            <div className="flex flex-wrap gap-4 text-sm font-medium">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-green-500"></div> Healthy: {getPercentage(issueCounts.healthy)}%</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-yellow-400"></div> Prompt / LLM Issues: {getPercentage(issueCounts.prompt)}%</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-gray-400"></div> Prompt (Refusal): {getPercentage(issueCounts.refusal)}%</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-orange-500"></div> Retriever Issues: {getPercentage(issueCounts.retriever)}%</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500"></div> Document Issues: {getPercentage(issueCounts.document)}%</div>
            </div>
          </div>

          {/* Section 3: Per Query Diagnosis Table */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 flex gap-4 bg-gray-50/50">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="text" placeholder="Search queries..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-teal-300"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <select 
                  value={filterDiagnosis} onChange={e => setFilterDiagnosis(e.target.value)}
                  className="pl-9 pr-8 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-teal-300 appearance-none bg-white"
                >
                  <option value="All">All Diagnoses</option>
                  <option value="Healthy">Healthy</option>
                  <option value="Prompt / LLM Issue">Prompt / LLM Issue</option>
                  <option value="Prompt / Answer Generation Issue">Prompt / Answer Gen (Refusal)</option>
                  <option value="Retriever Issue">Retriever Issue</option>
                  <option value="Document Issue">Document Issue</option>
                </select>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left whitespace-nowrap">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase text-xs font-bold">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3 min-w-[200px]">User Query</th>
                    <th className="px-4 py-3 text-center">Ctx Rel</th>
                    <th className="px-4 py-3 text-center">Faithful</th>
                    <th className="px-4 py-3 text-center">Ans Rel</th>
                    <th className="px-4 py-3 text-center">Halluc.</th>
                    <th className="px-4 py-3 text-center">F. Refus.</th>
                    <th className="px-4 py-3 text-center">Diagnosis</th>
                    <th className="px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map(r => (
                    <tr key={r.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-500">{r.id}</td>
                      <td className="px-4 py-3 text-gray-800 truncate max-w-xs" title={r.query}>{r.query}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`font-bold ${r.contextRelevance === 'High' ? 'text-green-600' : 'text-red-600'}`}>{r.contextRelevance}</span>
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-gray-700">{r.faithfulness}%</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`font-bold ${r.answerRelevance === 'High' ? 'text-green-600' : 'text-red-600'}`}>{r.answerRelevance}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {r.isHallucination ? <span className="inline-block w-2 h-2 rounded-full bg-red-500"></span> : <span className="inline-block w-2 h-2 rounded-full bg-gray-200"></span>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {r.isFalseRefusal ? <span className="inline-block w-2 h-2 rounded-full bg-orange-500"></span> : <span className="inline-block w-2 h-2 rounded-full bg-gray-200"></span>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-bold border ${getBadgeStyle(r.badgeType)}`}>
                          {r.diagnosis}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button 
                          onClick={() => setSelectedResult(r)}
                          className="p-1.5 text-teal-600 bg-teal-50 hover:bg-teal-100 rounded transition-colors"
                          title="View Details"
                        >
                          <Info size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredData.length === 0 && (
                    <tr>
                      <td colSpan="9" className="px-4 py-8 text-center text-gray-500">No diagnostic results match your filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Details Nested Modal */}
      {selectedResult && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/60 p-4">
          <div className="bg-white w-full max-w-5xl rounded-xl shadow-2xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-4 duration-200">
            <div className="px-5 py-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-lg">Diagnostic Details: {selectedResult.id}</h3>
                <span className={`inline-block px-2 py-1 rounded text-xs font-bold border ${getBadgeStyle(selectedResult.badgeType)}`}>
                  {selectedResult.diagnosis}
                </span>
              </div>
              <button onClick={() => setSelectedResult(null)} className="p-1.5 hover:bg-gray-200 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6 text-sm">
              {/* Recommendation Alert */}
              <div className={`p-4 rounded-lg border flex items-start gap-3 ${selectedResult.badgeType === 'healthy' ? 'bg-green-50 border-green-200 text-green-900' : 'bg-orange-50 border-orange-200 text-orange-900'}`}>
                {selectedResult.badgeType === 'healthy' ? <CheckCircle2 size={20} className="text-green-600 mt-0.5" /> : <AlertCircle size={20} className="text-orange-600 mt-0.5" />}
                <div>
                  <h4 className="font-bold text-sm mb-1">Recommendation</h4>
                  <p>{selectedResult.recommendation}</p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-700 uppercase text-xs mb-2">User Question</h4>
                <p className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-gray-800 font-medium text-base">{selectedResult.query}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-center">
                  <h4 className="font-bold text-gray-500 uppercase text-xs mb-1">Context Relevance</h4>
                  <span className={`text-lg font-bold ${selectedResult.contextRelevance === 'High' ? 'text-green-600' : 'text-red-600'}`}>{selectedResult.contextRelevance}</span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-center">
                  <h4 className="font-bold text-gray-500 uppercase text-xs mb-1">Faithfulness</h4>
                  <span className={`text-lg font-bold ${selectedResult.faithfulness >= 80 ? 'text-green-600' : 'text-red-600'}`}>{selectedResult.faithfulness}%</span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-center">
                  <h4 className="font-bold text-gray-500 uppercase text-xs mb-1">Answer Relevance</h4>
                  <span className={`text-lg font-bold ${selectedResult.answerRelevance === 'High' ? 'text-green-600' : 'text-red-600'}`}>{selectedResult.answerRelevance}</span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-center">
                  <h4 className="font-bold text-gray-500 uppercase text-xs mb-1">Human Label</h4>
                  <span className="text-gray-700 font-bold">{selectedResult.humanLabel}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-gray-700 uppercase text-xs mb-2">Generated Answer</h4>
                    <p className={`p-4 rounded-lg border h-40 overflow-y-auto leading-relaxed ${selectedResult.isFalseRefusal ? 'bg-orange-50 border-orange-200' : selectedResult.isHallucination ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-100'}`}>
                      {selectedResult.generatedAnswer}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-700 uppercase text-xs mb-2">Golden Answer</h4>
                    <p className="bg-gray-50 p-4 rounded-lg border border-gray-100 h-40 overflow-y-auto leading-relaxed">{selectedResult.goldenAnswer}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-gray-700 uppercase text-xs mb-2">Retrieved Context</h4>
                  <p className={`p-4 rounded-lg border h-[345px] overflow-y-auto leading-relaxed whitespace-pre-wrap ${selectedResult.contextRelevance === 'Low' ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-100'}`}>
                    {selectedResult.context}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
