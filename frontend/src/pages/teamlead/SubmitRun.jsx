import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Save, 
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  Minus,
  Calendar
} from 'lucide-react';

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import DateTimePicker from '../../components/ui/DateTimePicker';

// API
import { submissionAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ui/Toaster';

const statusOptions = [
  { value: 'passed', label: 'Passed' },
  { value: 'failed', label: 'Failed' },
  { value: 'skipped', label: 'Skipped' },
  { value: 'errored', label: 'Errored' }
];

const getStatusIcon = (status) => {
  switch (status) {
    case 'passed': return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
    case 'errored': return <AlertCircle className="h-4 w-4 text-purple-500" />;
    case 'skipped': return <Minus className="h-4 w-4 text-yellow-500" />;
    default: return null;
  }
};

const SubmitRun = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id: submissionId } = useParams();
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  
  const isEditing = Boolean(submissionId);

  const [formData, setFormData] = useState({
    team: user?.team || '',
    testName: '',
    description: '',
    timestamp: new Date(), // Default to today as Date object
    sections: [
      {
        id: Math.random().toString(36).substr(2, 9),
        name: '',
        result: 'passed',
        subsections: []
      }
    ]
  });

  const [errors, setErrors] = useState({});

  // Fetch submission data when editing
  const { data: submissionData, isLoading: isLoadingSubmission } = useQuery({
    queryKey: ['submission', submissionId],
    queryFn: () => submissionAPI.getById(submissionId),
    enabled: isEditing && !!submissionId,
  });

  // Pre-populate form when submission data is loaded
  useEffect(() => {
    if (submissionData?.data?.data?.submission && isEditing) {
      const submission = submissionData.data.data.submission;
      console.log('Loading submission data:', submission); // Debug log
      
      setFormData({
        team: submission.team || '',
        testName: submission.testName || '',
        description: submission.description || '',
        timestamp: submission.timestamp ? new Date(submission.timestamp) : new Date(),
        sections: submission.sections?.map(section => ({
          id: Math.random().toString(36).substr(2, 9),
          name: section.name || '',
          result: section.result || 'passed',
          subsections: section.subsections?.map(subsection => ({
            id: Math.random().toString(36).substr(2, 9),
            name: subsection.name || '',
            result: subsection.result || 'passed'
          })) || []
        })) || [
          {
            id: Math.random().toString(36).substr(2, 9),
            name: '',
            result: 'passed',
            subsections: []
          }
        ]
      });
    }
  }, [submissionData, isEditing]);

  // Handle submission loading error
  useEffect(() => {
    if (submissionData === undefined && isEditing && !isLoadingSubmission) {
      error('Failed to load submission data');
    }
  }, [submissionData, isEditing, isLoadingSubmission, error]);

  // Create submission mutation
  const createSubmissionMutation = useMutation({
    mutationFn: submissionAPI.create,
    onSuccess: (response) => {
      success('Test run submitted successfully!');
      queryClient.invalidateQueries(['my-submissions']);
      navigate('/teamlead/submissions');
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || 'Failed to submit test run';
      error(errorMessage);
      
      if (err.response?.data?.errors) {
        const fieldErrors = {};
        err.response.data.errors.forEach(e => {
          fieldErrors[e.field] = e.message;
        });
        setErrors(fieldErrors);
      }
    }
  });

  // Update submission mutation
  const updateSubmissionMutation = useMutation({
    mutationFn: (data) => submissionAPI.update(submissionId, data),
    onSuccess: (response) => {
      success('Test run updated successfully!');
      queryClient.invalidateQueries(['my-submissions']);
      queryClient.invalidateQueries(['submission', submissionId]);
      navigate('/teamlead/submissions');
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || 'Failed to update test run';
      error(errorMessage);
      
      if (err.response?.data?.errors) {
        const fieldErrors = {};
        err.response.data.errors.forEach(e => {
          fieldErrors[e.field] = e.message;
        });
        setErrors(fieldErrors);
      }
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    
    if (!formData.testName.trim()) {
      newErrors.testName = 'Test name is required';
    }
    
    if (!formData.team.trim()) {
      newErrors.team = 'Team name is required';
    }

    if (!formData.timestamp || !(formData.timestamp instanceof Date)) {
      newErrors.timestamp = 'Test date is required';
    }
    
    if (formData.sections.length === 0) {
      newErrors.sections = 'At least one section is required';
    }
    
    formData.sections.forEach((section, sIndex) => {
      if (!section.name.trim()) {
        newErrors[`section_${sIndex}_name`] = 'Section name is required';
      }
      
      section.subsections.forEach((subsection, subIndex) => {
        if (!subsection.name.trim()) {
          newErrors[`subsection_${sIndex}_${subIndex}_name`] = 'Subsection name is required';
        }
      });
    });
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Clean up the data before submission
    const submissionData = {
      team: formData.team.trim(),
      testName: formData.testName.trim(),
      description: formData.description.trim(),
      timestamp: formData.timestamp.toISOString(), // Convert Date to ISO string
      sections: formData.sections.map(section => ({
        name: section.name.trim(),
        result: section.result,
        subsections: section.subsections.map(subsection => ({
          name: subsection.name.trim(),
          result: subsection.result
        }))
      }))
    };

    if (isEditing) {
      updateSubmissionMutation.mutate(submissionData);
    } else {
      createSubmissionMutation.mutate(submissionData);
    }
  };

  const addSection = () => {
    setFormData(prev => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          id: Math.random().toString(36).substr(2, 9),
          name: '',
          result: 'passed',
          subsections: []
        }
      ]
    }));
  };

  const removeSection = (sectionIndex) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.filter((_, index) => index !== sectionIndex)
    }));
  };

  const updateSection = (sectionIndex, field, value) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map((section, index) => 
        index === sectionIndex ? { ...section, [field]: value } : section
      )
    }));
    
    // Clear error for this field
    const errorKey = `section_${sectionIndex}_${field}`;
    if (errors[errorKey]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const addSubsection = (sectionIndex) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map((section, index) => 
        index === sectionIndex 
          ? {
              ...section,
              subsections: [
                ...section.subsections,
                {
                  id: Math.random().toString(36).substr(2, 9),
                  name: '',
                  result: 'passed'
                }
              ]
            }
          : section
      )
    }));
  };

  const removeSubsection = (sectionIndex, subsectionIndex) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map((section, index) => 
        index === sectionIndex 
          ? {
              ...section,
              subsections: section.subsections.filter((_, subIndex) => subIndex !== subsectionIndex)
            }
          : section
      )
    }));
  };

  const updateSubsection = (sectionIndex, subsectionIndex, field, value) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map((section, sIndex) => 
        sIndex === sectionIndex 
          ? {
              ...section,
              subsections: section.subsections.map((subsection, subIndex) => 
                subIndex === subsectionIndex ? { ...subsection, [field]: value } : subsection
              )
            }
          : section
      )
    }));
    
    // Clear error for this field
    const errorKey = `subsection_${sectionIndex}_${subsectionIndex}_${field}`;
    if (errors[errorKey]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  // Show loading state when editing and data is still loading
  if (isEditing && isLoadingSubmission) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner className="h-8 w-8" />
          <span className="ml-3 text-lg">Loading submission data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(isEditing ? '/teamlead/submissions' : '/teamlead')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {isEditing ? 'Back to Submissions' : 'Back to Dashboard'}
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {isEditing ? 'Edit Test Run' : 'Submit Test Run'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing 
              ? 'Update your test run submission with detailed results'
              : 'Create a new test run submission with detailed results'
            }
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Team Name"
                placeholder="Enter team name"
                value={formData.team}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, team: e.target.value }));
                  if (errors.team) {
                    setErrors(prev => ({ ...prev, team: undefined }));
                  }
                }}
                error={errors.team}
                required
              />
              
              <Input
                label="Test/Run Name"
                placeholder="Enter test or run name"
                value={formData.testName}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, testName: e.target.value }));
                  if (errors.testName) {
                    setErrors(prev => ({ ...prev, testName: undefined }));
                  }
                }}
                error={errors.testName}
                required
              />

              <DateTimePicker
                label="Test Date & Time"
                selected={formData.timestamp}
                onChange={(date) => {
                  setFormData(prev => ({ ...prev, timestamp: date }));
                  if (errors.timestamp) {
                    setErrors(prev => ({ ...prev, timestamp: undefined }));
                  }
                }}
                placeholder="Select test date and time"
                error={errors.timestamp}
                maxDate={new Date()}
                showTimeSelect={true}
                timeIntervals={15}
                dateFormat="MMM dd, yyyy h:mm aa"
              />
            </div>

            {/* Description */}
            <div className="col-span-full">
              <Textarea
                label="Description (Optional)"
                placeholder="Add any additional details about this test run..."
                value={formData.description}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, description: e.target.value }));
                  if (errors.description) {
                    setErrors(prev => ({ ...prev, description: undefined }));
                  }
                }}
                error={errors.description}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Sections */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Test Sections</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addSection}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Section
            </Button>
          </CardHeader>
          <CardContent>
            <AnimatePresence>
              {formData.sections.map((section, sectionIndex) => (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="border rounded-lg p-4 mb-4 last:mb-0"
                >
                  {/* Section Header */}
                  <div className="flex items-center gap-2 mb-4">
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                    <span className="font-medium">Section {sectionIndex + 1}</span>
                    <div className="flex-1" />
                    {formData.sections.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSection(sectionIndex)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {/* Section Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <Input
                      label="Section Name"
                      placeholder="Enter section name"
                      value={section.name}
                      onChange={(e) => updateSection(sectionIndex, 'name', e.target.value)}
                      error={errors[`section_${sectionIndex}_name`]}
                      required
                    />
                    
                    <Select
                      label="Section Result"
                      options={statusOptions}
                      value={section.result}
                      onValueChange={(value) => updateSection(sectionIndex, 'result', value)}
                    />
                  </div>

                  {/* Subsections */}
                  <div className="ml-6">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-sm">Subsections</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => addSubsection(sectionIndex)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Subsection
                      </Button>
                    </div>

                    <AnimatePresence>
                      {section.subsections.map((subsection, subsectionIndex) => (
                        <motion.div
                          key={subsection.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="flex items-end gap-2 mb-3 last:mb-0"
                        >
                          <div className="flex-1">
                            <Input
                              label={`Subsection ${subsectionIndex + 1} Name`}
                              placeholder="Enter subsection name"
                              value={subsection.name}
                              onChange={(e) => updateSubsection(sectionIndex, subsectionIndex, 'name', e.target.value)}
                              error={errors[`subsection_${sectionIndex}_${subsectionIndex}_name`]}
                              required
                            />
                          </div>
                          
                          <div className="w-40">
                            <Select
                              label="Result"
                              options={statusOptions}
                              value={subsection.result}
                              onValueChange={(value) => updateSubsection(sectionIndex, subsectionIndex, 'result', value)}
                            />
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSubsection(sectionIndex, subsectionIndex)}
                            className="text-red-500 hover:text-red-700 mb-2"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {section.subsections.length === 0 && (
                      <p className="text-sm text-muted-foreground italic">
                        No subsections added yet
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {errors.sections && (
              <p className="text-sm text-destructive">{errors.sections}</p>
            )}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(isEditing ? '/teamlead/submissions' : '/teamlead')}
            disabled={createSubmissionMutation.isLoading || updateSubmissionMutation.isLoading}
          >
            Cancel
          </Button>
          
          <Button
            type="submit"
            loading={createSubmissionMutation.isLoading || updateSubmissionMutation.isLoading}
            disabled={createSubmissionMutation.isLoading || updateSubmissionMutation.isLoading}
          >
            <Save className="h-4 w-4 mr-2" />
            {isEditing ? 'Update Test Run' : 'Submit Test Run'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SubmitRun;
