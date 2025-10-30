"use client";

import { useEffect } from 'react';
import { useDemoLogsStore } from '@/stores/demoLogsStore';
import { DEMO_DATA_2025 } from '@/data/demoData2025';

export default function TestDataPage() {
  const logs = useDemoLogsStore(state => state.logs);
  const getAllLogs = useDemoLogsStore(state => state.getAllLogs);

  useEffect(() => {
    console.log('=== TEST PAGE ===');
    console.log('DEMO_DATA_2025 length:', DEMO_DATA_2025.length);
    console.log('Store logs length:', logs.length);
    console.log('getAllLogs() length:', getAllLogs().length);
    console.log('First 3 logs:', logs.slice(0, 3));
  }, [logs, getAllLogs]);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Demo Data Test Page</h1>
      
      <div className="space-y-6">
        <div className="border p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">Static Data (DEMO_DATA_2025)</h2>
          <p className="text-lg">Total entries: <strong>{DEMO_DATA_2025.length}</strong></p>
          <div className="mt-2 text-sm">
            <p>Dates: {DEMO_DATA_2025.slice(0, 5).map(d => d.date).join(', ')}...</p>
          </div>
        </div>

        <div className="border p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">Store Data (useDemoLogsStore)</h2>
          <p className="text-lg">Total entries: <strong>{logs.length}</strong></p>
          {logs.length > 0 ? (
            <div className="mt-2 text-sm">
              <p>Dates: {logs.slice(0, 5).map(d => d.date).join(', ')}...</p>
            </div>
          ) : (
            <p className="text-red-500 mt-2">⚠️ No logs in store!</p>
          )}
        </div>

        <div className="border p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">Sample Log Entries</h2>
          {logs.length > 0 ? (
            <div className="space-y-2">
              {logs.slice(0, 3).map((log) => (
                <div key={log._id} className="bg-gray-100 dark:bg-gray-800 p-3 rounded">
                  <p className="font-semibold">{log.date}</p>
                  <p className="text-sm">Entries: {log.entries.length}</p>
                  <ul className="text-xs mt-1 space-y-1">
                    {log.entries.map((entry) => (
                      <li key={entry.id}>• {entry.templateName}: {entry.content.substring(0, 50)}...</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No logs to display</p>
          )}
        </div>
      </div>
    </div>
  );
}
