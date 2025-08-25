import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Plus,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Calendar
} from 'lucide-react';

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import LoadingSpinner, { Skeleton } from '../../components/ui/LoadingSpinner';

// API
import { submissionAPI } from '../../services/api';
import { useToast } from '../../components/ui/Toaster';
import { formatDate, formatTime, capitalizeFirst } from '../../utils/format';

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'passed', label: 'Passed' },
  { value: 'failed', label: 'Failed' },
  { value: 'skipped', label: 'Skipped' },
  { value: 'errored', label: 'Errored' }
];

const MySubmissions = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedSubmission, setExpandedSubmission] = useState(null);
  
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  // Fetch submissions
  const { data: submissionsData, isLoading, refetch } = useQuery({
    queryKey: ['my-submissions', { page: currentPage, search: searchTerm, status: statusFilter }],
    queryFn: () => submissionAPI.getMine({ 
      page: currentPage, 
      limit: 10,
      ...(searchTerm && { search: searchTerm }),
      ...(statusFilter && { status: statusFilter })
    }),
    keepPreviousData: true,
    onError: (err) => {
      error('Failed to load submissions');
      console.error('Submissions fetch error:', err);
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: submissionAPI.delete,
    onSuccess: () => {
      success('Submission deleted successfully');
      queryClient.invalidateQueries(['my-submissions']);
    },
    onError: (err) => {
      error('Failed to delete submission');
      console.error('Delete error:', err);
    }
  });

  const submissions = submissionsData?.data?.data?.submissions || [];
  const pagination = submissionsData?.data?.data?.pagination || {};

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this submission? This action cannot be undone.')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    refetch();
  };

  const toggleExpanded = (submissionId) => {
    setExpandedSubmission(expandedSubmission === submissionId ? null : submissionId);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/teamlead')}
            className="mb-2 -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">My Submissions</h1>
          <p className="text-muted-foreground">
            Manage and view all your test run submissions
          </p>
        </div>
        
        <Link to="/teamlead/submit">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Submission
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by test name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="w-full sm:w-48">
              <Select
                placeholder="Filter by status"
                options={statusOptions}
                value={statusFilter}
                onValueChange={setStatusFilter}
              />
            </div>
            
            <Button type="submit" disabled={isLoading}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Submissions List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>
              Submissions ({pagination.totalCount || 0})
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : submissions.length > 0 ? (
            <div className="space-y-4">
              {submissions.map((submission, index) => (
                <motion.div
                  key={submission._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border rounded-lg overflow-hidden"
                >
                  {/* Main Row */}
                  <div className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{submission.testName}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(submission.timestamp)}
                            </span>
                            <span>{formatTime(submission.timestamp)}</span>
                            <span>{submission.sections?.length || 0} sections</span>
                          </div>
                        </div>
                        
                        <div className="text-sm text-muted-foreground">
                          {submission.sections?.length || 0} sections • {
                            submission.sections?.reduce((total, section) => 
                              total + (section.subsections?.length || 0), 0
                            ) || 0
                          } tests
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpanded(submission._id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        <Link to={`/teamlead/submissions/${submission._id}/edit`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(submission._id)}
                          disabled={deleteMutation.isLoading}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Expanded Details */}
                  {expandedSubmission === submission._id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t bg-muted/30"
                    >
                      <div className="p-4 space-y-3">
                        <h4 className="font-medium">Test Sections:</h4>
                        {submission.sections?.map((section, sectionIndex) => (
                          <div key={sectionIndex} className="ml-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge status={section.result} className="text-xs">
                                {section.name}
                              </Badge>
                            </div>
                            
                            {section.subsections?.length > 0 && (
                              <div className="ml-4 space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">
                                  Subsections:
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {section.subsections.map((subsection, subIndex) => (
                                    <Badge 
                                      key={subIndex}
                                      status={subsection.result === 'passed' ? null : subsection.result}
                                      variant={subsection.result === 'passed' ? 'secondary' : undefined}
                                      className="text-xs"
                                    >
                                      {subsection.name}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-4" />
                <p className="text-lg font-medium">No submissions found</p>
                <p className="text-sm">
                  {searchTerm || statusFilter 
                    ? 'Try adjusting your search criteria' 
                    : 'Create your first submission to get started'
                  }
                </p>
                {!searchTerm && !statusFilter && (
                  <Link to="/teamlead/submit" className="inline-block mt-4">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Submission
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * pagination.limit) + 1} to{' '}
                {Math.min(currentPage * pagination.limit, pagination.totalCount)} of{' '}
                {pagination.totalCount} submissions
              </p>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1 || isLoading}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <span className="text-sm">
                  Page {currentPage} of {pagination.totalPages}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                  disabled={currentPage === pagination.totalPages || isLoading}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MySubmissions;
