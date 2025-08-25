import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, Mail, User } from 'lucide-react';

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import LoadingSpinner, { Skeleton } from '../../components/ui/LoadingSpinner';

// API
import { managerAPI } from '../../services/api';
import { useToast } from '../../components/ui/Toaster';

const ManagerTeams = () => {
  const navigate = useNavigate();
  const { error } = useToast();

  // Fetch teams
  const { data: teamsData, isLoading } = useQuery({
    queryKey: ['manager-teams'],
    queryFn: () => managerAPI.getTeams(),
    onError: (err) => {
      error('Failed to load teams');
      console.error('Teams fetch error:', err);
    }
  });

  const teams = teamsData?.data?.data?.teams || [];

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
          <h1 className="text-3xl font-bold">Teams Overview</h1>
          <p className="text-muted-foreground">
            Manage and view all teams under your supervision
          </p>
        </div>
      </div>

      {/* Teams Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : teams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team, index) => (
            <motion.div
              key={team.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    {team.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Team Leads:</span>
                      <span className="font-medium">{team.leads.length}</span>
                    </div>
                    
                    {team.leads.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Team Leads:</p>
                        {team.leads.map((lead, leadIndex) => (
                          <div key={leadIndex} className="flex items-center gap-2 text-sm bg-muted/50 p-2 rounded">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div className="flex-1">
                              <p className="font-medium">{lead.name}</p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {lead.email}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No Teams Found</h3>
            <p className="text-muted-foreground">
              No teams are currently assigned to you. Team leads will appear here once they are assigned.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ManagerTeams;
