import React, { useState } from 'react';
import { X, Scale, Play, CheckCircle2, XCircle, AlertTriangle, Download, Info } from 'lucide-react';
import evaluationData from '../data/evaluation_data.json';

export default function MrJudgeModal({ onClose }) {
  const [results, setResults] = useState([]);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedResult, setSelectedResult] = useState(null);

  const [filterMatch, setFilterMatch] = useState('All');
  const [filterLabel, setFilterLabel] = useState('All');

  const runEvaluation = async () => {
    setIsEvaluating(true);
    setProgress(0);
    const newResults = [];

    for (let i = 0; i < evaluationData.length; i++) {
      const item = evaluationData[i];
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/judge`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: item.question,
            reference_answer: item.reference_answer
          })
        });
        const data = await res.json();
        const judgeData = data.judge_evaluation;
        
        const isMatch = (item.label.toLowerCase() === judgeData.judge_label.toLowerCase());

        newResults.push({
          id: item.id,
          query: item.question,
          humanLabel: item.label,
          judgeLabel: judgeData.judge_label,
          isMatch: isMatch,
          faithfulnessScore: judgeData.faithfulness_score,
          supportedClaims: judgeData.supported_claims,
          unsupportedClaims: judgeData.unsupported_claims,
          hallucinations: judgeData.hallucinations || [],
          reason: judgeData.reason,
          context: data.retrieved_context,
          generatedAnswer: data.generated_answer,
          goldenAnswer: data.golden_answer
        });
      } catch (err) {
        console.error(err);
        newResults.push({
          id: item.id,
          query: item.question,
          humanLabel: item.label,
          judgeLabel: 'Error',
          isMatch: false,
          faithfulnessScore: 0,
          supportedClaims: 0,
          unsupportedClaims: 0,
          hallucinations: [],
          reason: 'Failed to evaluate',
          context: '',
          generatedAnswer: '',
          goldenAnswer: ''
        });
      }
      setResults([...newResults]);
      setProgress(Math.round(((i + 1) / evaluationData.length) * 100));
    }
    setIsEvaluating(false);
  };

  const totalEvaluated = results.length;
  const matches = results.filter(r => r.isMatch).length;
  const mismatches = totalEvaluated - matches;
  const agreement = totalEvaluated > 0 ? Math.round((matches / totalEvaluated) * 100) : 0;
  
  const avgFaithfulness = totalEvaluated > 0 
    ? Math.round(results.reduce((acc, r) => acc + r.faithfulnessScore, 0) / totalEvaluated) 
    : 0;

  const totalHallucinations = results.reduce((acc, r) => acc + (r.hallucinations ? r.hallucinations.length : 0), 0);

  const getAgreementColor = (score) => {
    if (score >= 95) return '#16a34a';
    if (score >= 80) return '#ea580c';
    return '#dc2626';
  };

  const getLabelColor = (label) => {
    if (!label) return 'bg-gray-50 text-gray-500 border-gray-200';
    const l = label.toLowerCase();
    if (l === 'good') return 'bg-green-100 text-green-700 border-green-200';
    if (l === 'hallucinated') return 'bg-red-100 text-red-700 border-red-200';
    if (l === 'irrelevant') return 'bg-orange-100 text-orange-700 border-orange-200';
    if (l === 'refused') return 'bg-gray-100 text-gray-700 border-gray-200';
    return 'bg-gray-50 text-gray-500 border-gray-200';
  };

  const filteredResults = results.filter(r => {
    if (filterMatch !== 'All' && ((filterMatch === 'Match' && !r.isMatch) || (filterMatch === 'Mismatch' && r.isMatch))) return false;
    if (filterLabel !== 'All' && r.judgeLabel.toLowerCase() !== filterLabel.toLowerCase()) return false;
    return true;
  });

  const exportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(results, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "mr_judge_results.json");
    dlAnchorElem.click();
  };

  const exportCSV = () => {
    const header = ["ID", "Query", "Human Label", "Judge Label", "Match", "Faithfulness", "Reason"];
    const rows = results.map(r => [
      r.id, 
      `"${r.query.replace(/"/g, '""')}"`, 
      r.humanLabel, 
      r.judgeLabel, 
      r.isMatch ? 'Yes' : 'No', 
      r.faithfulnessScore, 
      `"${(r.reason || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [header.join(","), ...rows.map(e => e.join(","))].join("\n");
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", encodeURI(csvContent));
    dlAnchorElem.setAttribute("download", "mr_judge_results.csv");
    dlAnchorElem.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
      <div className="glass w-full max-w-7xl rounded-2xl shadow-2xl flex flex-col overflow-hidden h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-indigo-100 flex justify-between items-center bg-white/70">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><Scale size={24} /></div>
            <h2 className="text-xl font-bold text-gray-900">Mr. Judge Evaluation</h2>
          </div>
          <div className="flex gap-3">
            {results.length > 0 && !isEvaluating && (
              <>
                <button onClick={exportCSV} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-white border border-gray-200 hover:bg-gray-50 rounded-lg font-medium text-gray-700 transition-colors">
                  <Download size={16} /> CSV
                </button>
                <button onClick={exportJSON} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-white border border-gray-200 hover:bg-gray-50 rounded-lg font-medium text-gray-700 transition-colors">
                  <Download size={16} /> JSON
                </button>
              </>
            )}
            <button 
              onClick={runEvaluation} 
              disabled={isEvaluating}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              <Play size={16} />
              {isEvaluating ? `Evaluating... ${progress}%` : 'Run Evaluation'}
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 ml-2">
              <X size={20} />
            </button>
          </div>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto bg-gray-50/50">
          
          {/* Stats Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 col-span-2 flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 font-semibold text-sm uppercase">Judge Agreement</h3>
                <div className="flex gap-4 mt-2">
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500">Matches</span>
                    <span className="text-xl font-bold text-green-600">{matches}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500">Mismatches</span>
                    <span className="text-xl font-bold text-red-600">{mismatches}</span>
                  </div>
                </div>
              </div>
              <div className="relative w-20 h-20 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="40" cy="40" r="36" className="stroke-current text-gray-100" strokeWidth="8" fill="transparent" />
                  <circle 
                    cx="40" cy="40" r="36" 
                    className="stroke-current transition-all duration-1000 ease-out" 
                    strokeWidth="8" fill="transparent" 
                    strokeDasharray="226" 
                    strokeDashoffset={226 - (226 * agreement) / 100}
                    strokeLinecap="round"
                    style={{ color: getAgreementColor(agreement) }}
                  />
                </svg>
                <span className="absolute text-xl font-bold" style={{ color: getAgreementColor(agreement) }}>{agreement}%</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
              <span className="text-gray-500 font-semibold text-xs uppercase">Total Questions</span>
              <span className="text-3xl font-bold text-gray-800">{totalEvaluated} / {evaluationData.length}</span>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
              <span className="text-gray-500 font-semibold text-xs uppercase">Avg Faithfulness</span>
              <span className="text-3xl font-bold text-indigo-600">{avgFaithfulness}%</span>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
              <span className="text-gray-500 font-semibold text-xs uppercase">Hallucinations Found</span>
              <span className="text-3xl font-bold text-red-500">{totalHallucinations}</span>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mb-4">
            <select 
              value={filterMatch} onChange={e => setFilterMatch(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-indigo-300"
            >
              <option value="All">All Results (Match/Mismatch)</option>
              <option value="Match">Matches Only</option>
              <option value="Mismatch">Mismatches Only</option>
            </select>
            <select 
              value={filterLabel} onChange={e => setFilterLabel(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-indigo-300"
            >
              <option value="All">All Judge Labels</option>
              <option value="Good">Good</option>
              <option value="Hallucinated">Hallucinated</option>
              <option value="Irrelevant">Irrelevant</option>
              <option value="Refused">Refused</option>
            </select>
          </div>

          {/* Table */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase text-xs font-bold">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Query</th>
                  <th className="px-4 py-3 text-center">Human Label</th>
                  <th className="px-4 py-3 text-center">Judge Label</th>
                  <th className="px-4 py-3 text-center">Result</th>
                  <th className="px-4 py-3 text-center">Faithful</th>
                  <th className="px-4 py-3 text-center">Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                      {isEvaluating ? 'Evaluating... Please wait.' : 'No results to display. Click Run Evaluation.'}
                    </td>
                  </tr>
                ) : (
                  filteredResults.map((r, idx) => (
                    <tr key={idx} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-500">{r.id}</td>
                      <td className="px-4 py-3 text-gray-800 truncate max-w-[200px] xl:max-w-md" title={r.query}>{r.query}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-bold border ${getLabelColor(r.humanLabel)}`}>
                          {r.humanLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-bold border ${getLabelColor(r.judgeLabel)}`}>
                          {r.judgeLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {r.isMatch ? (
                          <span className="inline-flex items-center gap-1 text-green-600 font-bold"><CheckCircle2 size={16}/> Match</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-600 font-bold"><XCircle size={16}/> Mismatch</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center font-bold" style={{ color: getAgreementColor(r.faithfulnessScore) }}>
                        {r.faithfulnessScore}%
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button 
                          onClick={() => setSelectedResult(r)}
                          className="p-1.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded transition-colors"
                        >
                          <Info size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Details Nested Modal */}
      {selectedResult && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/60 p-4">
          <div className="bg-white w-full max-w-5xl rounded-xl shadow-2xl flex flex-col max-h-[85vh]">
            <div className="px-5 py-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
              <h3 className="font-bold text-lg">Details: {selectedResult.id}</h3>
              <button onClick={() => setSelectedResult(null)} className="p-1.5 hover:bg-gray-200 rounded-full">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6 text-sm">
              <div>
                <h4 className="font-bold text-gray-700 uppercase text-xs mb-2">User Question</h4>
                <p className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-gray-800 font-medium text-base">{selectedResult.query}</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-center">
                  <h4 className="font-bold text-gray-500 uppercase text-xs mb-1">Human Label</h4>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-bold border ${getLabelColor(selectedResult.humanLabel)}`}>{selectedResult.humanLabel}</span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-center">
                  <h4 className="font-bold text-gray-500 uppercase text-xs mb-1">Judge Label</h4>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-bold border ${getLabelColor(selectedResult.judgeLabel)}`}>{selectedResult.judgeLabel}</span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-center">
                  <h4 className="font-bold text-gray-500 uppercase text-xs mb-1">Faithfulness</h4>
                  <span className="text-lg font-bold" style={{ color: getAgreementColor(selectedResult.faithfulnessScore) }}>{selectedResult.faithfulnessScore}%</span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-center">
                  <h4 className="font-bold text-gray-500 uppercase text-xs mb-1">Claims</h4>
                  <span className="text-gray-700 font-medium">{selectedResult.supportedClaims} supp / {selectedResult.unsupportedClaims} unsupp</span>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-gray-700 uppercase text-xs mb-2">Judge Reason</h4>
                <p className="bg-indigo-50 text-indigo-900 p-4 rounded-lg border border-indigo-100 leading-relaxed">{selectedResult.reason}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold text-gray-700 uppercase text-xs mb-2">Generated Answer</h4>
                  <p className="bg-gray-50 p-4 rounded-lg border border-gray-100 h-48 overflow-y-auto leading-relaxed">{selectedResult.generatedAnswer}</p>
                </div>
                <div>
                  <h4 className="font-bold text-gray-700 uppercase text-xs mb-2">Retrieved Context</h4>
                  <p className="bg-gray-50 p-4 rounded-lg border border-gray-100 h-48 overflow-y-auto leading-relaxed whitespace-pre-wrap">{selectedResult.context}</p>
                </div>
              </div>
              {selectedResult.hallucinations && selectedResult.hallucinations.length > 0 && (
                <div>
                  <h4 className="font-bold text-red-700 uppercase text-xs mb-2 flex items-center gap-1"><AlertTriangle size={16}/> Hallucinations Detected</h4>
                  <ul className="list-disc list-inside bg-red-50 text-red-800 p-4 rounded-lg border border-red-100 space-y-1">
                    {selectedResult.hallucinations.map((h, i) => <li key={i}>{h}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
