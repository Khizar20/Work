import { useState } from 'react';

const mockFiles = [
  { name: 'Document1.pdf', size: '1.2 MB' },
  { name: 'Document2.docx', size: '2.5 MB' },
  { name: 'Document3.xlsx', size: '3.1 MB' },
];

export default function DocumentsLibrary() {
  const [search, setSearch] = useState('');

  const filteredFiles = mockFiles.filter((file) =>
    file.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Documents Library</h1>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search files..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="block w-full px-3 py-2 border rounded focus:outline-none focus:ring"
        />
      </div>
      <div className="p-4 bg-white rounded shadow-md">
        <table className="w-full border-collapse border border-gray-200">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2">File Name</th>
              <th className="border border-gray-300 px-4 py-2">Size</th>
            </tr>
          </thead>
          <tbody>
            {filteredFiles.map((file) => (
              <tr key={file.name}>
                <td className="border border-gray-300 px-4 py-2">{file.name}</td>
                <td className="border border-gray-300 px-4 py-2">{file.size}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}