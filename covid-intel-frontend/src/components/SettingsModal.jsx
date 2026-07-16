import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

export default function SettingsModal({ onClose }) {
  const [settings, setSettings] = useState({
    chunk_size: 45,
    chunk_overlap: 10,
    top_k: 5,
    temperature: 0.0,
    max_tokens: 1024
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/settings')
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(console.error);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: parseFloat(value) }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
      <div className="glass w-full max-w-md rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-medical-100 flex justify-between items-center bg-white/50">
          <h2 className="text-xl font-bold text-medical-900">Settings</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-4 bg-white/30">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Chunk Size</label>
            <input type="number" name="chunk_size" value={settings.chunk_size} onChange={handleChange} className="w-full px-3 py-2 border border-medical-200 rounded-lg focus:ring-2 focus:ring-medical-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Chunk Overlap</label>
            <input type="number" name="chunk_overlap" value={settings.chunk_overlap} onChange={handleChange} className="w-full px-3 py-2 border border-medical-200 rounded-lg focus:ring-2 focus:ring-medical-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Top K (Chunks Retrieved)</label>
            <input type="number" name="top_k" value={settings.top_k} onChange={handleChange} className="w-full px-3 py-2 border border-medical-200 rounded-lg focus:ring-2 focus:ring-medical-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Temperature</label>
            <input type="number" step="0.1" name="temperature" value={settings.temperature} onChange={handleChange} className="w-full px-3 py-2 border border-medical-200 rounded-lg focus:ring-2 focus:ring-medical-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Tokens</label>
            <input type="number" name="max_tokens" value={settings.max_tokens} onChange={handleChange} className="w-full px-3 py-2 border border-medical-200 rounded-lg focus:ring-2 focus:ring-medical-500 outline-none" />
          </div>
        </div>
        
        <div className="px-6 py-4 border-t border-medical-100 bg-white/50 flex justify-end">
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="flex items-center gap-2 bg-medical-600 hover:bg-medical-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            <Save size={18} />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
