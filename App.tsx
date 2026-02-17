
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Menu, Send, Plus, Search, RefreshCw, Download, FileText, ChevronRight, ShieldAlert, BookOpen, Globe, Briefcase, Calendar, ChevronLeft, Save, Trash2, Check, Lightbulb, Printer, Settings as SettingsIcon, MessageCircle, Mail, X, Bell, Database, Upload, Pin, PinOff, BarChart2, Sparkles, Copy, Lock, ShieldCheck, Fingerprint, Eye, Paperclip, XCircle, Bookmark, BookmarkCheck, LayoutGrid, ListFilter, Wand2, Map, ExternalLink, Clock, AlertTriangle, History, Zap, TrendingUp, Filter, Users, Layers, WifiOff, Wifi, ChevronDown, ArrowLeft } from 'lucide-react';
import Navigation from './components/Navigation';
import MarkdownRenderer from './components/MarkdownRenderer';
import ShareButton from './components/ShareButton';
import IncidentChart from './components/IncidentChart';
import { View, ChatMessage, Template, SecurityRole, StoredReport, WeeklyTip, UserProfile, KnowledgeDocument, SavedTrend, StoredTrainingModule, IntelligenceBriefing, SocialMediaIntel } from './types';
import { STATIC_TEMPLATES, SECURITY_TRAINING_DB } from './constants';
import { generateAdvisorResponse, generateTrainingModule, analyzeReport, fetchBestPractices, generateWeeklyTip, getTrainingSuggestions, analyzePatrolEffectiveness, fetchTopicSuggestions, generateSecurityIntelligenceBriefing, fetchSocialMediaIntelligence } from './services/geminiService';

const AntiRiskLogo = ({ className = "w-24 h-24", light = false }: { className?: string; light?: boolean }) => (
  <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M50 5 L95 85 L5 85 Z" fill={light ? "#1e293b" : "#000000"} />
    <path d="M50 15 L85 80 L15 80 Z" fill={light ? "#334155" : "#000000"} />
    <circle cx="50" cy="55" r="30" fill="white" />
    <text x="50" y="68" fontFamily="Arial, sans-serif" fontSize="38" fontWeight="bold" fill="black" textAnchor="middle">AR</text>
    <rect x="0" y="85" width="100" height="15" fill="#000" />
    <text x="50" y="96" fontFamily="Arial, sans-serif" fontSize="8" fontWeight="bold" fill="white" textAnchor="middle">ANTI-RISK SECURITY</text>
  </svg>
);

function App() {
  const [appState, setAppState] = useState<'SPLASH' | 'PIN_ENTRY' | 'PIN_SETUP' | 'READY'>('SPLASH');
  const [pinInput, setPinInput] = useState('');
  const [setupStep, setSetupStep] = useState(1);
  const [tempPin, setTempPin] = useState('');
  const [isPinError, setIsPinError] = useState(false);
  const [splashProgress, setSplashProgress] = useState(0);
  const [storedPin, setStoredPin] = useState<string | null>(() => localStorage.getItem('security_app_vault_pin'));
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showNewTipAlert, setShowNewTipAlert] = useState<WeeklyTip | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Training Synthesis Parameters
  const [trainingRole, setTrainingRole] = useState<string>('Security Guard');
  const [trainingWeek, setTrainingWeek] = useState<string>('Week 1');

  // Social Intelligence State
  const [socialIntel, setSocialIntel] = useState<SocialMediaIntel | null>(() => {
    const saved = localStorage.getItem('security_social_intel');
    return saved ? JSON.parse(saved) : null;
  });
  const [isSocialLoading, setIsSocialLoading] = useState(false);
  const [lastSocialSync, setLastSocialSync] = useState<number>(() => {
    const saved = localStorage.getItem('security_social_sync');
    return saved ? parseInt(saved) : 0;
  });

  // Intelligence Briefing State
  const [intelligenceHistory, setIntelligenceHistory] = useState<IntelligenceBriefing[]>(() => {
    const saved = localStorage.getItem('security_intelligence_briefings');
    return saved ? JSON.parse(saved) : [];
  });
  const [isIntelligenceLoading, setIsIntelligenceLoading] = useState(false);
  const [selectedBriefingId, setSelectedBriefingId] = useState<string | null>(null);
  const [nextSyncCountdown, setNextSyncCountdown] = useState<string>('Checking...');

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('security_app_profile');
    return saved ? JSON.parse(saved) : { name: '', phoneNumber: '', email: '' };
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('security_app_chat');
    return saved ? JSON.parse(saved) : [{
      id: 'welcome',
      role: 'model',
      text: "Hello. I am the AntiRisk Executive Advisor. I am ready to assist with operations, liability reduction, and strategic planning.",
      timestamp: Date.now()
    }];
  });

  const [storedReports, setStoredReports] = useState<StoredReport[]>(() => {
    const saved = localStorage.getItem('security_app_reports');
    return saved ? JSON.parse(saved) : [];
  });

  const [weeklyTips, setWeeklyTips] = useState<WeeklyTip[]>(() => {
    const saved = localStorage.getItem('security_app_weekly_tips');
    return saved ? JSON.parse(saved) : [];
  });

  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeDocument[]>(() => {
    const saved = localStorage.getItem('security_app_kb');
    return saved ? JSON.parse(saved) : [];
  });

  const [savedTraining, setSavedTraining] = useState<StoredTrainingModule[]>(() => {
    const saved = localStorage.getItem('security_app_training');
    return saved ? JSON.parse(saved) : [];
  });

  const [inputMessage, setInputMessage] = useState('');
  const [isAdvisorThinking, setIsAdvisorThinking] = useState(false);
  const [showKbModal, setShowKbModal] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocContent, setNewDocContent] = useState('');
  const [trainingTopic, setTrainingTopic] = useState('');
  const [trainingContent, setTrainingContent] = useState('');
  const [trainingSources, setTrainingSources] = useState<Array<{ title: string; url: string }> | undefined>(undefined);
  const [isTrainingLoading, setIsTrainingLoading] = useState(false);
  const [isSmartSuggesting, setIsSmartSuggesting] = useState(false);
  const [reportText, setReportText] = useState('');
  const [analysisResult, setAnalysisResult] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzerTab, setAnalyzerTab] = useState<'DAILY' | 'PATROL'>('DAILY');
  const [isTipLoading, setIsTipLoading] = useState(false);
  const [uploadingTemplateId, setUploadingTemplateId] = useState<string | null>(null);
  
  const [isTopicSearchFocused, setIsTopicSearchFocused] = useState(false);
  const [placeholderTopic, setPlaceholderTopic] = useState('');
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isAiSuggesting, setIsAiSuggesting] = useState(false);
  const topicDropdownRef = useRef<HTMLDivElement>(null);

  const allTopicsSorted = useMemo(() => {
    const staticTopics = Object.values(SECURITY_TRAINING_DB).flat();
    return Array.from(new Set([...staticTopics, ...aiSuggestions])).sort((a, b) => a.localeCompare(b));
  }, [aiSuggestions]);

  const filteredTopics = useMemo(() => {
    if (!trainingTopic) return allTopicsSorted.slice(0, 15);
    const search = trainingTopic.toLowerCase().trim();
    return allTopicsSorted
      .filter(t => t.toLowerCase().includes(search))
      .slice(0, 20);
  }, [trainingTopic, allTopicsSorted]);

  // Automated Weekly Tip Logic (Monday 7 AM Nigeria Time)
  useEffect(() => {
    if (appState !== 'READY' || !isOnline) return;

    const checkAndGenerateWeeklyTip = async () => {
      const now = new Date();
      const nigeriaTime = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Africa/Lagos',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).formatToParts(now);

      const parts: Record<string, string> = {};
      nigeriaTime.forEach(p => parts[p.type] = p.value);

      const hour = parseInt(parts.hour);
      const dayOfWeek = now.getDay(); 
      
      const oneJan = new Date(now.getFullYear(), 0, 1);
      const numberOfDays = Math.floor((now.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000));
      const weekNumber = Math.ceil((now.getDay() + 1 + numberOfDays) / 7);
      const weekKey = `${now.getFullYear()}-W${weekNumber}`;

      const lastGeneratedWeek = localStorage.getItem('security_last_tip_week');

      if (dayOfWeek >= 1 && (dayOfWeek > 1 || hour >= 7) && lastGeneratedWeek !== weekKey) {
        setIsTipLoading(true);
        try {
          const content = await generateWeeklyTip(weeklyTips);
          const derivedTopicMatch = content.match(/\*\*(.*)\*\*/) || content.match(/Topic:\s*(.*)/i);
          const derivedTopic = derivedTopicMatch ? derivedTopicMatch[1].trim() : "Weekly Strategic Focus";
          
          const newTip: WeeklyTip = { 
            id: Date.now().toString(), 
            timestamp: Date.now(), 
            weekDate: new Date().toLocaleDateString(), 
            topic: derivedTopic, 
            content, 
            isAutoGenerated: true 
          };
          
          setWeeklyTips(prev => [newTip, ...prev]);
          setShowNewTipAlert(newTip);
          localStorage.setItem('security_last_tip_week', weekKey);
        } catch (error) {
          console.error("Automated tip generation failed", error);
        } finally {
          setIsTipLoading(false);
        }
      }
    };

    checkAndGenerateWeeklyTip();
  }, [appState, isOnline, weeklyTips]);

  const handleToolkitFileUpload = (templateId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadingTemplateId(templateId);
      setTimeout(() => {
        setUploadingTemplateId(null);
        alert(`Successfully synchronized ${file.name} with AntiRisk protocols. Vault updated.`);
      }, 1500);
    }
  };

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleTriggerSocialIntel = async () => {
    if (isSocialLoading) return;
    if (!isOnline) {
      alert("System is currently offline. Synchronize logic requires a network handshake to fetch real-time Nigerian news.");
      return;
    }
    setIsSocialLoading(true);
    try {
      const result = await fetchSocialMediaIntelligence();
      setSocialIntel(result);
      const now = Date.now();
      setLastSocialSync(now);
      localStorage.setItem('security_social_intel', JSON.stringify(result));
      localStorage.setItem('security_social_sync', now.toString());
    } catch (err) {
      console.error("Social intelligence sync failed");
    } finally {
      setIsSocialLoading(false);
    }
  };

  useEffect(() => {
    if (appState !== 'READY' || !isOnline) return;
    const checkAndSyncSocial = () => {
      const now = Date.now();
      const oneHour = 60 * 60 * 1000;
      if (!socialIntel || (now - lastSocialSync) >= oneHour) {
        handleTriggerSocialIntel();
      }
    };
    checkAndSyncSocial();
    const interval = setInterval(checkAndSyncSocial, 60000 * 5); 
    return () => clearInterval(interval);
  }, [appState, socialIntel, lastSocialSync, isOnline]);

  const handleGenerateTraining = async () => {
    const topic = trainingTopic.trim();
    if (!topic) return;
    setIsTrainingLoading(true);
    setTrainingSources(undefined);
    setIsTopicSearchFocused(false);
    try {
      const result = await generateTrainingModule(topic, trainingRole, trainingWeek);
      setTrainingContent(result.text);
      setTrainingSources(result.sources);
    } finally {
      setIsTrainingLoading(false);
    }
  };

  const handleTriggerIntelligence = async () => {
    if (isIntelligenceLoading) return;
    if (!isOnline) {
      alert("System is currently offline. Intelligence Engine requires active connection to crawl global security feeds.");
      return;
    }
    setIsIntelligenceLoading(true);
    try {
      const previousContent = intelligenceHistory[0]?.content;
      const result = await generateSecurityIntelligenceBriefing(previousContent);
      const newBriefing: IntelligenceBriefing = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        content: result.text,
        sources: result.sources
      };
      setIntelligenceHistory(prev => [newBriefing, ...prev]);
      setSelectedBriefingId(newBriefing.id);
    } catch (err) {
      console.error("Failed to generate intelligence briefing");
    } finally {
      setIsIntelligenceLoading(false);
    }
  };

  useEffect(() => {
    if (appState !== 'READY' || !isOnline) return;
    const checkAndGenerateBriefing = () => {
      const now = Date.now();
      const lastBriefing = intelligenceHistory[0];
      const twoHours = 2 * 60 * 60 * 1000;
      if (!lastBriefing) {
        handleTriggerIntelligence();
      } else {
        const diff = now - lastBriefing.timestamp;
        if (diff >= twoHours) {
          handleTriggerIntelligence();
        } else {
          const remaining = twoHours - diff;
          const mins = Math.floor(remaining / 60000);
          setNextSyncCountdown(`${mins}m remaining`);
        }
      }
    };
    checkAndGenerateBriefing();
    const interval = setInterval(checkAndGenerateBriefing, 60000); 
    return () => clearInterval(interval);
  }, [appState, intelligenceHistory, isOnline]);

  useEffect(() => {
    if (!trainingTopic || trainingTopic.length < 3 || !isOnline) return;
    const timeout = setTimeout(async () => {
      setIsAiSuggesting(true);
      const suggestions = await fetchTopicSuggestions(trainingTopic);
      setAiSuggestions(prev => Array.from(new Set([...prev, ...suggestions])));
      setIsAiSuggesting(false);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [trainingTopic, isOnline]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (topicDropdownRef.current && !topicDropdownRef.current.contains(event.target as Node)) {
        setIsTopicSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    let timeout: any;
    let charIndex = 0;
    const targetTopic = allTopicsSorted[currentTopicIndex] || "Strategic Perimeter Defense";
    const typeWriter = () => {
      if (charIndex <= targetTopic.length) {
        setPlaceholderTopic(`e.g. ${targetTopic.substring(0, charIndex)}`);
        charIndex++;
        timeout = setTimeout(typeWriter, 50);
      } else {
        timeout = setTimeout(() => {
          setCurrentTopicIndex((prev) => (prev + 1) % allTopicsSorted.length);
        }, 3000);
      }
    };
    typeWriter();
    return () => clearTimeout(timeout);
  }, [currentTopicIndex, allTopicsSorted]);

  useEffect(() => { localStorage.setItem('security_app_profile', JSON.stringify(userProfile)); }, [userProfile]);
  useEffect(() => { localStorage.setItem('security_app_chat', JSON.stringify(messages)); }, [messages]);
  useEffect(() => { localStorage.setItem('security_app_reports', JSON.stringify(storedReports)); }, [storedReports]);
  useEffect(() => { localStorage.setItem('security_app_weekly_tips', JSON.stringify(weeklyTips)); }, [weeklyTips]);
  useEffect(() => { localStorage.setItem('security_app_kb', JSON.stringify(knowledgeBase)); }, [knowledgeBase]);
  useEffect(() => { localStorage.setItem('security_app_training', JSON.stringify(savedTraining)); }, [savedTraining]);
  useEffect(() => { localStorage.setItem('security_intelligence_briefings', JSON.stringify(intelligenceHistory)); }, [intelligenceHistory]);

  useEffect(() => {
    if (appState === 'SPLASH') {
      const startTime = Date.now();
      const duration = 2000;
      const timer = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min((elapsed / duration) * 100, 100);
        setSplashProgress(progress);
        if (progress >= 100) {
          clearInterval(timer);
          setTimeout(() => setAppState(storedPin ? 'PIN_ENTRY' : 'PIN_SETUP'), 300);
        }
      }, 30);
      return () => clearInterval(timer);
    }
  }, [appState, storedPin]);

  const handlePinDigit = (digit: string) => {
    if (pinInput.length >= 4) return;
    const newPin = pinInput + digit;
    setPinInput(newPin);
    setIsPinError(false);
    if (newPin.length === 4) {
      if (appState === 'PIN_ENTRY') {
        if (newPin === storedPin) setAppState('READY');
        else { setIsPinError(true); setTimeout(() => setPinInput(''), 500); }
      } else {
        if (setupStep === 1) { setTempPin(newPin); setSetupStep(2); setPinInput(''); }
        else {
          if (newPin === tempPin) { localStorage.setItem('security_app_vault_pin', newPin); setStoredPin(newPin); setAppState('READY'); }
          else { setIsPinError(true); setSetupStep(1); setPinInput(''); }
        }
      }
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: inputMessage, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsAdvisorThinking(true);
    const response = await generateAdvisorResponse(messages, inputMessage, knowledgeBase);
    const aiMsg: ChatMessage = { id: Date.now().toString() + 'ai', role: 'model', text: response.text, timestamp: Date.now() };
    setMessages(prev => [...prev, aiMsg]);
    setIsAdvisorThinking(false);
  };

  const handleAnalyzeReport = async () => {
    if (!reportText) return;
    setIsAnalyzing(true);
    const result = await analyzeReport(reportText, storedReports);
    setAnalysisResult(result);
    setStoredReports(prev => [{ id: Date.now().toString(), timestamp: Date.now(), dateStr: new Date().toLocaleDateString(), content: reportText, analysis: result }, ...prev]);
    setIsAnalyzing(false);
  };

  const handleAnalyzePatrols = async () => {
    setIsAnalyzing(true);
    try {
      const result = await analyzePatrolEffectiveness(storedReports, knowledgeBase);
      setAnalysisResult(result);
    } catch (error) {
      setAnalysisResult("Failed to generate patrol analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSmartAutoGenerate = async () => {
    setIsSmartSuggesting(true);
    try {
      const suggestions = await getTrainingSuggestions(storedReports);
      const selectedTopic = suggestions.length > 0 ? suggestions[0] : allTopicsSorted[Math.floor(Math.random() * allTopicsSorted.length)];
      setTrainingTopic(selectedTopic);
      setIsTrainingLoading(true);
      const result = await generateTrainingModule(selectedTopic, trainingRole, trainingWeek);
      setTrainingContent(result.text);
      setTrainingSources(result.sources);
    } finally {
      setIsSmartSuggesting(false);
      setIsTrainingLoading(false);
    }
  };

  const handleSaveTraining = () => {
    if (!trainingContent || !trainingTopic) return;
    const newModule: StoredTrainingModule = {
      id: Date.now().toString(),
      topic: `${trainingTopic} (${trainingWeek})`,
      targetAudience: trainingRole,
      content: trainingContent,
      generatedDate: new Date().toLocaleDateString(),
      timestamp: Date.now()
    };
    setSavedTraining(prev => [newModule, ...prev]);
    alert("Training module archived.");
  };

  const handleAddKbDocument = () => {
    if (!newDocTitle || !newDocContent) return;
    const newDoc: KnowledgeDocument = { id: Date.now().toString(), title: newDocTitle, content: newDocContent, dateAdded: new Date().toLocaleDateString() };
    setKnowledgeBase(prev => [...prev, newDoc]);
    setNewDocTitle(''); setNewDocContent('');
    setShowKbModal(false);
  };

  const renderDashboard = () => {
    const stats = [
      { label: 'Incident Reports', value: storedReports.length, icon: FileText, color: 'text-blue-400' },
      { label: 'Weekly Tips', value: weeklyTips.length, icon: Lightbulb, color: 'text-yellow-400' },
      { label: 'Policy Vault', value: knowledgeBase.length, icon: Database, color: 'text-emerald-400' },
      { label: 'Training Modules', value: savedTraining.length, icon: BookOpen, color: 'text-purple-400' },
    ];

    return (
      <div className="max-w-6xl mx-auto space-y-8 pb-20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Executive Dashboard</h2>
            <p className="text-slate-400 font-medium">AntiRisk Management Command Center</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-3 bg-slate-800/40 p-2 px-4 rounded-2xl border border-slate-700/50 shadow-inner">
               <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'}`}></div>
               <span className="text-xs font-black text-slate-300 uppercase tracking-widest">{isOnline ? 'Active Surveillance' : 'Offline Vault'}</span>
             </div>
             {!isOnline && (
               <button onClick={() => window.location.reload()} className="p-2 text-blue-400 bg-blue-400/10 rounded-xl hover:bg-blue-400/20 transition-all active:scale-95" title="Attempt Reconnect">
                 <RefreshCw size={18} />
               </button>
             )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-[#1b2537] p-8 rounded-[2.5rem] border border-slate-700/50 shadow-lg group hover:border-blue-500/30 transition-all">
              <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-2xl bg-slate-900/50 ${stat.color} group-hover:scale-110 transition-transform`}>
                  <stat.icon size={28} />
                </div>
              </div>
              <p className="text-4xl font-black text-white mb-1">{stat.value}</p>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-[#1b2537] p-8 rounded-[3rem] border border-slate-700/50 shadow-xl">
              <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-4">
                <BarChart2 className="text-blue-400" /> Incident Distribution
              </h3>
              <IncidentChart reports={storedReports} />
            </div>

            <div className="bg-[#1b2537] p-8 rounded-[3rem] border border-slate-700/50 shadow-xl">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold text-white flex items-center gap-4">
                  <Clock className="text-emerald-400" /> Recent Activity
                </h3>
              </div>
              <div className="space-y-4">
                {storedReports.length > 0 ? (
                  storedReports.slice(0, 5).map(report => (
                    <div key={report.id} className="flex items-center justify-between p-4 bg-slate-900/40 border border-slate-800 rounded-2xl">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                          <FileText size={18} className="text-slate-400" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white line-clamp-1">{report.content}</p>
                          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{report.dateStr}</p>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-slate-700" />
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center">
                    <p className="text-slate-600 italic">No recent incidents recorded.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-[#1b2537] p-8 rounded-[3rem] border border-slate-700/50 shadow-xl">
              <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-4">
                <Zap className="text-yellow-400" /> Quick Actions
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <button onClick={() => setCurrentView(View.REPORT_ANALYZER)} className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm transition-all flex items-center justify-between group">
                  New Incident Analysis <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                </button>
                <button onClick={() => setCurrentView(View.TRAINING)} className="w-full py-4 px-6 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl font-bold text-sm transition-all flex items-center justify-between">
                  Generate Training <BookOpen size={18} />
                </button>
                <button onClick={() => setCurrentView(View.WEEKLY_TIPS)} className="w-full py-4 px-6 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-bold text-sm transition-all flex items-center justify-between">
                  Weekly Focus <Lightbulb size={18} />
                </button>
              </div>
            </div>

            {socialIntel && (
              <div className="bg-[#1b2537] p-8 rounded-[3rem] border border-slate-700/50 shadow-xl">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-4">
                  <TrendingUp size={22} className="text-blue-400" /> Intelligence Alert
                </h3>
                <div className="p-5 bg-blue-500/5 border border-blue-500/20 rounded-2xl">
                  <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">Top Trend</p>
                  <p className="text-sm font-bold text-slate-200 leading-snug">{socialIntel.hourly_digest.top_story}</p>
                </div>
                <button onClick={() => setCurrentView(View.SOCIAL_TRENDS)} className="w-full mt-6 py-4 text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-[0.2em] flex items-center justify-center gap-2 border-t border-slate-800/50 pt-6 transition-all">
                  Full Radar Analysis <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderSocialTrends = () => (
    <div className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-6rem)] max-w-7xl mx-auto w-full gap-6">
      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 flex-1 min-h-0">
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-hidden">
          <div className="bg-[#1b2537] p-8 rounded-[2.5rem] border border-slate-700/50 shadow-lg flex flex-col shrink-0">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-3"><Zap size={28} className="text-yellow-400" /> Social Radar</h2>
                {!isOnline && (
                  <div className="mt-2 flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-lg">
                    <WifiOff size={12} className="text-red-500" />
                    <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">Offline Mode - Using Cache</span>
                  </div>
                )}
              </div>
              <button 
                onClick={handleTriggerSocialIntel} 
                disabled={isSocialLoading || !isOnline} 
                className={`p-3 rounded-2xl transition-all ${!isOnline ? 'bg-slate-800/40 text-slate-600 opacity-50 cursor-not-allowed' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}
                title={isOnline ? "Sync Real-time News" : "Reconnect to Sync"}
              >
                <RefreshCw className={isSocialLoading ? "animate-spin" : ""} size={20} />
              </button>
            </div>
            {socialIntel?.hourly_digest && (
              <div className="space-y-6">
                <div className="p-5 bg-yellow-500/10 border border-yellow-500/20 rounded-[1.5rem]">
                  <h4 className="text-[10px] font-black text-yellow-500 uppercase tracking-widest mb-2 flex items-center gap-2"><TrendingUp size={12} /> Top Trending Story</h4>
                  <p className="text-sm font-bold text-white leading-snug">{socialIntel.hourly_digest.top_story}</p>
                </div>
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Emerging Trends</h4>
                  <div className="flex flex-wrap gap-2">
                    {socialIntel.hourly_digest.emerging_trends.map((trend, i) => (
                      <span key={i} className="px-4 py-2 bg-slate-900/60 border border-slate-800 rounded-xl text-[11px] font-bold text-slate-300 flex items-center gap-2"><Filter size={10} className="text-blue-400" /> {trend}</span>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Key Updates</h4>
                  <ul className="space-y-3">
                    {socialIntel.hourly_digest.key_updates.map((update, i) => (
                      <li key={i} className="flex items-start gap-3 group">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 group-hover:scale-125 transition-transform shrink-0" />
                        <span className="text-xs font-semibold text-slate-400 leading-relaxed group-hover:text-slate-200">{update}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="pt-4 border-t border-slate-800/40">
                  <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest flex justify-between">
                    <span>Cached At: {new Date(lastSocialSync).toLocaleTimeString()}</span>
                    <span>1H Cycle {isOnline ? 'Active' : 'Paused'}</span>
                  </p>
                </div>
              </div>
            )}
          </div>
          {isOnline && (
            <div className="bg-blue-600/10 border border-blue-500/20 p-6 rounded-[2rem] animate-in fade-in slide-in-from-bottom-2">
              <p className="text-xs font-bold text-blue-400 mb-2 flex items-center gap-2"><Wifi size={14} /> Network Restored</p>
              <button 
                onClick={handleTriggerSocialIntel}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-sm transition-all shadow-lg active:scale-95"
              >
                Synchronize Live Feeds
              </button>
            </div>
          )}
        </div>
        <div className="lg:col-span-8 flex flex-col gap-6 overflow-hidden">
          <div className="bg-[#1b2537] rounded-[2.5rem] border border-slate-700/50 overflow-hidden shadow-2xl flex flex-col flex-1">
            <div className="p-6 bg-slate-900/40 border-b border-slate-700/50 flex justify-between items-center">
              <h3 className="font-bold text-white text-lg flex items-center gap-3"><Bell size={22} className="text-blue-400" /> Executive Intelligence Alerts</h3>
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                {isOnline ? (
                  <><ShieldCheck size={14} className="text-emerald-400" /> Verified Sources Only</>
                ) : (
                  <><WifiOff size={14} className="text-red-500" /> Viewing Vault History</>
                )}
              </div>
            </div>
            <div className="flex-1 p-8 overflow-y-auto bg-slate-900/10 scrollbar-hide space-y-6">
              {isSocialLoading && !socialIntel ? (
                <div className="h-full flex flex-col items-center justify-center gap-6">
                  <Zap size={64} className="text-yellow-400/20 animate-pulse" />
                  <div className="text-center">
                    <h4 className="text-white font-bold text-xl mb-2">Scanning Nigerian Radar</h4>
                    <p className="text-slate-500 max-w-sm">Fetching high-impact stories from Linda Ikeji, BellaNaija, Pulse, and Sahara Reporters...</p>
                  </div>
                </div>
              ) : socialIntel?.notifications ? (
                socialIntel.notifications.map((notif, idx) => (
                  <div key={idx} className={`p-8 rounded-[2rem] border transition-all hover:bg-slate-800 group relative ${notif.priority === 'high' ? 'bg-red-500/5 border-red-500/20' : 'bg-slate-900/30 border-slate-800/60'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${notif.priority === 'high' ? 'bg-red-500 text-white border-red-400' : 'bg-blue-600/10 text-blue-400 border-blue-500/20'}`}>{notif.priority === 'high' ? 'High Priority Alert' : notif.category}</span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{notif.source}</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-600">{new Date(notif.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <h4 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors leading-tight">{notif.title}</h4>
                    <p className="text-slate-400 text-sm leading-relaxed mb-6 italic">{notif.summary}</p>
                    <div className="flex justify-end pt-4 border-t border-slate-800/40 mt-4">
                      <button onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(notif.title + ' ' + notif.source)}`, '_blank')} className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-[0.2em] flex items-center gap-2 transition-all">Drill Down Detail <ChevronRight size={14} /></button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-30 text-slate-500 gap-6"><Zap size={64} /><p className="text-xl font-bold">Synchronize Social Media Intelligence Agent to begin.</p></div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReportAnalyzer = () => (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="bg-[#1b2537] p-8 rounded-[2.5rem] border border-slate-700/50 shadow-xl overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-5">
            <div className="bg-blue-500/10 p-4 rounded-3xl"><FileText className="text-blue-400" size={36} /></div>
            <div>
              <h2 className="text-3xl font-bold text-white tracking-tight">Intelligence Log</h2>
              <p className="text-slate-400 font-medium">Synthesize operational data into risk insights.</p>
            </div>
          </div>
          <div className="flex bg-slate-900/60 p-1.5 rounded-[1.25rem] border border-slate-800/60">
            <button onClick={() => setAnalyzerTab('DAILY')} className={`px-8 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 ${analyzerTab === 'DAILY' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-500 hover:text-white'}`}>Daily Report</button>
            <button onClick={() => setAnalyzerTab('PATROL')} className={`px-8 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 ${analyzerTab === 'PATROL' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-500 hover:text-white'}`}>Patrol Audit</button>
          </div>
        </div>
        {analyzerTab === 'DAILY' ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Input Incident or Activity Details</label>
              <textarea value={reportText} onChange={(e) => setReportText(e.target.value)} placeholder="Describe the situation, site conditions, or incidents in detail..." className="w-full bg-slate-900/40 border border-slate-700/40 rounded-[2rem] p-8 h-56 text-white focus:border-blue-500/50 outline-none resize-none text-lg transition-all placeholder:text-slate-700 font-medium" />
            </div>
            <button onClick={handleAnalyzeReport} disabled={isAnalyzing || !reportText.trim()} className="w-full bg-blue-600 hover:bg-blue-700 py-5 rounded-[1.5rem] font-bold text-white transition-all shadow-xl text-lg flex items-center justify-center gap-4 disabled:opacity-50 active:scale-[0.99]">{isAnalyzing ? <RefreshCw className="animate-spin" size={24} /> : <Sparkles size={24} />} Generate Intelligence Analysis</button>
          </div>
        ) : (
          <div className="space-y-6 text-center py-12 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-blue-500/5 border border-blue-500/10 p-12 rounded-[3rem]">
              <BarChart2 size={72} className="text-blue-400/30 mx-auto mb-8" />
              <h3 className="text-2xl font-bold text-white mb-3">Strategic Patrol Optimization</h3>
              <p className="text-slate-400 mb-10 max-w-md mx-auto leading-relaxed">Cross-references historical incident logs with site SOPs to identify surveillance gaps and predict high-risk patrol windows.</p>
              <button onClick={handleAnalyzePatrols} disabled={isAnalyzing || storedReports.length === 0} className="bg-emerald-600 hover:bg-emerald-700 px-12 py-5 rounded-2xl font-bold text-white transition-all shadow-2xl flex items-center justify-center gap-4 mx-auto disabled:opacity-50 active:scale-95">{isAnalyzing ? <RefreshCw className="animate-spin" size={24} /> : <ShieldCheck size={24} />} Audit Patrol Efficiency</button>
              {storedReports.length === 0 && <p className="mt-6 text-[10px] font-black text-red-500 uppercase tracking-widest">Requires historical log data</p>}
            </div>
          </div>
        )}
      </div>
      {analysisResult && (
        <div className="bg-[#1b2537] rounded-[3rem] border border-blue-500/20 overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-500">
          <div className="p-8 bg-blue-900/10 border-b border-blue-500/10 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-white text-xl flex items-center gap-4"><Sparkles size={24} className="text-yellow-400" /> Executive Analysis</h3>
              {!isOnline && <p className="text-[10px] text-amber-500 font-bold uppercase mt-1">Generated via Static Security Principles</p>}
            </div>
            <ShareButton content={analysisResult} title="AntiRisk Security Analysis Report" />
          </div>
          <div className="p-10 bg-slate-900/10"><MarkdownRenderer content={analysisResult} /></div>
        </div>
      )}
    </div>
  );

  const renderTrainingView = () => (
    <div className="max-w-7xl mx-auto h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-6 pb-4">
      <div className="w-full lg:w-96 flex flex-col gap-6 overflow-y-auto scrollbar-hide pr-1">
        <div className="bg-[#1b2537] p-8 rounded-[2.5rem] border border-slate-700/50 shadow-xl flex flex-col gap-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
               <BookOpen className="text-emerald-400" size={32} />
               <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">Intel Engine</h2>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Endless Database Active</p>
               </div>
            </div>
            <button onClick={handleSmartAutoGenerate} disabled={isSmartSuggesting} className="p-3 bg-slate-800 rounded-2xl text-emerald-400 hover:bg-slate-700 transition-all">
               <Wand2 size={20} />
            </button>
          </div>

          <div className="space-y-3">
             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Core Security Domain Search</label>
             <div className="relative">
                <input 
                  value={trainingTopic} 
                  onChange={(e) => {
                    setTrainingTopic(e.target.value);
                    setIsTopicSearchFocused(true);
                  }}
                  onFocus={() => setIsTopicSearchFocused(true)}
                  placeholder="e.g. Counter-Surveillance..." 
                  className="w-full bg-[#0a0f1a] border border-slate-800 rounded-2xl pl-5 pr-12 py-4 text-sm text-white focus:border-blue-500 outline-none transition-all placeholder:text-slate-800 font-medium" 
                />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-700" size={20} />
                
                {isTopicSearchFocused && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-[#0a0f1a] border border-slate-800 rounded-2xl shadow-2xl z-50 max-h-60 overflow-y-auto scrollbar-hide" ref={topicDropdownRef}>
                    {filteredTopics.map((topic, idx) => (
                      <button key={idx} onClick={() => { setTrainingTopic(topic); setIsTopicSearchFocused(false); }} className="w-full text-left p-4 hover:bg-slate-800/50 text-xs font-bold text-slate-400 hover:text-white transition-all border-b border-slate-900 last:border-0">{topic}</button>
                    ))}
                  </div>
                )}
             </div>
          </div>

          <div className="space-y-3">
             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Training Level</label>
             <div className="flex bg-[#0a0f1a] p-1.5 rounded-2xl border border-slate-800">
                {['Week 1', 'Week 2', 'Week 3'].map(week => (
                  <button 
                    key={week} 
                    onClick={() => setTrainingWeek(week)}
                    className={`flex-1 py-3 px-4 rounded-xl text-[11px] font-black transition-all ${trainingWeek === week ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-600 hover:text-slate-400'}`}
                  >
                    {week}
                  </button>
                ))}
             </div>
          </div>

          <div className="space-y-3">
             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Target Role Focus</label>
             <div className="relative group">
                <select 
                  value={trainingRole}
                  onChange={(e) => setTrainingRole(e.target.value)}
                  className="w-full bg-[#0a0f1a] border border-slate-800 rounded-2xl px-5 py-4 text-sm font-bold text-white focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="Security Guard">Security Guard</option>
                  <option value="Site Supervisor">Site Supervisor</option>
                  <option value="General Supervisor">General Supervisor</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                  <ChevronDown size={18} />
                </div>
             </div>
          </div>

          <button 
            onClick={handleGenerateTraining} 
            disabled={isTrainingLoading || !trainingTopic.trim()} 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-[1.75rem] font-black text-base shadow-xl transition-all flex items-center justify-center gap-4 disabled:opacity-50 active:scale-95"
          >
            {isTrainingLoading ? <RefreshCw className="animate-spin" size={24} /> : <><Sparkles size={22} /> Research & Build Domain</>}
          </button>
        </div>

        <div className="bg-[#1b2537] p-8 rounded-[2.5rem] border border-slate-700/50 shadow-xl">
           <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-3 mb-6"><Database size={16} /> Localized Library</h3>
           <div className="space-y-3">
              <button className="w-full text-left p-4 rounded-2xl bg-[#0a0f1a] border border-slate-800 text-sm font-bold text-white flex items-center justify-between group hover:border-blue-500/50 transition-all">
                 Tactical Operations
                 <ChevronRight size={16} className="text-slate-700 group-hover:text-blue-500 transition-all" />
              </button>
           </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        <div className="bg-[#1b2537] rounded-[3rem] border border-slate-700/50 overflow-hidden shadow-2xl flex flex-col flex-1">
          <div className="p-8 bg-slate-900/40 border-b border-slate-700/50 flex justify-between items-center">
            <h3 className="font-bold text-white text-lg flex items-center gap-4"><ShieldCheck className="text-emerald-400" /> Hyper-Actionable Tactical Brief</h3>
            <div className="flex gap-4">
              {trainingContent && (
                <>
                  <button onClick={handleSaveTraining} className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all shadow-lg active:scale-95">
                    <Save size={20} />
                  </button>
                  <ShareButton content={trainingContent} title={`Intel Brief: ${trainingTopic}`} />
                </>
              )}
            </div>
          </div>
          
          <div className="flex-1 p-12 overflow-y-auto scrollbar-hide bg-slate-900/10">
            {trainingContent ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <MarkdownRenderer content={trainingContent} />
                {trainingSources && trainingSources.length > 0 && (
                  <div className="mt-12 pt-10 border-t border-slate-800/60 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {trainingSources.map((source, idx) => (
                      <a key={idx} href={source.url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 p-5 bg-slate-800/30 border border-slate-800/60 rounded-2xl hover:border-blue-500/30 transition-all group">
                        <ExternalLink size={18} className="text-slate-600 group-hover:text-blue-400 shrink-0" />
                        <span className="text-xs font-bold text-slate-400 group-hover:text-slate-200 line-clamp-2">{source.title}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-20 py-20">
                <BookOpen size={100} className="mb-8" />
                <p className="text-xl font-black max-w-sm">Select a domain or search for a specific security topic to deploy tactical training.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderWeeklyTips = () => (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="bg-[#1b2537] p-8 rounded-[2.5rem] border border-slate-700/50 shadow-xl overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div className="flex items-center gap-5">
            <div className="bg-amber-500/10 p-4 rounded-3xl"><Lightbulb className="text-amber-400" size={36} /></div>
            <div>
              <h2 className="text-3xl font-bold text-white tracking-tight">Weekly Focus Archive</h2>
              <p className="text-slate-400 font-medium">Auto-generated force-wide strategic briefings.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl">
             <Clock size={16} className="text-emerald-400" />
             <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Monday 7AM Automation Active</span>
          </div>
        </div>

        {isTipLoading && (
          <div className="bg-blue-600/10 border border-blue-500/20 p-8 rounded-[2rem] mb-8 flex flex-col items-center justify-center text-center gap-4">
             <RefreshCw size={32} className="text-blue-400 animate-spin" />
             <p className="text-sm font-bold text-blue-100">Synthesizing this week's Strategic Force Briefing...</p>
          </div>
        )}

        <div className="space-y-6">
          {weeklyTips.length > 0 ? (
            weeklyTips.map(tip => (
              <div key={tip.id} className="bg-slate-900/30 border border-slate-800 rounded-[2rem] overflow-hidden group">
                <div className="p-8 border-b border-slate-800/40 bg-slate-800/20 flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold text-white">{tip.topic}</h3>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Week of {tip.weekDate} {tip.isAutoGenerated ? '| Strategic Auto-Brief' : ''}</p>
                  </div>
                  <ShareButton content={tip.content} title={`AntiRisk Weekly Focus: ${tip.topic}`} />
                </div>
                <div className="p-8"><MarkdownRenderer content={tip.content} /></div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center flex flex-col items-center justify-center opacity-30 text-slate-500">
              <Lightbulb size={64} className="mb-4" />
              <p className="text-xl font-bold">The Strategic Briefing will arrive on Monday at 07:00 WAT.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderIntelligenceBriefing = () => (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-4">
            <Globe className="text-blue-400" size={32} /> Global & Regional Intelligence
          </h2>
          <p className="text-slate-400 font-medium">Real-time surveillance of high-stakes Nigerian hubs.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-slate-900/60 px-4 py-2 rounded-xl border border-slate-800 text-[10px] font-black text-slate-500 uppercase tracking-widest">
            Next Sync: {nextSyncCountdown}
          </div>
          <button 
            onClick={handleTriggerIntelligence} 
            disabled={isIntelligenceLoading || !isOnline} 
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-900/20 transition-all active:scale-95 flex items-center gap-3 disabled:opacity-50"
          >
            {isIntelligenceLoading ? <RefreshCw className="animate-spin" size={18} /> : <RefreshCw size={18} />}
            Manual Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[600px]">
        <div className="lg:col-span-4 space-y-4 overflow-y-auto max-h-[800px] scrollbar-hide pr-2">
          <h3 className="text-xs font-black text-slate-600 uppercase tracking-widest mb-4 px-2">Briefing History</h3>
          {intelligenceHistory.map((briefing) => (
            <button
              key={briefing.id}
              onClick={() => setSelectedBriefingId(briefing.id)}
              className={`w-full text-left p-6 rounded-[1.75rem] border transition-all ${
                selectedBriefingId === briefing.id 
                  ? 'bg-blue-600 border-blue-500 shadow-lg shadow-blue-900/20' 
                  : 'bg-[#1b2537] border-slate-700/50 hover:border-slate-500'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-[10px] font-black uppercase tracking-widest ${selectedBriefingId === briefing.id ? 'text-blue-100' : 'text-slate-500'}`}>
                  {new Date(briefing.timestamp).toLocaleDateString()}
                </span>
                <span className={`text-[10px] font-bold ${selectedBriefingId === briefing.id ? 'text-blue-200' : 'text-slate-600'}`}>
                  {new Date(briefing.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className={`font-bold text-sm line-clamp-2 ${selectedBriefingId === briefing.id ? 'text-white' : 'text-slate-300'}`}>
                {briefing.content.substring(0, 80)}...
              </p>
            </button>
          ))}
          {intelligenceHistory.length === 0 && (
            <div className="text-center py-12 text-slate-600 italic">No history found.</div>
          )}
        </div>

        <div className="lg:col-span-8">
          {isIntelligenceLoading && !selectedBriefingId ? (
            <div className="h-full bg-[#1b2537] rounded-[3rem] border border-slate-700/50 flex flex-col items-center justify-center gap-6 shadow-xl">
              <RefreshCw className="text-blue-500 animate-spin" size={48} />
              <div className="text-center">
                <h4 className="text-white font-bold text-xl mb-2">Synthesizing Briefing</h4>
                <p className="text-slate-500 max-w-xs mx-auto text-sm">Crawling NIMASA, NSCDC, and global feeds for South-South/South-East Nigeria updates...</p>
              </div>
            </div>
          ) : selectedBriefingId ? (
            (() => {
              const briefing = intelligenceHistory.find(b => b.id === selectedBriefingId);
              if (!briefing) return null;
              return (
                <div className="bg-[#1b2537] rounded-[3rem] border border-slate-700/50 overflow-hidden shadow-2xl animate-in fade-in slide-in-from-right-4 duration-500 flex flex-col h-full">
                  <div className="p-8 bg-slate-900/40 border-b border-slate-700/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                    <div>
                      <h3 className="text-2xl font-black text-white mb-1">Intelligence Report</h3>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Cycle: 2-Hourly Strategic Sync</p>
                    </div>
                    <div className="flex gap-4">
                       <ShareButton content={briefing.content} title={`AntiRisk Intelligence Briefing - ${new Date(briefing.timestamp).toLocaleString()}`} />
                    </div>
                  </div>
                  <div className="flex-1 p-10 overflow-y-auto scrollbar-hide bg-slate-900/10">
                    <MarkdownRenderer content={briefing.content} />
                    {briefing.sources && briefing.sources.length > 0 && (
                      <div className="mt-12 pt-10 border-t border-slate-800/60">
                        <h4 className="text-xs font-black text-slate-600 uppercase tracking-[0.2em] mb-6 flex items-center gap-3"><Database size={16} /> Grounded Sources</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {briefing.sources.map((source, idx) => (
                            <a key={idx} href={source.url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 p-5 bg-slate-800/30 border border-slate-800/60 rounded-[1.5rem] hover:border-blue-500/30 transition-all group">
                              <ExternalLink size={18} className="text-slate-600 group-hover:text-blue-400 shrink-0" />
                              <span className="text-xs font-bold text-slate-400 group-hover:text-slate-200 line-clamp-2 leading-snug">{source.title}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="h-full bg-[#1b2537] rounded-[3.5rem] border-4 border-dashed border-slate-800 flex flex-col items-center justify-center p-12 text-center">
               <Globe size={80} className="text-slate-800 mb-8" />
               <h3 className="text-2xl font-black text-slate-400 mb-4">Select a Briefing</h3>
               <p className="text-slate-500 max-w-sm font-medium">Choose a report from the history on the left or generate a fresh sync.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderToolkit = () => (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-4">
            <Briefcase className="text-blue-400" size={32} /> Operations Vault
          </h2>
          <p className="text-slate-400 font-medium">Standardized templates and mission-critical documentation.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {STATIC_TEMPLATES.map((template) => (
          <div key={template.id} className="bg-[#1b2537] p-8 rounded-[2.5rem] border border-slate-700/50 shadow-xl flex flex-col h-full group transition-all duration-300 hover:scale-[1.03] hover:border-blue-500/60 hover:shadow-[0_0_35px_rgba(37,99,235,0.25)] ring-offset-slate-900 active:scale-[0.98]">
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-400 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                <FileText size={28} />
              </div>
              <ShareButton content={template.content} title={template.title} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{template.title}</h3>
            <p className="text-slate-400 text-sm mb-8 flex-1 leading-relaxed">{template.description}</p>
            
            <div className="space-y-4">
              <div className="p-5 bg-slate-900/60 rounded-2xl border border-slate-800 font-mono text-[10px] text-slate-500 overflow-hidden text-ellipsis whitespace-pre line-clamp-3 group-hover:border-slate-700 group-hover:bg-slate-900/80 transition-all">
                {template.content}
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    const blob = new Blob([template.content], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${template.id}.txt`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <Download size={14} /> Download
                </button>
                <button 
                  onClick={() => fileInputRefs.current[template.id]?.click()}
                  disabled={uploadingTemplateId === template.id}
                  className="flex-1 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-md"
                >
                  {uploadingTemplateId === template.id ? <RefreshCw size={14} className="animate-spin" /> : <Upload size={14} />}
                  Sync Local
                </button>
                <input 
                  type="file" 
                  ref={el => fileInputRefs.current[template.id] = el}
                  className="hidden" 
                  onChange={(e) => handleToolkitFileUpload(template.id, e)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (appState === 'SPLASH') {
    return (
      <div className="fixed inset-0 bg-[#0a0f1a] flex flex-col items-center justify-center p-8 z-[100]">
        <AntiRiskLogo className="w-32 h-32 mb-12 animate-pulse" light={true} />
        <div className="w-full max-w-xs space-y-6 text-center">
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden shadow-inner">
            <div className="h-full bg-blue-600 shadow-[0_0_20px_#2563eb] transition-all duration-300" style={{ width: `${splashProgress}%` }}></div>
          </div>
          <p className="text-sm font-bold text-blue-400 tracking-[0.3em] uppercase animate-pulse">Initializing Security Vault...</p>
        </div>
      </div>
    );
  }

  if (appState === 'PIN_ENTRY' || appState === 'PIN_SETUP') {
    return (
      <div className="fixed inset-0 bg-[#0a0f1a] flex flex-col items-center justify-center p-6 z-[100]">
        <AntiRiskLogo className="w-20 h-20 mb-6" />
        <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">{appState === 'PIN_SETUP' ? 'Initialize PIN' : 'Access Restricted'}</h2>
        <div className="flex gap-4 mb-12">
          {[...Array(4)].map((_, i) => <div key={i} className={`w-4 h-4 rounded-full border-2 ${pinInput.length > i ? (isPinError ? 'bg-red-500 border-red-500' : 'bg-blue-500 border-blue-500 shadow-[0_0_15px_#3b82f6]') : 'border-slate-800'}`} />)}
        </div>
        <div className="grid grid-cols-3 gap-4 w-full max-w-xs">
          {[1,2,3,4,5,6,7,8,9,0].map(num => <button key={num} onClick={() => handlePinDigit(num.toString())} className="aspect-square bg-slate-800/30 border border-slate-800/50 rounded-2xl text-2xl font-bold text-white active:scale-90 transition-all hover:bg-slate-800/60 shadow-inner">{num}</button>)}
          <button onClick={() => setPinInput('')} className="aspect-square bg-slate-800/30 border border-slate-800/50 rounded-2xl flex items-center justify-center text-red-500 hover:bg-red-900/10"><Trash2 size={24} /></button>
        </div>
      </div>
    );
  }

  const getViewTitle = () => {
    switch (currentView) {
      case View.DASHBOARD: return 'Dashboard';
      case View.SOCIAL_TRENDS: return 'Trending Intelligence';
      case View.ADVISOR: return 'AI Executive Advisor';
      case View.WEEKLY_TIPS: return 'Weekly Focus Archive';
      case View.BEST_PRACTICES: return 'Global Intelligence';
      case View.TRAINING: return 'Tactical Training Engine';
      case View.REPORT_ANALYZER: return 'Intelligence Log';
      case View.TOOLKIT: return 'Operations Vault';
      default: return 'AntiRisk Management';
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0a0f1a] text-slate-100 font-inter">
      <Navigation 
        currentView={currentView} 
        setView={setCurrentView} 
        isMobileMenuOpen={isMobileMenuOpen} 
        closeMobileMenu={() => setIsMobileMenuOpen(false)} 
        onOpenSettings={() => setShowSettings(true)} 
        socialBadge={socialIntel?.notifications.filter(n => n.priority === 'high').length}
      />
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="p-5 border-b border-slate-800/40 flex justify-between items-center bg-[#0a0f1a]/80 backdrop-blur-xl z-20 sticky top-0">
          <div className="flex items-center gap-6">
            {currentView !== View.DASHBOARD && (
              <button 
                onClick={() => setCurrentView(View.DASHBOARD)}
                className="flex items-center gap-2.5 text-blue-400 hover:text-white transition-all bg-blue-500/10 hover:bg-blue-600 px-4 py-2 rounded-xl border border-blue-500/20 group shadow-lg shadow-blue-500/5 active:scale-95"
              >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-xs font-black uppercase tracking-widest">Dashboard</span>
              </button>
            )}
            <div className="flex flex-col">
              <h1 className="font-black text-lg sm:text-2xl text-white tracking-tight leading-tight">{getViewTitle()}</h1>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">AntiRisk Strategic Access</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800/40">
              <ShieldCheck size={14} className="text-blue-400" />
              <span className="text-[10px] font-bold text-slate-400">Vault Level: Alpha</span>
            </div>
            <div className="lg:hidden">
              <button onClick={() => setIsMobileMenuOpen(true)} className="p-2.5 text-white bg-slate-800/50 rounded-xl hover:bg-slate-700 transition-colors"><Menu size={24} /></button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-12 scrollbar-hide">
          {currentView === View.DASHBOARD && renderDashboard()}
          {currentView === View.SOCIAL_TRENDS && renderSocialTrends()}
          {currentView === View.ADVISOR && (
            <div className="flex flex-col h-full max-w-4xl mx-auto bg-[#111827]/50 rounded-[2.5rem] border border-slate-800/50 overflow-hidden shadow-2xl">
               <div className="p-6 border-b border-slate-800/50 bg-[#1f2937]/30 flex justify-between items-center backdrop-blur-md">
                 <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/40">
                     <ShieldAlert className="text-white" size={22} />
                   </div>
                   <div>
                     <h2 className="font-black text-white text-lg tracking-tight">Executive Advisor</h2>
                     <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Always-on Intelligence</p>
                   </div>
                 </div>
                 <button onClick={() => setShowKbModal(true)} className="text-[10px] font-black uppercase tracking-widest text-blue-400 bg-blue-400/10 px-5 py-2.5 rounded-xl border border-blue-400/20 hover:bg-blue-400/20 transition-all shadow-inner">Policy Archives</button>
               </div>
               <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
                 {messages.map(msg => (
                   <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                     <div className={`max-w-[85%] p-6 rounded-[1.75rem] shadow-xl ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none shadow-blue-900/20' : 'bg-slate-800/80 text-slate-100 rounded-bl-none border border-slate-700/50 backdrop-blur-sm'}`}>
                       <MarkdownRenderer content={msg.text} />
                     </div>
                   </div>
                 ))}
                 {isAdvisorThinking && (
                   <div className="flex gap-2 p-6 bg-slate-800/40 rounded-2xl w-fit animate-pulse border border-slate-700/50">
                     <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce"></div>
                     <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce delay-100"></div>
                     <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce delay-200"></div>
                   </div>
                 )}
                 <div ref={chatEndRef} />
               </div>
               <div className="p-8 border-t border-slate-800/50 flex gap-4 bg-slate-900/20 backdrop-blur-md">
                 <input 
                  value={inputMessage} 
                  onChange={(e) => setInputMessage(e.target.value)} 
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} 
                  placeholder="Consult strategic intelligence..." 
                  className="flex-1 bg-slate-900/60 border border-slate-800 rounded-[1.25rem] px-8 py-5 text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-700 font-medium text-base shadow-inner" 
                 />
                 <button onClick={handleSendMessage} className="bg-blue-600 hover:bg-blue-700 text-white p-5 rounded-[1.25rem] shadow-xl shadow-blue-900/40 active:scale-95 flex items-center justify-center transition-all">
                   <Send size={28} />
                 </button>
               </div>
            </div>
          )}
          {currentView === View.WEEKLY_TIPS && renderWeeklyTips()}
          {currentView === View.REPORT_ANALYZER && renderReportAnalyzer()}
          {currentView === View.TRAINING && renderTrainingView()}
          {currentView === View.BEST_PRACTICES && renderIntelligenceBriefing()}
          {currentView === View.TOOLKIT && renderToolkit()}
        </div>

        {showKbModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in">
            <div className="bg-[#1b2537] rounded-[3rem] border border-slate-700/50 p-10 w-full max-w-2xl shadow-2xl">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-3xl font-bold text-white flex items-center gap-4"><Database className="text-emerald-400" size={32}/> Policy Archives</h2>
                <button onClick={() => setShowKbModal(false)} className="p-2.5 bg-slate-900/50 rounded-full text-slate-500 hover:text-white transition-colors"><X size={28}/></button>
              </div>
              <div className="space-y-6">
                <input value={newDocTitle} onChange={(e) => setNewDocTitle(e.target.value)} placeholder="Protocol Title..." className="w-full bg-slate-900/50 border border-slate-700/50 p-5 rounded-2xl outline-none text-white focus:border-blue-500 text-lg transition-colors" />
                <textarea value={newDocContent} onChange={(e) => setNewDocContent(e.target.value)} placeholder="Paste site policy text..." className="w-full bg-slate-900/50 border border-slate-700/50 p-6 rounded-2xl h-64 outline-none resize-none text-white focus:border-blue-500 text-lg transition-colors" />
                <button onClick={handleAddKbDocument} className="w-full bg-emerald-600 hover:bg-emerald-700 py-5 rounded-2xl font-bold text-xl active:scale-95 transition-all shadow-lg">Upload to Vault</button>
              </div>
            </div>
          </div>
        )}

        {showNewTipAlert && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-[#0a0f1a] rounded-[3rem] border border-yellow-500/30 p-10 w-full max-w-md text-center shadow-[0_0_100px_rgba(234,179,8,0.15)] animate-in zoom-in">
              <div className="w-20 h-20 bg-yellow-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8"><Bell size={40} className="text-yellow-400 animate-bounce" /></div>
              <h2 className="text-3xl font-bold text-white mb-4">Strategic Focus Ready</h2>
              <p className="text-slate-400 mb-10 text-lg">New force-wide briefing: <br/><span className="text-yellow-400 font-bold">"{showNewTipAlert.topic}"</span></p>
              <button onClick={() => setShowNewTipAlert(null)} className="w-full bg-blue-600 hover:bg-blue-700 py-4 rounded-2xl font-bold text-lg active:scale-95 transition-all">Review Briefing</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
