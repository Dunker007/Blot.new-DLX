import { Settings as SettingsIcon } from 'lucide-react';

export default function Settings() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
        <SettingsIcon size={64} className="mx-auto mb-4 text-cyan-400" />
        <h2 className="text-3xl font-bold mb-3">Settings</h2>
        <p className="text-slate-400 text-lg mb-6 max-w-2xl mx-auto">
          Settings panel coming soon!
        </p>
      </div>
    </div>
  );
}
