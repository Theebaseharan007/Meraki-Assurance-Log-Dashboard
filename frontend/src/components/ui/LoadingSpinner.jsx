import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

const LoadingSpinner = ({ 
  size = 'default', 
  className,
  fullScreen = false,
  text = 'Loading...' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    default: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const spinner = (
    <div className={cn('flex flex-col items-center justify-center space-y-4', className)}>
      <motion.div
        className={cn(
          'border-2 border-muted border-t-primary rounded-full',
          sizeClasses[size]
        )}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear'
        }}
      />
      {text && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm text-muted-foreground"
        >
          {text}
        </motion.p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

// Skeleton loader component
export const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={cn('skeleton', className)}
      {...props}
    />
  );
};

// Multiple skeleton items for lists
export const SkeletonList = ({ count = 3, itemClassName, containerClassName }) => {
  return (
    <div className={cn('space-y-4', containerClassName)}>
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton 
          key={index} 
          className={cn('h-20 w-full', itemClassName)} 
        />
      ))}
    </div>
  );
};

export default LoadingSpinner;
