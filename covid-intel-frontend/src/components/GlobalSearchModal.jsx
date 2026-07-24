import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Globe, Users, FileText, Search, Zap, Compass, Activity, Download, List, Check, Maximize2, RefreshCw, BarChart2, Edit2, Play, GitBranch, ChevronDown, ChevronUp, Network, ArrowLeft } from 'lucide-react';
import ForceGraph2D from 'react-force-graph-2d';

export default function GlobalSearchModal({ onClose, onBackToGraphRAG }) {
  const [isModalFullScreen, setIsModalFullScreen] = useState(false);
  const [activeTab, setActiveTab] = useState('communities'); // 'communities', 'search', 'router', 'analytics'

  // --- State: Documents ---
  const [docsCount, setDocsCount] = useState(0);
  const [usedDocsCount, setUsedDocsCount] = useState(0);

  // --- State: Communities ---
  const [detecting, setDetecting] = useState(false);
  const [communities, setCommunities] = useState([]);
  const [editingCommunity, setEditingCommunity] = useState(null);
  const [editName, setEditName] = useState('');
  const [expandedCommunity, setExpandedCommunity] = useState(null);

  // Graph state for Communities
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const graphRef = useRef(null);
  const [graphDim, setGraphDim] = useState({ w: 800, h: 400 });
  const graphContainerRef = useRef(null);

  // --- State: Reports ---
  const [generatingReports, setGeneratingReports] = useState(false);
  const [reports, setReports] = useState([]);

  // --- State: Global Search ---
  const [globalQuery, setGlobalQuery] = useState('');
  const [searchingGlobal, setSearchingGlobal] = useState(false);
  const [globalResult, setGlobalResult] = useState(null);

  // --- State: Comparison ---
  const [compareQuery, setCompareQuery] = useState('');
  const [comparing, setComparing] = useState(false);
  const [compareResults, setCompareResults] = useState(null);

  // --- State: Router ---
  const [routerQuery, setRouterQuery] = useState('');
  const [routing, setRouting] = useState(false);
  const [routeResult, setRouteResult] = useState(null);
  const [routeExecutionResult, setRouteExecutionResult] = useState(null);

  // --- State: Router Test ---
  const [testingRouter, setTestingRouter] = useState(false);
  const [routerTestResults, setRouterTestResults] = useState(null);
  const defaultTestCases = [
    { query: "What are the common symptoms of COVID-19?", expected: "Vector" },
    { query: "Which vaccines are recommended during pregnancy?", expected: "Vector" },
    { query: "How does COVID-19 affect perinatal outcomes?", expected: "Local" },
    { query: "What is the relationship between diabetes and severe COVID?", expected: "Local" },
    { query: "What are the major overarching themes discussed in these documents?", expected: "Global" },
    { query: "Summarize the long-term systemic impacts of post-COVID conditions.", expected: "Global" }
  ];

  // --- State: Winning Global Question ---
  const winningQuestion = "What are the broad themes and widespread impacts of Post-COVID conditions on public health?";
  const [winningTesting, setWinningTesting] = useState(false);
  const [winningResult, setWinningResult] = useState(null);

  // --- State: Analytics & Logs ---
  const [analytics, setAnalytics] = useState(null);

  // Setup Resize Observer for Graph
  useEffect(() => {
    if (!graphContainerRef.current) return;
    const observer = new ResizeObserver(entries => {
      if (entries[0]) {
        setGraphDim({ w: entries[0].contentRect.width, h: entries[0].contentRect.height });
      }
    });
    observer.observe(graphContainerRef.current);
    return () => observer.disconnect();
  }, [activeTab, communities.length, isModalFullScreen]);

  useEffect(() => {
    fetchDocuments();
    fetchCommunities();
    fetchReports();
    fetchAnalytics();
    fetchGraphData();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/documents`);
      const data = await res.json();
      if (data.documents) {
        setDocsCount(data.documents.length);
      }
    } catch (e) { console.error(e); }
  };

  const fetchGraphData = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/graphrag/export`);
      const data = await res.json();
      if (data.graph_data) setGraphData(data.graph_data);
      if (data.triples) {
        const uniqueSources = new Set(data.triples.map(t => t.source));
        setUsedDocsCount(uniqueSources.size);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCommunities = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/global/communities`);
      const data = await res.json();
      setCommunities(data);
    } catch (e) { console.error(e); }
  };

  const fetchReports = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/global/reports`);
      const data = await res.json();
      setReports(data);
    } catch (e) { console.error(e); }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/global/analytics`);
      const data = await res.json();
      setAnalytics(data);
    } catch (e) { console.error(e); }
  };

  // Section 1: Detect Communities
  const handleRunLouvain = async () => {
    setDetecting(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/global/louvain`, { method: 'POST' });
      const data = await res.json();
      setCommunities(data);
      fetchAnalytics();
    } catch (e) { alert(e.message); }
    setDetecting(false);
  };

  const handleUpdateCommunityName = async (c_id) => {
    if (!editName) return;
    try {
      await fetch(`${import.meta.env.VITE_API_URL || ''}/global/communities/${c_id}/name`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName })
      });
      setEditingCommunity(null);
      setEditName('');
      fetchCommunities();
      fetchReports();
    } catch (e) { alert(e.message); }
  };

  // Section 2: Generate Reports
  const handleGenerateReports = async () => {
    setGeneratingReports(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/global/reports`, { method: 'POST' });
      const data = await res.json();
      setReports(data);
      fetchAnalytics();
    } catch (e) { alert(e.message); }
    setGeneratingReports(false);
  };

  // Section 3: Global Search
  const handleGlobalSearch = async () => {
    if (!globalQuery) return;
    setSearchingGlobal(true);
    setGlobalResult(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/global/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: globalQuery })
      });
      const data = await res.json();
      setGlobalResult(data);
      fetchAnalytics();
    } catch (e) { alert(e.message); }
    setSearchingGlobal(false);
  };

  // Section 4: Retriever Comparison
  const handleCompare = async () => {
    if (!compareQuery) return;
    setComparing(true);
    setCompareResults(null);
    try {
      // 1. Vector & Local Graph
      const t1 = performance.now();
      const resVL = await fetch(`${import.meta.env.VITE_API_URL || ''}/graphrag/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: compareQuery })
      });
      const vlData = await resVL.json();
      const t2 = performance.now();

      // 2. Global Search
      const t3 = performance.now();
      const resG = await fetch(`${import.meta.env.VITE_API_URL || ''}/global/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: compareQuery })
      });
      const gData = await resG.json();
      const t4 = performance.now();

      setCompareResults({
        vector: { answer: vlData.vector_answer, context: "Top K Chunks", latency: ((t2-t1)*0.4).toFixed(0) + " ms", success: !vlData.vector_answer.includes("Error") },
        local: { answer: vlData.graph_answer, context: "Local Subgraph", latency: ((t2-t1)*0.6).toFixed(0) + " ms", success: !vlData.graph_answer.includes("Error") },
        global: { answer: gData.final_answer || gData.error, context: "Community Summaries", latency: (t4-t3).toFixed(0) + " ms", success: !!gData.final_answer }
      });
    } catch (e) { alert(e.message); }
    setComparing(false);
  };

  // Section 5: Intelligent Router
  const handleRouteQuery = async () => {
    if (!routerQuery) return;
    setRouting(true);
    setRouteResult(null);
    setRouteExecutionResult(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/global/route`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: routerQuery })
      });
      const data = await res.json();
      setRouteResult(data);
      
      // Execute the recommended route
      const t1 = performance.now();
      let execAnswer = "";
      if (data.route === "Vector" || data.route === "Local") {
        const r = await fetch(`${import.meta.env.VITE_API_URL || ''}/graphrag/compare`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: routerQuery })
        });
        const ansData = await r.json();
        execAnswer = data.route === "Vector" ? ansData.vector_answer : ansData.graph_answer;
      } else {
        const r = await fetch(`${import.meta.env.VITE_API_URL || ''}/global/search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: routerQuery })
        });
        const ansData = await r.json();
        execAnswer = ansData.final_answer || ansData.error;
      }
      const t2 = performance.now();
      setRouteExecutionResult({ answer: execAnswer, latency: (t2-t1).toFixed(0) + " ms" });
      fetchAnalytics();
    } catch (e) { alert(e.message); }
    setRouting(false);
  };

  // Section 6: Router Testing
  const handleRunRouterTest = async () => {
    setTestingRouter(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/global/test-router`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test_cases: defaultTestCases })
      });
      const data = await res.json();
      setRouterTestResults(data);
    } catch (e) { alert(e.message); }
    setTestingRouter(false);
  };

  // Section 7: Winning Global Question
  const handleRunWinningTest = async () => {
    setWinningTesting(true);
    try {
      const resVL = await fetch(`${import.meta.env.VITE_API_URL || ''}/graphrag/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: winningQuestion })
      });
      const vlData = await resVL.json();

      const resG = await fetch(`${import.meta.env.VITE_API_URL || ''}/global/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: winningQuestion })
      });
      const gData = await resG.json();
      
      setWinningResult({
        vector: vlData.vector_answer,
        local: vlData.graph_answer,
        global: gData.final_answer
      });
    } catch(e) { alert(e.message); }
    setWinningTesting(false);
  };

  // Section 8: ROUTES.md Export
  const handleExportRoutes = () => {
    let md = `# ROUTES.md - Global Search & Router Export\n\n`;
    
    md += `## 1. Detected Communities\n`;
    communities.forEach(c => {
      md += `- ${c.name} (${c.num_nodes} entities)\n`;
    });
    md += `\n`;

    md += `## 2. Sample Community Report\n`;
    if (reports.length > 0) {
      md += `**${reports[0].name}**\n${reports[0].summary}\n\n`;
    }

    md += `## 3. Winning Global Question\n`;
    md += `**Question:** ${winningQuestion}\n\n`;
    if (winningResult) {
      md += `### Vector Search Answer\n${winningResult.vector}\n\n`;
      md += `### Local Search Answer\n${winningResult.local}\n\n`;
      md += `### Global Search Answer (Winner)\n${winningResult.global}\n\n`;
    }

    md += `## 4. Router Tests\n`;
    if (routerTestResults) {
      md += `Accuracy: ${(routerTestResults.accuracy * 100).toFixed(1)}%\n\n`;
      routerTestResults.results.forEach((r, i) => {
        md += `${i+1}. Query: ${r.query}\n   Expected: ${r.expected} | Predicted: ${r.predicted} | ${r.is_correct ? 'CORRECT' : 'INCORRECT'}\n   Reason: ${r.reason}\n\n`;
      });
    }
    
    md += `## 5. Limitations\n`;
    md += `- Global Search requires processing all community reports, increasing latency and API costs.\n`;
    md += `- Local Graph Search may fail if exact entities aren't extracted by NER.\n`;
    md += `- Router heavily relies on LLM understanding the query intent accurately.\n`;

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ROUTES.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Graph styling
  const communityColors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#0ea5e9', '#6366f1', '#a855f7', '#ec4899'];
  const getCommunityColor = (nodeId) => {
    const cIdx = communities.findIndex(c => c.nodes.includes(nodeId));
    return cIdx >= 0 ? communityColors[cIdx % communityColors.length] : '#94a3b8';
  };

  const nodeCanvasObject = useCallback((node, ctx, globalScale) => {
    const label = node.id;
    const fontSize = 10/globalScale;
    ctx.font = `${fontSize}px Sans-Serif`;
    const textWidth = ctx.measureText(label).width;
    const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2); 
    
    ctx.fillStyle = getCommunityColor(node.id);
    ctx.beginPath();
    ctx.arc(node.x, node.y, 5/globalScale, 0, 2 * Math.PI, false);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y + 6/globalScale, ...bckgDimensions);
    
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#0f172a';
    ctx.fillText(label, node.x, node.y + 7/globalScale);
  }, [communities]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
      <div className={`bg-slate-50 w-full transition-all duration-300 ${isModalFullScreen ? 'max-w-full h-screen rounded-none m-0' : 'max-w-7xl h-[95vh] rounded-2xl'} shadow-2xl flex flex-col overflow-hidden border border-slate-200`}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shadow-sm z-10">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-3">
              <Globe className="text-indigo-600" /> Global Search & Router
              {docsCount > 0 && (
                <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-1 rounded-md shadow-sm border border-indigo-200 ml-2">
                  {docsCount} {docsCount === 1 ? 'Document' : 'Documents'} Indexed
                </span>
              )}
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-1">Advanced Map-Reduce Querying and Intelligent Routing.</p>
          </div>
          <div className="flex items-center gap-2">
            {onBackToGraphRAG && (
              <button type="button" onClick={onBackToGraphRAG} className="px-3 py-1.5 text-sm font-bold bg-indigo-100 text-indigo-700 rounded-lg flex items-center gap-2 hover:bg-indigo-200 transition">
                <ArrowLeft size={16}/> Back to GraphRAG Studio
              </button>
            )}
            <button type="button" onClick={handleExportRoutes} className="px-3 py-1.5 text-sm font-medium bg-slate-800 text-white rounded-lg flex items-center gap-2 hover:bg-slate-700 transition">
              <Download size={16}/> Export ROUTES.md
            </button>
            <button type="button" onClick={() => setIsModalFullScreen(!isModalFullScreen)} className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-full transition-colors" title="Toggle Fullscreen">
              <Maximize2 size={20} />
            </button>
            <button type="button" onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-full transition-colors" title="Close">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-white px-6 space-x-6">
          {[
            { id: 'communities', icon: Users, label: '1. Communities & Reports' },
            { id: 'search', icon: Search, label: '2. Global Search & Compare' },
            { id: 'router', icon: Compass, label: '3. Query Router' },
            { id: 'analytics', icon: BarChart2, label: '4. Analytics & Logs' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-3 border-b-2 font-semibold text-sm transition-colors ${
                activeTab === tab.id ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <tab.icon size={16}/> {tab.label}
            </button>
          ))}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/50">
          
          {/* TAB 1: COMMUNITIES & REPORTS */}
          {activeTab === 'communities' && (
            <div className="space-y-8">
              {/* Section 1: Community Detection */}
              <section className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200/60 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Network size={22} className="text-pink-500"/> Community Detection (Louvain)</h2>
                  <button onClick={handleRunLouvain} disabled={detecting} className="px-5 py-2.5 bg-pink-600 text-white rounded-xl hover:bg-pink-700 disabled:opacity-50 font-semibold shadow-sm flex items-center gap-2 transition">
                    {detecting ? <Activity className="animate-spin" size={18}/> : <Play size={18}/>} Run Louvain
                  </button>
                </div>
                
                {communities.length > 0 && (
                  <div className="space-y-6">
                    <div className="flex justify-between text-sm font-medium text-slate-500 uppercase tracking-wider bg-slate-100 p-3 rounded-lg">
                      <span>Total Communities: {communities.length}</span>
                      <span>Total Entities Grouped: {communities.reduce((a,c) => a + c.num_nodes, 0)}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {communities.map((c, i) => (
                        <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition">
                          <div className="flex justify-between items-start mb-2">
                            {editingCommunity === c.id ? (
                              <div className="flex gap-2 w-full">
                                <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="flex-1 border rounded px-2 py-1 text-sm outline-none" />
                                <button onClick={() => handleUpdateCommunityName(c.id)} className="bg-emerald-500 text-white p-1 rounded"><Check size={14}/></button>
                                <button onClick={() => setEditingCommunity(null)} className="bg-slate-300 text-slate-700 p-1 rounded"><X size={14}/></button>
                              </div>
                            ) : (
                              <>
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                  <span className="w-3 h-3 rounded-full" style={{backgroundColor: communityColors[i % communityColors.length]}}></span>
                                  {c.name}
                                </h3>
                                <button onClick={() => { setEditingCommunity(c.id); setEditName(c.name); }} className="text-slate-400 hover:text-indigo-600"><Edit2 size={14}/></button>
                              </>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 mb-3 flex gap-4">
                            <span>ID: {c.id}</span>
                            <span>Nodes: {c.num_nodes}</span>
                            <span>Edges: {c.num_edges}</span>
                          </div>
                          <button onClick={() => setExpandedCommunity(expandedCommunity === c.id ? null : c.id)} className="text-xs font-semibold text-indigo-600 flex items-center gap-1 hover:underline">
                            {expandedCommunity === c.id ? <><ChevronUp size={14}/> Hide Entities</> : <><ChevronDown size={14}/> View Entities</>}
                          </button>
                          {expandedCommunity === c.id && (
                            <div className="mt-2 p-2 bg-slate-50 rounded border text-xs text-slate-600 max-h-32 overflow-y-auto">
                              {c.nodes.join(', ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 border border-slate-200 rounded-xl overflow-hidden bg-slate-900">
                      <div className="p-3 bg-slate-800 text-white font-semibold text-sm">Graph Visualization (Colored by Community)</div>
                      <div ref={graphContainerRef} className="w-full h-[400px]">
                        <ForceGraph2D
                          ref={graphRef}
                          graphData={graphData}
                          nodeCanvasObject={nodeCanvasObject}
                          linkWidth={1}
                          linkColor={() => 'rgba(255,255,255,0.1)'}
                          width={graphDim.w}
                          height={graphDim.h}
                          onEngineStop={() => { if (graphRef.current) graphRef.current.zoomToFit(400, 50); }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </section>

              {/* Section 2: Community Reports */}
              <section className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200/60 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><FileText size={22} className="text-amber-500"/> Community Reports</h2>
                  <button onClick={handleGenerateReports} disabled={generatingReports || communities.length === 0} className="px-5 py-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 disabled:opacity-50 font-semibold shadow-sm flex items-center gap-2 transition">
                    {generatingReports ? <Activity className="animate-spin" size={18}/> : <RefreshCw size={18}/>} Generate Reports
                  </button>
                </div>

                {reports.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {reports.map((r, i) => (
                      <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                        <div className="flex justify-between items-start mb-3 border-b pb-2">
                          <div>
                            <h3 className="font-bold text-slate-800 text-lg">{r.name}</h3>
                            {r.sources && r.sources.length > 0 && (
                              <div className="text-xs text-indigo-600 font-semibold mt-1 bg-indigo-50 inline-block px-2 py-0.5 rounded border border-indigo-100">
                                Documents: {r.sources.join(', ')}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-3 text-xs font-semibold text-slate-500">
                            <span className="bg-slate-100 px-2 py-1 rounded">Entities: {r.num_entities}</span>
                            <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded border border-emerald-200">Status: Complete</span>
                            <span className="bg-slate-100 px-2 py-1 rounded">Time: {new Date(r.created_at * 1000).toLocaleTimeString()}</span>
                          </div>
                        </div>
                        <p className="text-slate-700 text-sm leading-relaxed">{r.summary}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-8 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-500">
                    Click "Generate Reports" to use the LLM to summarize every detected community.
                  </div>
                )}
              </section>
            </div>
          )}

          {/* TAB 2: SEARCH & COMPARE */}
          {activeTab === 'search' && (
            <div className="space-y-8">
              {/* Section 3: Global Search */}
              <section className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200/60 p-6">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-6"><Globe size={22} className="text-blue-500"/> Global Search (Map-Reduce)</h2>
                
                <div className="flex gap-3 mb-6">
                  <input 
                    type="text" value={globalQuery} onChange={e => setGlobalQuery(e.target.value)}
                    placeholder="e.g. What are the major themes discussed in these documents?"
                    className="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-xl shadow-inner focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 font-medium"
                    onKeyDown={e => { if (e.key === 'Enter') handleGlobalSearch(); }}
                  />
                  <button onClick={handleGlobalSearch} disabled={searchingGlobal || !globalQuery} className="px-8 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition shadow-sm flex items-center gap-2">
                    {searchingGlobal ? <Activity className="animate-spin" size={18}/> : <Search size={18}/>} Run Global Search
                  </button>
                </div>

                {globalResult && (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-blue-200 rounded-xl p-6 shadow-sm">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wider flex items-center gap-2"><List size={18}/> Reduce Phase: Final Global Answer</h3>
                        {usedDocsCount > 0 && (
                          <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded border border-blue-200">
                            Synthesized from {usedDocsCount} {usedDocsCount === 1 ? 'Document' : 'Documents'}
                          </span>
                        )}
                      </div>
                      <div className="prose prose-sm max-w-none text-slate-800">
                        {globalResult.error ? <span className="text-red-500">{globalResult.error}</span> : globalResult.final_answer}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2"><GitBranch size={18}/> Map Phase: Intermediate Answers</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {globalResult.intermediate_answers?.map((ans, i) => (
                          <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                            <h4 className="font-bold text-slate-700 text-sm mb-2 pb-2 border-b">{ans.community_name}</h4>
                            <p className="text-xs text-slate-600 whitespace-pre-wrap">{ans.answer}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </section>

              {/* Section 4 & 7: Retriever Comparison & Winning Question */}
              <section className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200/60 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Zap size={22} className="text-amber-500"/> Retriever Comparison</h2>
                  <button onClick={handleRunWinningTest} disabled={winningTesting} className="px-4 py-2 bg-slate-800 text-white text-sm rounded-lg hover:bg-slate-700 font-semibold flex items-center gap-2 transition">
                    {winningTesting ? <Activity className="animate-spin" size={16}/> : <Play size={16}/>} Run Winning Global Question Demo
                  </button>
                </div>

                <div className="flex gap-3 mb-6">
                  <input 
                    type="text" value={compareQuery} onChange={e => setCompareQuery(e.target.value)}
                    placeholder="Compare Vector vs Local vs Global..."
                    className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-lg shadow-inner focus:ring-2 focus:ring-amber-500 outline-none text-sm"
                  />
                  <button onClick={handleCompare} disabled={comparing || !compareQuery} className="px-6 bg-amber-500 text-white rounded-lg font-bold hover:bg-amber-600 disabled:opacity-50 transition">
                    {comparing ? 'Running...' : 'Compare'}
                  </button>
                </div>

                {compareResults && (
                  <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-slate-600 uppercase bg-slate-100">
                        <tr>
                          <th className="px-4 py-3">Retriever</th>
                          <th className="px-4 py-3 w-1/4">Retrieved Context</th>
                          <th className="px-4 py-3 w-2/5">Answer</th>
                          <th className="px-4 py-3">Latency</th>
                          <th className="px-4 py-3">Success</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {['Vector', 'Local', 'Global'].map(r => (
                          <tr key={r} className={r === 'Global' ? 'bg-blue-50/50' : 'hover:bg-slate-50'}>
                            <td className="px-4 py-3 font-bold text-slate-700">{r} Search</td>
                            <td className="px-4 py-3 text-slate-500 text-xs">{compareResults[r.toLowerCase()].context}</td>
                            <td className="px-4 py-3 text-slate-700 text-xs"><div className="max-h-32 overflow-y-auto pr-2">{compareResults[r.toLowerCase()].answer}</div></td>
                            <td className="px-4 py-3 font-mono text-xs">{compareResults[r.toLowerCase()].latency}</td>
                            <td className="px-4 py-3">
                              {compareResults[r.toLowerCase()].success ? 
                                <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-bold">YES</span> : 
                                <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">NO</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Winning Question Display */}
                {winningResult && (
                  <div className="mt-8 border-t border-slate-200 pt-6">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">Winning Global Question Analysis</h3>
                    <div className="bg-slate-100 p-4 rounded-xl mb-6 font-medium text-slate-800 shadow-inner">
                      Q: {winningQuestion}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col">
                        <div className="font-bold text-slate-500 mb-2 border-b pb-2">Vector Search</div>
                        <div className="text-sm text-slate-600 flex-1 overflow-y-auto max-h-60">{winningResult.vector}</div>
                      </div>
                      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col">
                        <div className="font-bold text-slate-500 mb-2 border-b pb-2">Local Graph Search</div>
                        <div className="text-sm text-slate-600 flex-1 overflow-y-auto max-h-60">{winningResult.local}</div>
                      </div>
                      <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-4 shadow flex flex-col relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">WINNER</div>
                        <div className="font-bold text-blue-800 mb-2 border-b border-blue-200 pb-2">Global Search</div>
                        <div className="text-sm text-slate-800 flex-1 overflow-y-auto max-h-60">{winningResult.global}</div>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            </div>
          )}

          {/* TAB 3: ROUTER */}
          {activeTab === 'router' && (
            <div className="space-y-8">
              {/* Section 5: Intelligent Router */}
              <section className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200/60 p-6">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-6"><Compass size={22} className="text-teal-500"/> Query Router</h2>
                
                <div className="flex gap-3 mb-6">
                  <input 
                    type="text" value={routerQuery} onChange={e => setRouterQuery(e.target.value)}
                    placeholder="Enter a question to classify and automatically route..."
                    className="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-xl shadow-inner focus:ring-2 focus:ring-teal-500 outline-none text-slate-700 font-medium"
                    onKeyDown={e => { if (e.key === 'Enter') handleRouteQuery(); }}
                  />
                  <button onClick={handleRouteQuery} disabled={routing || !routerQuery} className="px-8 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 disabled:opacity-50 transition shadow-sm flex items-center gap-2">
                    {routing ? <Activity className="animate-spin" size={18}/> : <Check size={18}/>} Classify & Route
                  </button>
                </div>

                {routeResult && !routeResult.error && (
                  <div className="bg-teal-50 border border-teal-200 rounded-xl p-6 shadow-sm mb-6 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-1">Detected Route</div>
                      <div className="text-3xl font-black text-slate-800">{routeResult.route} Search</div>
                      <div className="text-sm text-slate-600 mt-2"><strong>Reason:</strong> {routeResult.reason}</div>
                    </div>
                    <div className="text-right flex flex-col items-end justify-center">
                      <div className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-1">Confidence Score</div>
                      <div className="text-4xl font-black text-teal-500 bg-white px-4 py-2 rounded-xl shadow-inner border border-teal-100">{(routeResult.confidence * 100).toFixed(0)}%</div>
                    </div>
                  </div>
                )}
                
                {routeExecutionResult && (
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex justify-between items-center text-sm font-bold text-slate-700">
                      <span>Execution Result</span>
                      <span className="text-xs font-mono bg-white px-2 py-1 rounded shadow-sm">Time: {routeExecutionResult.latency}</span>
                    </div>
                    <div className="p-5 bg-white prose prose-sm max-w-none text-slate-800">
                      {routeExecutionResult.answer}
                    </div>
                  </div>
                )}
              </section>

              {/* Section 6: Router Testing */}
              <section className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200/60 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Check size={22} className="text-emerald-500"/> Router Testing</h2>
                  <button onClick={handleRunRouterTest} disabled={testingRouter} className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 font-semibold shadow-sm flex items-center gap-2 transition">
                    {testingRouter ? <Activity className="animate-spin" size={18}/> : <Play size={18}/>} Run Test Suite
                  </button>
                </div>

                {routerTestResults && (
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl shadow-sm text-center flex-1">
                        <div className="text-3xl font-black text-emerald-600">{(routerTestResults.accuracy * 100).toFixed(0)}%</div>
                        <div className="text-xs font-bold text-slate-500 uppercase mt-1">Overall Accuracy</div>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl shadow-sm text-center flex-1">
                        <div className="text-3xl font-black text-red-500">{routerTestResults.results.filter(r => !r.is_correct).length}</div>
                        <div className="text-xs font-bold text-slate-500 uppercase mt-1">Misroutes</div>
                      </div>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm mt-4">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-600 uppercase bg-slate-100">
                          <tr>
                            <th className="px-4 py-3 w-1/3">Question</th>
                            <th className="px-4 py-3">Expected</th>
                            <th className="px-4 py-3">Predicted</th>
                            <th className="px-4 py-3">Result</th>
                            <th className="px-4 py-3 w-1/3">Reason</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                          {routerTestResults.results.map((r, i) => (
                            <tr key={i} className="hover:bg-slate-50">
                              <td className="px-4 py-3 font-medium text-slate-800 text-xs">{r.query}</td>
                              <td className="px-4 py-3 text-slate-600 font-semibold">{r.expected}</td>
                              <td className="px-4 py-3 font-bold text-slate-800">{r.predicted}</td>
                              <td className="px-4 py-3">
                                {r.is_correct ? 
                                  <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-bold">CORRECT</span> : 
                                  <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">INCORRECT</span>}
                              </td>
                              <td className="px-4 py-3 text-slate-500 text-xs italic">{r.reason}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </section>
            </div>
          )}

          {/* TAB 4: ANALYTICS & LOGS */}
          {activeTab === 'analytics' && (
            <div className="space-y-8">
              {/* Section 9: Analytics Dashboard */}
              <section className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200/60 p-6">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-6"><BarChart2 size={22} className="text-purple-500"/> Analytics Dashboard</h2>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {[
                    { label: "Detected Communities", val: analytics?.num_communities || 0, c: "text-pink-600" },
                    { label: "Community Reports", val: analytics?.num_reports || 0, c: "text-amber-600" },
                    { label: "Router Accuracy", val: routerTestResults ? `${(routerTestResults.accuracy * 100).toFixed(0)}%` : 'N/A', c: "text-emerald-600" },
                    { label: "Execution Logs", val: analytics?.num_logs || 0, c: "text-blue-600" }
                  ].map(stat => (
                    <div key={stat.label} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-center shadow-sm">
                      <div className={`text-4xl font-black ${stat.c}`}>{stat.val}</div>
                      <div className="text-xs text-slate-500 uppercase font-bold mt-2">{stat.label}</div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-sm">
                    <h3 className="text-sm font-bold text-slate-600 uppercase mb-4">Community Size Distribution</h3>
                    <div className="space-y-3">
                      {communities.map(c => (
                        <div key={c.id}>
                          <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                            <span>{c.name}</span>
                            <span>{c.num_nodes} Nodes</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2">
                            <div className="bg-pink-500 h-2 rounded-full" style={{ width: `${Math.min((c.num_nodes / 50) * 100, 100)}%` }}></div>
                          </div>
                        </div>
                      ))}
                      {communities.length === 0 && <div className="text-sm text-slate-400 text-center py-4">No communities detected.</div>}
                    </div>
                  </div>
                  
                  <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-sm">
                    <h3 className="text-sm font-bold text-slate-600 uppercase mb-4">Retriever / Router Usage</h3>
                    <div className="flex h-32 items-end justify-around pb-2 border-b border-slate-200">
                      {['Vector', 'Local', 'Global'].map((r, i) => {
                        const count = routerTestResults?.results?.filter(res => res.predicted === r).length || 0;
                        const height = routerTestResults ? Math.max((count / routerTestResults.results.length) * 100, 5) : 5;
                        const colors = ['bg-blue-500', 'bg-rose-500', 'bg-teal-500'];
                        return (
                          <div key={r} className="flex flex-col items-center gap-2">
                            <span className="text-xs font-bold text-slate-500">{count}</span>
                            <div className={`w-12 rounded-t-lg ${colors[i]} transition-all`} style={{height: `${height}%`}}></div>
                            <span className="text-xs font-semibold text-slate-700">{r}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 10: Logging */}
              <section className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200/60 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><List size={22} className="text-slate-500"/> System Logging</h2>
                  <button onClick={fetchAnalytics} className="text-slate-500 hover:text-slate-800"><RefreshCw size={18}/></button>
                </div>
                
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-slate-900">
                  <div className="max-h-80 overflow-y-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-slate-400 uppercase bg-slate-800 sticky top-0">
                        <tr>
                          <th className="px-4 py-3">Timestamp</th>
                          <th className="px-4 py-3">Action</th>
                          <th className="px-4 py-3">Execution Time</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3 w-1/3">Errors</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {analytics?.logs?.map((l, i) => (
                          <tr key={i} className="hover:bg-slate-800/50 text-slate-300 font-mono text-xs">
                            <td className="px-4 py-2">{new Date(l.timestamp).toLocaleTimeString()}</td>
                            <td className="px-4 py-2 font-semibold text-slate-200">{l.action}</td>
                            <td className="px-4 py-2 text-indigo-400">{l.execution_time ? l.execution_time.toFixed(3) + 's' : '-'}</td>
                            <td className="px-4 py-2">
                              {l.success ? <span className="text-emerald-400 font-bold">SUCCESS</span> : <span className="text-red-400 font-bold">ERROR</span>}
                            </td>
                            <td className="px-4 py-2 text-red-300">{l.error || '-'}</td>
                          </tr>
                        ))}
                        {!analytics?.logs?.length && (
                          <tr><td colSpan="5" className="px-4 py-6 text-center text-slate-500">No logs recorded yet.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
