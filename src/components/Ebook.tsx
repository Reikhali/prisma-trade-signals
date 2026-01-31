import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, BookOpen, Target, TrendingUp, 
  BarChart3, Layers, AlertTriangle, Hash, ArrowDownUp, 
  Filter, Shield, CheckSquare, PlayCircle, Flame, Brain,
  MapPin, Waves, Activity, Zap, FileText, Youtube
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PrismaLogo } from './PrismaLogo';

const chapters = [
  {
    id: 1,
    title: 'Introdução',
    icon: BookOpen,
    section: 'Fundamentos',
    content: {
      title: 'Bem-vindo ao Prisma IA',
      description: 'Estratégia de Momentum Trading para 1 minuto com alta assertividade.',
      topics: [
        'O que é a estratégia Prisma IA',
        'Por que funciona: Filtros eliminam o ruído',
        'Timeframe: 1 minuto (candles clássicos)',
        'Foco em COMPRA (CALL) quando tendência bullish',
        'Foco em VENDA (PUT) quando tendência bearish',
      ],
      highlight: 'A chave do sucesso: Só entrar quando TODOS os filtros estão alinhados.',
    },
  },
  {
    id: 2,
    title: 'Configuração dos Indicadores',
    icon: BarChart3,
    section: 'Fundamentos',
    content: {
      title: 'Setup dos Indicadores',
      indicators: [
        {
          name: 'Momentum',
          period: 5,
          color: 'Turquesa',
          thickness: 2,
        },
        {
          name: 'Williams Momentum',
          period: 7,
          levels: '-20 e -80',
          color: 'Turquesa',
          thickness: 2,
        },
      ],
      steps: [
        'Abra a plataforma de trading',
        'Adicione o indicador Momentum (período 5)',
        'Configure cor turquesa e espessura 2',
        'Adicione Williams %R (período 7)',
        'Marque níveis -20 e -80',
        'Salve como template',
      ],
    },
  },
  {
    id: 3,
    title: 'Estratégia de Entrada',
    icon: Target,
    section: 'Fundamentos',
    content: {
      title: 'Gatilhos e Filtros de Entrada',
      rules: [
        {
          type: 'CALL (Compra)',
          conditions: [
            'Última vela fechou VERDE',
            'Momentum apontando para CIMA',
            'Williams saindo de zona oversold (-80)',
            'Tendência bullish confirmada',
            'Candles com corpos fortes (>50%)',
          ],
        },
        {
          type: 'PUT (Venda)',
          conditions: [
            'Última vela fechou VERMELHA',
            'Momentum apontando para BAIXO',
            'Williams saindo de zona overbought (-20)',
            'Tendência bearish confirmada',
            'Candles com corpos fortes (>50%)',
          ],
        },
      ],
      warning: 'NUNCA entre contra a cor da última vela. Se está vindo velas verdes, não faça PUT. Se está vindo velas vermelhas, não faça CALL.',
    },
  },
  {
    id: 4,
    title: 'Anatomia da Vela',
    icon: Flame,
    section: 'Fundamentos',
    content: {
      title: 'Componentes da Vela Japonesa',
      components: [
        { name: 'Corpo', description: 'Diferença entre abertura e fechamento. Corpo grande = força, corpo pequeno = indecisão.' },
        { name: 'Pavio Superior', description: 'Rejeição de preços altos. Pavio grande = vendedores defendendo região.' },
        { name: 'Pavio Inferior', description: 'Rejeição de preços baixos. Pavio grande = compradores defendendo suporte.' },
        { name: 'Cor', description: 'Verde = fechou acima da abertura (bullish). Vermelha = fechou abaixo (bearish).' },
      ],
      ideal: 'Vela ideal para entrada: Corpo >70%, pavios <15%, cor alinhada com tendência.',
    },
  },
  {
    id: 5,
    title: 'Vela Raiz',
    icon: Zap,
    section: 'Fundamentos',
    content: {
      title: 'O Conceito de Vela Raiz',
      description: 'A vela raiz é aquela que INICIA um movimento direcional forte. É o ponto de ignição.',
      characteristics: [
        'Corpo significativo (mínimo 60%)',
        'Rompe região de consolidação',
        'Volume implícito alto',
        'Sem hesitação (pavios mínimos)',
        'Muda o contexto do mercado',
      ],
      importance: 'Identificar a vela raiz permite entrar no INÍCIO do movimento, maximizando o lucro.',
    },
  },
  {
    id: 6,
    title: 'Lógica do Preço',
    icon: Brain,
    section: 'Fluxo e Análise',
    content: {
      title: 'Por Que o Preço Se Move',
      concepts: [
        { name: 'Oferta e Demanda', description: 'Mais compradores = preço sobe. Mais vendedores = preço cai.' },
        { name: 'Ciclos de Mercado', description: 'Acumulação → Tendência → Distribuição → Tendência inversa.' },
        { name: 'Momentum', description: 'Força do movimento. Momentum crescente = tendência saudável.' },
        { name: 'Exaustão', description: 'Quando o momentum diminui, reversão pode estar próxima.' },
      ],
      principle: 'O preço busca liquidez. Grandes players movem o mercado para "pegar" stops.',
    },
  },
  {
    id: 7,
    title: 'Fluxo de Velas',
    icon: Waves,
    section: 'Fluxo e Análise',
    content: {
      title: 'Leitura de Sequência de Velas',
      flows: [
        { type: 'Fluxo Bullish', description: 'Sequência de velas verdes com corpos crescentes. Momentum de compra.' },
        { type: 'Fluxo Bearish', description: 'Sequência de velas vermelhas com corpos crescentes. Momentum de venda.' },
        { type: 'Fluxo Lateral', description: 'Velas alternando cores, corpos pequenos. Evitar operar.' },
        { type: 'Fluxo de Reversão', description: 'Mudança de cor dominante após padrão de reversão.' },
      ],
      rule: 'Só opere a favor do fluxo. Velas verdes consecutivas = só CALL. Velas vermelhas consecutivas = só PUT.',
    },
  },
  {
    id: 8,
    title: 'Regiões do Mercado',
    icon: MapPin,
    section: 'Fluxo e Análise',
    content: {
      title: 'Zonas de Demanda e Oferta',
      zones: [
        { name: 'Zona de Demanda', description: 'Região onde compradores entraram com força. Preço tende a reagir ao retornar.', color: 'emerald' },
        { name: 'Zona de Oferta', description: 'Região onde vendedores entraram com força. Preço tende a ser rejeitado.', color: 'red' },
        { name: 'Suporte', description: 'Preço testado múltiplas vezes sem romper para baixo.', color: 'blue' },
        { name: 'Resistência', description: 'Preço testado múltiplas vezes sem romper para cima.', color: 'orange' },
      ],
    },
  },
  {
    id: 9,
    title: 'Leitura de Pavios',
    icon: Activity,
    section: 'Fluxo e Análise',
    content: {
      title: 'O Que os Pavios Revelam',
      readings: [
        { wick: 'Pavio Superior Grande', meaning: 'Vendedores rejeitaram preço alto. Pressão vendedora.' },
        { wick: 'Pavio Inferior Grande', meaning: 'Compradores defenderam preço baixo. Pressão compradora.' },
        { wick: 'Sem Pavios (Marubozu)', meaning: 'Domínio total. Força máxima na direção.' },
        { wick: 'Pavios Iguais (Doji)', meaning: 'Empate. Indecisão. Aguardar próxima vela.' },
      ],
      tip: 'Pavio na direção da sua operação = ruim. Pavio contra = bom (defesa do seu lado).',
    },
  },
  {
    id: 10,
    title: 'Leitura de Corpo',
    icon: Layers,
    section: 'Fluxo e Análise',
    content: {
      title: 'Interpretando o Corpo da Vela',
      sizes: [
        { size: 'Corpo >80%', meaning: 'Marubozu. Impulso extremo. Sinal forte.', strength: 'CRÍTICO' },
        { size: 'Corpo 50-80%', meaning: 'Vela forte. Domínio claro de um lado.', strength: 'ALTO' },
        { size: 'Corpo 30-50%', meaning: 'Vela moderada. Alguma hesitação.', strength: 'MÉDIO' },
        { size: 'Corpo <30%', meaning: 'Vela fraca ou Doji. Indecisão.', strength: 'BAIXO' },
      ],
      context: 'Corpos crescentes = aceleração (bom). Corpos diminuindo = desaceleração (cuidado).',
    },
  },
  {
    id: 11,
    title: 'Padrões de Reversão',
    icon: ArrowDownUp,
    section: 'Padrões',
    content: {
      title: 'Padrões que Indicam Mudança de Direção',
      patterns: [
        { name: 'Martelo', description: 'Pavio inferior 2x o corpo. Sinal bullish em fundo.', signal: 'CALL' },
        { name: 'Shooting Star', description: 'Pavio superior 2x o corpo. Sinal bearish em topo.', signal: 'PUT' },
        { name: 'Engolfo Bullish', description: 'Vela verde engole vermelha anterior. Reversão de alta.', signal: 'CALL' },
        { name: 'Engolfo Bearish', description: 'Vela vermelha engole verde anterior. Reversão de baixa.', signal: 'PUT' },
        { name: 'Doji em Suporte', description: 'Indecisão em região de demanda. Possível reversão alta.', signal: 'CALL' },
        { name: 'Doji em Resistência', description: 'Indecisão em região de oferta. Possível reversão baixa.', signal: 'PUT' },
      ],
    },
  },
  {
    id: 12,
    title: 'Padrões de Continuação',
    icon: TrendingUp,
    section: 'Padrões',
    content: {
      title: 'Padrões que Confirmam a Tendência',
      patterns: [
        { name: 'Três Soldados Brancos', description: '3 velas verdes consecutivas com corpos crescentes.', signal: 'CALL FORTE' },
        { name: 'Três Corvos Negros', description: '3 velas vermelhas consecutivas com corpos crescentes.', signal: 'PUT FORTE' },
        { name: 'Pullback Bullish', description: 'Tendência alta, retração leve, retomada. Entrada ideal.', signal: 'CALL' },
        { name: 'Pullback Bearish', description: 'Tendência baixa, retração leve, retomada. Entrada ideal.', signal: 'PUT' },
      ],
      tip: 'Padrões de continuação são MAIS CONFIÁVEIS que reversão. Opere a favor da tendência.',
    },
  },
  {
    id: 13,
    title: 'Zonas de Trap',
    icon: AlertTriangle,
    section: 'Zonas Especiais',
    content: {
      title: 'Armadilhas do Mercado',
      traps: [
        { name: 'Bull Trap', description: 'Falso rompimento de alta. Preço rompe resistência e volta. Loss para quem fez CALL.', avoid: 'Espere confirmação. Não entre no primeiro rompimento.' },
        { name: 'Bear Trap', description: 'Falso rompimento de baixa. Preço rompe suporte e volta. Loss para quem fez PUT.', avoid: 'Espere confirmação. Veja a próxima vela.' },
        { name: 'Stop Hunt', description: 'Movimento rápido para "pegar" stops antes de reverter.', avoid: 'Não coloque stop em regiões óbvias.' },
      ],
      golden: 'Se a vela de rompimento NÃO tem corpo forte (>60%), desconfie. Pode ser trap.',
    },
  },
  {
    id: 14,
    title: 'Níveis Psicológicos (00)',
    icon: Hash,
    section: 'Zonas Especiais',
    content: {
      title: 'A Importância dos Números Redondos',
      levels: ['1.10000', '1.20000', '1.30000', '100.00', '150.00'],
      behavior: [
        'Agem como suporte/resistência natural',
        'Acumulam ordens de grandes players',
        'Maior probabilidade de rejeição',
        'Rompimento exige força extra',
      ],
      rule: 'Não entre em operação se há nível 00 logo acima (para CALL) ou abaixo (para PUT). Risco de rejeição.',
    },
  },
  {
    id: 15,
    title: 'Pullback e Retração',
    icon: ArrowDownUp,
    section: 'Estratégia',
    content: {
      title: 'Entrada no Momento Ideal',
      description: 'Pullback é o recuo temporário antes da continuação. Melhor momento para entrar.',
      strategy: [
        'Identifique tendência clara (3+ velas na direção)',
        'Espere retração (1-2 velas contra)',
        'Observe vela de confirmação (volta na direção)',
        'Entre na abertura da vela seguinte',
        'Expiry: 1 minuto',
      ],
      fibonacci: ['38.2% - Pullback leve, tendência forte', '50% - Pullback normal', '61.8% - Pullback profundo, última chance'],
    },
  },
  {
    id: 16,
    title: 'Throwback',
    icon: Activity,
    section: 'Estratégia',
    content: {
      title: 'Reteste de Rompimento',
      description: 'Throwback é quando o preço rompe uma região e volta para testá-la como novo suporte/resistência.',
      steps: [
        'Preço rompe resistência com força',
        'Volta para testar a antiga resistência (agora suporte)',
        'Vela de rejeição confirma',
        'Entrada CALL na próxima vela',
      ],
      reverse: 'Para PUT: Preço rompe suporte, volta para testar como resistência, rejeição, entrada PUT.',
    },
  },
  {
    id: 17,
    title: 'Fluxo Avançado',
    icon: Waves,
    section: 'Estratégia',
    content: {
      title: 'Análise Profunda de Fluxo',
      concepts: [
        { name: 'Absorção', description: 'Grande vela "absorve" movimento anterior. Mudança de controle.' },
        { name: 'Exaustão', description: 'Corpos diminuindo após movimento. Energia acabando.' },
        { name: 'Aceleração', description: 'Corpos aumentando. Momentum crescente. Força na direção.' },
        { name: 'Confluência', description: 'Múltiplos sinais apontando mesma direção. Setup perfeito.' },
      ],
    },
  },
  {
    id: 18,
    title: 'Filtros Avançados',
    icon: Filter,
    section: 'Execução',
    content: {
      title: 'Sistema de Pontuação Prisma IA',
      filters: [
        { name: 'Última Vela', weight: 2, description: 'Cor alinhada com direção (OBRIGATÓRIO)' },
        { name: 'Corpo da Vela', weight: 1, description: '>50% = ponto' },
        { name: 'Pavios Mínimos', weight: 1, description: '<25% = ponto' },
        { name: 'Tendência', weight: 1.5, description: 'Alinhada = ponto' },
        { name: 'Velas Consecutivas', weight: 1, description: '2+ = ponto' },
        { name: 'Momentum', weight: 1, description: 'Apontando direção = ponto' },
        { name: 'Williams', weight: 1, description: 'Confirmando = ponto' },
        { name: 'Sem Desaceleração', weight: 0.5, description: 'Força mantida = ponto' },
        { name: 'Padrão Favorável', weight: 0.5, description: 'Padrão detectado = ponto' },
        { name: 'Confirmação Penúltima', weight: 0.5, description: 'Mesma cor = ponto' },
      ],
      scoring: [
        { range: '8-10', action: 'Entrada FORTE', stake: '$350 - $824' },
        { range: '6-7', action: 'Entrada VÁLIDA', stake: '$45 - $150' },
        { range: '0-5', action: 'NÃO ENTRAR', stake: '$0' },
      ],
    },
  },
  {
    id: 19,
    title: 'Gestão de Risco',
    icon: Shield,
    section: 'Execução',
    content: {
      title: 'Proteja Seu Capital',
      rules: [
        'Nunca arrisque mais de 5% do capital por operação',
        'Comece com stakes pequenos ($45)',
        'Só aumente após sequência de wins',
        'Aceite perdas quando filtros falham',
        'Pare após 3 losses seguidos',
        'Não tente recuperar prejuízo no mesmo dia',
      ],
      scaling: [
        { wins: 0, stake: '$45' },
        { wins: 2, stake: '$86' },
        { wins: 4, stake: '$150' },
        { wins: 6, stake: '$350' },
        { wins: 8, stake: '$824' },
      ],
    },
  },
  {
    id: 20,
    title: 'Checklist Final',
    icon: CheckSquare,
    section: 'Execução',
    content: {
      title: 'Checklist Antes de Entrar',
      checklist: [
        '☐ Última vela fechou na COR da operação?',
        '☐ Tendência está a favor?',
        '☐ Momentum apontando para direção certa?',
        '☐ Williams confirmando?',
        '☐ Corpo da vela é forte (>50%)?',
        '☐ Pavios são mínimos (<25%)?',
        '☐ Não há nível 00 bloqueando?',
        '☐ Não está em região de trap?',
        '☐ Score do Prisma IA é 6+?',
        '☐ Gestão de risco ok?',
      ],
      final: 'Se TODOS os itens estão ✓, ENTRE. Se qualquer um está ✗, AGUARDE.',
    },
  },
];

export function Ebook() {
  const [currentChapter, setCurrentChapter] = useState(0);
  const [showSidebar, setShowSidebar] = useState(true);
  
  const chapter = chapters[currentChapter];
  const sections = [...new Set(chapters.map(c => c.section))];
  
  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <AnimatePresence>
        {showSidebar && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="w-72 bg-card border-r border-border overflow-y-auto fixed h-full z-40 lg:relative"
          >
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <PrismaLogo size={40} />
                <div>
                  <h2 className="font-display font-bold text-white">Prisma IA</h2>
                  <p className="text-xs text-muted-foreground">E-book Completo</p>
                </div>
              </div>
            </div>
            
            <nav className="p-4">
              {sections.map((section) => (
                <div key={section} className="mb-4">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    {section}
                  </h3>
                  <ul className="space-y-1">
                    {chapters
                      .filter(c => c.section === section)
                      .map((c) => (
                        <li key={c.id}>
                          <button
                            onClick={() => setCurrentChapter(chapters.findIndex(ch => ch.id === c.id))}
                            className={`
                              w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2
                              transition-colors
                              ${c.id === chapter.id 
                                ? 'bg-primary/20 text-primary' 
                                : 'text-muted-foreground hover:bg-muted hover:text-white'}
                            `}
                          >
                            <c.icon className="w-4 h-4" />
                            {c.title}
                          </button>
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
            </nav>
            
            {/* YouTube Link */}
            <div className="p-4 border-t border-border">
              <a
                href="https://www.youtube.com/@trader.steven/videos"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-red-500/10 rounded-xl hover:bg-red-500/20 transition-colors"
              >
                <Youtube className="w-6 h-6 text-red-500" />
                <div>
                  <p className="text-sm font-medium text-white">Trader Steven</p>
                  <p className="text-xs text-muted-foreground">Vídeos no YouTube</p>
                </div>
              </a>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top Bar */}
        <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border p-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSidebar(!showSidebar)}
          >
            <FileText className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Capítulo {currentChapter + 1} de {chapters.length}
            </span>
            <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${((currentChapter + 1) / chapters.length) * 100}%` }}
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentChapter(Math.max(0, currentChapter - 1))}
              disabled={currentChapter === 0}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentChapter(Math.min(chapters.length - 1, currentChapter + 1))}
              disabled={currentChapter === chapters.length - 1}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Chapter Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={chapter.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-6 md:p-12 max-w-4xl mx-auto"
          >
            <div className="mb-8">
              <span className="text-sm text-primary font-medium">{chapter.section}</span>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-white mt-2 mb-4">
                {chapter.content.title || chapter.title}
              </h1>
              {chapter.content.description && (
                <p className="text-lg text-muted-foreground">{chapter.content.description}</p>
              )}
            </div>
            
            {/* Dynamic Content Rendering */}
            <div className="space-y-6">
              {chapter.content.topics && (
                <ul className="space-y-3">
                  {chapter.content.topics.map((topic, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-secondary">•</span>
                      <span className="text-foreground/80">{topic}</span>
                    </li>
                  ))}
                </ul>
              )}
              
              {chapter.content.highlight && (
                <div className="p-4 bg-primary/10 border border-primary/30 rounded-xl">
                  <p className="text-primary font-medium">{chapter.content.highlight}</p>
                </div>
              )}
              
              {chapter.content.indicators && (
                <div className="grid md:grid-cols-2 gap-4">
                  {chapter.content.indicators.map((ind, i) => (
                    <div key={i} className="prisma-card rounded-xl p-4">
                      <h3 className="font-semibold text-white mb-3">{ind.name}</h3>
                      <div className="space-y-2 text-sm">
                        <p><span className="text-muted-foreground">Período:</span> <span className="text-secondary">{ind.period}</span></p>
                        {ind.levels && <p><span className="text-muted-foreground">Níveis:</span> <span className="text-secondary">{ind.levels}</span></p>}
                        <p><span className="text-muted-foreground">Cor:</span> <span className="text-secondary">{ind.color}</span></p>
                        <p><span className="text-muted-foreground">Espessura:</span> <span className="text-secondary">{ind.thickness}</span></p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {chapter.content.rules && (
                <div className="space-y-4">
                  {chapter.content.rules.map((rule, i) => (
                    <div 
                      key={i} 
                      className={`p-4 rounded-xl border ${
                        rule.type.includes('CALL') 
                          ? 'bg-emerald-500/10 border-emerald-500/30' 
                          : 'bg-red-500/10 border-red-500/30'
                      }`}
                    >
                      <h4 className={`font-semibold mb-3 ${
                        rule.type.includes('CALL') ? 'text-emerald-400' : 'text-red-400'
                      }`}>{rule.type}</h4>
                      <ul className="space-y-2">
                        {rule.conditions.map((cond, j) => (
                          <li key={j} className="flex items-center gap-2 text-sm text-foreground/80">
                            <span className="text-secondary">✓</span>
                            {cond}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
              
              {chapter.content.warning && (
                <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl">
                  <p className="text-destructive font-medium">⚠️ {chapter.content.warning}</p>
                </div>
              )}
              
              {chapter.content.patterns && (
                <div className="grid md:grid-cols-2 gap-4">
                  {chapter.content.patterns.map((p, i) => (
                    <div key={i} className="prisma-card rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-white">{p.name}</h4>
                        <span className={`text-xs px-2 py-1 rounded ${
                          p.signal.includes('CALL') ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                        }`}>{p.signal}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{p.description}</p>
                    </div>
                  ))}
                </div>
              )}
              
              {chapter.content.filters && (
                <div className="space-y-3">
                  {chapter.content.filters.map((f, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium text-white">{f.name}</p>
                        <p className="text-sm text-muted-foreground">{f.description}</p>
                      </div>
                      <span className="text-secondary font-semibold">+{f.weight}</span>
                    </div>
                  ))}
                </div>
              )}
              
              {chapter.content.scoring && (
                <div className="grid md:grid-cols-3 gap-4 mt-6">
                  {chapter.content.scoring.map((s, i) => (
                    <div key={i} className={`p-4 rounded-xl text-center ${
                      i === 0 ? 'bg-emerald-500/20 border border-emerald-500/30' :
                      i === 1 ? 'bg-amber-500/20 border border-amber-500/30' :
                      'bg-red-500/20 border border-red-500/30'
                    }`}>
                      <p className="text-2xl font-display font-bold text-white">{s.range}</p>
                      <p className={`font-medium ${
                        i === 0 ? 'text-emerald-400' : i === 1 ? 'text-amber-400' : 'text-red-400'
                      }`}>{s.action}</p>
                      <p className="text-sm text-muted-foreground">{s.stake}</p>
                    </div>
                  ))}
                </div>
              )}
              
              {chapter.content.checklist && (
                <div className="space-y-2">
                  {chapter.content.checklist.map((item, i) => (
                    <div key={i} className="p-3 bg-muted/50 rounded-lg text-foreground/80">
                      {item}
                    </div>
                  ))}
                </div>
              )}
              
              {chapter.content.final && (
                <div className="p-4 bg-primary/10 border border-primary/30 rounded-xl mt-6">
                  <p className="text-primary font-medium text-center">{chapter.content.final}</p>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
