import React from 'react';

function SimpleApp() {
  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-4">DLX Studios - Debug Mode</h1>
      <p className="text-lg">✅ React is working</p>
      <p className="text-lg">✅ CSS is loading</p>
      <p className="text-lg">✅ Basic rendering functional</p>
      
      <div className="mt-8 p-4 bg-purple-600/20 rounded-lg border border-purple-500/30">
        <h2 className="text-xl font-semibold mb-2">Debug Info</h2>
        <p>If you can see this, the basic React setup is working.</p>
        <p>The white screen is likely caused by a component error.</p>
      </div>
    </div>
  );
}

export default SimpleApp;