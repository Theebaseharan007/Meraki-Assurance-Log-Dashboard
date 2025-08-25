import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  PlusCircle, 
  FileText, 
  BarChart3, 
  Clock, 
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  Minus
} from 'lucide-react';

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import LoadingSpinner, { Skeleton } from '../../components/ui/LoadingSpinner';

// API
import { submissionAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ui/Toaster';
import { formatDate, formatTime, capitalizeFirst } from '../../utils/format';

const TeamLeadHome = () => {
  const { user } = useAuth();
  const { error } = useToast();

  // Fetch recent submissions
  const { data: submissionsData, isLoading: submissionsLoading } = useQuery({
    queryKey: ['my-submissions', { page: 1, limit: 5 }],
    queryFn: () => submissionAPI.getMine({ page: 1, limit: 5 }),
    onError: (err) => {
      error('Failed to load recent submissions');
      console.error('Submissions fetch error:', err);
    }
  });

  const submissions = submissionsData?.data?.data?.submissions || [];
  const pagination = submissionsData?.data?.data?.pagination || {};

  // Calculate stats from submissions
  const stats = React.useMemo(() => {
    const total = submissions.length;
    const passed = submissions.filter(s => s.status === 'passed').length;
    const failed = submissions.filter(s => s.status === 'failed').length;
    const errored = submissions.filter(s => s.status === 'errored').length;
    const skipped = submissions.filter(s => s.status === 'skipped').length;

    return { total, passed, failed, errored, skipped };
  }, [submissions]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'errored': return <AlertCircle className="h-4 w-4 text-purple-500" />;
      case 'skipped': return <Minus className="h-4 w-4 text-yellow-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Team Lead Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}! Manage your test submissions and track progress.
          </p>
        </div>
        
        <Link to="/teamlead/submit">
          <Button className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            New Submission
          </Button>
        </Link>
      </div>

      {/* User Info Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">{user?.name}</h2>
              <p className="text-muted-foreground">{user?.email}</p>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Team: {user?.team}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Role: Team Lead
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total Submissions</p>
              <p className="text-3xl font-bold text-primary">{pagination.totalCount || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Runs</p>
                <p className="text-2xl font-bold text-primary">{stats.total}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Successful</p>
                <p className="text-2xl font-bold text-green-600">{stats.passed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Need Attention</p>
                <p className="text-2xl font-bold text-orange-600">{stats.failed + stats.errored}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/teamlead/submit">
              <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                <PlusCircle className="h-8 w-8" />
                <span>Submit New Run</span>
              </Button>
            </Link>
            
            <Link to="/teamlead/submissions">
              <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                <FileText className="h-8 w-8" />
                <span>View All Submissions</span>
              </Button>
            </Link>
            
            <Button variant="outline" className="w-full h-24 flex flex-col gap-2" disabled>
              <BarChart3 className="h-8 w-8" />
              <span>Analytics (Coming Soon)</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Submissions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Submissions</CardTitle>
          <Link to="/teamlead/submissions">
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {submissionsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : submissions.length > 0 ? (
            <div className="space-y-3">
              {submissions.map((submission, index) => (
                <motion.div
                  key={submission._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(submission.status)}
                    <div>
                      <h3 className="font-medium">{submission.testName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(submission.timestamp)} at {formatTime(submission.timestamp)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      {submission.sections?.length || 0} sections • {
                        submission.sections?.reduce((total, section) => 
                          total + (section.subsections?.length || 0), 0
                        ) || 0
                      } tests
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4" />
              <p className="text-lg font-medium">No submissions yet</p>
              <p className="text-sm mb-4">Get started by creating your first test submission</p>
              <Link to="/teamlead/submit">
                <Button>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create First Submission
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamLeadHome;
