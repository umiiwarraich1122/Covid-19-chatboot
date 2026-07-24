import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Network, Share2, Layers, Cpu, Search, Activity, Download, Check, AlertCircle, FileText, Zap, ChevronRight, Maximize2, Database, RefreshCw, Globe } from 'lucide-react';
import ForceGraph2D from 'react-force-graph-2d';

export default function GraphRAGModal({ onClose, onOpenGlobalSearch }) {
  const [isModalFullScreen, setIsModalFullScreen] = useState(false);
  const [isGraphFullScreen, setIsGraphFullScreen] = useState(false);
  const [isSubgraphFullScreen, setIsSubgraphFullScreen] = useState(false);

  // State for Document Selection
  const [documents, setDocuments] = useState([]);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [docLoading, setDocLoading] = useState(true);

  // State for Extraction
  const [extracting, setExtracting] = useState(false);
  const [triples, setTriples] = useState([]);

  // State for Resolution
  const [resolving, setResolving] = useState(false);
  const [canonicalMappings, setCanonicalMappings] = useState({});

  // State for Graph Build
  const [building, setBuilding] = useState(false);
  const [graphStats, setGraphStats] = useState(null);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });

  // State for Traversal & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [traversing, setTraversing] = useState(false);
  const [subgraph, setSubgraph] = useState(null);
  
  // State for Answer
  const [answering, setAnswering] = useState(false);
  const [graphAnswer, setGraphAnswer] = useState('');

  // State for Comparison
  const [comparing, setComparing] = useState(false);
  const [compareResult, setCompareResult] = useState(null);

  const graphRef = useRef(null);
  const subgraphRef = useRef(null);
  const graphContainerRef = useRef(null);
  const subgraphContainerRef = useRef(null);
  const [graphDim, setGraphDim] = useState({ w: 1000, h: 500 });
  const [subgraphDim, setSubgraphDim] = useState({ w: 600, h: 400 });

  useEffect(() => {
    if (!graphContainerRef.current) return;
    const observer = new ResizeObserver(entries => {
      if (entries[0]) {
        setGraphDim({ w: entries[0].contentRect.width, h: entries[0].contentRect.height });
      }
    });
    observer.observe(graphContainerRef.current);
    return () => observer.disconnect();
  }, [isGraphFullScreen, graphData.nodes.length]);

  useEffect(() => {
    if (!subgraphContainerRef.current) return;
    const observer = new ResizeObserver(entries => {
      if (entries[0]) {
        setSubgraphDim({ w: entries[0].contentRect.width, h: entries[0].contentRect.height });
      }
    });
    observer.observe(subgraphContainerRef.current);
    return () => observer.disconnect();
  }, [isSubgraphFullScreen, subgraph]);

  const [debugLogs, setDebugLogs] = useState([]);
  const addLog = (msg) => setDebugLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  // Initial Fetch
  useEffect(() => {
    fetchDocuments();
    fetchGraphStatus();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/documents`);
      const data = await res.json();
      setDocuments(data.documents || []);
      setDocLoading(false);
    } catch (e) {
      console.error(e);
      setDocLoading(false);
    }
  };

  const fetchGraphStatus = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/graphrag/export`);
      const data = await res.json();
      if (data.triples) setTriples(data.triples);
      if (data.canonical_entities) setCanonicalMappings(data.canonical_entities);
      if (data.graph_data && data.graph_data.nodes.length > 0) {
        setGraphData(data.graph_data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Section 1 & 2: Extract Triples
  const handleExtract = async () => {
    if (selectedDocs.length === 0) return alert("Select at least one document");
    setExtracting(true);
    addLog(`Extracting triples for: ${selectedDocs.join(', ')}`);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/graphrag/extract`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documents: selectedDocs })
      });
      const data = await res.json();
      setTriples(data.triples);
      addLog(`Extracted ${data.triples.length} triples.`);
    } catch (e) {
      addLog(`Extraction error: ${e.message}`);
    }
    setExtracting(false);
  };

  const handleReset = async () => {
    if (!window.confirm("Are you sure you want to reset the entire GraphRAG pipeline state?")) return;
    try {
      await fetch(`${import.meta.env.VITE_API_URL || ''}/graphrag/reset`, { method: 'POST' });
      setTriples([]);
      setCanonicalMappings({});
      setGraphData({ nodes: [], links: [] });
      setGraphStats(null);
      setSubgraph(null);
      setGraphAnswer('');
      setCompareResult(null);
      addLog("GraphRAG pipeline reset.");
    } catch (e) {
      addLog(`Reset error: ${e.message}`);
    }
  };

  // Section 3: Entity Resolution
  const handleResolve = async () => {
    setResolving(true);
    addLog(`Resolving entities...`);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/graphrag/resolve`, { method: 'POST' });
      const data = await res.json();
      setCanonicalMappings(data.mappings);
      addLog(`Resolved entities. Canonical mappings: ${Object.keys(data.mappings).length}`);
    } catch (e) {
      addLog(`Resolution error: ${e.message}`);
    }
    setResolving(false);
  };

  // Section 4 & 5: Build Graph
  const handleBuildGraph = async () => {
    setBuilding(true);
    addLog(`Building NetworkX Graph...`);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/graphrag/build`, { method: 'POST' });
      const data = await res.json();
      setGraphStats(data);
      setGraphData({ nodes: data.nodes, links: data.links });
      addLog(`Built graph: ${data.num_nodes} nodes, ${data.num_edges} edges.`);
    } catch (e) {
      addLog(`Build graph error: ${e.message}`);
    }
    setBuilding(false);
  };

  // Section 6: Traversal
  const handleTraverse = async (queryToUse = searchQuery) => {
    if (!queryToUse) return;
    setTraversing(true);
    addLog(`Traversing graph for query: "${queryToUse}"`);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/graphrag/traverse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryToUse })
      });
      const data = await res.json();
      setSubgraph(data);
      addLog(`Traversal complete. Found ${data.nodes.length} relevant nodes.`);
    } catch (e) {
      addLog(`Traversal error: ${e.message}`);
    }
    setTraversing(false);
  };

  // Section 8: Answer
  const handleAnswer = async () => {
    if (!subgraph) return;
    setAnswering(true);
    addLog(`Generating GraphRAG Answer...`);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/graphrag/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, path_text: subgraph.path_text })
      });
      const data = await res.json();
      setGraphAnswer(data.answer);
      addLog(`Answer generated.`);
    } catch (e) {
      addLog(`Answer error: ${e.message}`);
    }
    setAnswering(false);
  };

  // Section 9: Compare
  const handleCompare = async (queryToUse = searchQuery) => {
    if (!queryToUse) return;
    setComparing(true);
    addLog(`Running Vector vs Graph Compare for: "${queryToUse}"`);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/graphrag/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryToUse })
      });
      const data = await res.json();
      setCompareResult(data);
      setSearchQuery(queryToUse);
      addLog(`Comparison complete.`);
    } catch (e) {
      addLog(`Compare error: ${e.message}`);
    }
    setComparing(false);
  };

  // Section 12: Export
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ triples, canonicalMappings, graphData }, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "knowledge_graph.json");
    dlAnchorElem.click();
  };

  const handleExportCSV = () => {
    let csv = "Head,Relation,Tail,Source Document,Chunk Number\n";
    triples.forEach(t => {
      csv += `"${t.head}","${t.relation}","${t.tail}","${t.source}","${t.chunk}"\n`;
    });
    const dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "triples.csv");
    dlAnchorElem.click();
  };

  // Graph styling
  const nodeCanvasObject = useCallback((node, ctx, globalScale) => {
    const label = node.id;
    const fontSize = 12/globalScale;
    ctx.font = `${fontSize}px Sans-Serif`;
    const textWidth = ctx.measureText(label).width;
    const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2); 
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions);
    
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#0f172a';
    ctx.fillText(label, node.x, node.y);
    
    node.__bckgDimensions = bckgDimensions;
  }, []);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4"
      onDoubleClick={() => {
        if (isGraphFullScreen) setIsGraphFullScreen(false);
        if (isSubgraphFullScreen) setIsSubgraphFullScreen(false);
      }}
    >
      <div className={`bg-slate-50 w-full transition-all duration-300 ${isModalFullScreen ? 'max-w-full h-screen rounded-none m-0' : 'max-w-7xl h-[95vh] rounded-2xl'} shadow-2xl flex flex-col overflow-hidden border border-slate-200`}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shadow-sm z-10">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-3">
              <Network className="text-rose-600" /> GraphRAG Studio
            </h1>
            <p className="text-sm text-slate-500 font-medium">Build and visualize a Knowledge Graph from the chatbot documents.</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setIsModalFullScreen(!isModalFullScreen)} className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-full transition-colors" title="Toggle Fullscreen">
              <Maximize2 size={20} />
            </button>
            <button type="button" onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-full transition-colors" title="Close">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-12">
          
          {/* SECTION 1: Document Selection */}
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><FileText size={20} className="text-blue-500"/> Section 1: Document Selection</h2>
              <button onClick={handleReset} className="px-4 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 font-medium transition flex items-center gap-2"><RefreshCw size={16}/> Reset Pipeline</button>
            </div>
            <div className="flex gap-4 mb-4">
              <button 
                onClick={() => setSelectedDocs(documents.map(d => d.name))}
                className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded hover:bg-blue-100 font-medium transition"
              >Select All</button>
              <button 
                onClick={() => setSelectedDocs([])}
                className="px-3 py-1.5 text-sm bg-slate-50 text-slate-700 rounded hover:bg-slate-100 font-medium transition"
              >Deselect All</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-2">
              {docLoading ? <p>Loading documents...</p> : documents.map(doc => (
                <div key={doc.name} onClick={() => setSelectedDocs(prev => prev.includes(doc.name) ? prev.filter(d => d !== doc.name) : [...prev, doc.name])}
                  className={`p-3 rounded-lg border cursor-pointer flex justify-between items-center transition ${selectedDocs.includes(doc.name) ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-300'}`}>
                  <span className="font-medium text-slate-700 text-sm">{doc.name}</span>
                  <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded-full">{doc.chunks} chunks</span>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 2: Graph Extraction */}
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Cpu size={20} className="text-purple-500"/> Section 2: Graph Extraction</h2>
            <button 
              onClick={handleExtract} disabled={extracting}
              className="mb-4 px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-semibold shadow-sm flex items-center gap-2 transition"
            >
              {extracting ? <Activity className="animate-spin" size={18}/> : <Share2 size={18}/>}
              Extract Knowledge Graph
            </button>

            {triples.length > 0 && (
              <div className="border border-slate-200 rounded-lg overflow-hidden shadow-inner bg-slate-50">
                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-600 uppercase bg-slate-200 sticky top-0 shadow-sm">
                      <tr>
                        <th className="px-4 py-3">Head</th>
                        <th className="px-4 py-3">Relation</th>
                        <th className="px-4 py-3">Tail</th>
                        <th className="px-4 py-3">Source</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {triples.map((t, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="px-4 py-2 font-medium text-slate-800">{t.head}</td>
                          <td className="px-4 py-2 text-purple-600 bg-purple-50 font-medium text-center rounded">{t.relation}</td>
                          <td className="px-4 py-2 font-medium text-slate-800">{t.tail}</td>
                          <td className="px-4 py-2 text-slate-500 text-xs truncate max-w-[150px]">{t.source}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-3 bg-white border-t border-slate-200 text-sm font-semibold text-slate-700">Total Triples: {triples.length}</div>
              </div>
            )}
          </section>

          {/* SECTION 3: Entity Resolution */}
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Layers size={20} className="text-emerald-500"/> Section 3: Entity Resolution</h2>
            <button 
              onClick={handleResolve} disabled={resolving}
              className="mb-4 px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-semibold shadow-sm flex items-center gap-2 transition"
            >
              {resolving ? <Activity className="animate-spin" size={18}/> : <Check size={18}/>}
              Resolve Duplicate Entities
            </button>
            
            {Object.keys(canonicalMappings).length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 shadow-inner">
                  <h3 className="font-semibold text-slate-700 mb-3 border-b pb-2">Canonical Mappings</h3>
                  <div className="max-h-48 overflow-y-auto space-y-2 text-sm">
                    {Object.entries(canonicalMappings).map(([orig, canon]) => (
                      <div key={orig} className="flex items-center gap-2">
                        <span className="text-rose-500 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">{orig}</span>
                        <ChevronRight size={14} className="text-slate-400" />
                        <span className="text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">{canon}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border border-slate-200 rounded-lg p-6 bg-white shadow-sm flex flex-col justify-center space-y-4">
                  <div className="flex justify-between items-center"><span className="text-slate-500 font-medium">Total Entities Extracted</span><span className="font-bold text-lg">{new Set([...triples.map(t=>t.head), ...triples.map(t=>t.tail)]).size}</span></div>
                  <div className="flex justify-between items-center"><span className="text-slate-500 font-medium">Merged Entities</span><span className="font-bold text-lg text-emerald-600">{Object.keys(canonicalMappings).length}</span></div>
                </div>
              </div>
            )}
          </section>

          {/* SECTION 4 & 5: Knowledge Graph */}
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Network size={20} className="text-indigo-500"/> Section 4 & 5: Knowledge Graph</h2>
              <button onClick={handleBuildGraph} disabled={building} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-semibold shadow-sm flex items-center gap-2 transition">
                {building ? <Activity className="animate-spin" size={16}/> : <Maximize2 size={16}/>} Build Graph
              </button>
            </div>
            
            {graphStats && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                {[{label: "Nodes", val: graphStats.num_nodes, c: "text-blue-600"}, {label: "Edges", val: graphStats.num_edges, c: "text-purple-600"}, 
                  {label: "Unique Relations", val: new Set(triples.map(t=>t.relation)).size, c: "text-rose-600"}, 
                  {label: "Components", val: graphStats.connected_components, c: "text-emerald-600"}, 
                  {label: "Avg Degree", val: graphStats.avg_degree.toFixed(2), c: "text-orange-600"}].map(stat => (
                  <div key={stat.label} className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center shadow-sm">
                    <div className={`text-2xl font-black ${stat.c}`}>{stat.val}</div>
                    <div className="text-xs text-slate-500 uppercase font-semibold mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            )}

            {graphData.nodes.length > 0 && (
              <div 
                ref={graphContainerRef}
                className={`border-2 border-slate-200 overflow-hidden shadow-inner relative bg-slate-900 transition-all flex justify-center items-center ${isGraphFullScreen ? 'fixed inset-0 z-[100] w-screen h-screen rounded-none' : 'rounded-xl h-[500px]'}`}
                onDoubleClickCapture={() => setIsGraphFullScreen(!isGraphFullScreen)}
                title="Double-click to toggle fullscreen"
              >
                <ForceGraph2D
                  ref={graphRef}
                  graphData={graphData}
                  nodeAutoColorBy="id"
                  nodeCanvasObject={nodeCanvasObject}
                  linkDirectionalArrowLength={3.5}
                  linkDirectionalArrowRelPos={1}
                  linkWidth={1.5}
                  linkColor={() => 'rgba(255,255,255,0.3)'}
                  onNodeClick={node => {
                    alert(`Entity: ${node.id}\nSources: ${node.sources?.join(', ') || 'Unknown'}\nConnections: ${node.val}`);
                  }}
                  onEngineStop={() => {
                    if (graphRef.current) graphRef.current.zoomToFit(400, 50);
                  }}
                  width={graphDim.w}
                  height={graphDim.h}
                />
                
                {isGraphFullScreen && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); setIsGraphFullScreen(false); }}
                    className="absolute top-6 right-6 z-[101] bg-white text-slate-800 p-2 rounded-full shadow-lg hover:bg-slate-200"
                    title="Exit Fullscreen"
                  >
                    <X size={24} />
                  </button>
                )}
              </div>
            )}
          </section>

          {/* SECTION 6 & 7 & 8: Traversal & Answer */}
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Search size={20} className="text-sky-500"/> Section 6, 7 & 8: Graph Traversal & Answer</h2>
            
            <div className="flex gap-2 mb-6">
              <input 
                type="text" 
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleTraverse(); }}
                placeholder="Ask a question (e.g. 'What vaccines are recommended during pregnancy?')"
                className="flex-1 p-3 border border-slate-300 rounded-lg shadow-inner focus:ring-2 focus:ring-sky-500 outline-none"
              />
              <button type="button" onClick={() => handleTraverse()} disabled={traversing} className="px-6 bg-sky-600 text-white rounded-lg font-bold hover:bg-sky-700 transition">
                {traversing ? 'Searching...' : 'Traverse'}
              </button>
            </div>

            {subgraph && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-slate-700 mb-2 border-b pb-1">Traversal Subgraph</h3>
                  <div 
                    ref={subgraphContainerRef}
                    className={`border border-slate-200 overflow-hidden bg-slate-900 transition-all ${isSubgraphFullScreen ? 'fixed inset-0 z-[100] w-screen h-screen rounded-none' : 'rounded-lg h-[400px] relative'}`}
                    onDoubleClickCapture={() => setIsSubgraphFullScreen(!isSubgraphFullScreen)}
                    title="Double-click to toggle fullscreen"
                  >
                    <ForceGraph2D
                      ref={subgraphRef}
                      graphData={subgraph}
                      nodeAutoColorBy="id"
                      nodeCanvasObject={nodeCanvasObject}
                      linkDirectionalArrowLength={5}
                      linkWidth={2}
                      linkColor={() => 'rgba(255,255,255,0.5)'}
                      onEngineStop={() => {
                        if (subgraphRef.current) subgraphRef.current.zoomToFit(400, 50);
                      }}
                      width={subgraphDim.w}
                      height={subgraphDim.h}
                    />
                    
                    {isSubgraphFullScreen && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); setIsSubgraphFullScreen(false); }}
                        className="absolute top-6 right-6 z-[101] bg-white text-slate-800 p-2 rounded-full shadow-lg hover:bg-slate-200"
                        title="Exit Fullscreen"
                      >
                        <X size={24} />
                      </button>
                    )}
                  </div>
                  <div className="mt-3 p-3 bg-slate-50 border rounded-lg text-xs font-mono text-slate-600 h-32 overflow-y-auto whitespace-pre-wrap">
                    {subgraph.path_text || "No paths found."}
                  </div>
                </div>

                <div className="flex flex-col">
                  <h3 className="font-semibold text-slate-700 mb-2 border-b pb-1">GraphRAG Generation</h3>
                  <button type="button" onClick={handleAnswer} disabled={answering || !subgraph} className="w-full py-3 mb-4 bg-teal-600 text-white rounded-lg font-bold shadow hover:bg-teal-700 transition">
                    {answering ? 'Generating...' : 'Generate Answer with Subgraph Context'}
                  </button>
                  <div className="flex-1 border border-slate-200 rounded-lg p-5 bg-teal-50/30 overflow-y-auto prose prose-sm max-w-none text-slate-800 shadow-inner">
                    {graphAnswer || <span className="text-slate-400 italic">Generated answer will appear here...</span>}
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* SECTION 9 & 10: Comparison */}
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Zap size={20} className="text-amber-500"/> Section 9 & 10: Vector RAG vs GraphRAG Compare</h2>
            
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-500 mb-2 uppercase">Multi-Hop Demo Questions</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  "Which vaccine is recommended for pregnant women and what outcomes does it prevent?",
                  "How does COVID-19 affect perinatal outcomes compared to post-COVID conditions?",
                  "What are the causes of Fever in Multisystem Inflammatory Syndrome?"
                ].map((q, i) => (
                  <button type="button" key={i} onClick={() => {setSearchQuery(q); handleCompare(q);}}
                    className="px-4 py-2 bg-slate-100 hover:bg-amber-100 hover:text-amber-800 rounded-full text-sm text-left transition border border-slate-200 hover:border-amber-300">
                    {q}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 mb-6">
              <button type="button" onClick={() => handleCompare(searchQuery)} disabled={comparing} className="px-6 py-3 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-700 transition flex items-center gap-2">
                {comparing ? <Activity className="animate-spin" size={18}/> : <Zap size={18}/>} Run Comparison
              </button>
            </div>

            {compareResult && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Vector RAG */}
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col h-[500px]">
                  <div className="bg-blue-600 text-white px-4 py-2 font-bold uppercase tracking-wider text-sm flex items-center gap-2"><Database size={16}/> Vector RAG</div>
                  <div className="p-4 bg-blue-50 border-b border-slate-200 flex-1 overflow-y-auto">
                    <h4 className="text-xs font-semibold text-slate-500 mb-1 uppercase">Retrieved Chunks</h4>
                    {Array.isArray(compareResult?.vector_chunks) && compareResult.vector_chunks.map((c, i) => (
                      <div key={i} className="mb-2 p-2 bg-white rounded border border-slate-200 text-xs text-slate-700 shadow-sm">
                        <span className="font-bold text-blue-600">[{c.source}]</span> {c.text}
                      </div>
                    ))}
                  </div>
                  <div className="p-5 bg-white h-1/2 overflow-y-auto prose prose-sm max-w-none text-slate-800">
                    <h4 className="text-xs font-semibold text-slate-500 mb-2 uppercase">Final Answer</h4>
                    {compareResult?.vector_answer}
                  </div>
                </div>

                {/* Graph RAG */}
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col h-[500px]">
                  <div className="bg-rose-600 text-white px-4 py-2 font-bold uppercase tracking-wider text-sm flex items-center gap-2"><Network size={16}/> Graph RAG</div>
                  <div className="p-4 bg-rose-50 border-b border-slate-200 flex-1 overflow-y-auto">
                    <h4 className="text-xs font-semibold text-slate-500 mb-1 uppercase">Retrieved Subgraph Paths</h4>
                    <div className="p-2 bg-white rounded border border-slate-200 text-xs font-mono text-slate-700 whitespace-pre-wrap shadow-sm h-full">
                      {compareResult?.graph_subgraph?.path_text || "No paths found."}
                    </div>
                  </div>
                  <div className="p-5 bg-white h-1/2 overflow-y-auto prose prose-sm max-w-none text-slate-800">
                    <h4 className="text-xs font-semibold text-slate-500 mb-2 uppercase">Final Answer</h4>
                    {compareResult?.graph_answer}
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* SECTION 11 & 12: Debug & Export */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-80 flex flex-col">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><AlertCircle size={20} className="text-slate-500"/> Section 11: Debug Panel</h2>
              <div className="flex-1 bg-slate-900 rounded-lg p-4 font-mono text-xs text-green-400 overflow-y-auto shadow-inner">
                {debugLogs.length === 0 ? <span className="text-slate-500">System idle...</span> : debugLogs.map((l, i) => <div key={i}>{l}</div>)}
              </div>
            </section>

            <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-center">
              <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2"><Download size={20} className="text-slate-700"/> Section 12: Export Data</h2>
              <div className="space-y-4">
                <button onClick={handleExportJSON} className="w-full py-3 bg-slate-800 text-white rounded-lg font-bold shadow flex justify-center items-center gap-2 hover:bg-slate-700 transition">
                  <FileText size={18}/> Export Knowledge Graph JSON
                </button>
                <button onClick={handleExportCSV} className="w-full py-3 bg-slate-100 text-slate-800 border border-slate-300 rounded-lg font-bold shadow-sm flex justify-center items-center gap-2 hover:bg-slate-200 transition">
                  <FileText size={18}/> Export Triples CSV
                </button>
              </div>
            </section>
          </div>

          {/* SECTION 13: Next Steps */}
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center">
            <h2 className="text-xl font-extrabold text-slate-800 mb-2">Ready to query the entire Knowledge Graph?</h2>
            <p className="text-slate-500 mb-6 font-medium">Use Map-Reduce to summarize themes across all communities, and test the Intelligent Router.</p>
            <button 
              onClick={onOpenGlobalSearch} 
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-bold shadow-md hover:shadow-lg w-full md:w-auto"
            >
              <Globe size={20} /> Open Global Search & Router
            </button>
          </section>

        </div>
      </div>
    </div>
  );
}
