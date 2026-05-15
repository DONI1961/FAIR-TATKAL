"use client";

import React, { useRef, useEffect } from 'react';
import { Train, ChevronDown, RotateCcw, Ticket, LineChart, Shield, Copy, Mic, Globe, WifiOff, AlertTriangle, RefreshCw, Volume2, HardDrive } from 'lucide-react';
import Script from 'next/script';

  useEffect(() => {
    // We need to wait for Chart.js to be available on window
    const initChart = () => {
      if (!window.Chart || !chartRef.current) return;
      
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const isDark = document.documentElement.classList.contains('dark');
      const ctx = chartRef.current.getContext('2d');
      const scores = [0, 10, 20, 30, 40, 45, 50, 60, 70, 80, 90, 100];
      const probabilities = [28, 31, 35, 40, 48, 54, 62, 75, 86, 94, 98, 100];

      const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
      const mutedColor = getComputedStyle(document.documentElement).getPropertyValue('--muted-foreground').trim();
      const borderColor = getComputedStyle(document.documentElement).getPropertyValue('--border').trim();

      const gradientBlue = ctx.createLinearGradient(0, 0, 0, 300);
      gradientBlue.addColorStop(0, isDark ? 'rgba(59, 130, 246, 0.4)' : 'rgba(11, 77, 161, 0.2)');
      gradientBlue.addColorStop(1, 'rgba(59, 130, 246, 0.0)');

      chartInstance.current = new window.Chart(ctx, {
        type: 'line',
        data: {
          labels: scores,
          datasets: [{
            label: 'Win Probability',
            data: probabilities,
            borderColor: isDark ? '#3b82f6' : '#0b4da1',
            backgroundColor: gradientBlue,
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: function(context) {
              return context.dataIndex === 5 ? '#f59e0b' : (isDark ? '#ffffff' : '#0b4da1');
            },
            pointBorderColor: function(context) {
              return context.dataIndex === 5 ? '#f59e0b' : (isDark ? '#3b82f6' : '#ffffff');
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
              backgroundColor: isDark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)',
              titleColor: isDark ? '#ffffff' : '#111827',
              bodyColor: isDark ? '#ffffff' : '#111827',
              titleFont: { family: 'Inter', size: 13 },
              bodyFont: { family: 'Inter', size: 14, weight: 'bold' },
              padding: 12,
              cornerRadius: 8,
              displayColors: false,
              borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
              borderWidth: 1,
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
                color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                drawBorder: false
              },
              ticks: {
                font: { family: 'Inter' },
                color: isDark ? '#94a3b8' : '#64748b'
              },
              title: {
                display: true,
                text: 'Priority Score',
                font: { family: 'Inter', weight: '500' },
                color: isDark ? '#cbd5e1' : '#475569'
              }
            },
            y: {
              grid: {
                color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                drawBorder: false
              },
              ticks: {
                font: { family: 'Inter' },
                color: isDark ? '#94a3b8' : '#64748b',
                callback: function(value) {
                  return value + '%';
                }
              },
              title: {
                display: true,
                text: 'Probability',
                font: { family: 'Inter', weight: '500' },
                color: isDark ? '#cbd5e1' : '#475569'
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
    <div className="p-4 md:p-8 text-foreground font-sans min-h-screen bg-background">
      <Script src="https://cdn.jsdelivr.net/npm/chart.js" strategy="lazyOnload" />
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-border gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center">
              <Train className="text-primary mr-3 w-8 h-8" />
              Smart Rail Dashboard
            </h1>
            <p className="text-muted-foreground mt-1 ml-11">User Design Refinements Showcase</p>
          </div>
          <div className="flex items-center space-x-3 bg-card px-4 py-2 rounded-full shadow-sm border border-border">
            <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold shadow-inner">
              JD
            </div>
            <span className="font-medium text-foreground">John Doe</span>
            <ChevronDown className="text-muted-foreground w-4 h-4 ml-2" />
          </div>
        </header>

        {/* Refinement 3: Simplified Result Communication */}
        <section className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-6 sm:p-8 border-l-4 border-primary">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1 bg-card p-2 rounded-full shadow-sm">
                <RotateCcw className="text-primary w-6 h-6" />
              </div>
              <div className="ml-5 w-full">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xl font-bold text-foreground tracking-tight">Draw Result: New Delhi (NDLS) to Mumbai (BCT)</h3>
                  <span className="bg-primary/20 text-primary text-xs font-semibold px-2.5 py-0.5 rounded border border-primary/30">Refinement 3</span>
                </div>
                
                <div className="bg-card rounded-xl p-5 mt-4 shadow-sm border border-border relative overflow-hidden">
                  <div className="absolute -right-10 -top-10 text-primary opacity-5">
                    <Ticket className="w-40 h-40" />
                  </div>
                  
                  <p className="text-foreground text-lg relative z-10">
                    You were not selected this time. Your score has increased to <strong className="text-primary text-2xl mx-1">45</strong>. 
                    <br className="hidden sm:block" />Your improved odds for the next draw are <strong className="text-emerald-500 text-2xl mx-1">42%</strong>.
                  </p>
                  
                  <div className="mt-6 w-full bg-secondary rounded-full h-3 relative z-10">
                    <div className="bg-gradient-to-r from-primary/60 to-primary h-3 rounded-full relative" style={{ width: '45%' }}>
                      <div className="absolute right-0 top-0 bottom-0 w-4 bg-white opacity-30 rounded-r-full animate-pulse"></div>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-2 relative z-10 font-medium">
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
          <section className="bg-card rounded-2xl shadow-sm border border-border p-6 sm:p-8 flex flex-col h-full relative">
            <div className="absolute top-6 right-6">
              <span className="bg-emerald-500/10 text-emerald-500 text-xs font-semibold px-2.5 py-0.5 rounded border border-emerald-500/20">Refinement 1</span>
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2 flex items-center">
              <div className="w-8 h-8 rounded bg-emerald-500/10 flex items-center justify-center mr-3 text-emerald-500">
                <LineChart className="w-4 h-4" />
              </div>
              Odds Visualisation
            </h2>
            <p className="text-sm text-muted-foreground mb-6 font-medium">Win probability vs. priority score for a typical 100-entry draw (28 seats).</p>
            
            <div className="relative flex-grow min-h-[280px] w-full bg-secondary/30 rounded-xl p-4 border border-border">
              <canvas ref={chartRef}></canvas>
            </div>
            
            <div className="mt-4 flex items-center justify-center space-x-6 text-xs text-muted-foreground">
              <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-primary mr-2"></span> Your Current Position</div>
              <div className="flex items-center"><span className="w-3 h-3 rounded-full border-2 border-border mr-2"></span> Base Probability</div>
            </div>
          </section>

          {/* Refinement 2: Public Draw Log */}
          <section className="bg-card rounded-2xl shadow-sm border border-border p-6 sm:p-8 flex flex-col h-full relative">
            <div className="absolute top-6 right-6">
              <span className="bg-accent/10 text-accent text-xs font-semibold px-2.5 py-0.5 rounded border border-accent/20">Refinement 2</span>
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2 flex items-center">
              <div className="w-8 h-8 rounded bg-accent/10 flex items-center justify-center mr-3 text-accent">
                <Shield className="w-4 h-4" />
              </div>
              Public Draw Log
            </h2>
            <p className="text-sm text-muted-foreground mb-6 font-medium">Cryptographically verifiable history for your searched routes.</p>
            
            <div className="overflow-hidden flex-grow border border-border rounded-xl bg-card shadow-sm">
              <table className="min-w-full text-left text-sm text-muted-foreground">
                <thead className="bg-secondary/50 text-foreground border-b border-border">
                  <tr>
                    <th className="px-5 py-3 font-semibold text-xs uppercase tracking-wider">Draw Time</th>
                    <th className="px-5 py-3 font-semibold text-xs uppercase tracking-wider text-center">Entries</th>
                    <th className="px-5 py-3 font-semibold text-xs uppercase tracking-wider">Seed (Hash)</th>
                    <th className="px-5 py-3 font-semibold text-xs uppercase tracking-wider text-center">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap"><div className="font-medium text-foreground">Today</div><div className="text-xs text-muted-foreground">10:00 AM</div></td>
                    <td className="px-5 py-4 text-center font-medium">102</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center">
                        <span className="font-mono text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">0x7f8a9b...</span>
                        <Copy className="w-3 h-3 ml-2 text-muted-foreground hover:text-primary cursor-pointer" />
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center"><span className="bg-emerald-500/10 text-emerald-500 px-2.5 py-1 rounded-full text-xs font-semibold">28 Winners</span></td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap"><div className="font-medium text-foreground">Yesterday</div><div className="text-xs text-muted-foreground">10:00 AM</div></td>
                    <td className="px-5 py-4 text-center font-medium">98</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center">
                        <span className="font-mono text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">0x3a4b5c...</span>
                        <Copy className="w-3 h-3 ml-2 text-muted-foreground hover:text-primary cursor-pointer" />
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center"><span className="bg-emerald-500/10 text-emerald-500 px-2.5 py-1 rounded-full text-xs font-semibold">28 Winners</span></td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap"><div className="font-medium text-foreground">May 1, 2026</div><div className="text-xs text-muted-foreground">10:00 AM</div></td>
                    <td className="px-5 py-4 text-center font-medium">115</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center">
                        <span className="font-mono text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">0x1b2c3d...</span>
                        <Copy className="w-3 h-3 ml-2 text-muted-foreground hover:text-primary cursor-pointer" />
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center"><span className="bg-emerald-500/10 text-emerald-500 px-2.5 py-1 rounded-full text-xs font-semibold">28 Winners</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* ─── NEW REFINEMENTS START HERE ─── */}
        
        {/* Refinement 6: Clearer Failure Handling and Recovery Path */}
        <section className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden mt-8">
          <div className="bg-gradient-to-r from-orange-500/5 to-red-500/5 p-6 sm:p-8 border-l-4 border-orange-500">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1 bg-card p-2 rounded-full shadow-sm">
                <AlertTriangle className="text-orange-500 w-6 h-6" />
              </div>
              <div className="ml-5 w-full">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xl font-bold text-foreground tracking-tight">Payment Failure Recovery</h3>
                  <span className="bg-orange-500/10 text-orange-500 text-xs font-semibold px-2.5 py-0.5 rounded border border-orange-500/20">Refinement 6</span>
                </div>
                
                <div className="bg-card rounded-xl p-5 mt-4 shadow-sm border border-border relative overflow-hidden">
                  <p className="text-foreground text-lg relative z-10 font-medium">
                    Payment failed due to network timeout.
                  </p>
                  <div className="mt-4 bg-emerald-500/10 text-emerald-500 p-4 rounded-lg border border-emerald-500/20 flex items-start gap-3 relative z-10">
                    <Shield className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <p className="text-sm">
                      <strong>Don't worry!</strong> Your priority score of <span className="font-bold text-lg text-emerald-500 mx-1">45</span> is safe and has not been penalized. Technical issues outside your control do not affect your score.
                    </p>
                  </div>
                  
                  <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border pt-5 relative z-10">
                    <div className="flex items-center text-orange-500 font-medium">
                      <RefreshCw className="w-4 h-4 mr-2 animate-[spin_3s_linear_infinite]" />
                      Retry within 04:59
                    </div>
                    <button className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-6 rounded-lg transition-colors flex items-center justify-center shadow-lg">
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
          <section className="bg-card rounded-2xl shadow-sm border border-border p-6 sm:p-8 flex flex-col h-full relative">
            <div className="absolute top-6 right-6">
              <span className="bg-primary/10 text-primary text-xs font-semibold px-2.5 py-0.5 rounded border border-primary/20">Refinement 4</span>
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2 flex items-center">
              <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center mr-3 text-primary">
                <Globe className="w-4 h-4" />
              </div>
              Multi-Language Voice Assist
            </h2>
            <p className="text-sm text-muted-foreground mb-6 font-medium">Voice-guided prompts and multi-language support for low-literacy & elderly users.</p>
            
            <div className="flex-grow flex flex-col gap-5 bg-secondary/30 rounded-xl p-5 border border-border">
              {/* Language Selector */}
              <div className="flex gap-2 p-1 bg-card rounded-lg border border-border shadow-sm self-start">
                <button className="px-3 py-1.5 bg-primary/10 text-primary font-bold text-sm rounded-md border border-primary/20 transition-colors">English</button>
                <button className="px-3 py-1.5 text-muted-foreground hover:bg-secondary font-medium text-sm rounded-md transition-colors">हिंदी</button>
                <button className="px-3 py-1.5 text-muted-foreground hover:bg-secondary font-medium text-sm rounded-md transition-colors">தமிழ்</button>
              </div>
              
              {/* Voice Prompt UI */}
              <div className="bg-card p-4 rounded-xl border border-primary/10 shadow-sm relative overflow-hidden group">
                <div className="absolute -right-6 -bottom-6 text-primary opacity-5 group-hover:opacity-10 transition-colors duration-500">
                  <Mic className="w-24 h-24" />
                </div>
                
                <div className="flex items-start gap-4 relative z-10">
                  <button className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center shrink-0 shadow-md hover:bg-primary/90 hover:scale-105 transition-all duration-300">
                    <Volume2 className="w-6 h-6" />
                  </button>
                  <div>
                    <h4 className="font-bold text-foreground">Aadhaar Verification Required</h4>
                    <p className="text-sm text-muted-foreground mt-1 italic">
                      "Please prepare your Aadhaar card for the next step. Your identity needs to be verified before joining the draw."
                    </p>
                    <div className="flex items-center gap-1 mt-3">
                      <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                      <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Refinement 5: Enhanced 2G-Safe Interaction Pattern */}
          <section className="bg-card rounded-2xl shadow-sm border border-border p-6 sm:p-8 flex flex-col h-full relative">
            <div className="absolute top-6 right-6">
              <span className="bg-accent/10 text-accent text-xs font-semibold px-2.5 py-0.5 rounded border border-accent/20">Refinement 5</span>
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2 flex items-center">
              <div className="w-8 h-8 rounded bg-accent/10 flex items-center justify-center mr-3 text-accent">
                <WifiOff className="w-4 h-4" />
              </div>
              2G-Safe Interaction Pattern
            </h2>
            <p className="text-sm text-muted-foreground mb-6 font-medium">Offline-safe request queuing in the mobile client for weak networks.</p>
            
            <div className="flex-grow flex flex-col justify-center gap-4 bg-secondary rounded-xl p-6 border border-border text-foreground relative overflow-hidden group shadow-inner">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent to-primary opacity-80 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center text-accent text-sm font-black uppercase tracking-widest">
                  <WifiOff className="w-4 h-4 mr-2" />
                  Network Dropped
                </div>
                <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-background px-2 py-1 rounded border border-border shadow-sm">
                  <HardDrive className="w-3 h-3 mr-1" />
                  Cached
                </div>
              </div>
              
              <div className="bg-background/60 p-4 rounded-lg border border-border backdrop-blur-sm shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-foreground">Tatkal Draw Request</h4>
                    <p className="text-xs text-muted-foreground mt-1 font-medium">NDLS &rarr; BCT | 22:45</p>
                  </div>
                  <span className="text-[10px] bg-secondary text-muted-foreground px-2 py-0.5 rounded font-mono shadow-inner border border-border font-bold">4.2 KB</span>
                </div>
                
                <div className="mt-4 pt-4 border-t border-border flex items-center text-sm text-accent font-black uppercase tracking-wide">
                  <RefreshCw className="w-4 h-4 mr-2 animate-[spin_2s_linear_infinite]" />
                  Queued. Reconnecting...
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
