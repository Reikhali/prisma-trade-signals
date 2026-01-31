import { motion } from 'framer-motion';
import type { TradeSignal } from '@/lib/prismaAnalyzer';
import { ArrowUp, ArrowDown, Clock, Target, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface SignalCardProps {
  signal: TradeSignal;
}

export function SignalCard({ signal }: SignalCardProps) {
  const isCall = signal.type === 'CALL';
  const isPut = signal.type === 'PUT';
  const isWait = signal.type === 'AGUARDAR';
  
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`
        relative overflow-hidden rounded-2xl p-6
        ${isCall ? 'bg-gradient-to-br from-emerald-900/80 to-emerald-950/90 border-2 border-emerald-500/50' : ''}
        ${isPut ? 'bg-gradient-to-br from-red-900/80 to-red-950/90 border-2 border-red-500/50' : ''}
        ${isWait ? 'bg-gradient-to-br from-amber-900/80 to-amber-950/90 border-2 border-amber-500/50' : ''}
      `}
    >
      {/* Glow effect */}
      <div className={`
        absolute inset-0 opacity-20 blur-3xl
        ${isCall ? 'bg-emerald-500' : ''}
        ${isPut ? 'bg-red-500' : ''}
        ${isWait ? 'bg-amber-500' : ''}
      `} />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className={`
                w-16 h-16 rounded-2xl flex items-center justify-center
                ${isCall ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50' : ''}
                ${isPut ? 'bg-red-500 shadow-lg shadow-red-500/50' : ''}
                ${isWait ? 'bg-amber-500 shadow-lg shadow-amber-500/50' : ''}
              `}
            >
              {isCall && <ArrowUp className="w-10 h-10 text-white" />}
              {isPut && <ArrowDown className="w-10 h-10 text-white" />}
              {isWait && <Clock className="w-10 h-10 text-white" />}
            </motion.div>
            
            <div>
              <h2 className="text-3xl font-display font-bold text-white">
                {signal.type}
              </h2>
              <p className="text-sm text-white/60">
                {signal.timestamp.toLocaleTimeString('pt-BR')}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-4xl font-display font-bold text-white">
              {signal.score}/10
            </div>
            <p className="text-sm text-white/60">Score</p>
          </div>
        </div>
        
        {/* Confidence Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-white/60">Confiança</span>
            <span className="text-white font-semibold">{signal.confidence}%</span>
          </div>
          <div className="h-3 bg-black/30 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${signal.confidence}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`
                h-full rounded-full
                ${isCall ? 'bg-gradient-to-r from-emerald-400 to-emerald-300' : ''}
                ${isPut ? 'bg-gradient-to-r from-red-400 to-red-300' : ''}
                ${isWait ? 'bg-gradient-to-r from-amber-400 to-amber-300' : ''}
              `}
            />
          </div>
        </div>
        
        {/* Reason */}
        <div className="mb-6 p-4 bg-black/20 rounded-xl">
          <p className="text-white/90">{signal.reason}</p>
        </div>
        
        {/* Stake & Expiry */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-black/20 rounded-xl">
            <div className="flex items-center gap-2 text-white/60 text-sm mb-1">
              <Target className="w-4 h-4" />
              Stake Recomendado
            </div>
            <p className="text-xl font-semibold text-white">{signal.stake}</p>
          </div>
          <div className="p-4 bg-black/20 rounded-xl">
            <div className="flex items-center gap-2 text-white/60 text-sm mb-1">
              <Clock className="w-4 h-4" />
              Expiração
            </div>
            <p className="text-xl font-semibold text-white">{signal.expiry}</p>
          </div>
        </div>
        
        {/* Filters */}
        <div>
          <h3 className="text-sm font-semibold text-white/60 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Filtros Analisados
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {signal.filters.map((filter, index) => (
              <motion.div
                key={filter.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`
                  flex items-start gap-3 p-3 rounded-lg
                  ${filter.passed ? 'bg-emerald-500/10' : 'bg-red-500/10'}
                `}
              >
                {filter.passed ? (
                  <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white text-sm">{filter.name}</p>
                  <p className="text-xs text-white/60 truncate">{filter.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
