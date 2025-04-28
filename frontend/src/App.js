import AppLayout from "./components/AppLayout";
import { Routes, Route } from "react-router-dom";
import Task from "./components/Task";
import LandingPage from "./landingpage"; 
import { Toaster } from "react-hot-toast";
import AuthPage from './Auth';
import StudentDashboard from "./components/StudentDashboard";
import MilestonePage from "./components/MileStone";

{/*
function App() {
  console.log('render app..')
  return (
    <AppLayout>
      <Toaster
        position="top-right"
        gutter={8}
      />
      <Routes>
        <Route path="/:projectId" element={<Task />} />
        <Route path="/" element={
          <div className="flex flex-col items-center w-full pt-10">
            <img src="./image/welcome.svg" className="w-5/12" alt="" />
            <h1 className="text-lg text-gray-600">Select or create new project</h1>
          </div>
        } />
      </Routes>
    </AppLayout>
  );
}

export default App;
*/}

 function App() {
  console.log('render app..');

  return (
    <>
      <Toaster position="top-right" gutter={8} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/student-dashboard" element={
          <StudentDashboard />
        } /> 
        <Route path="/student-dashboard/:projectId" element={
            <StudentDashboard />
        } />
        <Route path="/:projectId" element={
            <StudentDashboard />
        } />
        <Route path="/milestones" element={
            <MilestonePage />
        } />
      </Routes>
    </>
  );
}

export default App; 
