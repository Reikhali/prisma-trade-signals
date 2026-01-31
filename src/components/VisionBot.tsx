import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Camera, Scan, Loader2, Image as ImageIcon, X, Zap, MonitorPlay } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createAnalysisFromImage, type AnalysisResult } from '@/lib/prismaAnalyzer';
import { SignalCard } from './SignalCard';
import { CandleVisualizer } from './CandleVisualizer';
import { FlowAnalyzer } from './FlowAnalyzer';
import { PrismaLogo } from './PrismaLogo';

export function VisionBot() {
  const [mode, setMode] = useState<'upload' | 'capture'>('upload');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const handleFileUpload = useCallback(async (file: File) => {
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setResult(null);
    
    // Analisar imagem
    setIsAnalyzing(true);
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = async () => {
        const analysis = await createAnalysisFromImage(img);
        setResult(analysis);
        setIsAnalyzing(false);
      };
      img.src = url;
    } catch (error) {
      console.error('Erro na análise:', error);
      setIsAnalyzing(false);
    }
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);
  
  const startScreenCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { 
          displaySurface: 'window',
        } as MediaTrackConstraints,
        audio: false,
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCapturing(true);
      
      stream.getVideoTracks()[0].onended = () => {
        stopCapture();
      };
    } catch (error) {
      console.error('Erro ao capturar tela:', error);
      alert('Não foi possível iniciar a captura. Verifique as permissões.');
    }
  };
  
  const stopCapture = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCapturing(false);
  };
  
  const captureFrame = async () => {
    if (!videoRef.current || !isCapturing) return;
    
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0);
    
    // Converter para blob e criar URL
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      
      const url = URL.createObjectURL(blob);
      setImageUrl(url);
      setResult(null);
      setIsAnalyzing(true);
      
      // Criar imagem e analisar
      const img = new Image();
      img.onload = async () => {
        const analysis = await createAnalysisFromImage(img);
        setResult(analysis);
        setIsAnalyzing(false);
      };
      img.src = url;
    }, 'image/png');
  };
  
  const resetAnalysis = () => {
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
    setImageUrl(null);
    setResult(null);
    stopCapture();
  };
  
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <PrismaLogo size={56} />
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-bold prisma-text">
                Prisma IA Vision
              </h1>
              <p className="text-muted-foreground">Motor de Análise Local - Sem API</p>
            </div>
          </div>
          
          {/* Mode Tabs */}
          <div className="flex justify-center gap-2 mt-6">
            <Button
              variant={mode === 'upload' ? 'default' : 'outline'}
              onClick={() => { setMode('upload'); resetAnalysis(); }}
              className={mode === 'upload' ? 'prisma-button' : ''}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
            <Button
              variant={mode === 'capture' ? 'default' : 'outline'}
              onClick={() => { setMode('capture'); resetAnalysis(); }}
              className={mode === 'capture' ? 'prisma-button' : ''}
            >
              <MonitorPlay className="w-4 h-4 mr-2" />
              Captura ao Vivo
            </Button>
          </div>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column - Input */}
          <div className="space-y-6">
            {mode === 'upload' ? (
              /* Upload Mode */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="prisma-card rounded-2xl p-6"
              >
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => fileInputRef.current?.click()}
                  className={`
                    relative border-2 border-dashed rounded-xl p-8
                    transition-all cursor-pointer
                    ${imageUrl 
                      ? 'border-primary/50 bg-primary/5' 
                      : 'border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5'}
                  `}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                    className="hidden"
                  />
                  
                  {imageUrl ? (
                    <div className="relative">
                      <img 
                        src={imageUrl} 
                        alt="Gráfico" 
                        className="w-full rounded-lg"
                      />
                      <button
                        onClick={(e) => { e.stopPropagation(); resetAnalysis(); }}
                        className="absolute top-2 right-2 p-2 bg-black/50 rounded-full hover:bg-black/70"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <ImageIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                      <p className="text-lg font-semibold text-white mb-2">
                        Arraste seu print do gráfico aqui
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ou clique para selecionar
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              /* Capture Mode */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="prisma-card rounded-2xl p-6"
              >
                <div className="relative aspect-video bg-black/50 rounded-xl overflow-hidden mb-4">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-contain"
                    playsInline
                    muted
                  />
                  
                  {!isCapturing && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <Camera className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                          Clique em "Iniciar Captura" para começar
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {isCapturing && (
                    <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-red-500/80 rounded-full">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      <span className="text-xs text-white font-medium">AO VIVO</span>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-3">
                  {!isCapturing ? (
                    <Button
                      onClick={startScreenCapture}
                      className="flex-1 prisma-button"
                    >
                      <MonitorPlay className="w-4 h-4 mr-2" />
                      Iniciar Captura
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={captureFrame}
                        className="flex-1 bg-secondary hover:bg-secondary/80"
                        disabled={isAnalyzing}
                      >
                        {isAnalyzing ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Scan className="w-4 h-4 mr-2" />
                        )}
                        {isAnalyzing ? 'Analisando...' : 'Capturar & Analisar'}
                      </Button>
                      <Button
                        onClick={stopCapture}
                        variant="destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
                
                {imageUrl && (
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground mb-2">Última captura:</p>
                    <img 
                      src={imageUrl} 
                      alt="Captura" 
                      className="w-full rounded-lg border border-border"
                    />
                  </div>
                )}
              </motion.div>
            )}
            
            {/* Analyzing State */}
            <AnimatePresence>
              {isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="prisma-card rounded-2xl p-6 text-center"
                >
                  <div className="relative w-24 h-24 mx-auto mb-4">
                    <PrismaLogo size={96} />
                    <motion.div
                      className="absolute inset-0 border-4 border-transparent border-t-secondary rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                  <p className="text-lg font-semibold text-white mb-2">
                    Analisando Gráfico...
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Processando pixels, detectando velas e indicadores
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Candles & Flow */}
            {result && (
              <>
                <CandleVisualizer candles={result.candles} />
                <FlowAnalyzer 
                  flow={result.flow} 
                  indicators={result.indicators}
                  patterns={result.patterns}
                />
              </>
            )}
          </div>
          
          {/* Right Column - Results */}
          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <SignalCard signal={result.signal} />
                </motion.div>
              ) : !isAnalyzing && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="prisma-card rounded-2xl p-8 text-center"
                >
                  <Zap className="w-16 h-16 mx-auto text-primary mb-4" />
                  <h3 className="text-xl font-display font-semibold text-white mb-2">
                    Pronto para Analisar
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {mode === 'upload' 
                      ? 'Faça upload de um print do gráfico para receber o sinal'
                      : 'Inicie a captura de tela e capture um frame do gráfico'}
                  </p>
                  <div className="text-left p-4 bg-black/20 rounded-xl">
                    <p className="text-sm text-secondary font-semibold mb-2">⚡ Motor Local Ativo</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Análise de cores de velas (Verde/Vermelha)</li>
                      <li>• Detecção de direção dos indicadores</li>
                      <li>• Regra de Ouro: Só opera NA COR da última vela</li>
                      <li>• 10 filtros de confirmação</li>
                      <li>• Sem dependência de API externa</li>
                    </ul>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Rules Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="prisma-card rounded-2xl p-6"
            >
              <h3 className="text-lg font-display font-semibold text-white mb-4">
                🎯 Regra de Ouro do Prisma IA
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/30">
                  <p className="text-emerald-300 font-medium">
                    ✅ CALL: Última vela VERDE + Tendência bullish + Indicadores subindo
                  </p>
                </div>
                <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/30">
                  <p className="text-red-300 font-medium">
                    ✅ PUT: Última vela VERMELHA + Tendência bearish + Indicadores descendo
                  </p>
                </div>
                <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/30">
                  <p className="text-amber-300 font-medium">
                    ⚠️ NUNCA opera contra a cor da última vela
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
