import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axios';

const MyAssignments = () => {
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    api.get('/student/assignments').then(r => setAssignments(r.data)).catch(() => {});
  }, []);

  const now = new Date();

  return (
    <Layout>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">My Assignments</h2>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {['Assignment', 'Subject', 'Teacher', 'Due Date', 'Status'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {assignments.map(a => {
              const overdue = !a.is_submitted && new Date(a.due_date) < now;
              return (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{a.assignment_name}</td>
                  <td className="px-4 py-3 text-gray-500">{a.subject_name}</td>
                  <td className="px-4 py-3 text-gray-500">{a.teacher?.name}</td>
                  <td className="px-4 py-3 text-gray-500">
                    <span className={overdue ? 'text-red-500 font-medium' : ''}>{a.due_date}</span>
                  </td>
                  <td className="px-4 py-3">
                    {a.is_submitted
                      ? <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-medium">Submitted</span>
                      : overdue
                        ? <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-medium">Overdue</span>
                        : <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-xs font-medium">Pending</span>
                    }
                  </td>
                </tr>
              );
            })}
            {assignments.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No assignments found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default MyAssignments;
