'use client';

import { motion, HTMLMotionProps, Variants } from 'framer-motion';
import * as React from 'react';

// Fade in animation
export const FadeIn: React.FC<HTMLMotionProps<'div'> & { delay?: number; duration?: number }> = ({
  children,
  delay = 0,
  duration = 0.5,
  ...props
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration, delay, ease: 'easeOut' }}
    {...props}
  >
    {children}
  </motion.div>
);

// Fade in up animation
export const FadeInUp: React.FC<HTMLMotionProps<'div'> & { delay?: number; duration?: number; distance?: number }> = ({
  children,
  delay = 0,
  duration = 0.5,
  distance = 20,
  ...props
}) => (
  <motion.div
    initial={{ opacity: 0, y: distance }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: distance }}
    transition={{ duration, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    {...props}
  >
    {children}
  </motion.div>
);

// Fade in down animation
export const FadeInDown: React.FC<HTMLMotionProps<'div'> & { delay?: number; duration?: number }> = ({
  children,
  delay = 0,
  duration = 0.5,
  ...props
}) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    {...props}
  >
    {children}
  </motion.div>
);

// Scale in animation
export const ScaleIn: React.FC<HTMLMotionProps<'div'> & { delay?: number; duration?: number }> = ({
  children,
  delay = 0,
  duration = 0.4,
  ...props
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    transition={{ duration, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    {...props}
  >
    {children}
  </motion.div>
);

// Slide in from left
export const SlideInLeft: React.FC<HTMLMotionProps<'div'> & { delay?: number; duration?: number }> = ({
  children,
  delay = 0,
  duration = 0.5,
  ...props
}) => (
  <motion.div
    initial={{ opacity: 0, x: -30 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -30 }}
    transition={{ duration, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    {...props}
  >
    {children}
  </motion.div>
);

// Slide in from right
export const SlideInRight: React.FC<HTMLMotionProps<'div'> & { delay?: number; duration?: number }> = ({
  children,
  delay = 0,
  duration = 0.5,
  ...props
}) => (
  <motion.div
    initial={{ opacity: 0, x: 30 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 30 }}
    transition={{ duration, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    {...props}
  >
    {children}
  </motion.div>
);

// Stagger container for children animations
export const StaggerContainer: React.FC<HTMLMotionProps<'div'> & { staggerDelay?: number; delayChildren?: number }> = ({
  children,
  staggerDelay = 0.1,
  delayChildren = 0,
  ...props
}) => (
  <motion.div
    initial="hidden"
    animate="visible"
    exit="hidden"
    variants={{
      visible: {
        transition: {
          staggerChildren: staggerDelay,
          delayChildren,
        },
      },
    }}
    {...props}
  >
    {children}
  </motion.div>
);

// Stagger item (child of StaggerContainer)
export const StaggerItem: React.FC<HTMLMotionProps<'div'> & { delay?: number }> = ({
  children,
  delay = 0,
  ...props
}) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { ease: [0.25, 0.46, 0.45, 0.94], duration: 0.5, delay },
      },
    }}
    {...props}
  >
    {children}
  </motion.div>
);

// Hover scale effect
export const HoverScale: React.FC<HTMLMotionProps<'div'> & { scale?: number }> = ({
  children,
  scale = 1.02,
  ...props
}) => (
  <motion.div
    whileHover={{ scale }}
    whileTap={{ scale: 0.98 }}
    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    {...props}
  >
    {children}
  </motion.div>
);

// Hover lift effect (scale + shadow)
export const HoverLift: React.FC<HTMLMotionProps<'div'>> = ({ children, className = '', ...props }) => (
  <motion.div
    className={className}
    whileHover={{ y: -4, boxShadow: '0 20px 40px -15px rgba(0,0,0,0.15)' }}
    whileTap={{ y: 0 }}
    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    {...props}
  >
    {children}
  </motion.div>
);

// Animated counter
export const AnimatedCounter: React.FC<{ value: number; duration?: number; className?: string }> = ({
  value,
  duration = 1,
  className = '',
}) => {
  const [displayValue, setDisplayValue] = React.useState(0);

  React.useEffect(() => {
    const startTime = Date.now();
    const startValue = displayValue;
    const difference = value - startValue;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
      
      setDisplayValue(Math.round(startValue + difference * easeProgress));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return <span className={className}>{displayValue}</span>;
};

// Animated text reveal (word by word)
export const TextReveal: React.FC<{ text: string; className?: string; delay?: number }> = ({
  text,
  className = '',
  delay = 0,
}) => {
  const words = text.split(' ');
  
  return (
    <motion.span className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: delay + i * 0.08,
            duration: 0.4,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className="inline-block mr-[0.25em]"
        >
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
};

// Floating animation
export const Float: React.FC<HTMLMotionProps<'div'> & { amplitude?: number; duration?: number }> = ({
  children,
  amplitude = 10,
  duration = 3,
  ...props
}) => (
  <motion.div
    animate={{
      y: [-amplitude, amplitude, -amplitude],
    }}
    transition={{
      duration,
      repeat: Infinity,
      ease: 'easeInOut',
    }}
    {...props}
  >
    {children}
  </motion.div>
);

// Pulse animation
export const Pulse: React.FC<HTMLMotionProps<'div'>> = ({ children, ...props }) => (
  <motion.div
    animate={{
      scale: [1, 1.05, 1],
      opacity: [1, 0.8, 1],
    }}
    transition={{
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    }}
    {...props}
  >
    {children}
  </motion.div>
);

// Page transition wrapper
export const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 8 }}
    transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
  >
    {children}
  </motion.div>
);

// Variants for reuse
export const fadeInUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export { motion };
