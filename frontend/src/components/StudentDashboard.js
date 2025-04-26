import React, { useEffect, useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { useParams, useNavigate, useLocation } from "react-router";
import axios from "axios";
import toast from "react-hot-toast";
import AddMilestoneModal from "./AddMilestoneModal";

const FIXED_COLUMNS = {
  planned: "Planned",
  inProgress: "In Progress",
  pendingApproval: "Pending Approval",
  completed: "Completed",
};

const onDragEnd = (result, columns, setColumns, currentProjectId) => {
  if (!result.destination) return;

  const { source, destination } = result;
  let updatedColumns = {};

  if (source.droppableId !== destination.droppableId) {
    const sourceColumn = columns[source.droppableId];
    const destColumn = columns[destination.droppableId];
    const sourceItems = [...sourceColumn.items];
    const destItems = [...destColumn.items];
    const [removed] = sourceItems.splice(source.index, 1);
    destItems.splice(destination.index, 0, removed);

    updatedColumns = {
      ...columns,
      [source.droppableId]: {
        ...sourceColumn,
        items: sourceItems,
      },
      [destination.droppableId]: {
        ...destColumn,
        items: destItems,
      },
    };
  } else {
    const column = columns[source.droppableId];
    const copiedItems = [...column.items];
    const [removed] = copiedItems.splice(source.index, 1);
    copiedItems.splice(destination.index, 0, removed);

    updatedColumns = {
      ...columns,
      [source.droppableId]: {
        ...column,
        items: copiedItems,
      },
    };
  }

  setColumns(updatedColumns);

  if (currentProjectId) {
    axios
      .put(`http://localhost:9000/project/${currentProjectId}/todo`, updatedColumns)
      .then(() => toast.success("Task order updated"))
      .catch(() => toast.error("Failed to update task order"));
  }
};

function StudentDashboard() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [columns, setColumns] = useState({});
  const [title, setTitle] = useState("");
  const [isAddMilestoneModalOpen, setAddMilestoneModalOpen] = useState(false);
  const [isRenderChange, setRenderChange] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user?.id) {
      axios.get(`http://localhost:9000/user/${user.id}/projects`)
        .then((res) => {
          if (res.data.length > 0) {
            setCurrentProjectId(res.data[0]._id);
          } else {
            setCurrentProjectId(null); // No projects found
          }
        })
        .catch(() => toast.error("Error fetching projects"));
    }
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!projectId && user?.id) {
      axios.get(`http://localhost:9000/user/${user.id}/projects`).then((res) => {
        if (res.data.length > 0) {
          setCurrentProjectId(res.data[0]._id);
          navigate(`/student-dashboard/${res.data[0]._id}`);
        } else {
          setCurrentProjectId(null);
        }
      }).catch(() => toast.error("Error fetching projects"));
    } else {
      setCurrentProjectId(projectId);
    }
  }, [projectId, navigate]);

  useEffect(() => {
    if (currentProjectId && (!isAddMilestoneModalOpen || isRenderChange)) {
      axios.get(`http://localhost:9000/project/${currentProjectId}`).then((res) => {
        const taskData = res.data[0].task;
        setTitle(res.data[0].title);
        const newColumns = {};
        Object.entries(FIXED_COLUMNS).forEach(([key, name]) => {
          newColumns[key] = {
            name,
            items: taskData.filter(task => task.stage === name).sort((a, b) => a.order - b.order),
          };
        });
        setColumns(newColumns);
        setRenderChange(false);
      }).catch(() => toast.error("Something went wrong"));
    }
  }, [currentProjectId, isAddMilestoneModalOpen, isRenderChange]);

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-50 border-r border-gray-200 px-4 py-6">
        <div className="text-indigo-600 font-bold text-xl mb-8">PhDTracker</div>
        <div className="space-y-4">
          <div className="text-sm text-gray-700 font-medium">Student Profile</div>
          <ul className="space-y-2 mt-2">
            <li className="text-indigo-700 bg-indigo-100 px-4 py-2 rounded-md">Home</li>
            <li className="text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-md cursor-pointer">Dashboard</li>
            <li className="text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-md cursor-pointer" onClick={() => navigate("/milestones")}>My Milestones</li>
            <li className="text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-md cursor-pointer">Progress</li>
          </ul>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="flex justify-between items-center py-4 px-6 bg-white shadow-sm border-b">
          <input className="bg-gray-100 rounded px-3 py-2 w-1/3" placeholder="Search..." />
          <div className="flex items-center gap-4">
            <button className="text-indigo-600">🔔</button>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded text-sm" onClick={() => setAddMilestoneModalOpen(true)}>Add Milestone</button>
            <img src="/avatar.png" alt="User" className="h-8 w-8 rounded-full" />
          </div>
        </header>

        <main className="p-6 overflow-auto">
          {currentProjectId ? (
            <DragDropContext onDragEnd={(result) => onDragEnd(result, columns, setColumns, currentProjectId)}>
              <div className="flex gap-6 overflow-x-auto">
                {Object.entries(columns).map(([columnId, column]) => (
                  <div key={columnId} className="w-[23%] min-w-[250px]">
                    <div className="mb-2 font-semibold text-sm uppercase text-gray-600 flex justify-between">
                      {column.name}
                      {column.items.length > 0 && <span className="text-xs text-gray-400">{column.items.length}</span>}
                    </div>
                    <Droppable droppableId={columnId}>
                      {(provided, snapshot) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className={`min-h-[500px] p-2 rounded-md border-2 ${snapshot.isDraggingOver ? 'border-indigo-600' : 'border-transparent'}`}>
                          {column.items.map((item, index) => (
                            <Draggable key={item._id} draggableId={item._id} index={index}>
                              {(provided) => (
                                <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="bg-white border border-gray-200 rounded-md shadow-sm mb-2 p-3 cursor-pointer">
                                  <h3 className="text-sm font-medium text-gray-800 truncate">{item.title}</h3>
                                  <p className="text-xs text-gray-500 mt-1 truncate">{item.description}</p>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                ))}
              </div>
            </DragDropContext>
          ) : (
            <div className="text-center text-gray-500">
              <p>No Milestones found. Start by creating a new Milestone!</p>
            </div>
          )}
        </main>
      </div>

      {isAddMilestoneModalOpen && (
        <AddMilestoneModal
          isOpen={isAddMilestoneModalOpen}
          onClose={() => setAddMilestoneModalOpen(false)}
          studentId={JSON.parse(localStorage.getItem('student') || '{}')?.id}
          userId={JSON.parse(localStorage.getItem('user') || '{}')?.id}
          refreshMilestones={() => setRenderChange(true)}
        />
      )}
    </div>
  );
}

export default StudentDashboard;
