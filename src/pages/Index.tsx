import { useState } from 'react';
import { motion } from 'framer-motion';
import { Scan, BookOpen, Zap, Brain, Target, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PrismaLogo } from '@/components/PrismaLogo';
import { VisionBot } from '@/components/VisionBot';
import { Ebook } from '@/components/Ebook';

export default function Index() {
  const [currentView, setCurrentView] = useState<'home' | 'vision' | 'ebook'>('home');

  if (currentView === 'vision') {
    return (
      <div className="min-h-screen bg-background">
        <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <button 
              onClick={() => setCurrentView('home')}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <PrismaLogo size={32} />
              <span className="font-display font-bold text-white">Prisma IA</span>
            </button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentView('ebook')}>
                <BookOpen className="w-4 h-4 mr-2" />
                E-book
              </Button>
            </div>
          </div>
        </nav>
        <VisionBot />
      </div>
    );
  }

  if (currentView === 'ebook') {
    return (
      <div className="min-h-screen bg-background">
        <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <button 
              onClick={() => setCurrentView('home')}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <PrismaLogo size={32} />
              <span className="font-display font-bold text-white">Prisma IA</span>
            </button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentView('vision')}>
                <Scan className="w-4 h-4 mr-2" />
                Vision Bot
              </Button>
            </div>
          </div>
        </nav>
        <Ebook />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[120px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PrismaLogo size={48} />
            <div>
              <h1 className="font-display font-bold text-xl prisma-text">Prisma IA</h1>
              <p className="text-xs text-muted-foreground">Trading Intelligence</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setCurrentView('ebook')}>
              <BookOpen className="w-4 h-4 mr-2" />
              E-book
            </Button>
            <Button className="prisma-button" onClick={() => setCurrentView('vision')}>
              <Scan className="w-4 h-4 mr-2" />
              Vision Bot
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 min-h-[80vh] flex items-center justify-center px-4">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.8 }}
            className="mb-8"
          >
            <PrismaLogo size={120} />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl font-display font-bold mb-6"
          >
            <span className="prisma-text">Prisma IA</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto"
          >
            Motor de análise local com <span className="text-secondary">todo conhecimento embutido</span>. 
            Sem API externa. Só opera <span className="text-primary">na cor da última vela</span>.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button 
              size="lg" 
              className="prisma-button text-lg px-8 py-6"
              onClick={() => setCurrentView('vision')}
            >
              <Scan className="w-5 h-5 mr-2" />
              Analisar Gráfico
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-8 py-6"
              onClick={() => setCurrentView('ebook')}
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Estudar Estratégia
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-display font-bold text-center text-white mb-12">
            Por que o <span className="prisma-text">Prisma IA</span> é diferente
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Brain,
                title: 'Motor Local',
                description: 'Todo o conhecimento de trading está embutido no código. Sem dependência de API externa.',
              },
              {
                icon: Target,
                title: 'Regra de Ouro',
                description: 'CALL só quando última vela é verde. PUT só quando é vermelha. Nunca contra a tendência.',
              },
              {
                icon: TrendingUp,
                title: '10 Filtros',
                description: 'Sistema de pontuação com 10 filtros. Só entra quando score é 6+. Maximiza assertividade.',
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="prisma-card rounded-2xl p-6 hover:border-primary/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-display font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="max-w-4xl mx-auto text-center prisma-card rounded-3xl p-12"
        >
          <Zap className="w-16 h-16 mx-auto text-secondary mb-6" />
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
            Pronto para operar com inteligência?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Faça upload do print do seu gráfico e deixe o Prisma IA analisar.
          </p>
          <Button 
            size="lg" 
            className="prisma-button text-lg px-10 py-6"
            onClick={() => setCurrentView('vision')}
          >
            <Scan className="w-5 h-5 mr-2" />
            Iniciar Análise Agora
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <PrismaLogo size={32} />
            <span className="font-display font-bold text-white">Prisma IA</span>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            ⚠️ Trading de opções binárias envolve alto risco. Opere com responsabilidade.
          </p>
        </div>
      </footer>
    </div>
  );
}
