import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Calendar, Users, Filter, BarChart3, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { format, startOfToday } from 'date-fns';

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import LoadingSpinner, { Skeleton } from '../../components/ui/LoadingSpinner';
import DatePicker from '../../components/ui/DatePicker';

// Chart Components
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

// API
import { managerAPI } from '../../services/api';
import { useToast } from '../../components/ui/Toaster';
import { formatDate, formatTime, getChartColor, capitalizeFirst } from '../../utils/format';

const ManagerHome = () => {
  const [selectedDate, setSelectedDate] = useState(startOfToday());
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedRun, setSelectedRun] = useState(null); // Track selected submission for chart
  const { success, error } = useToast();

  // Fetch teams
  const { data: teamsData, isLoading: teamsLoading } = useQuery({
    queryKey: ['manager-teams'],
    queryFn: () => managerAPI.getTeams(),
    onError: (err) => {
      error('Failed to load teams');
      console.error('Teams fetch error:', err);
    }
  });

  // Fetch runs for selected date/team
  const { data: runsData, isLoading: runsLoading, refetch: refetchRuns } = useQuery({
    queryKey: ['manager-runs', format(selectedDate, 'yyyy-MM-dd'), selectedTeam],
    queryFn: () => managerAPI.getRuns({ 
      date: format(selectedDate, 'yyyy-MM-dd'), 
      ...(selectedTeam && { team: selectedTeam })
    }),
    enabled: !!selectedDate,
    onError: (err) => {
      error('Failed to load test runs');
      console.error('Runs fetch error:', err);
    }
  });

  // Fetch dashboard summary
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ['manager-dashboard'],
    queryFn: () => managerAPI.getDashboard(),
    onError: (err) => {
      console.error('Dashboard fetch error:', err);
    }
  });

  const teams = teamsData?.data?.data?.teams || [];
  const runs = runsData?.data?.data?.runs || [];
  const aggregateData = runsData?.data?.data?.aggregateData || { statusCounts: {}, testNamesByStatus: {} };
  const dashboardStats = dashboardData?.data?.data?.summary || {};

  // Prepare team options for select
  const teamOptions = [
    { value: '', label: 'All Teams' },
    ...teams.map(team => ({
      value: team.name,
      label: `${team.name} (${team.leads.length} leads)`
    }))
  ];

  // Prepare chart data - either for selected run or aggregate
  const chartData = selectedRun 
    ? (() => {
        // Calculate status counts for the selected submission
        const statusCounts = {};
        const testNamesByStatus = {};
        
        selectedRun.sections?.forEach(section => {
          const status = section.result;
          statusCounts[status] = (statusCounts[status] || 0) + 1;
          if (!testNamesByStatus[status]) testNamesByStatus[status] = [];
          testNamesByStatus[status].push(section.name);
          
          // Count subsections too
          section.subsections?.forEach(subsection => {
            const subStatus = subsection.result;
            statusCounts[subStatus] = (statusCounts[subStatus] || 0) + 1;
            if (!testNamesByStatus[subStatus]) testNamesByStatus[subStatus] = [];
            testNamesByStatus[subStatus].push(subsection.name);
          });
        });
        
        return Object.entries(statusCounts)
          .filter(([_, count]) => count > 0)
          .map(([status, count]) => ({
            name: capitalizeFirst(status),
            value: count,
            status,
            color: getChartColor(status),
            testNames: testNamesByStatus[status] || []
          }));
      })()
    : Object.entries(aggregateData.statusCounts || {})
        .filter(([_, count]) => count > 0)
        .map(([status, count]) => ({
          name: capitalizeFirst(status),
          value: count,
          status,
          color: getChartColor(status),
          testNames: aggregateData.testNamesByStatus?.[status] || []
        }));

  // Custom tooltip for pie chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const testNames = data.payload.testNames || [];
      
      return (
        <div className="bg-popover border rounded-lg p-3 shadow-lg max-w-xs">
          <p className="font-medium">{data.name}: {data.value}</p>
          {testNames.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium mb-1">Test Cases:</p>
              <div className="text-xs space-y-1 max-h-32 overflow-y-auto">
                {testNames.slice(0, 10).map((name, index) => (
                  <p key={index} className="truncate">{name}</p>
                ))}
                {testNames.length > 10 && (
                  <p className="text-muted-foreground">... and {testNames.length - 10} more</p>
                )}
              </div>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Manager Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor team performance and test run analytics
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchRuns()}
            disabled={runsLoading}
          >
            <Clock className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {dashboardStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Teams</p>
                  <p className="text-2xl font-bold">{dashboardStats.totalTeams || 0}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Team Leads</p>
                  <p className="text-2xl font-bold">{dashboardStats.totalTeamLeads || 0}</p>
                </div>
                <Users className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Runs</p>
                  <p className="text-2xl font-bold">{dashboardStats.totalSubmissions || 0}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Date Range</p>
                  <p className="text-sm font-medium">
                    {dashboardStats.dateRange?.days || 7} days
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Date Filter */}
            <div className="flex-1">
              <DatePicker
                label="Date"
                selected={selectedDate}
                onChange={setSelectedDate}
                placeholder="Select date"
                maxDate={new Date()}
              />
            </div>
            
            {/* Team Filter */}
            <div className="flex-1">
              {teamsLoading ? (
                <div>
                  <label className="text-sm font-medium mb-2 block">Team</label>
                  <Skeleton className="h-10 w-full" />
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
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>
              {selectedRun ? `${selectedRun.testName} - Status Breakdown` : 'Status Overview'}
            </CardTitle>
            {selectedRun && (
              <p className="text-sm text-muted-foreground">
                Click another submission to change chart data
              </p>
            )}
          </CardHeader>
          <CardContent>
            {runsLoading ? (
              <div className="h-64 flex items-center justify-center">
                <LoadingSpinner />
              </div>
            ) : chartData.length > 0 ? (
              <div>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Legend */}
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium text-center mb-3">Status Legend</p>
                  <div className="grid grid-cols-2 gap-2">
                    {chartData.map((entry, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs">
                        <div 
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="truncate">{entry.name} ({entry.value})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
                <AlertCircle className="h-12 w-12 mb-4" />
                <p>No test runs found</p>
                <p className="text-sm">Try selecting a different date or team</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Run Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              Test Runs for {formatDate(selectedDate)}
              {selectedTeam && ` - ${selectedTeam}`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {runsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : runs.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {runs.map((run, index) => (
                  <motion.div
                    key={run._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedRun?._id === run._id 
                        ? 'bg-primary/10 border-primary' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedRun(selectedRun?._id === run._id ? null : run)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{run.testName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {formatTime(run.timestamp)} • {run.team} • by {run.leadId?.name}
                        </p>
                      </div>
                      <Badge status={run.status}>
                        {capitalizeFirst(run.status)}
                      </Badge>
                    </div>
                    
                    {/* Sections */}
                    <div className="space-y-2">
                      {run.sections?.map((section, sIndex) => (
                        <div key={sIndex} className="text-sm">
                          <div className="flex items-center gap-2 mb-1">

                            <span className="font-medium text-foreground">
                              {section.name}
                            </span>
                          </div>
                          {section.subsections?.length > 0 && (
                            <div className="ml-4 flex flex-wrap gap-2">
                              {section.subsections.map((subsection, subIndex) => (
                                <span 
                                  key={subIndex}
                                  className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded"
                                >
                                  {subsection.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4" />
                <p>No test runs found for the selected criteria</p>
                <p className="text-sm">Try selecting a different date or team</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManagerHome;
