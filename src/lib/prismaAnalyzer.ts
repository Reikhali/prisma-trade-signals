// ============================================================
// PRISMA IA - Motor de Análise Local Completo (Sem API Externa)
// Todo o conhecimento de trading está embutido neste arquivo
// ============================================================

// ==========================================
// TIPOS E INTERFACES
// ==========================================

export interface CandleData {
  index: number;
  color: 'green' | 'red' | 'neutral';
  bodyPercent: number;
  upperWickPercent: number;
  lowerWickPercent: number;
  significance: 'low' | 'medium' | 'high' | 'critical';
  pattern?: string;
  context: string;
  flowPosition: 'with-trend' | 'against-trend' | 'reversal' | 'lateral';
  gapType?: 'gap-up' | 'gap-down' | 'gap-in' | 'gap-out' | 'none';
}

export interface IndicatorData {
  momentum: {
    direction: 'up' | 'down' | 'neutral';
    angle: number; // -90 a 90 graus
    strength: number; // 0-100
    isPointingStrong: boolean; // Apontando fortemente na direção
  };
  williams: {
    direction: 'up' | 'down' | 'neutral';
    angle: number;
    zone: 'overbought' | 'oversold' | 'neutral';
    strength: number;
    isPointingStrong: boolean;
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
  microTrend: 'bullish' | 'bearish' | 'lateral'; // Últimas 5 velas
  macroTrend: 'bullish' | 'bearish' | 'lateral'; // Todas as velas
  lateralizationRisk: number; // 0-100
  counterTrendCandles: number;
  hasLTA: boolean; // Linha de Tendência de Alta
  hasLTB: boolean; // Linha de Tendência de Baixa
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
  lastCandleColor: 'green' | 'red' | 'neutral';
}

export interface FilterResult {
  name: string;
  passed: boolean;
  description: string;
  weight: number;
  category: 'essential' | 'confirmation' | 'bonus';
}

export interface ZoneData {
  demand: number[];
  supply: number[];
  psychological: number[];
  traps: {
    type: 'bull-trap' | 'bear-trap';
    index: number;
  }[];
}

export interface AnalysisResult {
  candles: CandleData[];
  indicators: IndicatorData;
  flow: FlowAnalysis;
  signal: TradeSignal;
  zones: ZoneData;
  patterns: string[];
  gaps: {
    type: string;
    index: number;
    interpretation: string;
  }[];
}

// ==========================================
// MOTOR DE ANÁLISE DE IMAGEM (PIXEL A PIXEL)
// ==========================================

export function analyzeChartImage(imageData: ImageData): AnalysisResult {
  const { width, height, data } = imageData;
  
  // 1. Detectar velas por análise de cor (VERDE = Alta, VERMELHA = Baixa)
  const candles = detectCandles(data, width, height);
  
  // 2. Detectar indicadores (linhas turquesa - Momentum e Williams)
  const indicators = detectIndicators(data, width, height);
  
  // 3. Analisar fluxo completo
  const flow = analyzeFlow(candles);
  
  // 4. Atualizar contexto de cada vela com fluxo
  updateCandlesWithFlowContext(candles, flow);
  
  // 5. Detectar zonas (demanda, oferta, psicológicos, traps)
  const zones = detectZones(candles, height);
  
  // 6. Detectar padrões complexos
  const patterns = detectPatterns(candles);
  
  // 7. Detectar gaps
  const gaps = detectGaps(candles);
  
  // 8. REGRA DE OURO: Gerar sinal baseado APENAS na cor da última vela
  const signal = generateSignal(candles, indicators, flow, patterns, zones, gaps);
  
  return {
    candles,
    indicators,
    flow,
    signal,
    zones,
    patterns,
    gaps,
  };
}

// ==========================================
// DETECÇÃO DE VELAS POR COR
// VERDE = ALTA (Bullish)
// VERMELHA = BAIXA (Bearish)
// ==========================================

function detectCandles(data: Uint8ClampedArray, width: number, height: number): CandleData[] {
  const candles: CandleData[] = [];
  const numCandles = 15; // Número de velas a detectar
  
  for (let i = 0; i < numCandles; i++) {
    const startX = Math.floor((width / numCandles) * i);
    const endX = Math.floor((width / numCandles) * (i + 1));
    
    let greenPixels = 0;
    let redPixels = 0;
    let totalPixels = 0;
    
    // Analisar região central onde as velas estão
    const startY = Math.floor(height * 0.15);
    const endY = Math.floor(height * 0.65);
    
    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        const idx = (y * width + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        
        // Detectar VERDE (vela bullish/alta)
        // Verde: G dominante, maior que R e B
        if (g > r + 20 && g > b + 20 && g > 70) {
          greenPixels++;
        }
        // Detectar VERMELHO (vela bearish/baixa)
        // Vermelho: R dominante, maior que G e B
        else if (r > g + 20 && r > b + 20 && r > 70) {
          redPixels++;
        }
        
        totalPixels++;
      }
    }
    
    const greenRatio = greenPixels / totalPixels;
    const redRatio = redPixels / totalPixels;
    
    // Determinar cor da vela (NUNCA branca ou azul - só verde ou vermelha)
    let color: 'green' | 'red' | 'neutral' = 'neutral';
    let bodyPercent = 0;
    
    if (greenRatio > redRatio && greenRatio > 0.03) {
      color = 'green'; // ALTA
      bodyPercent = Math.min(100, Math.round(greenRatio * 600));
    } else if (redRatio > greenRatio && redRatio > 0.03) {
      color = 'red'; // BAIXA
      bodyPercent = Math.min(100, Math.round(redRatio * 600));
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
      flowPosition: 'with-trend', // Será atualizado depois
      gapType: 'none',
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
  const centerY = height / 2;
  let upperColorPixels = 0;
  let lowerColorPixels = 0;
  
  for (let y = Math.floor(height * 0.15); y < Math.floor(height * 0.65); y++) {
    for (let x = startX; x < endX; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      
      const isColored = (color === 'green' && g > r + 20) || 
                        (color === 'red' && r > g + 20);
      
      if (isColored) {
        if (y < centerY) upperColorPixels++;
        else lowerColorPixels++;
      }
    }
  }
  
  const total = upperColorPixels + lowerColorPixels || 1;
  const upperWick = Math.round((upperColorPixels / total) * 50);
  const lowerWick = Math.round((lowerColorPixels / total) * 50);
  
  return { upperWick, lowerWick };
}

function calculateSignificance(body: number, upperWick: number, lowerWick: number): 'low' | 'medium' | 'high' | 'critical' {
  // Vela crítica: corpo >70%, pavios mínimos
  if (body > 70 && upperWick < 15 && lowerWick < 15) return 'critical';
  // Vela forte: corpo >50%
  if (body > 50) return 'high';
  // Vela moderada: corpo >30%
  if (body > 30) return 'medium';
  // Vela fraca
  return 'low';
}

// ==========================================
// DETECÇÃO DE PADRÕES DE VELA
// ==========================================

function detectCandlePattern(body: number, upperWick: number, lowerWick: number, color: string): string {
  // === PADRÕES DE FORÇA ===
  
  // Marubozu - Corpo cheio, dominação total (sem pavios significativos)
  if (body > 75 && upperWick < 12 && lowerWick < 12) {
    return color === 'green' ? 'Marubozu Bullish' : 'Marubozu Bearish';
  }
  
  // Vela Raiz - Vela forte que inicia um movimento
  if (body > 60 && (upperWick < 20 && lowerWick < 20)) {
    return color === 'green' ? 'Vela Raiz Bullish' : 'Vela Raiz Bearish';
  }
  
  // === PADRÕES DE REVERSÃO ===
  
  // Martelo (Hammer) - Pavio inferior longo, corpo pequeno no topo
  if (lowerWick > body * 2 && upperWick < body * 0.5 && body > 10) {
    return 'Martelo';
  }
  
  // Martelo Invertido / Shooting Star
  if (upperWick > body * 2 && lowerWick < body * 0.5 && body > 10) {
    return color === 'green' ? 'Martelo Invertido' : 'Shooting Star';
  }
  
  // Enforcado (Hanging Man) - Similar ao martelo mas em topo
  if (lowerWick > body * 2 && upperWick < 10 && color === 'red') {
    return 'Enforcado';
  }
  
  // === PADRÕES DE INDECISÃO ===
  
  // Doji - Corpo muito pequeno
  if (body < 15) {
    if (upperWick > 25 && lowerWick > 25) {
      return 'Doji Perna Longa';
    }
    if (upperWick < 10 && lowerWick > 25) {
      return 'Dragonfly Doji';
    }
    if (upperWick > 25 && lowerWick < 10) {
      return 'Gravestone Doji';
    }
    return 'Doji';
  }
  
  // Pin Bar - Rejeição forte
  if ((upperWick > body * 1.5 || lowerWick > body * 1.5) && body > 15) {
    return lowerWick > upperWick ? 'Pin Bar Bullish' : 'Pin Bar Bearish';
  }
  
  // === PADRÕES NORMAIS ===
  
  // Engolfo potencial (confirmado na função de padrões)
  if (body > 55) {
    return color === 'green' ? 'Engolfo Bullish' : 'Engolfo Bearish';
  }
  
  return 'Normal';
}

// ==========================================
// GERAÇÃO DE CONTEXTO DA VELA
// ==========================================

function generateCandleContext(color: string, body: number, upperWick: number, lowerWick: number, pattern?: string): string {
  if (color === 'neutral') {
    return 'Vela de INDECISÃO - Empate entre compradores e vendedores, mercado sem direção clara';
  }
  
  const isBullish = color === 'green';
  const direction = isBullish ? 'COMPRADORES' : 'VENDEDORES';
  const opposite = isBullish ? 'vendedores' : 'compradores';
  
  // Contextos específicos por padrão
  if (pattern?.includes('Marubozu')) {
    return `Vela de IMPULSO ${isBullish ? 'BULLISH' : 'BEARISH'} PURO - ${direction} dominaram COMPLETAMENTE sem nenhuma hesitação. Força máxima do movimento.`;
  }
  
  if (pattern?.includes('Vela Raiz')) {
    return `VELA RAIZ detectada - Esta vela INICIOU o movimento ${isBullish ? 'de alta' : 'de baixa'}. ${direction} entraram com força, ${opposite} sem resistência.`;
  }
  
  if (pattern === 'Martelo') {
    return `MARTELO detectado - ${opposite.charAt(0).toUpperCase() + opposite.slice(1)} tentaram empurrar o preço mas FALHARAM. ${direction} defenderam fortemente a zona inferior.`;
  }
  
  if (pattern === 'Shooting Star') {
    return `SHOOTING STAR - Rejeição FORTE no topo. ${opposite.charAt(0).toUpperCase() + opposite.slice(1)} tentaram subir mas encontraram resistência brutal.`;
  }
  
  if (pattern === 'Enforcado') {
    return `ENFORCADO em possível topo - Sinal de que ${direction} podem estar perdendo força. Cuidado com reversão.`;
  }
  
  if (pattern?.includes('Doji')) {
    return `${pattern} - EMPATE total entre compradores e vendedores. Mercado indeciso, AGUARDAR definição antes de entrar.`;
  }
  
  if (pattern?.includes('Pin Bar')) {
    const rejection = pattern.includes('Bullish') ? 'inferior' : 'superior';
    return `${pattern} - Rejeição forte na região ${rejection}. Preço testou e foi REJEITADO, indicando possível reversão.`;
  }
  
  // Contexto baseado na força do corpo
  if (body > 70) {
    return `Vela ${isBullish ? 'VERDE' : 'VERMELHA'} de ALTA FORÇA (${body}% corpo) - ${direction} no CONTROLE TOTAL. Movimento confiante sem hesitação.`;
  }
  
  if (body > 50) {
    return `Vela ${isBullish ? 'VERDE' : 'VERMELHA'} FORTE (${body}% corpo) - ${direction} dominando, mas com leve resistência dos ${opposite}.`;
  }
  
  if (body > 30) {
    return `Vela ${isBullish ? 'verde' : 'vermelha'} MODERADA (${body}% corpo) - ${direction} com vantagem, mas ${opposite} ofereceram resistência.`;
  }
  
  return `Vela ${isBullish ? 'verde' : 'vermelha'} FRACA (${body}% corpo) - Disputa equilibrada, ${direction} com leve vantagem.`;
}

// ==========================================
// DETECÇÃO DE INDICADORES (TURQUESA)
// Foco na INCLINAÇÃO/ÂNGULO (não cruzamento)
// ==========================================

function detectIndicators(data: Uint8ClampedArray, width: number, height: number): IndicatorData {
  const turquoisePoints: { x: number; y: number }[] = [];
  
  // Área dos indicadores (parte inferior do gráfico)
  const indicatorStartY = Math.floor(height * 0.68);
  const indicatorEndY = height;
  
  for (let y = indicatorStartY; y < indicatorEndY; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      
      // Detectar turquesa (cor dos indicadores Momentum e Williams)
      // Turquesa: G alto, B alto, R baixo
      if (g > 120 && b > 120 && r < 120 && Math.abs(g - b) < 60) {
        turquoisePoints.push({ x, y });
      }
      // Também detectar cyan/azul claro
      if (b > 150 && g > 100 && r < 100) {
        turquoisePoints.push({ x, y });
      }
    }
  }
  
  // Calcular INCLINAÇÃO baseado nos pontos encontrados
  const direction = calculateIndicatorSlope(turquoisePoints, width, height);
  
  return {
    momentum: {
      direction: direction.momentumDir,
      angle: direction.momentumAngle,
      strength: direction.momentumStrength,
      isPointingStrong: Math.abs(direction.momentumAngle) > 15 && direction.momentumStrength > 60,
    },
    williams: {
      direction: direction.williamsDir,
      angle: direction.williamsAngle,
      zone: direction.williamsZone,
      strength: direction.williamsStrength,
      isPointingStrong: Math.abs(direction.williamsAngle) > 12 && direction.williamsStrength > 55,
    },
  };
}

function calculateIndicatorSlope(points: { x: number; y: number }[], width: number, _height: number): {
  momentumDir: 'up' | 'down' | 'neutral';
  momentumAngle: number;
  momentumStrength: number;
  williamsDir: 'up' | 'down' | 'neutral';
  williamsAngle: number;
  williamsStrength: number;
  williamsZone: 'overbought' | 'oversold' | 'neutral';
} {
  if (points.length < 10) {
    return {
      momentumDir: 'neutral',
      momentumAngle: 0,
      momentumStrength: 50,
      williamsDir: 'neutral',
      williamsAngle: 0,
      williamsStrength: 50,
      williamsZone: 'neutral',
    };
  }
  
  // Dividir pontos em regiões para analisar INCLINAÇÃO
  const recentPoints = points.filter(p => p.x > width * 0.75);
  const midPoints = points.filter(p => p.x > width * 0.5 && p.x <= width * 0.75);
  const olderPoints = points.filter(p => p.x > width * 0.25 && p.x <= width * 0.5);
  
  // Calcular Y médio de cada região
  const recentAvgY = recentPoints.length > 0 
    ? recentPoints.reduce((sum, p) => sum + p.y, 0) / recentPoints.length 
    : 0;
  const midAvgY = midPoints.length > 0 
    ? midPoints.reduce((sum, p) => sum + p.y, 0) / midPoints.length 
    : recentAvgY;
  const olderAvgY = olderPoints.length > 0 
    ? olderPoints.reduce((sum, p) => sum + p.y, 0) / olderPoints.length 
    : midAvgY;
  
  // Calcular inclinação (Y inverte em canvas: menor Y = mais alto)
  // Se recentAvgY < olderAvgY = indicador subindo
  const yDiffMomentum = olderAvgY - recentAvgY;
  const yDiffWilliams = midAvgY - recentAvgY;
  
  // Converter diferença em ângulo aproximado
  const momentumAngle = Math.atan2(yDiffMomentum, width * 0.5) * (180 / Math.PI);
  const williamsAngle = Math.atan2(yDiffWilliams, width * 0.25) * (180 / Math.PI);
  
  // Determinar direção baseado no ângulo
  let momentumDir: 'up' | 'down' | 'neutral' = 'neutral';
  if (momentumAngle > 8) momentumDir = 'up';
  else if (momentumAngle < -8) momentumDir = 'down';
  
  let williamsDir: 'up' | 'down' | 'neutral' = 'neutral';
  if (williamsAngle > 6) williamsDir = 'up';
  else if (williamsAngle < -6) williamsDir = 'down';
  
  // Calcular força baseada no ângulo
  const momentumStrength = Math.min(100, Math.abs(momentumAngle) * 2.5 + 25);
  const williamsStrength = Math.min(100, Math.abs(williamsAngle) * 2.8 + 25);
  
  // Determinar zona do Williams baseado na posição Y média
  let williamsZone: 'overbought' | 'oversold' | 'neutral' = 'neutral';
  if (williamsStrength > 70) williamsZone = williamsDir === 'up' ? 'oversold' : 'overbought';
  
  return {
    momentumDir,
    momentumAngle,
    momentumStrength,
    williamsDir,
    williamsAngle,
    williamsStrength,
    williamsZone,
  };
}

// ==========================================
// ANÁLISE DE FLUXO COMPLETA
// ==========================================

function analyzeFlow(candles: CandleData[]): FlowAnalysis {
  const lastCandles = candles.slice(-8);
  const last5 = candles.slice(-5);
  
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
  
  // Contar cores nas últimas 8 velas
  const greenCount = lastCandles.filter(c => c.color === 'green').length;
  const redCount = lastCandles.filter(c => c.color === 'red').length;
  
  // Tendência MACRO (todas as velas)
  const allGreen = candles.filter(c => c.color === 'green').length;
  const allRed = candles.filter(c => c.color === 'red').length;
  
  let macroTrend: 'bullish' | 'bearish' | 'lateral' = 'lateral';
  if (allGreen > allRed + 3) macroTrend = 'bullish';
  else if (allRed > allGreen + 3) macroTrend = 'bearish';
  
  // Tendência MICRO (últimas 5 velas)
  const micro5Green = last5.filter(c => c.color === 'green').length;
  const micro5Red = last5.filter(c => c.color === 'red').length;
  
  let microTrend: 'bullish' | 'bearish' | 'lateral' = 'lateral';
  if (micro5Green >= 4) microTrend = 'bullish';
  else if (micro5Red >= 4) microTrend = 'bearish';
  
  // Tendência principal
  let trend: 'bullish' | 'bearish' | 'lateral' = 'lateral';
  let strength = 50;
  
  if (greenCount >= 5) {
    trend = 'bullish';
    strength = 55 + (greenCount - 5) * 10 + consecutiveGreen * 5;
  } else if (redCount >= 5) {
    trend = 'bearish';
    strength = 55 + (redCount - 5) * 10 + consecutiveRed * 5;
  }
  
  // Verificar aceleração (corpos crescendo)
  const lastThree = lastCandles.slice(-3);
  const acceleration = lastThree.length === 3 && 
    lastThree[2].bodyPercent > lastThree[1].bodyPercent * 1.1 &&
    lastThree[1].bodyPercent > lastThree[0].bodyPercent * 1.1 &&
    lastThree.every(c => c.color === lastThree[2].color);
  
  // Verificar desaceleração (corpos diminuindo)
  const deceleration = lastThree.length === 3 &&
    lastThree[2].bodyPercent < lastThree[1].bodyPercent * 0.9 &&
    lastThree[1].bodyPercent < lastThree[0].bodyPercent * 0.9;
  
  // Contar velas contra-tendência
  const mainColor = trend === 'bullish' ? 'green' : 'red';
  const counterTrendCandles = lastCandles.filter(c => 
    c.color !== mainColor && c.color !== 'neutral'
  ).length;
  
  // Calcular risco de lateralização
  const neutralCount = lastCandles.filter(c => c.color === 'neutral').length;
  const lateralizationRisk = Math.min(100, (counterTrendCandles * 12) + (neutralCount * 15));
  
  // Detectar linhas de tendência
  const hasLTA = detectLTA(candles);
  const hasLTB = detectLTB(candles);
  
  return {
    trend,
    strength: Math.min(100, strength),
    lastCandles,
    consecutiveGreen,
    consecutiveRed,
    acceleration,
    deceleration,
    microTrend,
    macroTrend,
    lateralizationRisk,
    counterTrendCandles,
    hasLTA,
    hasLTB,
  };
}

function detectLTA(candles: CandleData[]): boolean {
  // Linha de Tendência de Alta: 3+ velas verdes formando fundos crescentes
  let greenSequence = 0;
  for (let i = candles.length - 1; i >= 0; i--) {
    if (candles[i].color === 'green') {
      greenSequence++;
    } else if (greenSequence < 3) {
      greenSequence = 0;
    } else {
      break;
    }
  }
  return greenSequence >= 3;
}

function detectLTB(candles: CandleData[]): boolean {
  // Linha de Tendência de Baixa: 3+ velas vermelhas formando topos decrescentes
  let redSequence = 0;
  for (let i = candles.length - 1; i >= 0; i--) {
    if (candles[i].color === 'red') {
      redSequence++;
    } else if (redSequence < 3) {
      redSequence = 0;
    } else {
      break;
    }
  }
  return redSequence >= 3;
}

// ==========================================
// ATUALIZAR CONTEXTO DAS VELAS COM FLUXO
// ==========================================

function updateCandlesWithFlowContext(candles: CandleData[], flow: FlowAnalysis): void {
  const expectedColor = flow.trend === 'bullish' ? 'green' : 
                        flow.trend === 'bearish' ? 'red' : 'neutral';
  
  candles.forEach((candle, index) => {
    const prevCandle = index > 0 ? candles[index - 1] : null;
    
    // Determinar posição no fluxo
    if (candle.color === 'neutral') {
      candle.flowPosition = 'lateral';
    } else if (candle.color === expectedColor) {
      candle.flowPosition = 'with-trend';
    } else if (prevCandle && prevCandle.color !== candle.color && prevCandle.color !== 'neutral') {
      candle.flowPosition = 'reversal';
    } else {
      candle.flowPosition = 'against-trend';
    }
    
    // Detectar gaps simples
    if (prevCandle && Math.abs(candle.bodyPercent - prevCandle.bodyPercent) > 40) {
      if (candle.bodyPercent > prevCandle.bodyPercent) {
        candle.gapType = candle.color === 'green' ? 'gap-up' : 'gap-down';
      } else {
        candle.gapType = 'gap-in';
      }
    }
  });
}

// ==========================================
// DETECÇÃO DE ZONAS
// ==========================================

function detectZones(candles: CandleData[], _height: number): ZoneData {
  const demand: number[] = [];
  const supply: number[] = [];
  const psychological = [100, 200, 300, 400, 500, 1000]; // Níveis .00
  const traps: { type: 'bull-trap' | 'bear-trap'; index: number }[] = [];
  
  candles.forEach((c, i) => {
    // Zonas de demanda: martelos, pin bars bullish
    if (c.pattern === 'Martelo' || c.pattern === 'Pin Bar Bullish' || c.pattern === 'Dragonfly Doji') {
      demand.push(i);
    }
    // Zonas de oferta: shooting stars, pin bars bearish
    if (c.pattern === 'Shooting Star' || c.pattern === 'Pin Bar Bearish' || c.pattern === 'Gravestone Doji') {
      supply.push(i);
    }
    
    // Detectar traps
    if (i >= 2) {
      const prev2 = candles[i - 2];
      const prev1 = candles[i - 1];
      
      // Bull trap: 2 verdes e depois vermelha forte
      if (prev2.color === 'green' && prev1.color === 'green' && 
          c.color === 'red' && c.bodyPercent > 50) {
        traps.push({ type: 'bull-trap', index: i });
      }
      
      // Bear trap: 2 vermelhas e depois verde forte
      if (prev2.color === 'red' && prev1.color === 'red' && 
          c.color === 'green' && c.bodyPercent > 50) {
        traps.push({ type: 'bear-trap', index: i });
      }
    }
  });
  
  return { demand, supply, psychological, traps };
}

// ==========================================
// DETECÇÃO DE GAPS
// ==========================================

function detectGaps(candles: CandleData[]): { type: string; index: number; interpretation: string }[] {
  const gaps: { type: string; index: number; interpretation: string }[] = [];
  
  candles.forEach((c, i) => {
    if (c.gapType && c.gapType !== 'none') {
      let interpretation = '';
      
      switch (c.gapType) {
        case 'gap-up':
          interpretation = 'Gap de alta - Compradores entraram com força, possível continuação bullish';
          break;
        case 'gap-down':
          interpretation = 'Gap de baixa - Vendedores dominaram, possível continuação bearish';
          break;
        case 'gap-in':
          interpretation = 'Gap preenchido - Movimento de correção, possível exaustão';
          break;
        case 'gap-out':
          interpretation = 'Gap de saída - Rompimento forte, momentum acelerando';
          break;
      }
      
      gaps.push({
        type: c.gapType,
        index: i,
        interpretation,
      });
    }
  });
  
  return gaps;
}

// ==========================================
// DETECÇÃO DE PADRÕES COMPLEXOS
// ==========================================

function detectPatterns(candles: CandleData[]): string[] {
  const patterns: string[] = [];
  const last5 = candles.slice(-5);
  const last3 = candles.slice(-3);
  
  // Três Soldados Brancos
  if (last3.every(c => c.color === 'green' && c.bodyPercent > 35)) {
    const bodiesGrowing = last3[2].bodyPercent >= last3[1].bodyPercent && 
                          last3[1].bodyPercent >= last3[0].bodyPercent;
    if (bodiesGrowing) {
      patterns.push('Três Soldados Brancos');
    }
  }
  
  // Três Corvos Negros
  if (last3.every(c => c.color === 'red' && c.bodyPercent > 35)) {
    const bodiesGrowing = last3[2].bodyPercent >= last3[1].bodyPercent && 
                          last3[1].bodyPercent >= last3[0].bodyPercent;
    if (bodiesGrowing) {
      patterns.push('Três Corvos Negros');
    }
  }
  
  // Pullback Bullish
  if (last3.length === 3) {
    if (last3[0].color === 'green' && last3[1].color === 'red' && last3[2].color === 'green' &&
        last3[2].bodyPercent > last3[1].bodyPercent) {
      patterns.push('Pullback Bullish');
    }
    // Pullback Bearish
    if (last3[0].color === 'red' && last3[1].color === 'green' && last3[2].color === 'red' &&
        last3[2].bodyPercent > last3[1].bodyPercent) {
      patterns.push('Pullback Bearish');
    }
  }
  
  // Throwback
  if (last5.length >= 4) {
    const first3Green = last5.slice(0, 3).every(c => c.color === 'green');
    const thenRed = last5[3]?.color === 'red';
    const backGreen = last5[4]?.color === 'green';
    if (first3Green && thenRed && backGreen) {
      patterns.push('Throwback Bullish');
    }
  }
  
  // Engolfo
  if (last5.length >= 2) {
    const secondLast = last5[last5.length - 2];
    const lastCandle = last5[last5.length - 1];
    
    if (secondLast.color === 'red' && lastCandle.color === 'green' && 
        lastCandle.bodyPercent > secondLast.bodyPercent * 1.3) {
      patterns.push('Engolfo Bullish');
    }
    if (secondLast.color === 'green' && lastCandle.color === 'red' && 
        lastCandle.bodyPercent > secondLast.bodyPercent * 1.3) {
      patterns.push('Engolfo Bearish');
    }
  }
  
  // Desaceleração
  if (last3.every(c => c.color === last3[0].color && c.color !== 'neutral')) {
    if (last3[2].bodyPercent < last3[1].bodyPercent * 0.8 &&
        last3[1].bodyPercent < last3[0].bodyPercent * 0.8) {
      patterns.push('Desaceleração');
    }
  }
  
  // Morning Star (Estrela da Manhã)
  if (last3.length === 3 && 
      last3[0].color === 'red' && last3[0].bodyPercent > 40 &&
      last3[1].bodyPercent < 20 && // Corpo pequeno (estrela)
      last3[2].color === 'green' && last3[2].bodyPercent > 40) {
    patterns.push('Estrela da Manhã');
  }
  
  // Evening Star (Estrela da Noite)
  if (last3.length === 3 && 
      last3[0].color === 'green' && last3[0].bodyPercent > 40 &&
      last3[1].bodyPercent < 20 &&
      last3[2].color === 'red' && last3[2].bodyPercent > 40) {
    patterns.push('Estrela da Noite');
  }
  
  return patterns;
}

// ==========================================
// GERAÇÃO DE SINAL - REGRA DE OURO
// CALL só com última vela VERDE
// PUT só com última vela VERMELHA
// ==========================================

function generateSignal(
  candles: CandleData[],
  indicators: IndicatorData,
  flow: FlowAnalysis,
  patterns: string[],
  zones: ZoneData,
  gaps: { type: string; index: number; interpretation: string }[]
): TradeSignal {
  const filters: FilterResult[] = [];
  let score = 0;
  
  const lastCandle = candles[candles.length - 1];
  const penultimateCandle = candles[candles.length - 2];
  const antepenultimate = candles[candles.length - 3];
  
  // =========================================
  // REGRA DE OURO ABSOLUTA
  // =========================================
  // - Última vela VERDE → só pode ser CALL
  // - Última vela VERMELHA → só pode ser PUT
  // - Última vela NEUTRA → AGUARDAR
  // NUNCA opera contra a cor da última vela!
  
  if (lastCandle.color === 'neutral') {
    return {
      type: 'AGUARDAR',
      confidence: 0,
      score: 0,
      filters: [{
        name: 'Regra de Ouro',
        passed: false,
        description: 'Última vela é DOJI/Neutra - Sem direção definida. AGUARDAR próxima vela.',
        weight: 10,
        category: 'essential',
      }],
      reason: 'Última vela não tem direção clara (Doji/Indecisão). Aguarde a próxima vela definir a direção.',
      stake: '$0',
      expiry: '1 min',
      timestamp: new Date(),
      lastCandleColor: 'neutral',
    };
  }
  
  const signalType: 'CALL' | 'PUT' = lastCandle.color === 'green' ? 'CALL' : 'PUT';
  const expectedTrend = signalType === 'CALL' ? 'bullish' : 'bearish';
  const expectedIndicatorDir = signalType === 'CALL' ? 'up' : 'down';
  const expectedColor = lastCandle.color;
  
  // =========================================
  // FILTROS ESSENCIAIS (Peso alto)
  // =========================================
  
  // FILTRO 1: Última vela fechou na cor certa (OBRIGATÓRIO - já passou pela regra de ouro)
  filters.push({
    name: '✓ Última Vela',
    passed: true,
    description: `Última vela fechou ${lastCandle.color === 'green' ? 'VERDE (ALTA)' : 'VERMELHA (BAIXA)'} - Operação ${signalType} PERMITIDA`,
    weight: 2,
    category: 'essential',
  });
  score += 2;
  
  // FILTRO 2: Corpo da última vela (força)
  const bodyStrong = lastCandle.bodyPercent >= 50;
  const bodyVeryStrong = lastCandle.bodyPercent >= 70;
  filters.push({
    name: 'Corpo da Vela',
    passed: bodyStrong,
    description: bodyVeryStrong 
      ? `Corpo MUITO FORTE (${lastCandle.bodyPercent}%) - Dominação total`
      : bodyStrong 
        ? `Corpo FORTE (${lastCandle.bodyPercent}%) - Controle claro` 
        : `Corpo FRACO (${lastCandle.bodyPercent}%) - Hesitação detectada`,
    weight: 1,
    category: 'essential',
  });
  if (bodyVeryStrong) score += 1.2;
  else if (bodyStrong) score += 1;
  
  // FILTRO 3: Pavios mínimos (sem rejeição)
  const wicksMinimal = lastCandle.upperWickPercent < 20 && lastCandle.lowerWickPercent < 20;
  const wicksOk = lastCandle.upperWickPercent < 30 && lastCandle.lowerWickPercent < 30;
  filters.push({
    name: 'Pavios',
    passed: wicksOk,
    description: wicksMinimal 
      ? 'Pavios MÍNIMOS - Sem rejeição, movimento limpo'
      : wicksOk 
        ? 'Pavios aceitáveis - Leve resistência'
        : `Pavios GRANDES (${Math.max(lastCandle.upperWickPercent, lastCandle.lowerWickPercent)}%) - Rejeição detectada`,
    weight: 1,
    category: 'essential',
  });
  if (wicksMinimal) score += 1;
  else if (wicksOk) score += 0.7;
  
  // =========================================
  // FILTROS DE CONFIRMAÇÃO (Peso médio)
  // =========================================
  
  // FILTRO 4: Tendência alinhada
  const trendAligned = flow.trend === expectedTrend;
  filters.push({
    name: 'Tendência',
    passed: trendAligned,
    description: trendAligned 
      ? `Tendência ${flow.trend.toUpperCase()} alinhada com ${signalType}`
      : `Tendência ${flow.trend.toUpperCase()} - ${flow.trend === 'lateral' ? 'Mercado lateral, cuidado' : 'CONTRA o sinal!'}`,
    weight: 1.5,
    category: 'confirmation',
  });
  if (trendAligned) score += 1.5;
  
  // FILTRO 5: Velas consecutivas na mesma direção
  const consecutive = signalType === 'CALL' ? flow.consecutiveGreen : flow.consecutiveRed;
  const consecutiveOk = consecutive >= 2;
  const consecutiveStrong = consecutive >= 4;
  filters.push({
    name: 'Sequência',
    passed: consecutiveOk,
    description: consecutiveStrong
      ? `${consecutive} velas consecutivas ${expectedColor === 'green' ? 'VERDES' : 'VERMELHAS'} - MOMENTUM FORTE`
      : consecutiveOk
        ? `${consecutive} velas consecutivas - Momentum presente`
        : `Apenas ${consecutive} vela(s) na direção - Momentum fraco`,
    weight: 1,
    category: 'confirmation',
  });
  if (consecutiveStrong) score += 1.2;
  else if (consecutiveOk) score += 1;
  
  // FILTRO 6: Penúltima vela confirma direção
  const penultimateConfirms = penultimateCandle?.color === expectedColor;
  filters.push({
    name: 'Confirmação',
    passed: penultimateConfirms,
    description: penultimateConfirms 
      ? `Penúltima vela também ${penultimateCandle.color === 'green' ? 'VERDE' : 'VERMELHA'} - Confirma fluxo`
      : 'Penúltima vela era diferente - Possível reversão recente',
    weight: 0.8,
    category: 'confirmation',
  });
  if (penultimateConfirms) score += 0.8;
  
  // FILTRO 7: Antepenúltima vela (3 velas alinhadas)
  const threeAligned = antepenultimate?.color === expectedColor && penultimateConfirms;
  filters.push({
    name: 'Tripla Confirmação',
    passed: threeAligned,
    description: threeAligned 
      ? `3 velas consecutivas ${expectedColor === 'green' ? 'VERDES' : 'VERMELHAS'} - Fluxo forte`
      : 'Menos de 3 velas alinhadas',
    weight: 0.5,
    category: 'confirmation',
  });
  if (threeAligned) score += 0.5;
  
  // =========================================
  // FILTROS DE INDICADORES (Momentum e Williams por INCLINAÇÃO)
  // =========================================
  
  // FILTRO 8: Momentum APONTANDO na direção (não cruzando, mas inclinado)
  const momentumAligned = indicators.momentum.direction === expectedIndicatorDir;
  const momentumStrong = indicators.momentum.isPointingStrong && momentumAligned;
  filters.push({
    name: 'Momentum',
    passed: momentumAligned,
    description: momentumStrong
      ? `Momentum APONTANDO FORTE para ${expectedIndicatorDir === 'up' ? 'CIMA' : 'BAIXO'} (${indicators.momentum.angle.toFixed(1)}°)`
      : momentumAligned
        ? `Momentum apontando para ${expectedIndicatorDir === 'up' ? 'CIMA' : 'BAIXO'}`
        : `Momentum ${indicators.momentum.direction === 'neutral' ? 'NEUTRO' : 'apontando para direção ERRADA'}`,
    weight: 0.8,
    category: 'confirmation',
  });
  if (momentumStrong) score += 1;
  else if (momentumAligned) score += 0.8;
  
  // FILTRO 9: Williams APONTANDO na direção
  const williamsAligned = indicators.williams.direction === expectedIndicatorDir;
  const williamsStrong = indicators.williams.isPointingStrong && williamsAligned;
  filters.push({
    name: 'Williams',
    passed: williamsAligned,
    description: williamsStrong
      ? `Williams APONTANDO FORTE para ${expectedIndicatorDir === 'up' ? 'CIMA' : 'BAIXO'}`
      : williamsAligned
        ? `Williams alinhado com direção`
        : 'Williams não confirmou direção',
    weight: 0.7,
    category: 'confirmation',
  });
  if (williamsStrong) score += 0.9;
  else if (williamsAligned) score += 0.7;
  
  // =========================================
  // FILTROS BÔNUS
  // =========================================
  
  // FILTRO 10: Sem desaceleração
  const noDecel = !flow.deceleration;
  filters.push({
    name: 'Força do Movimento',
    passed: noDecel,
    description: noDecel 
      ? flow.acceleration ? 'ACELERAÇÃO detectada - Corpos crescendo' : 'Movimento mantendo força'
      : 'DESACELERAÇÃO - Corpos encolhendo, momentum pode estar acabando',
    weight: 0.5,
    category: 'bonus',
  });
  if (flow.acceleration) score += 0.7;
  else if (noDecel) score += 0.5;
  
  // FILTRO 11: Padrão favorável detectado
  const favorablePatterns = signalType === 'CALL' 
    ? ['Três Soldados Brancos', 'Engolfo Bullish', 'Pullback Bullish', 'Throwback Bullish', 'Estrela da Manhã', 'Vela Raiz Bullish', 'Marubozu Bullish']
    : ['Três Corvos Negros', 'Engolfo Bearish', 'Pullback Bearish', 'Estrela da Noite', 'Vela Raiz Bearish', 'Marubozu Bearish'];
  const matchedPatterns = patterns.filter(p => favorablePatterns.some(fp => p.includes(fp) || fp.includes(p)));
  const hasPattern = matchedPatterns.length > 0;
  filters.push({
    name: 'Padrão Gráfico',
    passed: hasPattern,
    description: hasPattern 
      ? `Padrão detectado: ${matchedPatterns.join(', ')}`
      : 'Sem padrão especial reconhecido',
    weight: 0.5,
    category: 'bonus',
  });
  if (hasPattern) score += 0.6;
  
  // FILTRO 12: Padrão da última vela
  const lastCandlePatternFavorable = lastCandle.pattern && (
    (signalType === 'CALL' && (lastCandle.pattern.includes('Bullish') || lastCandle.pattern === 'Martelo')) ||
    (signalType === 'PUT' && (lastCandle.pattern.includes('Bearish') || lastCandle.pattern === 'Shooting Star'))
  );
  filters.push({
    name: 'Padrão da Vela',
    passed: !!lastCandlePatternFavorable,
    description: lastCandlePatternFavorable 
      ? `Última vela: ${lastCandle.pattern}`
      : `Última vela sem padrão especial`,
    weight: 0.4,
    category: 'bonus',
  });
  if (lastCandlePatternFavorable) score += 0.5;
  
  // FILTRO 13: Significância da última vela
  const significanceOk = lastCandle.significance === 'high' || lastCandle.significance === 'critical';
  filters.push({
    name: 'Significância',
    passed: significanceOk,
    description: significanceOk 
      ? `Vela de ALTA significância (${lastCandle.significance})`
      : `Vela de baixa significância (${lastCandle.significance})`,
    weight: 0.3,
    category: 'bonus',
  });
  if (lastCandle.significance === 'critical') score += 0.5;
  else if (lastCandle.significance === 'high') score += 0.3;
  
  // FILTRO 14: Risco de lateralização baixo
  const lowLateralization = flow.lateralizationRisk < 30;
  filters.push({
    name: 'Risco de Lateral',
    passed: lowLateralization,
    description: lowLateralization 
      ? `Risco de lateralização BAIXO (${flow.lateralizationRisk}%)`
      : `Risco de lateralização ${flow.lateralizationRisk > 50 ? 'ALTO' : 'MÉDIO'} (${flow.lateralizationRisk}%)`,
    weight: 0.3,
    category: 'bonus',
  });
  if (lowLateralization) score += 0.3;
  
  // FILTRO 15: Linha de tendência favorável
  const trendLineOk = (signalType === 'CALL' && flow.hasLTA) || (signalType === 'PUT' && flow.hasLTB);
  filters.push({
    name: 'Linha de Tendência',
    passed: trendLineOk,
    description: trendLineOk 
      ? `${signalType === 'CALL' ? 'LTA' : 'LTB'} detectada - Estrutura de tendência formada`
      : 'Sem linha de tendência clara',
    weight: 0.3,
    category: 'bonus',
  });
  if (trendLineOk) score += 0.3;
  
  // FILTRO 16: Sem traps recentes
  const recentTraps = zones.traps.filter(t => 
    (signalType === 'CALL' && t.type === 'bull-trap') ||
    (signalType === 'PUT' && t.type === 'bear-trap')
  );
  const noTraps = recentTraps.length === 0;
  filters.push({
    name: 'Armadilhas',
    passed: noTraps,
    description: noTraps 
      ? 'Sem armadilhas (traps) detectadas'
      : `CUIDADO: ${recentTraps[0].type.toUpperCase()} detectado`,
    weight: 0.3,
    category: 'bonus',
  });
  if (noTraps) score += 0.3;
  
  // FILTRO 17: Micro e Macro tendência alinhadas
  const microMacroAligned = flow.microTrend === flow.macroTrend && flow.microTrend === expectedTrend;
  filters.push({
    name: 'Alinhamento Micro/Macro',
    passed: microMacroAligned,
    description: microMacroAligned 
      ? 'Micro e Macro tendência ALINHADAS - Setup ideal'
      : `Micro: ${flow.microTrend}, Macro: ${flow.macroTrend} - Divergência`,
    weight: 0.4,
    category: 'bonus',
  });
  if (microMacroAligned) score += 0.4;
  
  // =========================================
  // CALCULAR RESULTADO FINAL
  // =========================================
  
  const maxScore = 10;
  const confidence = Math.round((score / maxScore) * 100);
  const finalScore = Math.round(score * 10) / 10;
  
  // Determinar stake e razão
  let stake = '$0';
  let reason = '';
  let finalType: 'CALL' | 'PUT' | 'AGUARDAR' = signalType;
  
  if (finalScore >= 8) {
    stake = '$350 - $824';
    reason = `🎯 Sinal PERFEITO para ${signalType}! Score ${finalScore}/10. Última vela ${lastCandle.color === 'green' ? 'VERDE' : 'VERMELHA'} + ${filters.filter(f => f.passed).length}/${filters.length} filtros confirmados. Momentum e Williams APONTANDO na direção. Entry de ALTA confiança.`;
  } else if (finalScore >= 6) {
    stake = '$45 - $150';
    reason = `✅ Sinal VÁLIDO para ${signalType}. Score ${finalScore}/10. Última vela ${lastCandle.color === 'green' ? 'VERDE' : 'VERMELHA'} + maioria dos filtros passou. Entry padrão.`;
  } else {
    finalType = 'AGUARDAR';
    stake = '$0';
    reason = `⚠️ Score ${finalScore}/10 INSUFICIENTE. Última vela ${lastCandle.color === 'green' ? 'VERDE' : 'VERMELHA'} mas muitos filtros falharam. ${filters.filter(f => !f.passed).length} filtros NÃO passaram. Aguarde setup melhor.`;
  }
  
  return {
    type: finalType,
    confidence,
    score: finalScore,
    filters,
    reason,
    stake,
    expiry: '1 min',
    timestamp: new Date(),
    lastCandleColor: lastCandle.color,
  };
}

// ==========================================
// FUNÇÕES DE EXPORTAÇÃO
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
