import { motion } from 'framer-motion';

export function PrismaLogo({ size = 48 }: { size?: number }) {
  return (
    <motion.div 
      className="relative"
      style={{ width: size, height: size }}
      animate={{ rotate: 360 }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <linearGradient id="prismaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="50%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#14b8a6" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Prisma - Forma triangular com refração */}
        <motion.polygon
          points="50,5 95,85 5,85"
          fill="none"
          stroke="url(#prismaGradient)"
          strokeWidth="3"
          filter="url(#glow)"
          initial={{ opacity: 0.5 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        
        {/* Linhas internas de refração */}
        <motion.line
          x1="50" y1="5" x2="30" y2="85"
          stroke="url(#prismaGradient)"
          strokeWidth="1.5"
          opacity="0.6"
        />
        <motion.line
          x1="50" y1="5" x2="70" y2="85"
          stroke="url(#prismaGradient)"
          strokeWidth="1.5"
          opacity="0.6"
        />
        
        {/* Ponto central */}
        <motion.circle
          cx="50"
          cy="45"
          r="5"
          fill="url(#prismaGradient)"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </svg>
    </motion.div>
  );
}
