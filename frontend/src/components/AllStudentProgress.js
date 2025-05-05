import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const PROGRESS_BY_STATUS = {
  Planned: { percent: 10, color: "#a78bfa", order: 1 },
  InProgress: { percent: 50, color: "#6366f1", order: 2 },
  PendingApproval: { percent: 80, color: "#f59e0b", order: 3 },
  Completed: { percent: 100, color: "#22c55e", order: 4 },
};

export default function AllStudentProgress() {
  const [students, setStudents] = useState([]);
  const [milestonesByStudent, setMilestonesByStudent] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudentsAndMilestones();
    // eslint-disable-next-line
  }, []);

  const fetchStudentsAndMilestones = async () => {
    setLoading(true);
    try {
      // Fetch all students assigned to this advisor
      const studentsRes = await api.get('/api/advisor/students');
      setStudents(studentsRes.data);

      // Fetch milestones for each student
      const milestonesData = {};
      await Promise.all(
        studentsRes.data.map(async (student) => {
          const res = await api.get(`/api/milestones/student/${student._id}`);
          milestonesData[student._id] = res.data;
        })
      );
      setMilestonesByStudent(milestonesData);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getMilestonesByStatus = () => {
    const statusGroups = {
      Planned: [],
      InProgress: [],
      PendingApproval: [],
      Completed: []
    };

    Object.entries(milestonesByStudent).forEach(([studentId, milestones]) => {
      const student = students.find(s => s._id === studentId);
      if (!student) return;

      milestones.forEach(milestone => {
        statusGroups[milestone.status].push({
          ...milestone,
          studentName: `${student.first_name} ${student.last_name}`,
          studentId: student._id
        });
      });
    });

    return statusGroups;
  };

  if (loading) return (
    <div className="flex h-screen justify-center items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  const statusGroups = getMilestonesByStatus();

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-50 border-r border-gray-200 px-4 py-6">
        <div className="text-indigo-600 font-bold text-xl mb-8">PhDTracker</div>
        <div className="space-y-4">
          <div className="text-sm text-gray-700 font-medium">Navigation</div>
          <ul className="space-y-2 mt-2">
            <li 
              className="text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-md cursor-pointer"
              onClick={() => navigate("/advisor/dashboard")}
            >
              Dashboard
            </li>
            <li 
              className="text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-md cursor-pointer"
              onClick={() => navigate("/advisor/pending-approvals")}
            >
              Pending Approvals
            </li>
            <li 
              className="text-indigo-700 bg-indigo-100 px-4 py-2 rounded-md cursor-pointer"
              onClick={() => navigate("/advisor/student-progress")}
            >
              Student Progress
            </li>
          </ul>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <h1 className="text-2xl font-semibold text-gray-800">Milestone Status Overview</h1>
        </header>

        <main className="p-6 overflow-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(PROGRESS_BY_STATUS).map(([status, { color, percent }]) => (
              <div 
                key={status}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-800">{status}</h2>
                    <span className="text-sm font-medium" style={{ color }}>
                      {statusGroups[status].length} milestones
                    </span>
                  </div>
                </div>
                
                <div className="p-4">
                  {statusGroups[status].length > 0 ? (
                    <div className="space-y-4">
                      {statusGroups[status].map((milestone) => (
                        <div key={milestone._id} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700">{milestone.title}</span>
                            <button
                              onClick={() => navigate(`/advisor/student/${milestone.studentId}`)}
                              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                            >
                              {milestone.studentName}
              </button>
            </div>
                          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                              className="h-full rounded-full transition-all duration-300"
                        style={{
                                width: `${percent}%`,
                                backgroundColor: color,
                        }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
              ) : (
                    <div className="text-gray-400 text-sm text-center py-4">No milestones in this status.</div>
              )}
            </div>
          </div>
        ))}
          </div>
        </main>
      </div>
    </div>
  );
} 