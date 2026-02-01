import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface JellyButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'cyan';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  icon?: ReactNode;
}

const springConfig = {
  stiffness: 300,
  damping: 20,
};

const variants = {
  primary: 'bg-gradient-forest text-primary-foreground shadow-neon shadow-purple',
  secondary: 'bg-gradient-purple text-secondary-foreground shadow-purple',
  cyan: 'bg-gradient-neon text-accent-foreground shadow-cyan',
  ghost: 'bg-muted/30 text-foreground border border-border hover:bg-muted/50 backdrop-blur-xl',
};

const sizes = {
  sm: 'px-5 py-2.5 text-sm',
  md: 'px-7 py-3.5 text-base',
  lg: 'px-10 py-5 text-lg',
};

const JellyButton = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  icon,
}: JellyButtonProps) => {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative overflow-hidden font-display font-semibold
        rounded-jelly
        transition-shadow duration-300
        ${variants[variant]}
        ${sizes[size]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={springConfig}
    >
      {/* Shine effect */}
      <motion.div
        className="absolute inset-0 opacity-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"
        initial={{ x: '-100%' }}
        whileHover={{ x: '100%', opacity: 1 }}
        transition={{ duration: 0.6 }}
      />
      
      {/* Inner glow */}
      <div className="absolute inset-0 rounded-jelly opacity-50 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
      
      {/* Content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {icon && <span className="text-xl">{icon}</span>}
        {children}
      </span>
    </motion.button>
  );
};

export default JellyButton;
