import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Activity, 
  Plus, 
  History, 
  BarChart2, 
  Settings, 
  Wifi, 
  WifiOff, 
  Heart, 
  Thermometer, 
  Droplet, 
  Wind,
  ShieldCheck,
  Download,
  BookOpen,
  Sparkles,
  AlertCircle,
  Clock,
  Check,
  Pill,
  BellOff,
  Pencil,
  X,
  Save
} from 'lucide-react';
import { VitalType, HealthEntry, SyncStatus, AppConfig } from './types';
import { GeminiHealthService } from './services/geminiService';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

// --- Sub-components ---

const NavItem: React.FC<{ active: boolean; icon: any; label: string; onClick: () => void }> = ({ active, icon: Icon, label, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-full py-2 transition-all ${active ? 'text-teal-600' : 'text-gray-400 hover:text-gray-500'}`}
  >
    <Icon size={24} className={active ? 'mb-1 transform scale-110' : 'mb-1'} />
    <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
  </button>
);

const VitalCard: React.FC<{ label: string; value: string; unit: string; icon: any; color: string }> = ({ label, value, unit, icon: Icon, color }) => (
  <div className="bg-white p-4 material-card flex flex-col justify-between border border-gray-100 hover:border-teal-100 transition-all cursor-pointer group">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-2 rounded-2xl ${color} transition-transform group-hover:scale-110`}>
        <Icon size={20} className="text-white" />
      </div>
      <span className="text-xs text-gray-400 font-medium">{label}</span>
    </div>
    <div>
      <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
      <p className="text-xs text-gray-500">{unit}</p>
    </div>
  </div>
);

const MedicationCard: React.FC<{ 
  name: string; 
  dosage: string; 
  time: string; 
  status: 'pending' | 'taken' 
}> = ({ name: initialName, dosage: initialDosage, time: initialTime, status: initialStatus }) => {
  const [currentStatus, setCurrentStatus] = useState<'pending' | 'taken' | 'snoozed'>(initialStatus);
  const [isEditing, setIsEditing] = useState(false);
  
  const [medData, setMedData] = useState({
    name: initialName,
    dosage: initialDosage,
    time: initialTime
  });

  const [editValues, setEditValues] = useState({ ...medData });

  const handleSnooze = () => setCurrentStatus('snoozed');
  const handleTake = () => setCurrentStatus('taken');
  const handleSave = () => {
    setMedData({ ...editValues });
    setIsEditing(false);
  };
  const handleCancel = () => {
    setEditValues({ ...medData });
    setIsEditing(false);
  };

  return (
    <div className={`p-4 material-card border transition-all duration-300 ${
      currentStatus === 'taken' 
        ? 'bg-green-50 border-green-100 opacity-80' 
        : currentStatus === 'snoozed'
        ? 'bg-orange-50 border-orange-100'
        : 'bg-white border-gray-100'
    }`}>
      {isEditing ? (
        <div className="space-y-3 animate-in fade-in zoom-in duration-200">
          <div className="flex items-center gap-2">
            <Pill size={16} className="text-teal-600" />
            <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Editando Medicamento</h4>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input 
              type="text" 
              value={editValues.name}
              onChange={(e) => setEditValues({...editValues, name: e.target.value})}
              placeholder="Nome"
              className="col-span-2 px-3 py-2 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-teal-500"
            />
            <input 
              type="text" 
              value={editValues.dosage}
              onChange={(e) => setEditValues({...editValues, dosage: e.target.value})}
              placeholder="Dosagem"
              className="px-3 py-2 bg-gray-50 border-none rounded-xl text-xs focus:ring-2 focus:ring-teal-500"
            />
            <input 
              type="time" 
              value={editValues.time}
              onChange={(e) => setEditValues({...editValues, time: e.target.value})}
              className="px-3 py-2 bg-gray-50 border-none rounded-xl text-xs focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button onClick={handleCancel} className="p-2 text-gray-400 hover:text-rose-500 transition-colors">
              <X size={18} />
            </button>
            <button onClick={handleSave} className="p-2 bg-teal-600 text-white rounded-xl shadow-md active:scale-90 transition-all">
              <Save size={18} />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl transition-colors ${
              currentStatus === 'taken' ? 'bg-green-500 text-white' : 
              currentStatus === 'snoozed' ? 'bg-orange-500 text-white' : 
              'bg-teal-100 text-teal-600'
            }`}>
              <Pill size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className={`text-sm font-bold transition-all ${currentStatus === 'taken' ? 'text-green-800 line-through opacity-60' : 'text-gray-800'}`}>
                  {medData.name}
                </h4>
                {currentStatus === 'snoozed' && (
                  <span className="bg-orange-100 text-orange-600 text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase">Adiado</span>
                )}
              </div>
              <p className="text-[10px] text-gray-500 uppercase font-medium tracking-tight">
                {medData.dosage} • {currentStatus === 'snoozed' ? 'Em 15 min' : medData.time}
              </p>
            </div>
          </div>
          
          <div className="flex gap-1.5">
            <button 
              onClick={() => setIsEditing(true)} 
              className="p-2 text-gray-300 hover:text-teal-600 transition-colors"
              title="Editar informações"
            >
              <Pencil size={16} />
            </button>
            {currentStatus !== 'taken' && (
              <>
                <button 
                  onClick={handleSnooze} 
                  className={`p-2 rounded-xl transition-all active:scale-90 ${
                    currentStatus === 'snoozed' 
                    ? 'bg-orange-200 text-orange-700' 
                    : 'bg-gray-50 text-gray-400 hover:bg-orange-50 hover:text-orange-500'
                  }`}
                  title="Adiar por 15 minutos"
                >
                  <BellOff size={18} />
                </button>
                <button 
                  onClick={handleTake} 
                  className="p-2 bg-teal-50 text-teal-600 rounded-xl hover:bg-teal-500 hover:text-white transition-all shadow-sm active:scale-95 flex items-center gap-1"
                  title="Marcar como tomado"
                >
                  <Check size={18} />
                </button>
              </>
            )}
            {currentStatus === 'taken' && (
              <div className="flex items-center gap-1 text-green-600 font-bold text-[10px] uppercase animate-in fade-in zoom-in duration-300">
                <Check size={14} strokeWidth={3} /> Concluído
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Main App Component ---

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'stats' | 'settings'>('dashboard');
  const [entries, setEntries] = useState<HealthEntry[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [biblicalMessage, setBiblicalMessage] = useState<string>('');
  
  // Stats filters
  const [activeVitals, setActiveVitals] = useState<Set<VitalType>>(new Set([VitalType.GLUCOSE]));

  // States for new entry modal
  const [selectedVital, setSelectedVital] = useState<VitalType>(VitalType.GLUCOSE);
  const [entryValue, setEntryValue] = useState('');
  const [entryError, setEntryError] = useState('');

  const [config, setConfig] = useState<AppConfig>({
    aiEnabled: true,
    biblicalMessagesEnabled: true,
    language: 'pt-BR',
    offlineMode: false,
  });

  const aiService = useMemo(() => new GeminiHealthService(), []);

  useEffect(() => {
    // Gerando mais dados para o gráfico ficar interessante
    const mockData: HealthEntry[] = [
      { id: '1', timestamp: Date.now() - 3600000, type: VitalType.GLUCOSE, value: '98', unit: 'mg/dL', emoji: '🩸', symptoms: [], syncStatus: SyncStatus.SYNCED },
      { id: '2', timestamp: Date.now() - 7200000, type: VitalType.BLOOD_PRESSURE, value: '120/80', unit: 'mmHg', emoji: '💓', symptoms: [], syncStatus: SyncStatus.SYNCED },
      { id: '3', timestamp: Date.now() - 86400000, type: VitalType.GLUCOSE, value: '110', unit: 'mg/dL', emoji: '🩸', symptoms: [], syncStatus: SyncStatus.SYNCED },
      { id: '4', timestamp: Date.now() - 172800000, type: VitalType.TEMPERATURE, value: '36.5', unit: '°C', emoji: '🌡️', symptoms: [], syncStatus: SyncStatus.SYNCED },
      { id: '5', timestamp: Date.now() - 172800000, type: VitalType.BLOOD_PRESSURE, value: '135/85', unit: 'mmHg', emoji: '💓', symptoms: [], syncStatus: SyncStatus.SYNCED },
      { id: '6', timestamp: Date.now() - 172800000, type: VitalType.SATURATION, value: '98', unit: '%', emoji: '🫁', symptoms: [], syncStatus: SyncStatus.SYNCED },
      { id: '7', timestamp: Date.now() - 259200000, type: VitalType.HEART_RATE, value: '72', unit: 'bpm', emoji: '🫀', symptoms: [], syncStatus: SyncStatus.SYNCED },
    ];
    setEntries(mockData);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Normalização de dados para o Recharts
  const chartData = useMemo(() => {
    const sorted = [...entries].sort((a, b) => a.timestamp - b.timestamp);
    // Agrupar por dia aproximado ou timestamp para pontos simultâneos
    const dataPoints: Record<string, any> = {};

    sorted.forEach(entry => {
      const timeLabel = new Date(entry.timestamp).toLocaleDateString([], { day: '2-digit', month: '2-digit', hour: '2-digit' });
      if (!dataPoints[timeLabel]) {
        dataPoints[timeLabel] = { time: timeLabel, timestamp: entry.timestamp };
      }

      if (entry.type === VitalType.BLOOD_PRESSURE) {
        const [sis, dia] = entry.value.split('/').map(Number);
        dataPoints[timeLabel].pressureSis = sis;
        dataPoints[timeLabel].pressureDia = dia;
      } else {
        const key = entry.type.toLowerCase();
        dataPoints[timeLabel][key] = parseFloat(entry.value);
      }
    });

    return Object.values(dataPoints).sort((a, b) => a.timestamp - b.timestamp);
  }, [entries]);

  const toggleVitalFilter = (type: VitalType) => {
    const next = new Set(activeVitals);
    if (next.has(type)) {
      if (next.size > 1) next.delete(type);
    } else {
      next.add(type);
    }
    setActiveVitals(next);
  };

  const validateValue = (type: VitalType, val: string): boolean => {
    if (!val) return false;
    switch (type) {
      case VitalType.BLOOD_PRESSURE:
        return /^\d{2,3}\/\d{2,3}$/.test(val);
      case VitalType.GLUCOSE:
      case VitalType.TEMPERATURE:
        return /^\d+(\.\d+)?$/.test(val);
      case VitalType.HEART_RATE:
        return /^\d{1,3}$/.test(val);
      case VitalType.SATURATION:
        const num = parseInt(val);
        return /^\d+$/.test(val) && num >= 0 && num <= 100;
      default:
        return false;
    }
  };

  const getEmojiForVital = (type: VitalType) => {
    switch (type) {
      case VitalType.GLUCOSE: return '🩸';
      case VitalType.BLOOD_PRESSURE: return '💓';
      case VitalType.HEART_RATE: return '🫀';
      case VitalType.SATURATION: return '🫁';
      case VitalType.TEMPERATURE: return '🌡️';
      default: return '📊';
    }
  };

  const addEntry = (type: VitalType, value: string) => {
    if (!validateValue(type, value)) {
      setEntryError('Formato de valor inválido.');
      return;
    }

    const newEntry: HealthEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      type,
      value,
      unit: type === VitalType.GLUCOSE ? 'mg/dL' : type === VitalType.HEART_RATE ? 'bpm' : type === VitalType.SATURATION ? '%' : type === VitalType.TEMPERATURE ? '°C' : 'mmHg',
      emoji: getEmojiForVital(type),
      symptoms: [],
      syncStatus: isOnline ? SyncStatus.SYNCED : SyncStatus.PENDING,
    };
    
    setEntries([newEntry, ...entries]);
    setShowNewEntry(false);
    setEntryValue('');
    setEntryError('');
  };

  const fetchAiInsights = async () => {
    if (!isOnline || !config.aiEnabled) return;
    setLoadingAi(true);
    const summary = await aiService.summarizePatterns(entries);
    setAiSummary(summary);
    if (config.biblicalMessagesEnabled) {
      const msg = await aiService.getBiblicalMessage();
      setBiblicalMessage(msg);
    }
    setLoadingAi(false);
  };

  const renderDashboard = () => (
    <div className="space-y-6 pb-24">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Saúde em Foco</h1>
          <p className="text-gray-500 text-sm italic font-medium">Cuidado ético e espiritual</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${isOnline ? 'bg-teal-50 text-teal-700' : 'bg-orange-50 text-orange-700'}`}>
          {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
          {isOnline ? 'Sincronizado' : 'Modo Offline'}
        </div>
      </header>

      <section className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h2 className="font-bold text-gray-400 text-[10px] uppercase tracking-widest">Medicamentos de Hoje</h2>
          <button className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded-lg hover:bg-teal-100">Ver Calendário</button>
        </div>
        <MedicationCard name="Metformina" dosage="500mg" time="08:00" status="taken" />
        <MedicationCard name="Losartana" dosage="50mg" time="20:00" status="pending" />
      </section>

      {config.biblicalMessagesEnabled && biblicalMessage && (
        <div className="bg-white p-6 material-card border border-blue-50 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 text-blue-50/50 group-hover:scale-110 transition-transform">
            <BookOpen size={100} />
          </div>
          <p className="text-blue-900/80 italic font-medium relative z-10 leading-relaxed text-sm">
            "{biblicalMessage}"
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <VitalCard label="Glicose" value="98" unit="mg/dL" icon={Droplet} color="bg-rose-500" />
        <VitalCard label="Pressão" value="120/80" unit="mmHg" icon={Activity} color="bg-blue-500" />
        <VitalCard label="Corpo" value="36.6" unit="°C" icon={Thermometer} color="bg-orange-500" />
        <VitalCard label="Saturação" value="99" unit="%" icon={Wind} color="bg-teal-500" />
      </div>

      <div className="bg-white p-6 material-card border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="text-teal-500" size={20} />
            <h2 className="font-bold text-gray-800">Insights do App</h2>
          </div>
          <button 
            onClick={fetchAiInsights}
            disabled={loadingAi || !isOnline}
            className="text-[10px] font-black uppercase text-teal-600 hover:text-teal-700 disabled:text-gray-300 tracking-tighter"
          >
            {loadingAi ? 'Analisando...' : 'Atualizar IA'}
          </button>
        </div>
        {aiSummary ? (
          <p className="text-sm text-gray-600 leading-relaxed">{aiSummary}</p>
        ) : (
          <p className="text-sm text-gray-400 italic">Toque em "Atualizar IA" para analisar seus padrões de saúde dos últimos dias.</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 flex flex-col relative shadow-2xl overflow-hidden">
      <main className="flex-1 p-6 overflow-y-auto overflow-x-hidden pt-8">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'history' && (
          <div className="space-y-4 pb-24">
            <h1 className="text-2xl font-bold text-gray-900">Histórico</h1>
            <div className="space-y-3">
              {[...entries].sort((a,b) => b.timestamp - a.timestamp).map((entry) => (
                <div key={entry.id} className="bg-white p-4 material-card border border-gray-100 flex items-center gap-4">
                  <div className="text-2xl">{entry.emoji}</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800 text-xs uppercase opacity-70 tracking-tight">{entry.type.replace('_', ' ')}</h4>
                    <p className="text-xl font-black">{entry.value} <span className="text-[10px] text-teal-600 uppercase">{entry.unit}</span></p>
                  </div>
                  <span className="text-[10px] text-gray-400">{new Date(entry.timestamp).toLocaleDateString([], {day:'2-digit', month:'short'})} {new Date(entry.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Ajustes</h1>
            <section className="bg-white rounded-[32px] p-2 space-y-1 border border-gray-100">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Sparkles size={18} className="text-teal-500" />
                  <p className="text-sm font-semibold">Análise por IA</p>
                </div>
                <button 
                  onClick={() => setConfig({...config, aiEnabled: !config.aiEnabled})}
                  className={`w-11 h-6 rounded-full relative transition-colors ${config.aiEnabled ? 'bg-teal-500' : 'bg-gray-200'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${config.aiEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </section>
          </div>
        )}
        {activeTab === 'stats' && (
          <div className="space-y-6 pb-24 min-h-full">
             <header>
              <h1 className="text-2xl font-bold text-gray-900">Tendências</h1>
              <p className="text-gray-500 text-sm">Acompanhamento evolutivo</p>
             </header>

             {/* Filtros do Gráfico */}
             <div className="flex flex-wrap gap-2">
                {[
                  { id: VitalType.GLUCOSE, label: 'Glicose', color: 'bg-rose-500', text: 'text-rose-500' },
                  { id: VitalType.BLOOD_PRESSURE, label: 'Pressão', color: 'bg-blue-500', text: 'text-blue-500' },
                  { id: VitalType.TEMPERATURE, label: 'Temp', color: 'bg-orange-500', text: 'text-orange-500' },
                  { id: VitalType.SATURATION, label: 'Sat', color: 'bg-teal-500', text: 'text-teal-500' },
                  { id: VitalType.HEART_RATE, label: 'FC', color: 'bg-pink-500', text: 'text-pink-500' },
                ].map(v => (
                  <button 
                    key={v.id}
                    onClick={() => toggleVitalFilter(v.id)}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter transition-all flex items-center gap-1.5 ${
                      activeVitals.has(v.id) 
                      ? `${v.color} text-white shadow-md scale-105` 
                      : 'bg-white text-gray-400 border border-gray-100'
                    }`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${activeVitals.has(v.id) ? 'bg-white' : v.color}`}></div>
                    {v.label}
                  </button>
                ))}
                <button 
                  onClick={() => setActiveVitals(new Set(Object.values(VitalType)))}
                  className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter bg-gray-900 text-white"
                >
                  Ver Todos
                </button>
             </div>

             <div className="bg-white p-4 material-card h-[350px] border border-gray-100">
               <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis 
                      dataKey="time" 
                      tick={{fontSize: 8, fill: '#94a3b8', fontWeight: 700}} 
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fontSize: 9, fill: '#94a3b8'}} 
                    />
                    <Tooltip 
                      contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '10px'}}
                    />
                    <Legend iconType="circle" wrapperStyle={{paddingTop: '20px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase'}} />
                    
                    {activeVitals.has(VitalType.GLUCOSE) && (
                      <Line name="Glicose" type="monotone" dataKey="glucose" stroke="#f43f5e" strokeWidth={3} dot={{r:3}} connectNulls />
                    )}
                    {activeVitals.has(VitalType.BLOOD_PRESSURE) && (
                      <>
                        <Line name="Pressão SIS" type="monotone" dataKey="pressureSis" stroke="#3b82f6" strokeWidth={3} dot={{r:3}} connectNulls />
                        <Line name="Pressão DIA" type="monotone" dataKey="pressureDia" stroke="#60a5fa" strokeWidth={2} strokeDasharray="5 5" dot={{r:3}} connectNulls />
                      </>
                    )}
                    {activeVitals.has(VitalType.TEMPERATURE) && (
                      <Line name="Temperatura" type="monotone" dataKey="temperature" stroke="#f97316" strokeWidth={3} dot={{r:3}} connectNulls />
                    )}
                    {activeVitals.has(VitalType.SATURATION) && (
                      <Line name="Saturação" type="monotone" dataKey="saturation" stroke="#14b8a6" strokeWidth={3} dot={{r:3}} connectNulls />
                    )}
                    {activeVitals.has(VitalType.HEART_RATE) && (
                      <Line name="Batimentos" type="monotone" dataKey="heart_rate" stroke="#ec4899" strokeWidth={3} dot={{r:3}} connectNulls />
                    )}
                  </LineChart>
               </ResponsiveContainer>
             </div>
             
             <div className="p-4 bg-teal-50 rounded-3xl border border-teal-100">
               <p className="text-[11px] text-teal-800 font-medium leading-relaxed">
                 <Sparkles size={14} className="inline mr-1 mb-1 text-teal-600" />
                 <b>Análise Visual:</b> A sobreposição de dados pode ajudar a identificar como sua glicemia reage a variações na pressão arterial ou temperatura corporal.
               </p>
             </div>
          </div>
        )}
      </main>

      <button 
        onClick={() => { setShowNewEntry(true); setEntryError(''); setEntryValue(''); }}
        className="fixed bottom-24 right-6 w-14 h-14 bg-teal-600 text-white rounded-[22px] shadow-xl flex items-center justify-center hover:scale-110 active:scale-90 transition-all z-40"
      >
        <Plus size={32} />
      </button>

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto glass border-t flex justify-around items-center px-4 py-3 z-50 rounded-t-[32px]">
        <NavItem active={activeTab === 'dashboard'} icon={Activity} label="Painel" onClick={() => setActiveTab('dashboard')} />
        <NavItem active={activeTab === 'history'} icon={History} label="Histórico" onClick={() => setActiveTab('history')} />
        <div className="w-16" />
        <NavItem active={activeTab === 'stats'} icon={BarChart2} label="Gráficos" onClick={() => setActiveTab('stats')} />
        <NavItem active={activeTab === 'settings'} icon={Settings} label="Ajustes" onClick={() => setActiveTab('settings')} />
      </nav>

      {showNewEntry && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex items-end p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-white rounded-[40px] p-8 space-y-6 animate-in slide-in-from-bottom duration-500 shadow-2xl">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-black text-gray-800">Novo Registro</h2>
              <button onClick={() => setShowNewEntry(false)} className="text-gray-300 hover:text-gray-600">✕</button>
            </div>
            
            <div className="grid grid-cols-5 gap-3">
              {[VitalType.GLUCOSE, VitalType.BLOOD_PRESSURE, VitalType.HEART_RATE, VitalType.SATURATION, VitalType.TEMPERATURE].map(t => (
                 <button 
                  key={t} 
                  onClick={() => { setSelectedVital(t); setEntryError(''); }}
                  className={`p-3 border rounded-[20px] transition-all flex flex-col items-center gap-2 ${selectedVital === t ? 'bg-teal-50 border-teal-500 text-teal-600' : 'border-gray-100 text-gray-400'}`}
                 >
                    {t === VitalType.GLUCOSE && <Droplet size={20} />}
                    {t === VitalType.BLOOD_PRESSURE && <Activity size={20} />}
                    {t === VitalType.HEART_RATE && <Heart size={20} />}
                    {t === VitalType.SATURATION && <Wind size={20} />}
                    {t === VitalType.TEMPERATURE && <Thermometer size={20} />}
                    <span className="text-[7px] font-black uppercase tracking-tighter">{t.split('_')[0]}</span>
                 </button>
              ))}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-1">
                {selectedVital === VitalType.BLOOD_PRESSURE ? 'Pressão (Sist/Diast)' : 'Valor Medido'}
              </label>
              <input 
                type="text" 
                value={entryValue}
                onChange={(e) => { setEntryValue(e.target.value); setEntryError(''); }}
                placeholder={selectedVital === VitalType.BLOOD_PRESSURE ? "120/80" : "00.0"} 
                className={`w-full px-5 py-4 bg-gray-50 rounded-2xl border-2 transition-all text-lg font-bold ${entryError ? 'border-rose-400 bg-rose-50' : 'border-transparent focus:border-teal-500'}`} 
              />
              {entryError && <p className="text-[10px] text-rose-500 font-bold ml-1 animate-in slide-in-from-left duration-200">{entryError}</p>}
            </div>

            <button 
              onClick={() => addEntry(selectedVital, entryValue)} 
              className="w-full py-5 bg-teal-600 text-white rounded-2xl font-black text-lg shadow-lg hover:bg-teal-700 active:scale-95 transition-all"
            >
              Salvar Registro
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;