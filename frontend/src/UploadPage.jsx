import { Upload } from 'lucide-react'

export default function UploadPage({ onFileUpload }) {
  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm text-center">
        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-gray-100">
          <Upload size={32} className="text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Import Data</h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          Drag and drop your CSV or JSON file here to instantly populate your prospect list.
        </p>

        <div className="relative group cursor-pointer">
          <input
            type="file"
            accept=".csv,.json"
            onChange={onFileUpload}
            className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
          />
          <div className="border-2 border-dashed border-gray-200 rounded-2xl p-10 group-hover:border-blue-500/50 group-hover:bg-blue-50/30 transition-all duration-300">
            <span className="inline-flex px-4 py-2 bg-black text-white font-medium rounded-lg shadow-sm group-hover:scale-105 transition-transform">
              Select File
            </span>
            <p className="mt-4 text-xs text-gray-400 uppercase tracking-wide">Supports CSV & JSON</p>
          </div>
        </div>

        <div className="mt-12 text-left bg-gray-50/50 rounded-xl p-6 border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            Required Format
          </h3>

          <div className="space-y-6">
            <div>
              <p className="text-xs text-gray-500 mb-2 font-mono">CSV Example</p>
              <div className="bg-white rounded-lg p-3 border border-gray-200 overflow-x-auto shadow-sm">
                <code className="text-xs text-blue-600 font-mono block">name,position,college</code>
                <code className="text-xs text-gray-500 font-mono block">Marcus Johnson,QB,Alabama</code>
                <code className="text-xs text-gray-500 font-mono block">DeShawn Williams,RB,Ohio State</code>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-2 font-mono">JSON Example</p>
              <div className="bg-white rounded-lg p-3 border border-gray-200 overflow-x-auto shadow-sm">
                <pre className="text-xs text-gray-500 font-mono">
{`[
  { "name": "Marcus Johnson", "position": "QB", "college": "Alabama" },
  { "name": "Tyler Smith", "position": "WR", "college": "LSU" }
]`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
