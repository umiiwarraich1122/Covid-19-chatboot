import { useState, useEffect } from 'react';
import { X, Upload, Trash2, File as FileIcon } from 'lucide-react';

export default function DocumentModal({ onClose }) {
  const [docs, setDocs] = useState([]);
  const [uploading, setUploading] = useState(false);

  const fetchDocs = async () => {
    try {
      const res = await fetch('/documents');
      const data = await res.json();
      setDocs(data.documents || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      await fetch('/documents', {
        method: 'POST',
        body: formData
      });
      await fetchDocs();
    } catch (e) {
      console.error(e);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (filename) => {
    try {
      await fetch(`/documents/${filename}`, {
        method: 'DELETE'
      });
      await fetchDocs();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
      <div className="glass w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[80vh]">
        <div className="px-6 py-4 border-b border-medical-100 flex justify-between items-center bg-white/50">
          <h2 className="text-xl font-bold text-medical-900">Document Management</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto bg-white/30">
          <div className="mb-6">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-medical-300 border-dashed rounded-xl cursor-pointer bg-white/50 hover:bg-medical-50 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6 text-medical-600">
                <Upload size={28} className="mb-2" />
                <p className="text-sm font-medium">{uploading ? 'Uploading and indexing...' : 'Click to upload document'}</p>
                <p className="text-xs text-gray-500 mt-1">PDF, DOCX, TXT, MD</p>
              </div>
              <input type="file" className="hidden" accept=".pdf,.txt,.md,.docx" onChange={handleUpload} disabled={uploading} />
            </label>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Uploaded Documents ({docs.length})</h3>
            {docs.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No documents uploaded yet.</p>
            ) : (
              docs.map((doc, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-white border border-medical-100 rounded-xl shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-medical-50 text-medical-600 rounded-lg">
                      <FileIcon size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{doc.name}</p>
                      <p className="text-xs text-gray-500">{doc.chunks} indexed chunks</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDelete(doc.name)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Document"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
