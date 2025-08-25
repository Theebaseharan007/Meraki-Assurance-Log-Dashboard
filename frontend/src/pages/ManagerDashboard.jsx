import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import ManagerHome from './manager/ManagerHome';
import ManagerTeams from './manager/ManagerTeams';
import ManagerReports from './manager/ManagerReports';

const ManagerDashboard = () => {
  return (
    <DashboardLayout userRole="manager">
      <Routes>
        <Route index element={<ManagerHome />} />
        <Route path="teams" element={<ManagerTeams />} />
        <Route path="reports" element={<ManagerReports />} />
        <Route path="*" element={<ManagerHome />} />
      </Routes>
    </DashboardLayout>
  );
};

export default ManagerDashboard;
