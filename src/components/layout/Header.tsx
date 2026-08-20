'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Map,
  LayoutDashboard,
  Layers,
  Calendar,
  Image as ImageIcon,
  FileText,
  Clock,
  CheckSquare,
  Search,
  RotateCcw,
  Bell,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Grid,
  Sprout,
  BarChart3,
  ShieldCheck,
  Smartphone,
  Briefcase,
  Microscope,
  Compass,
  ArrowUpRight,
  X
} from 'lucide-react';
import { ALERTAS_ACIONAVEIS_CANONICOS } from '@/data/semanticDb';
import { ModoOperacao } from '@/types/prad';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [modoOperacao, setModoOperacao] = useState<ModoOperacao>('gestao');

  // Notificações & Modal de Ajuda
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [alertsList, setAlertsList] = useState(ALERTAS_ACIONAVEIS_CANONICOS);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // 10 MÓDULOS DA NOVA ARQUITETURA DE NAVEGAÇÃO
  const navItems = [
    { href: '/dashboard', label: 'Visão Geral', icon: LayoutDashboard },
    { href: '/areas', label: 'Áreas PRAD', icon: Layers },
    { href: '/execucao', label: 'Execução', icon: CheckSquare },
    { href: '/monitoramento', label: 'Monitoramento', icon: Sprout },
    { href: '/geoportal', label: 'Mapa', icon: Compass },
    { href: '/evidencias', label: 'Evidências', icon: ImageIcon },
    { href: '/indicadores', label: 'Indicadores', icon: BarChart3 },
    { href: '/planejamento', label: 'Planejamento', icon: Calendar },
    { href: '/relatorios', label: 'Relatórios', icon: FileText },
    { href: '/dados', label: 'Qualidade', icon: ShieldCheck },
  ];

  // Busca em tempo real
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      setShowSearchDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery.trim())}`);
        const data = await res.json();
        setSearchResults(data);
        setShowSearchDropdown(true);
      } catch (e) {
        setSearchResults(null);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = alertsList.length;

  return (
    <>
      {/* 1. TOP HEADER BAR */}
      <header
        className="text-white h-14 sticky top-0 z-50 flex items-center justify-between px-4 border-b border-white/10 shadow-md relative bg-[#121812]"
        style={{ backgroundImage: "url('/branding/header_bg.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px] pointer-events-none" />

        {/* LOGOS INSTITUCIONAIS & TÍTULO */}
        <div className="flex items-center space-x-3.5 relative z-10">
          <img
            src="/branding/logo_ecobrasil_clean.png"
            alt="EcoBrasil Consultoria Ambiental"
            style={{ height: '30px', width: 'auto', maxHeight: '30px' }}
            className="h-7 w-auto object-contain bg-white/95 px-2 py-1 rounded-lg shadow-sm"
          />
          <img
            src="/branding/logo_engie_transparent.png"
            alt="ENGIE"
            style={{ height: '30px', width: 'auto', maxHeight: '30px' }}
            className="h-7 w-auto object-contain drop-shadow-md"
          />
          <div className="hidden lg:block border-l border-white/20 pl-3">
            <h1 className="text-xs font-bold tracking-tight text-white/90 uppercase leading-none">
              PRAD UMBURANAS
            </h1>
            <p className="text-[10px] text-white/60 font-mono mt-0.5">
              Sistema Integrado de Recuperação Ambiental
            </p>
          </div>
        </div>

        {/* BUSCA GLOBAL UNIFICADA */}
        <div ref={searchContainerRef} className="relative z-20 hidden md:block w-72 lg:w-96">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-white/50 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar área, atividade, foto, espécie..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.trim() && setShowSearchDropdown(true)}
              className="w-full pl-8 pr-8 py-1.5 bg-black/40 border border-white/20 rounded-xl text-xs text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#00A651] focus:bg-black/60 transition-all font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* DROPDOWN DE RESULTADOS DA BUSCA */}
          {showSearchDropdown && searchResults && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white text-[#17211B] rounded-2xl shadow-2xl border border-[#DDE4DE] overflow-hidden max-h-96 overflow-y-auto text-xs z-50 animate-in fade-in">
              <div className="p-2.5 bg-[#F5F7F4] border-b border-[#DDE4DE] text-[10px] font-bold text-[#5F6D65] uppercase flex items-center justify-between">
                <span>Resultados ({searchResults.total})</span>
                {isSearching && <span className="text-[#00A651]">Buscando...</span>}
              </div>

              {searchResults.total === 0 ? (
                <div className="p-4 text-center text-[#5F6D65] text-xs">
                  Nenhum registro encontrado para "{searchQuery}".
                </div>
              ) : (
                <div className="divide-y divide-[#DDE4DE]/60">
                  {searchResults.areas.length > 0 && (
                    <div className="p-2">
                      <div className="text-[10px] font-bold text-[#00A651] uppercase px-2 mb-1">Áreas PRAD</div>
                      {searchResults.areas.map((a: any) => (
                        <Link
                          key={a.id}
                          href={`/areas/${a.id}`}
                          onClick={() => setShowSearchDropdown(false)}
                          className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl transition-colors"
                        >
                          <div>
                            <span className="font-mono font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded text-[10px] mr-1.5">
                              {a.id}
                            </span>
                            <span className="font-bold text-[#17211B]">{a.nome}</span>
                            <div className="text-[10px] text-[#5F6D65] mt-0.5">{a.tipo} • {a.areaHa} ha</div>
                          </div>
                          <span className="text-[10px] font-bold text-[#00A651]">{a.indiceRecuperacao}% Rec.</span>
                        </Link>
                      ))}
                    </div>
                  )}

                  {searchResults.evidencias.length > 0 && (
                    <div className="p-2">
                      <div className="text-[10px] font-bold text-sky-700 uppercase px-2 mb-1">Evidências & Fotos</div>
                      {searchResults.evidencias.map((e: any) => (
                        <Link
                          key={e.id}
                          href={`/evidencias`}
                          onClick={() => setShowSearchDropdown(false)}
                          className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl transition-colors"
                        >
                          <div>
                            <span className="font-bold text-[#17211B]">{e.titulo}</span>
                            <div className="text-[10px] text-[#5F6D65]">{e.areaId} • {e.coordenadasUtm}</div>
                          </div>
                          <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* SELETOR DE MODO OPERACIONAL & FERRAMENTAS */}
        <div className="flex items-center space-x-2 relative z-10">
          
          {/* SELETOR DE MODO */}
          <div className="hidden sm:flex items-center bg-black/40 border border-white/15 rounded-xl p-0.5 text-xs">
            <button
              onClick={() => setModoOperacao('gestao')}
              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
                modoOperacao === 'gestao' ? 'bg-[#00A651] text-white shadow-sm' : 'text-white/60 hover:text-white'
              }`}
              title="Modo Gestão: Foco em KPIs, cronograma e desvios"
            >
              <Briefcase className="w-3 h-3" />
              <span>Gestão</span>
            </button>
            <button
              onClick={() => setModoOperacao('campo')}
              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
                modoOperacao === 'campo' ? 'bg-[#00A651] text-white shadow-sm' : 'text-white/60 hover:text-white'
              }`}
              title="Modo Campo: Interface simplificada com GPS e registro rápido"
            >
              <Smartphone className="w-3 h-3" />
              <span>Campo</span>
            </button>
            <button
              onClick={() => setModoOperacao('analitico')}
              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
                modoOperacao === 'analitico' ? 'bg-[#00A651] text-white shadow-sm' : 'text-white/60 hover:text-white'
              }`}
              title="Modo Analítico: Séries temporais, MDT/MDS e sensoriamento remoto"
            >
              <Microscope className="w-3 h-3" />
              <span>Analítico</span>
            </button>
          </div>

          {/* SINO DE ALERTAS ACIONÁVEIS */}
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors cursor-pointer text-white flex items-center justify-center"
            title="Alertas & Pendências que exigem ação"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* 2. SUB-BARRA DE NAVEGAÇÃO PRINCIPAL (10 MÓDULOS) */}
      <nav className="bg-[#17211B] border-b border-[#2E3C33] px-4 overflow-x-auto shadow-sm sticky top-14 z-40">
        <div className="flex items-center space-x-1 py-1.5 min-w-max">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${
                  isActive
                    ? 'bg-[#00A651] text-white shadow-sm'
                    : 'text-[#DDE4DE]/75 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* 3. PAINEL LATERAL DE ALERTAS ACIONÁVEIS */}
      {isNotificationsOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl border-l border-[#DDE4DE] flex flex-col animate-in slide-in-from-right duration-200">
            <div className="p-4 bg-[#17211B] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#00A651]" />
                <h3 className="font-bold text-sm">Situações que Exigem Ação</h3>
              </div>
              <button
                onClick={() => setIsNotificationsOpen(false)}
                className="p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 space-y-3 text-xs font-sans">
              {alertsList.map((alerta) => (
                <div
                  key={alerta.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    alerta.criticidade === 'critico'
                      ? 'bg-red-50/70 border-red-200'
                      : alerta.criticidade === 'atencao'
                      ? 'bg-amber-50/70 border-amber-200'
                      : 'bg-blue-50/70 border-blue-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-[10px] px-1.5 py-0.5 rounded bg-white border border-[#DDE4DE]">
                      {alerta.codigoArea}
                    </span>
                    <span className={`text-[10px] font-bold uppercase ${
                      alerta.criticidade === 'critico' ? 'text-red-700' :
                      alerta.criticidade === 'atencao' ? 'text-amber-700' : 'text-blue-700'
                    }`}>
                      {alerta.tipo}
                    </span>
                  </div>

                  <h4 className="font-bold text-xs text-[#17211B] leading-tight">
                    {alerta.titulo}
                  </h4>
                  <p className="text-[11px] text-[#5F6D65] mt-1">
                    {alerta.descricao}
                  </p>

                  <div className="pt-2.5 mt-2 border-t border-black/5 flex items-center justify-between">
                    <span className="text-[10px] text-[#5F6D65]">{alerta.dataGeracao}</span>
                    <Link
                      href={alerta.rotaAcao}
                      onClick={() => setIsNotificationsOpen(false)}
                      className="px-3 py-1 bg-[#00A651] hover:bg-[#008C44] text-white rounded-lg font-bold text-[10px] flex items-center gap-1 shadow-sm"
                    >
                      <span>{alerta.acaoSugerida}</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
