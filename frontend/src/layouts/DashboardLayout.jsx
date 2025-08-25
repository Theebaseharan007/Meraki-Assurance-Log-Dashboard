import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Menu, 
  X, 
  Home, 
  Users, 
  FileText, 
  Settings, 
  LogOut,
  Sun,
  Moon,
  Monitor,
  ChevronDown
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { useTheme, THEMES } from '../contexts/ThemeContext';
import { useToast } from '../components/ui/Toaster';
import { cn } from '../utils/cn';

const DashboardLayout = ({ children, userRole }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  
  const { user, logout } = useAuth();
  const { theme, setTheme, effectiveTheme } = useTheme();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const location = useLocation();



  const profileDropdownRef = useRef(null);
  const themeDropdownRef = useRef(null);

  // Navigation items based on role
  const getNavigationItems = () => {
    if (userRole === 'manager') {
      return [
        { name: 'Dashboard', href: '/manager', icon: Home },
        { name: 'Teams', href: '/manager/teams', icon: Users },
        { name: 'Reports', href: '/manager/reports', icon: FileText },
      ];
    } else {
      return [
        { name: 'Dashboard', href: '/teamlead', icon: Home },
        { name: 'Submit Run', href: '/teamlead/submit', icon: FileText },
        { name: 'My Submissions', href: '/teamlead/submissions', icon: FileText },
      ];
    }
  };

  const navigationItems = getNavigationItems();

  // Close dropdowns when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(event.target)) {
        setThemeDropdownOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setProfileDropdownOpen(false);
        setThemeDropdownOpen(false);
      }
    };

    if (profileDropdownOpen || themeDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [profileDropdownOpen, themeDropdownOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      success('Logged out successfully');
      navigate('/', { replace: true });
    } catch (err) {
      error('Failed to logout');
    }
  };

  const themeOptions = [
    { value: THEMES.LIGHT, label: 'Light', icon: Sun },
    { value: THEMES.DARK, label: 'Dark', icon: Moon },
    { value: THEMES.SYSTEM, label: 'System', icon: Monitor },
  ];

  const currentThemeOption = themeOptions.find(opt => opt.value === theme) || themeOptions[0];

  return (
    <div className="min-h-screen bg-background lg:flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : '-100%' }}
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-64 bg-card border-r transform transition-transform duration-200 ease-in-out',
          'lg:translate-x-0 lg:relative lg:z-auto',
          'flex flex-col'
        )}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <Link to="/" className="flex items-center space-x-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            <span className="text-lg font-bold">TestRunner</span>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = location.pathname === item.href || 
                           (item.href !== '/' && location.pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <IconComponent className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t space-y-2">
          <Link
            to="/settings"
            className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Link>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 lg:flex lg:flex-col">
        {/* Top Navigation */}
        <header className="bg-background border-b sticky top-0 z-30 flex-shrink-0">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Page title - could be dynamic */}
            <div className="flex-1 lg:flex-none">
              <h1 className="text-lg font-semibold capitalize">
                {userRole === 'manager' ? 'Manager Portal' : 'Team Lead Portal'}
              </h1>
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              {/* Theme Selector */}
              <div className="relative" ref={themeDropdownRef}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setThemeDropdownOpen(!themeDropdownOpen);
                  }}
                  className="flex items-center space-x-2"
                >
                  <currentThemeOption.icon className="h-4 w-4" />
                  <ChevronDown className="h-3 w-3" />
                </Button>

                {themeDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-48 bg-popover border rounded-md shadow-lg z-[60]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {themeOptions.map((option) => {
                      const IconComponent = option.icon;
                      return (
                        <button
                          key={option.value}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setTheme(option.value);
                            setThemeDropdownOpen(false);
                            success(`Theme changed to ${option.label}`);
                          }}
                          className={cn(
                            'w-full flex items-center space-x-3 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground',
                            theme === option.value && 'bg-accent text-accent-foreground'
                          )}
                        >
                          <IconComponent className="h-4 w-4" />
                          <span>{option.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Profile Dropdown */}
              <div className="relative" ref={profileDropdownRef}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setProfileDropdownOpen(!profileDropdownOpen);
                  }}
                  className="flex items-center space-x-2"
                >
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                  </div>
                  <ChevronDown className="h-3 w-3" />
                </Button>

                {profileDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-64 bg-popover border rounded-md shadow-lg z-[60]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="px-4 py-3 border-b">
                      <p className="font-medium">{user?.name}</p>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                      <p className="text-xs text-muted-foreground capitalize mt-1">
                        {user?.role === 'teamLead' ? 'Team Lead' : 'Manager'}
                        {user?.team && ` • ${user.team}`}
                      </p>
                    </div>
                    
                    <div className="py-2">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        Profile Settings
                      </Link>
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          handleLogout();
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive/10 flex items-center space-x-2"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>


    </div>
  );
};

export default DashboardLayout;
