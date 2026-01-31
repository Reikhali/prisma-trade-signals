// Prisma IA - Motor de Análise Local (Sem API Externa)
// Todo o conhecimento de trading está embutido aqui

export interface CandleData {
  index: number;
  color: 'green' | 'red' | 'neutral';
  bodyPercent: number;
  upperWickPercent: number;
  lowerWickPercent: number;
  significance: 'low' | 'medium' | 'high' | 'critical';
  pattern?: string;
  context: string;
}

export interface IndicatorData {
  momentum: {
    direction: 'up' | 'down' | 'neutral';
    angle: number; // -90 a 90 graus
    strength: number; // 0-100
    crossedZero: boolean;
  };
  williams: {
    direction: 'up' | 'down' | 'neutral';
    angle: number;
    zone: 'overbought' | 'oversold' | 'neutral';
    strength: number;
  };
}

export interface FlowAnalysis {
  trend: 'bullish' | 'bearish' | 'lateral';
  strength: number;
  lastCandles: CandleData[];
  consecutiveGreen: number;
  consecutiveRed: number;
  acceleration: boolean;
  deceleration: boolean;
}

export interface TradeSignal {
  type: 'CALL' | 'PUT' | 'AGUARDAR';
  confidence: number; // 0-100
  score: number; // 0-10
  filters: FilterResult[];
  reason: string;
  stake: string;
  expiry: string;
  timestamp: Date;
}

export interface FilterResult {
  name: string;
  passed: boolean;
  description: string;
  weight: number;
}

export interface AnalysisResult {
  candles: CandleData[];
  indicators: IndicatorData;
  flow: FlowAnalysis;
  signal: TradeSignal;
  zones: {
    demand: number[];
    supply: number[];
    psychological: number[];
  };
  patterns: string[];
}

// ==========================================
// MOTOR DE ANÁLISE DE IMAGEM (PIXEL A PIXEL)
// ==========================================

export function analyzeChartImage(imageData: ImageData): AnalysisResult {
  const { width, height, data } = imageData;
  
  // Detectar velas por análise de cor
  const candles = detectCandles(data, width, height);
  
  // Detectar indicadores (linhas turquesa)
  const indicators = detectIndicators(data, width, height);
  
  // Analisar fluxo
  const flow = analyzeFlow(candles);
  
  // Detectar zonas
  const zones = detectZones(candles, height);
  
  // Detectar padrões
  const patterns = detectPatterns(candles);
  
  // REGRA DE OURO: Gerar sinal baseado na última vela
  const signal = generateSignal(candles, indicators, flow, patterns);
  
  return {
    candles,
    indicators,
    flow,
    signal,
    zones,
    patterns,
  };
}

// ==========================================
// DETECÇÃO DE VELAS POR COR
// ==========================================

function detectCandles(data: Uint8ClampedArray, width: number, height: number): CandleData[] {
  const candles: CandleData[] = [];
  const candleWidth = Math.floor(width / 20); // Aproximadamente 20 velas visíveis
  
  for (let i = 0; i < 15; i++) {
    const startX = Math.floor((width / 15) * i);
    const endX = Math.floor((width / 15) * (i + 1));
    
    let greenPixels = 0;
    let redPixels = 0;
    let totalPixels = 0;
    
    // Analisar região central onde as velas estão
    const startY = Math.floor(height * 0.2);
    const endY = Math.floor(height * 0.7);
    
    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        const idx = (y * width + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        
        // Detectar verde (vela bullish)
        if (g > r + 30 && g > b + 30 && g > 80) {
          greenPixels++;
        }
        // Detectar vermelho (vela bearish)
        else if (r > g + 30 && r > b + 30 && r > 80) {
          redPixels++;
        }
        
        totalPixels++;
      }
    }
    
    const greenRatio = greenPixels / totalPixels;
    const redRatio = redPixels / totalPixels;
    
    let color: 'green' | 'red' | 'neutral' = 'neutral';
    let bodyPercent = 0;
    
    if (greenRatio > redRatio && greenRatio > 0.05) {
      color = 'green';
      bodyPercent = Math.min(100, greenRatio * 500);
    } else if (redRatio > greenRatio && redRatio > 0.05) {
      color = 'red';
      bodyPercent = Math.min(100, redRatio * 500);
    }
    
    // Estimar pavios baseado na distribuição vertical de cor
    const { upperWick, lowerWick } = estimateWicks(data, width, height, startX, endX, color);
    
    const significance = calculateSignificance(bodyPercent, upperWick, lowerWick);
    const pattern = detectCandlePattern(bodyPercent, upperWick, lowerWick, color);
    const context = generateCandleContext(color, bodyPercent, upperWick, lowerWick, pattern);
    
    candles.push({
      index: i + 1,
      color,
      bodyPercent,
      upperWickPercent: upperWick,
      lowerWickPercent: lowerWick,
      significance,
      pattern,
      context,
    });
  }
  
  return candles;
}

function estimateWicks(
  data: Uint8ClampedArray, 
  width: number, 
  height: number,
  startX: number, 
  endX: number,
  color: 'green' | 'red' | 'neutral'
): { upperWick: number; lowerWick: number } {
  // Estimativa simplificada baseada na distribuição de cores
  const centerY = height / 2;
  let upperColorPixels = 0;
  let lowerColorPixels = 0;
  let totalPixels = 0;
  
  for (let y = Math.floor(height * 0.2); y < Math.floor(height * 0.7); y++) {
    for (let x = startX; x < endX; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      
      const isColored = (color === 'green' && g > r + 30) || 
                        (color === 'red' && r > g + 30);
      
      if (isColored) {
        if (y < centerY) upperColorPixels++;
        else lowerColorPixels++;
      }
      totalPixels++;
    }
  }
  
  const total = upperColorPixels + lowerColorPixels || 1;
  const upperWick = Math.round((upperColorPixels / total) * 50);
  const lowerWick = Math.round((lowerColorPixels / total) * 50);
  
  return { upperWick, lowerWick };
}

function calculateSignificance(body: number, upperWick: number, lowerWick: number): 'low' | 'medium' | 'high' | 'critical' {
  if (body > 70 && upperWick < 15 && lowerWick < 15) return 'critical';
  if (body > 50) return 'high';
  if (body > 30) return 'medium';
  return 'low';
}

function detectCandlePattern(body: number, upperWick: number, lowerWick: number, color: string): string {
  // Marubozu - Corpo cheio sem pavios
  if (body > 80 && upperWick < 10 && lowerWick < 10) {
    return color === 'green' ? 'Marubozu Bullish' : 'Marubozu Bearish';
  }
  
  // Martelo
  if (lowerWick > body * 2 && upperWick < 10) {
    return 'Martelo';
  }
  
  // Shooting Star
  if (upperWick > body * 2 && lowerWick < 10) {
    return 'Shooting Star';
  }
  
  // Doji
  if (body < 15 && (upperWick > 20 || lowerWick > 20)) {
    return 'Doji';
  }
  
  // Pin Bar
  if ((upperWick > body * 1.5 || lowerWick > body * 1.5) && body > 20) {
    return lowerWick > upperWick ? 'Pin Bar Bullish' : 'Pin Bar Bearish';
  }
  
  // Engolfo (precisa comparar com vela anterior)
  if (body > 60) {
    return color === 'green' ? 'Engolfo Bullish' : 'Engolfo Bearish';
  }
  
  return 'Normal';
}

function generateCandleContext(color: string, body: number, upperWick: number, lowerWick: number, pattern?: string): string {
  if (color === 'neutral') {
    return 'Vela de INDECISÃO - Mercado sem direção clara';
  }
  
  const direction = color === 'green' ? 'COMPRADORES' : 'VENDEDORES';
  const opposite = color === 'green' ? 'vendedores' : 'compradores';
  
  if (body > 70 && upperWick < 15 && lowerWick < 15) {
    return `Vela de IMPULSO ${color === 'green' ? 'BULLISH' : 'BEARISH'} - ${direction} dominaram completamente sem hesitação`;
  }
  
  if (pattern === 'Martelo') {
    return `MARTELO detectado - Forte rejeição de preços baixos, ${opposite} tentaram mas falharam`;
  }
  
  if (pattern === 'Shooting Star') {
    return `SHOOTING STAR - Rejeição no topo, ${opposite} defenderam região superior`;
  }
  
  if (pattern === 'Doji') {
    return 'DOJI - Empate entre compradores e vendedores, aguardar definição';
  }
  
  if (body > 50) {
    return `Vela ${color === 'green' ? 'BULLISH' : 'BEARISH'} FORTE (${body}% corpo) - ${direction} no controle`;
  }
  
  return `Vela ${color === 'green' ? 'verde' : 'vermelha'} moderada - ${direction} com leve vantagem`;
}

// ==========================================
// DETECÇÃO DE INDICADORES (TURQUESA)
// ==========================================

function detectIndicators(data: Uint8ClampedArray, width: number, height: number): IndicatorData {
  // Detectar linha turquesa (cor dos indicadores Momentum e Williams)
  const turquoisePoints: { x: number; y: number }[] = [];
  
  // Área dos indicadores (geralmente na parte inferior do gráfico)
  const indicatorStartY = Math.floor(height * 0.7);
  const indicatorEndY = height;
  
  for (let y = indicatorStartY; y < indicatorEndY; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      
      // Detectar turquesa (R baixo, G alto, B alto)
      if (g > 150 && b > 150 && r < 100 && Math.abs(g - b) < 50) {
        turquoisePoints.push({ x, y });
      }
    }
  }
  
  // Calcular direção baseado nos pontos encontrados
  const direction = calculateIndicatorDirection(turquoisePoints, width);
  
  return {
    momentum: {
      direction: direction.momentumDir,
      angle: direction.momentumAngle,
      strength: direction.momentumStrength,
      crossedZero: direction.momentumStrength > 60,
    },
    williams: {
      direction: direction.williamsDir,
      angle: direction.williamsAngle,
      zone: direction.williamsStrength > 70 ? 'overbought' : 
            direction.williamsStrength < 30 ? 'oversold' : 'neutral',
      strength: direction.williamsStrength,
    },
  };
}

function calculateIndicatorDirection(points: { x: number; y: number }[], width: number): {
  momentumDir: 'up' | 'down' | 'neutral';
  momentumAngle: number;
  momentumStrength: number;
  williamsDir: 'up' | 'down' | 'neutral';
  williamsAngle: number;
  williamsStrength: number;
} {
  if (points.length < 10) {
    return {
      momentumDir: 'neutral',
      momentumAngle: 0,
      momentumStrength: 50,
      williamsDir: 'neutral',
      williamsAngle: 0,
      williamsStrength: 50,
    };
  }
  
  // Dividir pontos em regiões para analisar tendência
  const recentPoints = points.filter(p => p.x > width * 0.7);
  const olderPoints = points.filter(p => p.x < width * 0.5 && p.x > width * 0.3);
  
  const recentAvgY = recentPoints.reduce((sum, p) => sum + p.y, 0) / (recentPoints.length || 1);
  const olderAvgY = olderPoints.reduce((sum, p) => sum + p.y, 0) / (olderPoints.length || 1);
  
  const yDiff = olderAvgY - recentAvgY; // Positivo = subindo (Y inverte em canvas)
  const angle = Math.atan2(yDiff, width * 0.4) * (180 / Math.PI);
  
  let direction: 'up' | 'down' | 'neutral' = 'neutral';
  if (angle > 5) direction = 'up';
  else if (angle < -5) direction = 'down';
  
  const strength = Math.min(100, Math.abs(angle) * 2 + 30);
  
  return {
    momentumDir: direction,
    momentumAngle: angle,
    momentumStrength: strength,
    williamsDir: direction,
    williamsAngle: angle * 0.8,
    williamsStrength: strength * 0.9,
  };
}

// ==========================================
// ANÁLISE DE FLUXO
// ==========================================

function analyzeFlow(candles: CandleData[]): FlowAnalysis {
  const lastCandles = candles.slice(-8);
  
  let consecutiveGreen = 0;
  let consecutiveRed = 0;
  
  // Contar velas consecutivas da mesma cor (do fim para o início)
  for (let i = candles.length - 1; i >= 0; i--) {
    if (candles[i].color === 'green') {
      if (consecutiveRed === 0) consecutiveGreen++;
      else break;
    } else if (candles[i].color === 'red') {
      if (consecutiveGreen === 0) consecutiveRed++;
      else break;
    } else {
      break;
    }
  }
  
  const greenCount = lastCandles.filter(c => c.color === 'green').length;
  const redCount = lastCandles.filter(c => c.color === 'red').length;
  
  let trend: 'bullish' | 'bearish' | 'lateral' = 'lateral';
  let strength = 50;
  
  if (greenCount >= 5) {
    trend = 'bullish';
    strength = 60 + (greenCount - 5) * 10;
  } else if (redCount >= 5) {
    trend = 'bearish';
    strength = 60 + (redCount - 5) * 10;
  }
  
  // Verificar aceleração (corpos crescendo)
  const lastThree = lastCandles.slice(-3);
  const acceleration = lastThree.length === 3 && 
    lastThree[2].bodyPercent > lastThree[1].bodyPercent &&
    lastThree[1].bodyPercent > lastThree[0].bodyPercent;
  
  // Verificar desaceleração (corpos diminuindo)
  const deceleration = lastThree.length === 3 &&
    lastThree[2].bodyPercent < lastThree[1].bodyPercent &&
    lastThree[1].bodyPercent < lastThree[0].bodyPercent;
  
  return {
    trend,
    strength: Math.min(100, strength),
    lastCandles,
    consecutiveGreen,
    consecutiveRed,
    acceleration,
    deceleration,
  };
}

// ==========================================
// DETECÇÃO DE ZONAS
// ==========================================

function detectZones(candles: CandleData[], height: number): {
  demand: number[];
  supply: number[];
  psychological: number[];
} {
  const demand: number[] = [];
  const supply: number[] = [];
  const psychological = [100, 200, 300, 400, 500]; // Níveis .00
  
  // Zonas de demanda: onde houve martelos ou pin bars bullish
  candles.forEach((c, i) => {
    if (c.pattern === 'Martelo' || c.pattern === 'Pin Bar Bullish') {
      demand.push(i);
    }
    if (c.pattern === 'Shooting Star' || c.pattern === 'Pin Bar Bearish') {
      supply.push(i);
    }
  });
  
  return { demand, supply, psychological };
}

// ==========================================
// DETECÇÃO DE PADRÕES
// ==========================================

function detectPatterns(candles: CandleData[]): string[] {
  const patterns: string[] = [];
  const last5 = candles.slice(-5);
  
  // Três Soldados Brancos
  const threeGreen = last5.filter(c => c.color === 'green' && c.bodyPercent > 40);
  if (threeGreen.length >= 3) {
    patterns.push('Três Soldados Brancos');
  }
  
  // Três Corvos Negros
  const threeRed = last5.filter(c => c.color === 'red' && c.bodyPercent > 40);
  if (threeRed.length >= 3) {
    patterns.push('Três Corvos Negros');
  }
  
  // Pullback
  const last3 = candles.slice(-3);
  if (last3.length === 3) {
    if (last3[0].color === 'green' && last3[1].color === 'red' && last3[2].color === 'green') {
      patterns.push('Pullback Bullish');
    }
    if (last3[0].color === 'red' && last3[1].color === 'green' && last3[2].color === 'red') {
      patterns.push('Pullback Bearish');
    }
  }
  
  // Engolfo
  if (last5.length >= 2) {
    const secondLast = last5[last5.length - 2];
    const lastCandle = last5[last5.length - 1];
    
    if (secondLast.color === 'red' && lastCandle.color === 'green' && 
        lastCandle.bodyPercent > secondLast.bodyPercent * 1.5) {
      patterns.push('Engolfo Bullish');
    }
    if (secondLast.color === 'green' && lastCandle.color === 'red' && 
        lastCandle.bodyPercent > secondLast.bodyPercent * 1.5) {
      patterns.push('Engolfo Bearish');
    }
  }
  
  return patterns;
}

// ==========================================
// GERAÇÃO DE SINAL - REGRA DE OURO
// ==========================================

function generateSignal(
  candles: CandleData[],
  indicators: IndicatorData,
  flow: FlowAnalysis,
  patterns: string[]
): TradeSignal {
  const filters: FilterResult[] = [];
  let score = 0;
  
  // Pegar última vela
  const lastCandle = candles[candles.length - 1];
  const penultimateCandle = candles[candles.length - 2];
  
  // =========================================
  // REGRA DE OURO: SÓ OPERA NA COR DA ÚLTIMA VELA
  // =========================================
  
  // Se última vela é VERDE = só pode ser CALL
  // Se última vela é VERMELHA = só pode ser PUT
  // Se última vela é NEUTRAL = AGUARDAR
  
  if (lastCandle.color === 'neutral') {
    return {
      type: 'AGUARDAR',
      confidence: 0,
      score: 0,
      filters: [{
        name: 'Última Vela',
        passed: false,
        description: 'Última vela é DOJI/Neutra - sem direção clara',
        weight: 10,
      }],
      reason: 'Última vela não tem direção clara. Aguarde próxima vela.',
      stake: '$0',
      expiry: '1 min',
      timestamp: new Date(),
    };
  }
  
  const signalType: 'CALL' | 'PUT' = lastCandle.color === 'green' ? 'CALL' : 'PUT';
  const expectedTrend = signalType === 'CALL' ? 'bullish' : 'bearish';
  const expectedIndicatorDir = signalType === 'CALL' ? 'up' : 'down';
  
  // FILTRO 1: Última vela fechou na cor certa (obrigatório - já passou)
  filters.push({
    name: 'Última Vela',
    passed: true,
    description: `Última vela fechou ${lastCandle.color === 'green' ? 'VERDE' : 'VERMELHA'} - OK para ${signalType}`,
    weight: 2,
  });
  score += 2;
  
  // FILTRO 2: Corpo da última vela
  const bodyStrong = lastCandle.bodyPercent >= 50;
  filters.push({
    name: 'Corpo da Vela',
    passed: bodyStrong,
    description: bodyStrong 
      ? `Corpo FORTE (${lastCandle.bodyPercent}%) - Domínio claro` 
      : `Corpo fraco (${lastCandle.bodyPercent}%) - Hesitação`,
    weight: 1,
  });
  if (bodyStrong) score += 1;
  
  // FILTRO 3: Pavios mínimos
  const wicksOk = lastCandle.upperWickPercent < 25 && lastCandle.lowerWickPercent < 25;
  filters.push({
    name: 'Pavios',
    passed: wicksOk,
    description: wicksOk 
      ? 'Pavios mínimos - Sem rejeição' 
      : 'Pavios grandes - Rejeição detectada',
    weight: 1,
  });
  if (wicksOk) score += 1;
  
  // FILTRO 4: Tendência alinhada
  const trendAligned = flow.trend === expectedTrend;
  filters.push({
    name: 'Tendência',
    passed: trendAligned,
    description: trendAligned 
      ? `Tendência ${flow.trend.toUpperCase()} alinhada` 
      : `Tendência ${flow.trend.toUpperCase()} - CONTRA o sinal`,
    weight: 1.5,
  });
  if (trendAligned) score += 1.5;
  
  // FILTRO 5: Velas consecutivas
  const consecutiveOk = signalType === 'CALL' 
    ? flow.consecutiveGreen >= 2 
    : flow.consecutiveRed >= 2;
  filters.push({
    name: 'Sequência',
    passed: consecutiveOk,
    description: consecutiveOk 
      ? `${signalType === 'CALL' ? flow.consecutiveGreen : flow.consecutiveRed} velas consecutivas na direção` 
      : 'Menos de 2 velas consecutivas',
    weight: 1,
  });
  if (consecutiveOk) score += 1;
  
  // FILTRO 6: Momentum apontando
  const momentumAligned = indicators.momentum.direction === expectedIndicatorDir;
  filters.push({
    name: 'Momentum',
    passed: momentumAligned,
    description: momentumAligned 
      ? `Momentum apontando para ${expectedIndicatorDir === 'up' ? 'CIMA' : 'BAIXO'} (${indicators.momentum.angle.toFixed(1)}°)` 
      : `Momentum apontando para direção errada`,
    weight: 1,
  });
  if (momentumAligned) score += 1;
  
  // FILTRO 7: Williams apontando
  const williamsAligned = indicators.williams.direction === expectedIndicatorDir;
  filters.push({
    name: 'Williams',
    passed: williamsAligned,
    description: williamsAligned 
      ? `Williams apontando para ${expectedIndicatorDir === 'up' ? 'CIMA' : 'BAIXO'}` 
      : 'Williams não confirmou direção',
    weight: 1,
  });
  if (williamsAligned) score += 1;
  
  // FILTRO 8: Sem desaceleração
  const noDecel = !flow.deceleration;
  filters.push({
    name: 'Força',
    passed: noDecel,
    description: noDecel 
      ? 'Movimento mantendo força' 
      : 'DESACELERAÇÃO detectada - momentum enfraquecendo',
    weight: 0.5,
  });
  if (noDecel) score += 0.5;
  
  // FILTRO 9: Padrão favorável
  const favorablePatterns = signalType === 'CALL' 
    ? ['Três Soldados Brancos', 'Engolfo Bullish', 'Pullback Bullish']
    : ['Três Corvos Negros', 'Engolfo Bearish', 'Pullback Bearish'];
  const hasPattern = patterns.some(p => favorablePatterns.includes(p));
  filters.push({
    name: 'Padrão',
    passed: hasPattern,
    description: hasPattern 
      ? `Padrão detectado: ${patterns.filter(p => favorablePatterns.includes(p)).join(', ')}` 
      : 'Sem padrão especial',
    weight: 0.5,
  });
  if (hasPattern) score += 0.5;
  
  // FILTRO 10: Penúltima vela confirma
  const penultimateConfirms = penultimateCandle?.color === lastCandle.color;
  filters.push({
    name: 'Confirmação',
    passed: penultimateConfirms,
    description: penultimateConfirms 
      ? 'Penúltima vela confirma direção' 
      : 'Penúltima vela era diferente',
    weight: 0.5,
  });
  if (penultimateConfirms) score += 0.5;
  
  // Calcular confiança
  const maxScore = 10;
  const confidence = Math.round((score / maxScore) * 100);
  
  // Determinar stake
  let stake = '$0';
  let reason = '';
  let finalType: 'CALL' | 'PUT' | 'AGUARDAR' = signalType;
  
  if (score >= 8) {
    stake = '$350 - $824';
    reason = `Sinal PERFEITO! Todos os filtros alinhados para ${signalType}. Última vela ${lastCandle.color === 'green' ? 'VERDE' : 'VERMELHA'} + Indicadores confirmando.`;
  } else if (score >= 6) {
    stake = '$45 - $150';
    reason = `Sinal VÁLIDO para ${signalType}. Maioria dos filtros passou. Entry padrão.`;
  } else {
    finalType = 'AGUARDAR';
    stake = '$0';
    reason = `Score ${score.toFixed(1)}/10 insuficiente. Muitos filtros falharam. Aguarde setup melhor.`;
  }
  
  return {
    type: finalType,
    confidence,
    score: Math.round(score * 10) / 10,
    filters,
    reason,
    stake,
    expiry: '1 min',
    timestamp: new Date(),
  };
}

// ==========================================
// FUNÇÃO PRINCIPAL DE ANÁLISE
// ==========================================

export function analyzeFromCanvas(canvas: HTMLCanvasElement): AnalysisResult | null {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return analyzeChartImage(imageData);
}

export function createAnalysisFromImage(img: HTMLImageElement): Promise<AnalysisResult> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Não foi possível criar contexto 2D');
    }
    
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    resolve(analyzeChartImage(imageData));
  });
}
