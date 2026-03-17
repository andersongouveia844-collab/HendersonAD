/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wind, 
  MessageCircle, 
  Sparkles, 
  User, 
  Home as HomeIcon, 
  ChevronRight, 
  Send,
  Heart,
  ShieldCheck,
  Brain
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// --- Types ---
type Tab = 'home' | 'diary' | 'explore' | 'profile';

interface Message {
  role: 'user' | 'model';
  text: string;
}

// --- Components ---

const Navbar = ({ activeTab, setActiveTab }: { activeTab: Tab, setActiveTab: (tab: Tab) => void }) => {
  const tabs: { id: Tab, icon: any, label: string }[] = [
    { id: 'home', icon: HomeIcon, label: 'Início' },
    { id: 'diary', icon: MessageCircle, label: 'Diário' },
    { id: 'explore', icon: Sparkles, label: 'Explorar' },
    { id: 'profile', icon: User, label: 'Perfil' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-black/5 px-6 py-3 pb-8 z-50">
      <div className="max-w-md mx-auto flex justify-between items-center">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1 transition-colors ${
              activeTab === tab.id ? 'text-respiro-sage' : 'text-gray-400'
            }`}
          >
            <tab.icon size={24} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
            <span className="text-[10px] font-medium uppercase tracking-wider">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

const BreathingExercise = () => {
  const [phase, setPhase] = useState<'Inspirar' | 'Segurar' | 'Expirar'>('Inspirar');
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    const sequence = async () => {
      setPhase('Inspirar');
      await new Promise(r => setTimeout(r, 4000));
      setPhase('Segurar');
      await new Promise(r => setTimeout(r, 4000));
      setPhase('Expirar');
      await new Promise(r => setTimeout(r, 4000));
    };

    const interval = setInterval(sequence, 12000);
    sequence();

    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <div className="bg-respiro-sage/10 rounded-3xl p-8 flex flex-col items-center justify-center text-center gap-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-respiro-sage/20">
        <motion.div 
          className="h-full bg-respiro-sage"
          animate={{ width: isActive ? ['0%', '100%'] : '0%' }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        />
      </div>
      
      <motion.div
        animate={{ scale: isActive ? (phase === 'Inspirar' ? 1.5 : phase === 'Expirar' ? 1 : 1.5) : 1 }}
        transition={{ duration: 4, ease: "easeInOut" }}
        className="w-32 h-32 rounded-full bg-respiro-sage/20 flex items-center justify-center"
      >
        <Wind className="text-respiro-sage" size={48} />
      </motion.div>

      <div className="space-y-2">
        <h3 className="serif text-2xl italic text-respiro-ink">
          {isActive ? phase : 'Um momento para você'}
        </h3>
        <p className="text-sm text-gray-500 max-w-[200px]">
          {isActive ? 'Siga o ritmo da luz' : 'Que tal um respiro consciente agora?'}
        </p>
      </div>

      <button
        onClick={() => setIsActive(!isActive)}
        className="px-8 py-3 bg-respiro-sage text-white rounded-full font-medium hover:bg-respiro-sage/90 transition-colors"
      >
        {isActive ? 'Parar' : 'Começar'}
      </button>
    </div>
  );
};

const AIDiary = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Olá. Parece que hoje as coisas estão um pouco pesadas, vamos conversar? Estou aqui para te ouvir, sem julgamentos.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const chat = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: "Você é o mentor do app Respiro. Seu tom de voz é calmo, empático e seguro. Use a 'Empatia Ativa': reconheça a dor sem julgamentos. Evite termos médicos complexos. Se o usuário demonstrar crise grave, sugira procurar um profissional ou exercício de ancoragem. Nunca use 'Erro 404' ou termos técnicos. Fale em Português do Brasil."
        },
        history: messages.map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        }))
      });

      const result = await chat.sendMessage({ message: userMsg });
      setMessages(prev => [...prev, { role: 'model', text: result.text || 'Desculpe, não consegui processar sua mensagem agora.' }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: 'Tivemos um pequeno tropeço na conexão. Vamos tentar respirar fundo e conversar novamente?' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] bg-white rounded-3xl shadow-sm overflow-hidden border border-black/5">
      <div className="p-4 border-bottom border-black/5 bg-respiro-cream/30 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-respiro-sage/20 flex items-center justify-center text-respiro-sage">
          <Brain size={20} />
        </div>
        <div>
          <h3 className="font-semibold text-sm">Mentor Respiro</h3>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest">IA Empática</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, i) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-respiro-sage text-white rounded-tr-none' 
                : 'bg-respiro-cream text-respiro-ink rounded-tl-none'
            }`}>
              {msg.text}
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-respiro-cream p-4 rounded-2xl rounded-tl-none">
              <motion.div 
                animate={{ opacity: [0.4, 1, 0.4] }} 
                transition={{ duration: 1.5, repeat: Infinity }}
                className="flex gap-1"
              >
                <div className="w-1.5 h-1.5 bg-respiro-sage rounded-full" />
                <div className="w-1.5 h-1.5 bg-respiro-sage rounded-full" />
                <div className="w-1.5 h-1.5 bg-respiro-sage rounded-full" />
              </motion.div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-black/5">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Como você está se sentindo?"
            className="w-full pl-4 pr-12 py-3 bg-respiro-cream/50 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-respiro-sage/30 transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-respiro-sage text-white rounded-full flex items-center justify-center disabled:opacity-50"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

const ExploreItem = ({ title, duration, icon: Icon, color }: { title: string, duration: string, icon: any, color: string }) => (
  <button className="w-full p-4 bg-white rounded-2xl border border-black/5 flex items-center gap-4 hover:shadow-md transition-all group">
    <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center text-white`}>
      <Icon size={24} />
    </div>
    <div className="flex-1 text-left">
      <h4 className="font-medium text-respiro-ink">{title}</h4>
      <p className="text-xs text-gray-400">{duration}</p>
    </div>
    <ChevronRight size={18} className="text-gray-300 group-hover:text-respiro-sage transition-colors" />
  </button>
);

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [userName] = useState('Mariana'); // Mocked for MVP

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="px-6 pt-12 pb-6 max-w-md mx-auto flex justify-between items-end">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-respiro-sage font-semibold mb-1">Respiro</p>
          <h1 className="serif text-3xl font-light">
            {activeTab === 'home' && `Bom dia, ${userName}`}
            {activeTab === 'diary' && 'Seu Diário'}
            {activeTab === 'explore' && 'Práticas'}
            {activeTab === 'profile' && 'Sua Jornada'}
          </h1>
        </div>
        <div className="w-10 h-10 rounded-full border border-black/5 overflow-hidden">
          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`} alt="Avatar" referrerPolicy="no-referrer" />
        </div>
      </header>

      <main className="px-6 max-w-md mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <BreathingExercise />
              
              <section className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="serif text-xl italic">Destaques para você</h2>
                  <button className="text-xs text-respiro-sage font-medium">Ver tudo</button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-respiro-cream p-4 rounded-3xl space-y-3">
                    <div className="w-8 h-8 rounded-lg bg-respiro-clay/20 flex items-center justify-center text-respiro-clay">
                      <Heart size={18} />
                    </div>
                    <p className="text-sm font-medium">Ancoragem 5-4-3-2-1</p>
                    <p className="text-[10px] text-gray-400">5 MIN • SOS</p>
                  </div>
                  <div className="bg-respiro-sage/10 p-4 rounded-3xl space-y-3">
                    <div className="w-8 h-8 rounded-lg bg-respiro-sage/20 flex items-center justify-center text-respiro-sage">
                      <Brain size={18} />
                    </div>
                    <p className="text-sm font-medium">Meditação Matinal</p>
                    <p className="text-[10px] text-gray-400">10 MIN • FOCO</p>
                  </div>
                </div>
              </section>

              <div className="bg-respiro-ink text-white p-6 rounded-3xl flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-respiro-sage">
                    <ShieldCheck size={16} />
                    <span className="text-[10px] uppercase font-bold tracking-widest">Segurança</span>
                  </div>
                  <h3 className="font-medium">Falar com especialista</h3>
                  <p className="text-xs text-gray-400">Psicólogos disponíveis agora</p>
                </div>
                <button className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all">
                  <ChevronRight size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'diary' && (
            <motion.div
              key="diary"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <AIDiary />
            </motion.div>
          )}

          {activeTab === 'explore' && (
            <motion.div
              key="explore"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <ExploreItem title="Respiração Quadrada" duration="4 min • Ansiedade" icon={Wind} color="bg-blue-400" />
              <ExploreItem title="Escaneamento Corporal" duration="12 min • Relaxamento" icon={Brain} color="bg-purple-400" />
              <ExploreItem title="Afirmações Positivas" duration="3 min • Autoestima" icon={Heart} color="bg-rose-400" />
              <ExploreItem title="Ancoragem Sensorial" duration="5 min • Pânico" icon={Sparkles} color="bg-amber-400" />
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="bg-white p-6 rounded-3xl border border-black/5 text-center space-y-4">
                <div className="w-20 h-20 rounded-full mx-auto border-2 border-respiro-sage p-1">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`} alt="Avatar" className="rounded-full" referrerPolicy="no-referrer" />
                </div>
                <div>
                  <h2 className="serif text-2xl">{userName}</h2>
                  <p className="text-xs text-gray-400">Membro desde Março 2026</p>
                </div>
                <div className="flex justify-center gap-8 pt-4">
                  <div className="text-center">
                    <p className="text-xl font-semibold">12</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">Respiros</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-semibold">5</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">Sessões</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 px-2">Configurações</h3>
                <button className="w-full p-4 bg-white rounded-2xl border border-black/5 flex items-center justify-between">
                  <span className="text-sm">Privacidade e Dados</span>
                  <ShieldCheck size={18} className="text-gray-300" />
                </button>
                <button className="w-full p-4 bg-white rounded-2xl border border-black/5 flex items-center justify-between">
                  <span className="text-sm">Notificações de Cuidado</span>
                  <ChevronRight size={18} className="text-gray-300" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
