import React, { useState } from 'react';
import { 
  Cpu, 
  Zap, 
  ShieldCheck, 
  RefreshCw, 
  History, 
  MessageSquare,
  FileText,
  Camera,
  Play,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import api from '../services/api/axios';

interface AnalysisResult {
  probableCause: string;
  explanation: string;
  requiredActions: string[];
  estimatedLaborTime: string;
  confidenceLevel: number;
  smartAdvisorTips: string[];
}

async function analyzeFault(symptoms: string, vehicle: string): Promise<AnalysisResult> {
  const insights = await api.get('/dashboard/insights');
  const insightText: string = insights.data?.data?.insight ?? 'Analysis completed.';

  return {
    probableCause: 'Engine performance anomaly',
    explanation: `${insightText} Input summary: ${symptoms}. Vehicle: ${vehicle}.`,
    requiredActions: [
      'Run OBD scan and capture freeze-frame data',
      'Inspect ignition and fuel delivery components',
      'Verify part availability before repair booking'
    ],
    estimatedLaborTime: '2-4 hours',
    confidenceLevel: 0.82,
    smartAdvisorTips: [
      'Prioritize low-stock parts before scheduling repair.',
      'Confirm customer availability for follow-up diagnostics.',
      'Validate final estimate after physical inspection.'
    ]
  };
}

const DiagnosticsView = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [symptoms, setSymptoms] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analysisSteps = [
    "Interrogating ECU Data...",
    "Correlating Sensor Patterns...",
    "Scanning Technical Database...",
    "Generating Predictive Insights..."
  ];

  const handleStartAnalysis = async () => {
    if (!symptoms.trim()) return;
    
    setAnalyzing(true);
    setError(null);
    setResult(null);
    
    // Start simulations steps
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < analysisSteps.length) {
        setActiveStep(step);
      }
    }, 1000);

    try {
      const analysis = await analyzeFault(symptoms, "BMW M4 Competition (2021)");
      setResult(analysis);
    } catch (err) {
      setError("Failed to generate AI analysis. Please try again.");
      console.error(err);
    } finally {
      clearInterval(interval);
      setAnalyzing(false);
      setActiveStep(0);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 text-on-surface">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3 italic">
            <Cpu className="w-8 h-8 text-primary" />
            AI DIAGNOSTICS HUB
          </h2>
          <p className="text-on-surface-variant font-medium mt-1">Next-gen vehicle telemetry & predictive repair insights.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-surface-container-highest border border-white/10 rounded-xl text-sm font-bold hover:bg-white/10 transition-colors">
            <History className="w-4 h-4" />
            History
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-secondary-container text-white rounded-xl text-sm font-bold shadow-lg shadow-secondary-container/20 red-glow-hover">
            <Camera className="w-4 h-4" />
            Visual Scan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Diagnostic Input Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel machined-edge rounded-3xl p-8 space-y-6">
            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Observation / Fault Symptoms</label>
              <div className="relative">
                <textarea 
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Describe the issue (e.g., 'Rough idle when cold, hesitation under heavy acceleration, code P0301 present...')"
                  className="w-full bg-surface-container-lowest border border-white/5 rounded-2xl p-6 min-h-[160px] text-lg text-white placeholder:text-on-surface-variant/30 focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                />
                <button className="absolute bottom-4 right-4 p-3 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-colors">
                  <Zap className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-surface-container-lowest rounded-2xl border border-white/5">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">Target Vehicle</p>
                <p className="font-bold text-white">BMW M4 Competition (2021)</p>
              </div>
              <div className="p-4 bg-surface-container-lowest rounded-2xl border border-white/5">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">Connected Device</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <p className="font-bold text-white">Wrench-OBD-v4</p>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-400/10 border border-red-400/20 rounded-xl flex items-center gap-3 text-red-400 text-sm font-bold animate-shake">
                <AlertCircle className="w-5 h-5 shrink-0" />
                {error}
              </div>
            )}

            <button 
              onClick={handleStartAnalysis}
              disabled={analyzing || !symptoms.trim()}
              className="w-full bg-primary text-on-primary py-5 rounded-2xl font-black text-lg tracking-wider shadow-2xl shadow-primary/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale uppercase flex items-center justify-center gap-4"
            >
              {analyzing ? (
                <>
                  <RefreshCw className="w-6 h-6 animate-spin" />
                  {analysisSteps[activeStep]}
                </>
              ) : (
                <>
                  <Play className="w-6 h-6 fill-current" />
                  Initiate AI Deep Scan
                </>
              )}
            </button>
          </div>

          {!analyzing && result && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel border-emerald-400/20 bg-emerald-400/5 rounded-3xl p-8 space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                  ANALYSIS GENERATED
                </h3>
                <span className="text-xs font-mono text-emerald-400/60 font-bold">
                  {(result.confidenceLevel * 100).toFixed(1)}% CONFIDENCE LEVEL
                </span>
              </div>
              
              <div className="space-y-4">
                <div className="p-6 bg-surface-container-low rounded-2xl border border-white/5 space-y-3">
                  <h4 className="font-bold text-white uppercase text-sm tracking-wide">Probable Cause: {result.probableCause}</h4>
                  <p className="text-on-surface-variant leading-relaxed italic">
                    {result.explanation}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 bg-white/5 rounded-2xl space-y-2">
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase">Required Actions</p>
                    <ul className="space-y-1">
                      {result.requiredActions.map((action, i) => (
                        <li key={i} className="text-sm font-bold text-white flex items-center gap-2">
                          <div className="w-1 h-1 bg-primary rounded-full" />
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-5 bg-white/5 rounded-2xl space-y-2">
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase">Est. Labor Time</p>
                    <p className="font-bold text-white text-xl">{result.estimatedLaborTime}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Sidebar Insights */}
        <div className="space-y-6">
          <div className="glass-panel machined-edge rounded-3xl p-6 space-y-4">
            <h4 className="font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              SMART ADVISOR
            </h4>
            <div className="space-y-3 text-sm leading-relaxed">
              {result?.smartAdvisorTips.map((tip, i) => (
                <p key={i} className="text-on-surface-variant bg-white/5 p-4 rounded-xl border border-white/5">
                  "{tip}"
                </p>
              )) || (
                <>
                  <p className="text-on-surface-variant bg-white/5 p-4 rounded-xl opacity-50">
                    "Waiting for diagnostic input..."
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="glass-panel machined-edge rounded-3xl p-6 space-y-6">
            <h4 className="font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-secondary-container" />
              REPAIR GUIDES
            </h4>
            <div className="space-y-4">
              {['ECU Wiring Diagram', 'Torque Specs - Head Bolts', 'Transmission Reset Sequence'].map((guide, i) => (
                <button key={i} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group">
                  <span className="text-sm font-medium text-on-surface-variant group-hover:text-white">{guide}</span>
                  <FileText className="w-4 h-4 text-white/20 group-hover:text-primary transition-colors" />
                </button>
              ))}
            </div>
            <button className="w-full py-3 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-white hover:border-white/20 transition-all">
              Load PDF Workbench
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticsView;
