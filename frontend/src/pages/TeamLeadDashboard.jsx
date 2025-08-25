import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import TeamLeadHome from './teamlead/TeamLeadHome';
import SubmitRun from './teamlead/SubmitRun';
import MySubmissions from './teamlead/MySubmissions';

const TeamLeadDashboard = () => {
  return (
    <DashboardLayout userRole="teamLead">
      <Routes>
        <Route index element={<TeamLeadHome />} />
        <Route path="submit" element={<SubmitRun />} />
        <Route path="submissions" element={<MySubmissions />} />
        <Route path="submissions/:id/edit" element={<SubmitRun />} />
        <Route path="*" element={<TeamLeadHome />} />
      </Routes>
    </DashboardLayout>
  );
};

export default TeamLeadDashboard;
