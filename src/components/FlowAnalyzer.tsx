import { motion } from 'framer-motion';
import type { FlowAnalysis, IndicatorData } from '@/lib/prismaAnalyzer';
import { TrendingUp, TrendingDown, Minus, Zap, Activity } from 'lucide-react';

interface FlowAnalyzerProps {
  flow: FlowAnalysis;
  indicators: IndicatorData;
  patterns: string[];
}

export function FlowAnalyzer({ flow, indicators, patterns }: FlowAnalyzerProps) {
  return (
    <div className="prisma-card rounded-2xl p-6 space-y-6">
      {/* Tendência Principal */}
      <div>
        <h3 className="text-lg font-display font-semibold text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-secondary" />
          Análise de Fluxo
        </h3>
        
        <div className={`
          p-4 rounded-xl flex items-center justify-between
          ${flow.trend === 'bullish' ? 'bg-emerald-500/10 border border-emerald-500/30' : ''}
          ${flow.trend === 'bearish' ? 'bg-red-500/10 border border-red-500/30' : ''}
          ${flow.trend === 'lateral' ? 'bg-amber-500/10 border border-amber-500/30' : ''}
        `}>
          <div className="flex items-center gap-3">
            {flow.trend === 'bullish' && <TrendingUp className="w-8 h-8 text-emerald-400" />}
            {flow.trend === 'bearish' && <TrendingDown className="w-8 h-8 text-red-400" />}
            {flow.trend === 'lateral' && <Minus className="w-8 h-8 text-amber-400" />}
            
            <div>
              <p className="text-lg font-semibold text-white capitalize">{flow.trend}</p>
              <p className="text-sm text-muted-foreground">Tendência Atual</p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-2xl font-display font-bold text-white">{flow.strength}%</p>
            <p className="text-sm text-muted-foreground">Força</p>
          </div>
        </div>
      </div>
      
      {/* Sequência de Velas */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
          <p className="text-3xl font-display font-bold text-emerald-400">{flow.consecutiveGreen}</p>
          <p className="text-sm text-muted-foreground">Verdes Consecutivas</p>
        </div>
        <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/20">
          <p className="text-3xl font-display font-bold text-red-400">{flow.consecutiveRed}</p>
          <p className="text-sm text-muted-foreground">Vermelhas Consecutivas</p>
        </div>
      </div>
      
      {/* Aceleração/Desaceleração */}
      <div className="flex gap-2">
        {flow.acceleration && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-2 px-3 py-2 bg-emerald-500/20 rounded-full"
          >
            <Zap className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-emerald-300">Aceleração</span>
          </motion.div>
        )}
        {flow.deceleration && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-2 px-3 py-2 bg-amber-500/20 rounded-full"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-amber-300">Desaceleração</span>
          </motion.div>
        )}
      </div>
      
      {/* Indicadores */}
      <div>
        <h4 className="text-sm font-semibold text-muted-foreground mb-3">Indicadores</h4>
        <div className="space-y-3">
          {/* Momentum */}
          <div className="p-3 bg-black/20 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-medium">Momentum</span>
              <div className="flex items-center gap-2">
                {indicators.momentum.direction === 'up' && (
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                )}
                {indicators.momentum.direction === 'down' && (
                  <TrendingDown className="w-4 h-4 text-red-400" />
                )}
                {indicators.momentum.direction === 'neutral' && (
                  <Minus className="w-4 h-4 text-gray-400" />
                )}
                <span className="text-secondary font-semibold">
                  {indicators.momentum.angle.toFixed(1)}°
                </span>
              </div>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-secondary rounded-full"
                style={{ width: `${indicators.momentum.strength}%` }}
              />
            </div>
          </div>
          
          {/* Williams */}
          <div className="p-3 bg-black/20 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-medium">Williams %R</span>
              <div className="flex items-center gap-2">
                <span className={`
                  text-xs px-2 py-0.5 rounded
                  ${indicators.williams.zone === 'overbought' ? 'bg-red-500/20 text-red-300' : ''}
                  ${indicators.williams.zone === 'oversold' ? 'bg-emerald-500/20 text-emerald-300' : ''}
                  ${indicators.williams.zone === 'neutral' ? 'bg-gray-500/20 text-gray-300' : ''}
                `}>
                  {indicators.williams.zone === 'overbought' && 'Sobrecomprado'}
                  {indicators.williams.zone === 'oversold' && 'Sobrevendido'}
                  {indicators.williams.zone === 'neutral' && 'Neutro'}
                </span>
              </div>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-secondary rounded-full"
                style={{ width: `${indicators.williams.strength}%` }}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Padrões Detectados */}
      {patterns.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-muted-foreground mb-3">Padrões Detectados</h4>
          <div className="flex flex-wrap gap-2">
            {patterns.map((pattern) => (
              <motion.span
                key={pattern}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="px-3 py-1.5 bg-primary/20 text-primary rounded-full text-sm font-medium"
              >
                {pattern}
              </motion.span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
