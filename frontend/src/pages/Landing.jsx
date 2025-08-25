import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, Users, Shield, Zap } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Card, CardContent } from '../components/ui/Card';
import { useAuth } from '../contexts/AuthContext';

const roleOptions = [
  { value: 'manager', label: 'Manager' },
  { value: 'teamLead', label: 'Team Lead' }
];

const features = [
  {
    icon: BarChart3,
    title: 'Real-time Analytics',
    description: 'Interactive charts and dashboards with detailed test run insights'
  },
  {
    icon: Users,
    title: 'Team Management',
    description: 'Seamless collaboration between managers and team leads'
  },
  {
    icon: Shield,
    title: 'Secure & Reliable',
    description: 'Enterprise-grade security with role-based access control'
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Optimized performance with instant data synchronization'
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5 }
  }
};

const Landing = () => {
  const [selectedRole, setSelectedRole] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectPath = user.role === 'manager' ? '/manager' : '/teamlead';
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleContinue = async () => {
    if (!selectedRole) return;

    setIsLoading(true);
    
    // Simulate checking for existing user (in real app, this would be an API call)
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // For demo purposes, always redirect to signup
    // In real implementation, you'd check if user exists and redirect to login if they do
    navigate(`/signup?role=${selectedRole}`);
    
    setIsLoading(false);
  };

  const handleLoginRedirect = () => {
    if (selectedRole) {
      navigate(`/login?role=${selectedRole}`);
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Navigation */}
      <nav className="border-b bg-background/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div 
              className="flex items-center space-x-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <BarChart3 className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">TestRunner Dashboard</span>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Button 
                variant="ghost" 
                onClick={handleLoginRedirect}
                className="text-sm"
              >
                Already have an account? Sign in
              </Button>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            <motion.h1 
              variants={itemVariants}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight"
            >
              Enterprise Test Run
              <span className="text-primary block">Management</span>
            </motion.h1>
            
            <motion.p 
              variants={itemVariants}
              className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            >
              Streamline your testing workflow with real-time analytics, 
              team collaboration, and intelligent reporting. Built for scale.
            </motion.p>

            {/* Role Selection Card */}
            <motion.div 
              variants={itemVariants}
              className="max-w-md mx-auto mt-12"
            >
              <Card className="glass border-2 border-primary/20 shadow-2xl">
                <CardContent className="p-8 space-y-6">
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl font-semibold">Get Started</h2>
                    <p className="text-muted-foreground">
                      Choose your role to continue
                    </p>
                  </div>
                  
                  <Select
                    placeholder="Select your role..."
                    options={roleOptions}
                    value={selectedRole}
                    onValueChange={setSelectedRole}
                    className="w-full"
                  />
                  
                  <Button
                    onClick={handleContinue}
                    disabled={!selectedRole}
                    loading={isLoading}
                    className="w-full h-12 text-base"
                    size="lg"
                  >
                    Continue
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built with modern technologies and enterprise-grade security
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-6 text-center space-y-4">
                      <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold">{feature.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              <span className="font-semibold">TestRunner Dashboard</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 TestRunner Dashboard. Built with React & Node.js
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
