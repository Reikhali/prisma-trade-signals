import { motion } from 'framer-motion';
import type { CandleData } from '@/lib/prismaAnalyzer';

interface CandleVisualizerProps {
  candles: CandleData[];
}

export function CandleVisualizer({ candles }: CandleVisualizerProps) {
  return (
    <div className="prisma-card rounded-2xl p-6">
      <h3 className="text-lg font-display font-semibold text-white mb-4">
        Análise das Velas
      </h3>
      
      {/* Gráfico de velas */}
      <div className="flex items-end justify-center gap-1 h-40 mb-6 p-4 bg-black/20 rounded-xl">
        {candles.map((candle, index) => (
          <motion.div
            key={index}
            initial={{ height: 0 }}
            animate={{ height: `${Math.max(20, candle.bodyPercent)}%` }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            className="relative flex flex-col items-center"
            style={{ width: `${100 / candles.length - 1}%`, maxWidth: '40px' }}
          >
            {/* Pavio superior */}
            <div 
              className={`w-0.5 ${candle.color === 'green' ? 'bg-emerald-400' : candle.color === 'red' ? 'bg-red-400' : 'bg-gray-400'}`}
              style={{ height: `${candle.upperWickPercent}%` }}
            />
            
            {/* Corpo */}
            <motion.div
              className={`
                w-full rounded-sm
                ${candle.color === 'green' ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30' : ''}
                ${candle.color === 'red' ? 'bg-red-500 shadow-lg shadow-red-500/30' : ''}
                ${candle.color === 'neutral' ? 'bg-gray-500' : ''}
              `}
              style={{ 
                height: `${candle.bodyPercent}%`,
                minHeight: '8px'
              }}
            />
            
            {/* Pavio inferior */}
            <div 
              className={`w-0.5 ${candle.color === 'green' ? 'bg-emerald-400' : candle.color === 'red' ? 'bg-red-400' : 'bg-gray-400'}`}
              style={{ height: `${candle.lowerWickPercent}%` }}
            />
            
            {/* Número da vela */}
            <span className="text-[8px] text-muted-foreground mt-1">{candle.index}</span>
          </motion.div>
        ))}
      </div>
      
      {/* Lista de velas com detalhes */}
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {candles.slice(-5).reverse().map((candle) => (
          <motion.div
            key={candle.index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`
              p-3 rounded-xl border
              ${candle.color === 'green' ? 'bg-emerald-500/10 border-emerald-500/30' : ''}
              ${candle.color === 'red' ? 'bg-red-500/10 border-red-500/30' : ''}
              ${candle.color === 'neutral' ? 'bg-gray-500/10 border-gray-500/30' : ''}
            `}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-white">
                Vela {candle.index}
              </span>
              <span className={`
                text-xs px-2 py-1 rounded-full font-medium
                ${candle.significance === 'critical' ? 'bg-purple-500/20 text-purple-300' : ''}
                ${candle.significance === 'high' ? 'bg-blue-500/20 text-blue-300' : ''}
                ${candle.significance === 'medium' ? 'bg-amber-500/20 text-amber-300' : ''}
                ${candle.significance === 'low' ? 'bg-gray-500/20 text-gray-300' : ''}
              `}>
                {candle.significance.toUpperCase()}
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-xs mb-2">
              <div className="text-center p-1 bg-black/20 rounded">
                <span className="text-muted-foreground">Corpo</span>
                <p className="text-white font-semibold">{candle.bodyPercent}%</p>
              </div>
              <div className="text-center p-1 bg-black/20 rounded">
                <span className="text-muted-foreground">P. Sup</span>
                <p className="text-white font-semibold">{candle.upperWickPercent}%</p>
              </div>
              <div className="text-center p-1 bg-black/20 rounded">
                <span className="text-muted-foreground">P. Inf</span>
                <p className="text-white font-semibold">{candle.lowerWickPercent}%</p>
              </div>
            </div>
            
            {candle.pattern && candle.pattern !== 'Normal' && (
              <div className="text-xs text-secondary mb-1">
                🔍 Padrão: {candle.pattern}
              </div>
            )}
            
            <p className="text-xs text-muted-foreground">{candle.context}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
