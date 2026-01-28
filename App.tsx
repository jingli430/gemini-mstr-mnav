
import React, { useState, useEffect, useCallback } from 'react';
import { StatCard } from './components/StatCard';
import { MNAVChart } from './components/MNAVChart';
import { fetchHistoricalData, calculateMNAV } from './services/financeApi';
import { getMNAVAnalysis, fetchLatestMSTRStats } from './services/geminiService';
import { MSTRDataPoint, MSTRStats } from './types';
import { MSTR_CONSTANTS } from './constants';

const App: React.FC = () => {
  const [data, setData] = useState<MSTRDataPoint[]>([]);
  const [stats, setStats] = useState<MSTRStats | null>(null);
  const [analysis, setAnalysis] = useState<string>('正在由 Gemini AI 进行深度分析...');
  const [loading, setLoading] = useState(true);
  const [notificationStatus, setNotificationStatus] = useState<'default' | 'granted' | 'denied'>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  const initData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch historical data
      const history = await fetchHistoricalData(90);
      setData(history);

      // 2. Fetch/Update current stats
      const latest = history[history.length - 1];
      const currentStats = calculateMNAV(
        latest.mstrPrice,
        latest.btcPrice,
        MSTR_CONSTANTS.BTC_HOLDINGS,
        MSTR_CONSTANTS.SHARES_OUTSTANDING
      );
      setStats(currentStats);

      // 3. Gemini Analysis
      const aiResponse = await getMNAVAnalysis(currentStats.mnavRatio, currentStats.premium);
      setAnalysis(aiResponse || "暂无分析数据");

      // Optional: Check if MSTR data is updated via Gemini
      const refreshedStats = await fetchLatestMSTRStats();
      if (refreshedStats) {
        console.log("Updated MSTR Stats found:", refreshedStats);
      }

    } catch (err) {
      console.error("Initialization error:", err);
      // Ensure we don't leave the UI in a broken state if possible
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initData();
  }, [initData]);

  const requestNotification = async () => {
    if (typeof Notification === 'undefined') {
      alert("此浏览器不支持通知功能。请在 iOS Safari 中选择 '添加到主屏幕'。");
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      setNotificationStatus(permission);
      if (permission === 'granted') {
        new Notification("MSTR MNAV 提醒", {
          body: "您已成功开启每日 MNAV 溢价监控。我们将每天为您推送到 iPhone。",
          icon: "https://picsum.photos/200"
        });
      }
    } catch (err) {
      console.error("Notification permission error:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0b0e14]">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400 font-medium animate-pulse">正在同步 MSTR & BTC 链上数据...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
      {/* Header */}
      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            MSTR MNAV 追踪器
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            监控 MicroStrategy 比特币持仓与市值的溢价率曲线
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={requestNotification}
            className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2 ${
              notificationStatus === 'granted' 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20'
            }`}
          >
            {notificationStatus === 'granted' ? (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" /></svg>
                通知已开启
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                在 iPhone 开启每日提醒
              </>
            )}
          </button>
          
          <button 
            onClick={() => window.location.reload()}
            className="p-2.5 rounded-xl border border-gray-700 hover:bg-gray-800 text-gray-400 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          </button>
        </div>
      </header>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard 
          label="MNAV 倍数" 
          value={`${stats?.mnavRatio?.toFixed(2) ?? '0.00'}x`} 
          subValue="市值 / 比特币持仓价值" 
          color="blue"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
        />
        <StatCard 
          label="当前溢价率" 
          value={`${stats?.premium?.toFixed(1) ?? '0.0'}%`} 
          subValue="较比特币持仓的溢价" 
          color="emerald"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
        />
        <StatCard 
          label="MSTR 股价" 
          value={`$${stats?.currentMstrPrice?.toFixed(2) ?? '0.00'}`} 
          subValue="市场交易价格" 
          color="amber"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard 
          label="BTC 价格" 
          value={`$${stats?.currentBtcPrice?.toLocaleString() ?? '0'}`} 
          subValue="全球比特币指数" 
          color="rose"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Column */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-200">MNAV 倍数历史曲线 (90D)</h3>
            <div className="flex gap-2">
              <span className="flex items-center gap-1.5 text-xs text-gray-400">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span> MNAV 倍数
              </span>
            </div>
          </div>
          <MNAVChart data={data} />
        </div>

        {/* AI Analysis & Instruction Column */}
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="font-bold text-emerald-400 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              Gemini AI 智能分析
            </h3>
            <div className="text-gray-300 text-sm leading-relaxed space-y-3">
              {analysis.split('\n').map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/10 border border-blue-500/20 p-6 rounded-2xl">
            <h3 className="font-bold text-blue-400 mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
              iPhone 提醒设置教程
            </h3>
            <ol className="text-xs text-gray-400 space-y-2 list-decimal list-inside">
              <li>在 iOS Safari 浏览器中点击下方 <b>分享</b> 图标。</li>
              <li>选择 <b>“添加到主屏幕”</b>。</li>
              <li>在主屏幕打开此应用，即可开启原生 <b>推送通知</b>。</li>
              <li>系统将每日定时计算溢价并在 iPhone 锁屏发送提醒。</li>
            </ol>
            <div className="mt-4 flex justify-center">
              <div className="animate-bounce">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <footer className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-600 text-xs">
        <p>数据源: 模拟实时市场 & MicroStrategy 投资者关系报告 ({MSTR_CONSTANTS.UPDATE_DATE})</p>
        <p className="mt-2">MNAV = (股价 × 流通股) / (持仓比特币量 × 比特币单价)</p>
        <p className="mt-1">由 Google Gemini 3 Pro 提供金融语义驱动</p>
      </footer>
    </div>
  );
};

export default App;
