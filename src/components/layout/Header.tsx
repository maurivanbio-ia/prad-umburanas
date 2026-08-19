'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  Map,
  LayoutDashboard,
  Layers,
  Calendar,
  CalendarDays,
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
} from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Notifications & Help Modal States
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  const [alertsList, setAlertsList] = useState([
    {
      id: 1,
      title: '2 Fotografias Sem Localização',
      desc: 'Evidências fotográficas aguardando vinculação espacial no Geoportal.',
      tag: 'Crítico',
      time: 'Há 15 min',
      link: '/galeria',
      color: 'bg-red-500/20 text-red-300 border-red-500/30',
      read: false,
    },
    {
      id: 2,
      title: 'Meta Quinzenal PRAD-17 em Andamento',
      desc: 'Revegetação da área PRAD-17 com 15% de saldo restante para o encerramento.',
      tag: 'Prazo',
      time: 'Há 1 hora',
      link: '/planejamento',
      color: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      read: false,
    },
    {
      id: 3,
      title: 'Cenas Sentinel-2 Atualizadas',
      desc: 'Processamento de saúde vegetal NDVI recalculado com dados de 16/08/2026.',
      tag: 'Satélite',
      time: 'Há 3 horas',
      link: '/geoportal',
      color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      read: false,
    },
  ]);

  const unreadCount = alertsList.filter((a) => !a.read).length;

  const handleMarkAsRead = (id: number) => {
    setAlertsList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item))
    );
  };

  const handleClearAllAlerts = () => {
    setAlertsList((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  const navItems = [
    { href: '/geoportal', label: 'Geoportal', symbol: '/symbols/01_geoportal_mapa.png' },
    { href: '/dashboard', label: 'Dashboard', symbol: '/symbols/02_dashboard_velocimetro.png' },
    { href: '/areas', label: 'Áreas PRAD', symbol: '/symbols/03_areas_prad_folha.png' },
    { href: '/planejamento', label: 'Planejamento', symbol: '/symbols/04_planejamento_grafico.png' },
    { href: '/calendario', label: 'Calendário', symbol: '/symbols/05_calendario.png' },
    { href: '/galeria', label: 'Galeria', symbol: '/symbols/06_galeria.png' },
    { href: '/relatorios', label: 'Relatórios', symbol: '/symbols/07_relatorios_documento.png' },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/areas?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <>
      {/* 1. TOP HEADER BAR (Dark Header with custom background image) */}
      <header
        className="text-white h-14 sticky top-0 z-50 flex items-center justify-between px-4 border-b border-white/10 shadow-md relative bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/branding/header_bg.png')" }}
      >
        {/* Dark Overlay gradient for crisp logo & text contrast */}
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] pointer-events-none" />

        {/* Left Logos & Title */}
        <div className="flex items-center space-x-3.5 relative z-10">
          <img
            src="/branding/logo_ecobrasil_clean.png"
            alt="EcoBrasil Consultoria Ambiental"
            className="h-8 w-auto object-contain bg-white/95 px-2 py-1 rounded-lg shadow-sm"
          />
          <img
            src="/branding/logo_engie_transparent.png"
            alt="ENGIE"
            className="h-8 w-auto object-contain drop-shadow-md"
          />
          <div className="h-6 w-px bg-white/30" />
          <h1 className="font-extrabold text-sm tracking-tight text-white font-sans drop-shadow-md">
            PRAD Umburanas
          </h1>
        </div>

        {/* Center Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-lg mx-6 relative z-10">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-white/50" />
            <input
              type="text"
              placeholder="Buscar no mapa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-white/10 hover:bg-white/15 focus:bg-white focus:text-slate-900 text-white placeholder-white/50 rounded-lg border border-white/10 focus:outline-none transition-all font-sans"
            />
          </div>
        </form>

        {/* Right Status & User Profile */}
        <div className="flex items-center space-x-3 text-xs font-sans relative z-10">
          {/* Sync Pill */}
          <div className="flex items-center space-x-1.5 bg-[#1F2E0D] border border-emerald-500/30 text-emerald-300 px-3 py-1 rounded-full font-mono text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold">Sincronizado</span>
            <RotateCcw className="w-3 h-3 text-emerald-400 ml-1 cursor-pointer" />
          </div>

          {/* Notifications Button & Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setIsNotificationsOpen(!isNotificationsOpen);
                setIsHelpModalOpen(false);
              }}
              className="relative p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              title="Alertas & Notificações"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-[#121812] shadow-sm">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Floating Dropdown Card */}
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-[#121812] border border-white/20 rounded-2xl shadow-2xl z-50 text-xs overflow-hidden animate-in fade-in duration-150">
                <div className="p-3 border-b border-white/10 flex items-center justify-between bg-white/5">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Bell className="w-4 h-4 text-emerald-400" /> Alertas do Sistema ({unreadCount})
                  </span>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleClearAllAlerts}
                      className="text-[10px] text-emerald-400 hover:underline font-semibold cursor-pointer"
                    >
                      Limpar Lidos
                    </button>
                  )}
                </div>

                <div className="divide-y divide-white/10 max-h-80 overflow-y-auto">
                  {alertsList.map((alert) => (
                    <Link
                      key={alert.id}
                      href={alert.link}
                      onClick={() => {
                        handleMarkAsRead(alert.id);
                        setIsNotificationsOpen(false);
                      }}
                      className={`p-3 block transition-colors space-y-1 ${
                        alert.read ? 'bg-white/[0.02] opacity-60' : 'hover:bg-white/5 bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border ${alert.color}`}>
                            {alert.tag}
                          </span>
                          {alert.read && (
                            <span className="text-[9px] text-white/40 font-mono italic">✓ Lido</span>
                          )}
                        </div>
                        <span className="text-[10px] text-white/40">{alert.time}</span>
                      </div>
                      <strong className={`block text-xs ${alert.read ? 'text-white/60' : 'text-white font-bold'}`}>
                        {alert.title}
                      </strong>
                      <p className="text-white/70 text-[11px] leading-tight">{alert.desc}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Help & Quick Guide Button */}
          <button
            onClick={() => {
              setIsHelpModalOpen(true);
              setIsNotificationsOpen(false);
            }}
            className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            title="Ajuda & Guia de Uso"
          >
            <HelpCircle className="w-5 h-5" />
          </button>

          {/* User Profile */}
          <div className="flex items-center space-x-2 pl-2 border-l border-white/10">
            <div className="w-8 h-8 rounded-full bg-slate-800 overflow-hidden border border-white/30 shadow-sm">
              <img
                src="/avatars/rafael_oliveira.jpg"
                alt="Rafael Oliveira"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-semibold text-xs text-white hidden sm:block">Rafael Oliveira</span>
          </div>
        </div>
      </header>

      {/* ❓ MODAL GUIA DE USO & SUPORTE TÉCNICO */}
      {isHelpModalOpen && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#17211B] text-white rounded-2xl border border-[#2C3A2E] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col text-xs font-sans">
            <div className="p-4 border-b border-[#2C3A2E] bg-[#121812] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#365314] text-[#A8C98F] flex items-center justify-center shadow-inner">
                  <HelpCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white">Manual Operacional PRAD Umburanas</h3>
                  <p className="text-[10px] text-white/50 font-mono">Guia Técnico de Navegação e Funcionalidades GIS</p>
                </div>
              </div>
              <button
                onClick={() => setIsHelpModalOpen(false)}
                className="text-white/40 hover:text-white transition-colors cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-3.5 max-h-[75vh] overflow-y-auto text-white/80">
              <div className="p-3.5 bg-[#121812] rounded-xl border border-[#2C3A2E] space-y-1.5 shadow-sm">
                <div className="flex items-center gap-2 text-[#A8C98F] font-bold text-xs">
                  <Map className="w-4 h-4 text-[#00A651]" />
                  <span>1. Geoportal 2D & Indicadores Cartográficos</span>
                </div>
                <p className="text-[11px] leading-relaxed text-white/70">
                  Navegação cartográfica de alta precisão, ferramentas de medição de distâncias/superfícies e controle individual de camadas cartográficas (Poligonal CEUR, Parques SPE, Reserva Legal e Aerogeradores).
                </p>
              </div>

              <div className="p-3.5 bg-[#121812] rounded-xl border border-[#2C3A2E] space-y-1.5 shadow-sm">
                <div className="flex items-center gap-2 text-[#A8C98F] font-bold text-xs">
                  <Layers className="w-4 h-4 text-[#00A651]" />
                  <span>2. Cadastro de Áreas & Aproximação Submétrica</span>
                </div>
                <p className="text-[11px] leading-relaxed text-white/70">
                  Consulta à lista de 38 poligonais PRAD com minimapa sincronizado em tempo real. O botão <em>"Abrir esta Área no Geoportal 2D"</em> executa o voo direto com aproximação submétrica sobre o ponto da área.
                </p>
              </div>

              <div className="p-3.5 bg-[#121812] rounded-xl border border-[#2C3A2E] space-y-1.5 shadow-sm">
                <div className="flex items-center gap-2 text-[#A8C98F] font-bold text-xs">
                  <Calendar className="w-4 h-4 text-[#00A651]" />
                  <span>3. Planejamento Operacional & Calendário</span>
                </div>
                <p className="text-[11px] leading-relaxed text-white/70">
                  Agendamento e acompanhamento de metas quinzenais, vistorias de campo para amostragem de solo, plantio de nativas e controle de progresso físico em hectares.
                </p>
              </div>

              <div className="p-3.5 bg-[#121812] rounded-xl border border-[#2C3A2E] space-y-1.5 shadow-sm">
                <div className="flex items-center gap-2 text-[#A8C98F] font-bold text-xs">
                  <FileText className="w-4 h-4 text-[#00A651]" />
                  <span>4. Suporte Técnico & Especificação</span>
                </div>
                <p className="text-[11px] leading-relaxed text-white/70">
                  Sistema desenvolvido para o <strong>Conjunto Eólico Umburanas (ENGIE / EcoBrasil)</strong>.<br />
                  Elaborado por: <strong className="text-white font-extrabold">Maurivan Vaz Ribeiro</strong>.
                </p>
              </div>
            </div>

            <div className="p-3 border-t border-[#2C3A2E] bg-[#121812] flex items-center justify-end">
              <button
                onClick={() => setIsHelpModalOpen(false)}
                className="px-5 py-2 bg-[#365314] hover:bg-[#283e0e] text-white font-bold rounded-xl shadow-md transition-all cursor-pointer text-xs"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. LEFT VERTICAL SIDEBAR (Dark Olive Sidebar matching screenshot) */}
      <aside className="fixed left-0 top-14 bottom-0 z-40 bg-[#1D2A0D] w-20 flex flex-col items-center py-3 border-r border-[#121812] font-sans">
        {/* Top App Grid Icon */}
        <button className="p-2 text-white/70 hover:text-white mb-3">
          <Grid className="w-5 h-5" />
        </button>

        {/* Vertical Nav List */}
        <nav className="flex-1 w-full space-y-2 px-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center p-2 rounded-xl text-[10px] font-medium transition-all text-center ${
                  isActive
                    ? 'bg-[#3B5212] text-white shadow font-bold border border-emerald-400/30'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <img src={item.symbol} alt={item.label} className="w-5 h-5 mb-1 object-contain brightness-0 invert" />
                <span className="leading-tight">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Collapse Toggle */}
        <button className="p-2 text-white/50 hover:text-white">
          <ChevronLeft className="w-4 h-4" />
        </button>
      </aside>
    </>
  );
}
