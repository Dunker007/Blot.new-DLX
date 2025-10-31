import { FileCode, Sparkles } from 'lucide-react';

export default function Workspace() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
        <FileCode size={64} className="mx-auto mb-4 text-cyan-400" />
        <h2 className="text-3xl font-bold mb-3">Code Workspace</h2>
        <p className="text-slate-400 text-lg mb-6 max-w-2xl mx-auto">
          Advanced code editor with Monaco integration, AI-powered autocomplete,
          and real-time preview capabilities. Coming soon!
        </p>
        <div className="flex items-center justify-center gap-2 text-cyan-400">
          <Sparkles size={20} />
          <span className="font-medium">Under Development</span>
        </div>
      </div>
    </div>
  );
}
