// Updated StudentDashboard.js with Progress Bars on Cards

import React, { useEffect, useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { useNavigate } from "react-router";
import axios from "axios";
import toast from "react-hot-toast";
import AddMilestoneModal from "./AddMilestoneModal";
import { FaPen, FaTrash } from "react-icons/fa";

const FIXED_COLUMNS = {
  Planned: "Planned",
  InProgress: "In Progress",
  PendingApproval: "Pending Approval",
  Completed: "Completed",
};

const PROGRESS_BY_STATUS = {
  Planned: { percent: 10, color: "#a78bfa" }, // Light Purple
  InProgress: { percent: 50, color: "#6366f1" }, // Indigo
  PendingApproval: { percent: 80, color: "#f59e0b" }, // Orange
  Completed: { percent: 100, color: "#22c55e" }, // Green
};

const onDragEnd = (result, columns, setColumns) => {
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
};

function StudentDashboard() {
  const navigate = useNavigate();
  const [columns, setColumns] = useState({});
  const [isAddMilestoneModalOpen, setAddMilestoneModalOpen] = useState(false);
  const [milestoneToEdit, setMilestoneToEdit] = useState(null);
  const [isRenderChange, setRenderChange] = useState(false);

  useEffect(() => {
    fetchMilestones();
  }, [isAddMilestoneModalOpen, isRenderChange]);

  const fetchMilestones = async () => {
    const storedStudent = JSON.parse(localStorage.getItem("student") || "{}");
    if (storedStudent.id) {
      try {
        const response = await axios.get(`http://localhost:9000/api/milestones/student/${storedStudent.id}`);
        const milestoneData = response.data;

        const newColumns = {};
        Object.entries(FIXED_COLUMNS).forEach(([key, name]) => {
          newColumns[key] = {
            name,
            items: milestoneData.filter(m => m.status === key),
          };
        });

        setColumns(newColumns);
      } catch (error) {
        toast.error("Failed to load milestones");
      }
    }
  };

  const handleEdit = (milestone) => {
    setMilestoneToEdit(milestone);
    setAddMilestoneModalOpen(true);
  };

  const handleDelete = async (milestoneId) => {
    try {
      await axios.delete(`http://localhost:9000/api/milestones/${milestoneId}`);
      toast.success("Milestone deleted");
      setRenderChange(prev => !prev);
    } catch (error) {
      toast.error("Failed to delete milestone");
    }
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-50 border-r border-gray-200 px-4 py-6">
        <div className="text-indigo-600 font-bold text-xl mb-8">PhDTracker</div>
        <div className="space-y-4">
          <div className="text-sm text-gray-700 font-medium">Student Profile</div>
          <ul className="space-y-2 mt-2">
            <li className="text-indigo-700 bg-indigo-100 px-4 py-2 rounded-md">Home</li>
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
          <DragDropContext onDragEnd={(result) => onDragEnd(result, columns, setColumns)}>
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
                                <div className="flex flex-col space-y-1">
                                  <h3 className="font-semibold text-gray-800 text-sm">{item.title}</h3>
                                  <div className="text-xs text-gray-500">
                                    {item.dueDate ? (
                                      <>
                                        {new Date(item.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}<br />
                                        {new Date(item.dueDate).toLocaleDateString()}
                                      </>
                                    ) : "No Due Date"}
                                  </div>
                                  {/* Progress Bar */}
                                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden mt-2">
                                    <div className="h-full rounded-full" style={{ width: `${PROGRESS_BY_STATUS[item.status]?.percent || 0}%`, backgroundColor: PROGRESS_BY_STATUS[item.status]?.color || '#ccc' }}></div>
                                  </div>
                                  <div className="flex justify-around mt-2 text-gray-500">
                                    <FaPen className="cursor-pointer hover:text-indigo-600" size={14} onClick={() => handleEdit(item)} />
                                    <FaTrash className="cursor-pointer hover:text-red-500" size={14} onClick={() => handleDelete(item._id)} />
                                  </div>
                                </div>
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
        </main>
      </div>

      {isAddMilestoneModalOpen && (
        <AddMilestoneModal
          isOpen={isAddMilestoneModalOpen}
          onClose={() => {
            setAddMilestoneModalOpen(false);
            setMilestoneToEdit(null);
          }}
          studentId={JSON.parse(localStorage.getItem('student') || '{}')?.id}
          userId={JSON.parse(localStorage.getItem('user') || '{}')?.id}
          refreshMilestones={() => setRenderChange(prev => !prev)}
          milestoneToEdit={milestoneToEdit}
        />
      )}
    </div>
  );
}

export default StudentDashboard;
