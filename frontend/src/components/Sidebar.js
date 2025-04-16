import React, { useCallback, useEffect, useState } from 'react'
import AddProjectModal from './AddProjectModal'
import axios from 'axios'
import { Link, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'

const Sidebar = () => {

  const [isModalOpen, setModalState] = useState(false)
  const [projects, setProjects] = useState([])
  const [paramsWindow, setParamsWindow] = useState(window.location.pathname.slice(1))
  const location = useLocation();
  const isStudentDashboard = location.pathname.startsWith('/student-dashboard');
  
  const handleLocation = (e) => {
    setParamsWindow(new URL(e.currentTarget.href).pathname.slice(1))
  }

  const openModal = useCallback(() => {
    setModalState(true)
  }, [])

  const closeModal = useCallback(() => {
    setModalState(false)
  }, [])

  const projectData = () => {
    // Get current user from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id;

    if (!userId) {
      toast.error('User not authenticated');
      return;
    }

    // Fetch only the projects belonging to the current user
    axios.get(`http://localhost:9000/user/${userId}/projects`)
      .then((res) => {
        setProjects(res.data)
      })
      .catch(error => {
        toast.error('Failed to load projects');
      });
  }

  useEffect(() => {
    projectData()
    document.addEventListener('projectUpdate', ({ detail }) => {
      projectData()
    })
    return () => {
      document.removeEventListener('projectUpdate', {}, false)
    }
  }, []);

  // Determine route prefix based on current location
  const getProjectPath = (projectId) => {
    return isStudentDashboard ? `/student-dashboard/${projectId}` : `/${projectId}`;
  };

  return (
    <div className='py-5'>
      <div className="px-4 mb-3 flex items-center justify-between">
        <span className=''>Projects</span>
        <button onClick={openModal} className='bg-indigo-200 rounded-full p-[2px] focus:outline-none focus:ring focus:ring-indigo-200 focus:ring-offset-1'>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-indigo-600">
            <path fillRule="evenodd" d="M12 5.25a.75.75 0 01.75.75v5.25H18a.75.75 0 010 1.5h-5.25V18a.75.75 0 01-1.5 0v-5.25H6a.75.75 0 010-1.5h5.25V6a.75.75 0 01.75-.75z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      <ul className='border-r border-gray-300 pr-2'>
        {projects.length > 0 ? (
          projects.map((project, index) => (
            <Link key={index} to={getProjectPath(project._id)} onClick={(e) => handleLocation(e)}>
              <li className={`px-5 py-1.5 mb-1 text-gray-600 font text-sm capitalize select-none hover:text-indigo-600 rounded transition-colors hover:bg-indigo-200/80 ${paramsWindow === (isStudentDashboard ? `student-dashboard/${project._id}` : project._id) && 'text-indigo-600 bg-indigo-200/80'}`}>
                {project.title}
              </li>
            </Link>
          ))
        ) : (
          <li className="px-5 py-1.5 mb-1 text-gray-500 text-sm">
            No projects yet. Add one with the + button.
          </li>
        )}
      </ul>
      <AddProjectModal isModalOpen={isModalOpen} closeModal={closeModal} />
    </div>
  )
}

export default Sidebar