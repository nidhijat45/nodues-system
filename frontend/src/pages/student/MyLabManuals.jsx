import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axios';

const MyLabManuals = () => {
  const [manuals, setManuals] = useState([]);

  useEffect(() => {
    api.get('/student/lab-manuals').then(r => setManuals(r.data)).catch(() => {});
  }, []);

  return (
    <Layout>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">My Lab Manuals</h2>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {['Subject', 'Teacher', 'Status'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {manuals.map(m => (
              <tr key={m.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{m.subject_name}</td>
                <td className="px-4 py-3 text-gray-500">{m.teacher?.name}</td>
                <td className="px-4 py-3">
                  {m.is_submitted
                    ? <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-medium">Submitted</span>
                    : <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-xs font-medium">Pending</span>
                  }
                </td>
              </tr>
            ))}
            {manuals.length === 0 && (
              <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-400">No lab manuals found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default MyLabManuals;
