"use client";

import React, { useRef, useEffect } from 'react';
import { Train, ChevronDown, RotateCcw, Ticket, LineChart, Shield, Copy, Mic, Globe, WifiOff, AlertTriangle, RefreshCw, Volume2, HardDrive } from 'lucide-react';
import Script from 'next/script';

export default function DashboardRefinements() {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    // We need to wait for Chart.js to be available on window
    const initChart = () => {
      if (!window.Chart || !chartRef.current) return;
      
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext('2d');
      const scores = [0, 10, 20, 30, 40, 45, 50, 60, 70, 80, 90, 100];
      const probabilities = [28, 31, 35, 40, 48, 54, 62, 75, 86, 94, 98, 100];

      const gradientBlue = ctx.createLinearGradient(0, 0, 0, 300);
      gradientBlue.addColorStop(0, 'rgba(99, 102, 241, 0.4)'); // indigo-500
      gradientBlue.addColorStop(1, 'rgba(99, 102, 241, 0.0)');

      chartInstance.current = new window.Chart(ctx, {
        type: 'line',
        data: {
          labels: scores,
          datasets: [{
            label: 'Win Probability',
            data: probabilities,
            borderColor: '#6366f1',
            backgroundColor: gradientBlue,
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: function(context) {
              return context.dataIndex === 5 ? '#f59e0b' : '#ffffff';
            },
            pointBorderColor: function(context) {
              return context.dataIndex === 5 ? '#f59e0b' : '#6366f1';
            },
            pointBorderWidth: 2,
            pointRadius: function(context) {
              return context.dataIndex === 5 ? 6 : 3;
            },
            pointHoverRadius: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              backgroundColor: 'rgba(15, 23, 42, 0.9)',
              titleFont: { family: 'Inter', size: 13 },
              bodyFont: { family: 'Inter', size: 14, weight: 'bold' },
              padding: 12,
              cornerRadius: 8,
              displayColors: false,
              callbacks: {
                title: function(tooltipItems) {
                  return 'Priority Score: ' + tooltipItems[0].label;
                },
                label: function(context) {
                  let label = context.parsed.y + '% Probability';
                  if (context.dataIndex === 5) {
                    label += ' (You are here)';
                  }
                  return label;
                }
              }
            }
          },
          scales: {
            x: {
              grid: {
                color: '#f1f5f9',
                drawBorder: false
              },
              ticks: {
                font: { family: 'Inter' },
                color: '#64748b'
              },
              title: {
                display: true,
                text: 'Priority Score',
                font: { family: 'Inter', weight: '500' },
                color: '#475569'
              }
            },
            y: {
              grid: {
                color: '#f1f5f9',
                drawBorder: false
              },
              ticks: {
                font: { family: 'Inter' },
                color: '#64748b',
                callback: function(value) {
                  return value + '%';
                }
              },
              title: {
                display: true,
                text: 'Probability',
                font: { family: 'Inter', weight: '500' },
                color: '#475569'
              },
              min: 0,
              max: 100
            }
          },
          interaction: {
            intersect: false,
            mode: 'index',
          },
        }
      });
    };

    // Check periodically if Chart is loaded
    const checkChart = setInterval(() => {
      if (window.Chart) {
        initChart();
        clearInterval(checkChart);
      }
    }, 100);

    return () => {
      clearInterval(checkChart);
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []);

  return (
    <div className="p-4 md:p-8 text-slate-800 font-sans min-h-screen bg-slate-50">
      <Script src="https://cdn.jsdelivr.net/npm/chart.js" strategy="lazyOnload" />
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-slate-200 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center">
              <Train className="text-indigo-600 mr-3 w-8 h-8" />
              Smart Rail Dashboard
            </h1>
            <p className="text-slate-500 mt-1 ml-11">User Design Refinements Showcase</p>
          </div>
          <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
            <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold shadow-inner">
              JD
            </div>
            <span className="font-medium text-slate-700">John Doe</span>
            <ChevronDown className="text-slate-400 w-4 h-4 ml-2" />
          </div>
        </header>

        {/* Refinement 3: Simplified Result Communication */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 sm:p-8 border-l-4 border-indigo-500">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1 bg-white p-2 rounded-full shadow-sm">
                <RotateCcw className="text-indigo-500 w-6 h-6" />
              </div>
              <div className="ml-5 w-full">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xl font-bold text-indigo-900 tracking-tight">Draw Result: New Delhi (NDLS) to Mumbai (BCT)</h3>
                  <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-indigo-200">Refinement 3</span>
                </div>
                
                <div className="bg-white rounded-xl p-5 mt-4 shadow-sm border border-indigo-100 relative overflow-hidden">
                  <div className="absolute -right-10 -top-10 text-indigo-50 opacity-50">
                    <Ticket className="w-40 h-40" />
                  </div>
                  
                  <p className="text-slate-700 text-lg relative z-10">
                    You were not selected this time. Your score has increased to <strong className="text-indigo-700 text-2xl mx-1">45</strong>. 
                    <br className="hidden sm:block" />Your improved odds for the next draw are <strong className="text-emerald-600 text-2xl mx-1">42%</strong>.
                  </p>
                  
                  <div className="mt-6 w-full bg-slate-100 rounded-full h-3 relative z-10">
                    <div className="bg-gradient-to-r from-indigo-400 to-indigo-600 h-3 rounded-full relative" style={{ width: '45%' }}>
                      <div className="absolute right-0 top-0 bottom-0 w-4 bg-white opacity-30 rounded-r-full animate-pulse"></div>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 mt-2 relative z-10 font-medium">
                    <span>Score: 0</span>
                    <span>Current: 45</span>
                    <span>Guaranteed Ticket (100)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Refinement 1: Odds Visualisation */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8 flex flex-col h-full relative">
            <div className="absolute top-6 right-6">
              <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-0.5 rounded border border-emerald-200">Refinement 1</span>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2 flex items-center">
              <div className="w-8 h-8 rounded bg-emerald-100 flex items-center justify-center mr-3 text-emerald-600">
                <LineChart className="w-4 h-4" />
              </div>
              Odds Visualisation
            </h2>
            <p className="text-sm text-slate-500 mb-6 font-medium">Win probability vs. priority score for a typical 100-entry draw (28 seats).</p>
            
            <div className="relative flex-grow min-h-[280px] w-full bg-slate-50 rounded-xl p-4 border border-slate-100">
              <canvas ref={chartRef}></canvas>
            </div>
            
            <div className="mt-4 flex items-center justify-center space-x-6 text-xs text-slate-500">
              <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-indigo-500 mr-2"></span> Your Current Position</div>
              <div className="flex items-center"><span className="w-3 h-3 rounded-full border-2 border-slate-300 mr-2"></span> Base Probability</div>
            </div>
          </section>

          {/* Refinement 2: Public Draw Log */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8 flex flex-col h-full relative">
            <div className="absolute top-6 right-6">
              <span className="bg-purple-50 text-purple-700 text-xs font-semibold px-2.5 py-0.5 rounded border border-purple-200">Refinement 2</span>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2 flex items-center">
              <div className="w-8 h-8 rounded bg-purple-100 flex items-center justify-center mr-3 text-purple-600">
                <Shield className="w-4 h-4" />
              </div>
              Public Draw Log
            </h2>
            <p className="text-sm text-slate-500 mb-6 font-medium">Cryptographically verifiable history for your searched routes.</p>
            
            <div className="overflow-hidden flex-grow border border-slate-200 rounded-xl bg-white shadow-sm">
              <table className="min-w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3 font-semibold text-xs uppercase tracking-wider">Draw Time</th>
                    <th className="px-5 py-3 font-semibold text-xs uppercase tracking-wider text-center">Entries</th>
                    <th className="px-5 py-3 font-semibold text-xs uppercase tracking-wider">Seed (Hash)</th>
                    <th className="px-5 py-3 font-semibold text-xs uppercase tracking-wider text-center">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap"><div className="font-medium text-slate-800">Today</div><div className="text-xs text-slate-400">10:00 AM</div></td>
                    <td className="px-5 py-4 text-center font-medium">102</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center">
                        <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">0x7f8a9b...</span>
                        <Copy className="w-3 h-3 ml-2 text-slate-400 hover:text-indigo-500 cursor-pointer" />
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center"><span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-semibold">28 Winners</span></td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap"><div className="font-medium text-slate-800">Yesterday</div><div className="text-xs text-slate-400">10:00 AM</div></td>
                    <td className="px-5 py-4 text-center font-medium">98</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center">
                        <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">0x3a4b5c...</span>
                        <Copy className="w-3 h-3 ml-2 text-slate-400 hover:text-indigo-500 cursor-pointer" />
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center"><span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-semibold">28 Winners</span></td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap"><div className="font-medium text-slate-800">May 1, 2026</div><div className="text-xs text-slate-400">10:00 AM</div></td>
                    <td className="px-5 py-4 text-center font-medium">115</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center">
                        <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">0x1b2c3d...</span>
                        <Copy className="w-3 h-3 ml-2 text-slate-400 hover:text-indigo-500 cursor-pointer" />
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center"><span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-semibold">28 Winners</span></td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap"><div className="font-medium text-slate-800">Apr 30, 2026</div><div className="text-xs text-slate-400">10:00 AM</div></td>
                    <td className="px-5 py-4 text-center font-medium">105</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center">
                        <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">0x9f8e7d...</span>
                        <Copy className="w-3 h-3 ml-2 text-slate-400 hover:text-indigo-500 cursor-pointer" />
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center"><span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-semibold">28 Winners</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* ─── NEW REFINEMENTS START HERE ─── */}
        
        {/* Refinement 6: Clearer Failure Handling and Recovery Path */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mt-8">
          <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 sm:p-8 border-l-4 border-orange-500">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1 bg-white p-2 rounded-full shadow-sm">
                <AlertTriangle className="text-orange-500 w-6 h-6" />
              </div>
              <div className="ml-5 w-full">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xl font-bold text-orange-900 tracking-tight">Payment Failure Recovery</h3>
                  <span className="bg-orange-100 text-orange-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-orange-200">Refinement 6</span>
                </div>
                
                <div className="bg-white rounded-xl p-5 mt-4 shadow-sm border border-orange-100 relative overflow-hidden">
                  <p className="text-slate-700 text-lg relative z-10 font-medium">
                    Payment failed due to network timeout.
                  </p>
                  <div className="mt-4 bg-emerald-50 text-emerald-800 p-4 rounded-lg border border-emerald-100 flex items-start gap-3 relative z-10">
                    <Shield className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <p className="text-sm">
                      <strong>Don't worry!</strong> Your priority score of <span className="font-bold text-lg text-emerald-700 mx-1">45</span> is safe and has not been penalized. Technical issues outside your control do not affect your score.
                    </p>
                  </div>
                  
                  <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 pt-5 relative z-10">
                    <div className="flex items-center text-orange-600 font-medium">
                      <RefreshCw className="w-4 h-4 mr-2 animate-[spin_3s_linear_infinite]" />
                      Retry within 04:59
                    </div>
                    <button className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-6 rounded-lg transition-colors flex items-center justify-center">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Retry Payment
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Refinement 4: Voice-Assisted and Multi-Language Guidance */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8 flex flex-col h-full relative">
            <div className="absolute top-6 right-6">
              <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-0.5 rounded border border-blue-200">Refinement 4</span>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2 flex items-center">
              <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center mr-3 text-blue-600">
                <Globe className="w-4 h-4" />
              </div>
              Multi-Language Voice Assist
            </h2>
            <p className="text-sm text-slate-500 mb-6 font-medium">Voice-guided prompts and multi-language support for low-literacy & elderly users.</p>
            
            <div className="flex-grow flex flex-col gap-5 bg-slate-50 rounded-xl p-5 border border-slate-100">
              {/* Language Selector */}
              <div className="flex gap-2 p-1 bg-white rounded-lg border border-slate-200 shadow-sm self-start">
                <button className="px-3 py-1.5 bg-blue-50 text-blue-700 font-bold text-sm rounded-md border border-blue-100 transition-colors">English</button>
                <button className="px-3 py-1.5 text-slate-600 hover:bg-slate-50 font-medium text-sm rounded-md transition-colors">हिंदी</button>
                <button className="px-3 py-1.5 text-slate-600 hover:bg-slate-50 font-medium text-sm rounded-md transition-colors">தமிழ்</button>
              </div>
              
              {/* Voice Prompt UI */}
              <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm relative overflow-hidden group">
                <div className="absolute -right-6 -bottom-6 text-indigo-50 group-hover:text-indigo-100 transition-colors duration-500">
                  <Mic className="w-24 h-24" />
                </div>
                
                <div className="flex items-start gap-4 relative z-10">
                  <button className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center shrink-0 shadow-md hover:bg-indigo-700 hover:scale-105 transition-all duration-300">
                    <Volume2 className="w-6 h-6" />
                  </button>
                  <div>
                    <h4 className="font-bold text-slate-800">Aadhaar Verification Required</h4>
                    <p className="text-sm text-slate-600 mt-1 italic">
                      "Please prepare your Aadhaar card for the next step. Your identity needs to be verified before joining the draw."
                    </p>
                    <div className="flex items-center gap-1 mt-3">
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Refinement 5: Enhanced 2G-Safe Interaction Pattern */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8 flex flex-col h-full relative">
            <div className="absolute top-6 right-6">
              <span className="bg-amber-50 text-amber-700 text-xs font-semibold px-2.5 py-0.5 rounded border border-amber-200">Refinement 5</span>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2 flex items-center">
              <div className="w-8 h-8 rounded bg-amber-100 flex items-center justify-center mr-3 text-amber-600">
                <WifiOff className="w-4 h-4" />
              </div>
              2G-Safe Interaction Pattern
            </h2>
            <p className="text-sm text-slate-500 mb-6 font-medium">Offline-safe request queuing in the mobile client for weak networks.</p>
            
            <div className="flex-grow flex flex-col justify-center gap-4 bg-slate-800 rounded-xl p-6 border border-slate-700 text-white relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-orange-500 opacity-80 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center text-amber-400 text-sm font-bold">
                  <WifiOff className="w-4 h-4 mr-2" />
                  Network Dropped
                </div>
                <div className="flex items-center text-xs text-slate-400 bg-slate-700 px-2 py-1 rounded">
                  <HardDrive className="w-3 h-3 mr-1" />
                  Cached
                </div>
              </div>
              
              <div className="bg-slate-700/60 p-4 rounded-lg border border-slate-600 backdrop-blur-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-slate-200">Tatkal Draw Request</h4>
                    <p className="text-xs text-slate-400 mt-1">NDLS &rarr; BCT | 22:45</p>
                  </div>
                  <span className="text-xs bg-slate-600 text-slate-300 px-2 py-0.5 rounded font-mono shadow-inner border border-slate-500">4.2 KB</span>
                </div>
                
                <div className="mt-4 pt-4 border-t border-slate-600 flex items-center text-sm text-amber-300 font-medium">
                  <RefreshCw className="w-4 h-4 mr-2 animate-[spin_2s_linear_infinite]" />
                  Queued. Will auto-submit when online.
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
