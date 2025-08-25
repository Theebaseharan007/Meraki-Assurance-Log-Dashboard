import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, Download, Calendar, Filter } from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

// API
import { managerAPI } from '../../services/api';
import { useToast } from '../../components/ui/Toaster';
import { formatDate } from '../../utils/format';

const ManagerReports = () => {
  const navigate = useNavigate();
  const { error } = useToast();
  
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [selectedTeam, setSelectedTeam] = useState('');

  // Fetch teams for filter
  const { data: teamsData, isLoading: teamsLoading } = useQuery({
    queryKey: ['manager-teams'],
    queryFn: () => managerAPI.getTeams(),
    onError: (err) => {
      error('Failed to load teams');
      console.error('Teams fetch error:', err);
    }
  });

  const teams = teamsData?.data?.data?.teams || [];
  
  const teamOptions = [
    { value: '', label: 'All Teams' },
    ...teams.map(team => ({
      value: team.name,
      label: team.name
    }))
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/manager')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Generate and download detailed reports for your teams
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Month</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="input w-full"
              />
            </div>
            
            <div>
              {teamsLoading ? (
                <div>
                  <label className="text-sm font-medium mb-2 block">Team</label>
                  <div className="input bg-muted animate-pulse h-10"></div>
                </div>
              ) : (
                <Select
                  label="Team"
                  placeholder="Select team..."
                  options={teamOptions}
                  value={selectedTeam}
                  onValueChange={setSelectedTeam}
                />
              )}
            </div>
            
            <div className="flex items-end">
              <Button className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-lg font-medium mb-2">Monthly Summary</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Comprehensive overview of all test runs and results for the selected month
              </p>
              <Button variant="outline" size="sm">
                Generate
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <h3 className="text-lg font-medium mb-2">Daily Breakdown</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Day-by-day analysis of test execution and failure rates
              </p>
              <Button variant="outline" size="sm">
                Generate
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-blue-500" />
              <h3 className="text-lg font-medium mb-2">Team Performance</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Individual team analysis and performance metrics
              </p>
              <Button variant="outline" size="sm">
                Generate
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Coming Soon Notice */}
      <Card>
        <CardContent className="p-8 text-center">
          <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-medium mb-2">Advanced Reports Coming Soon</h3>
          <p className="text-muted-foreground">
            We're working on advanced reporting features including PDF exports, 
            custom date ranges, and detailed analytics. Stay tuned for updates!
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManagerReports;
