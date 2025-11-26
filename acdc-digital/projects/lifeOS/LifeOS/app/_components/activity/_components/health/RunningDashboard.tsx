// HEALTH & FITNESS - Running dashboard with training logs and analytics
// /Users/matthewsimon/Projects/LifeOS/LifeOS/app/_components/activity/_components/health/RunningDashboard.tsx

'use client';

import React, { useState } from 'react';
import { 
  Activity, 
  Plus, 
  Clock, 
  Zap, 
  MapPin, 
  Target,
  TrendingUp,
  Calendar as CalendarIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar } from '@/components/ui/calendar';

interface RunningSession {
  id: number;
  distance: number;
  duration: string;
  pace: string;
  location: string;
  date: string;
  calories: number;
  notes: string;
  tags: string[];
}

interface RunningGoal {
  id: number;
  title: string;
  type: 'weekly_distance' | 'pace_improvement' | 'consistency';
  target: number;
  current: number;
  unit: string;
  deadline: string;
}

interface WeeklyStats {
  totalDistance: number;
  totalRuns: number;
  averagePace: string;
  totalTime: string;
  bestPace: string;
}

export function RunningDashboard() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isAddingRun, setIsAddingRun] = useState(false);
  const [newRunDistance, setNewRunDistance] = useState('');
  const [newRunDuration, setNewRunDuration] = useState('');
  const [newRunLocation, setNewRunLocation] = useState('');
  const [newRunNotes, setNewRunNotes] = useState('');
  const [chartTimeframe, setChartTimeframe] = useState<'week' | 'month' | 'year'>('week');

  // Mock data for running sessions with comprehensive sample data
  const [runningSessions, setRunningSessions] = useState<RunningSession[]>([
    // Recent week data
    {
      id: 1,
      distance: 5.2,
      duration: '42:18',
      pace: '8:08',
      location: 'Central Park Loop',
      date: '2025-08-21',
      calories: 468,
      notes: 'Perfect morning run. Felt strong and maintained good pace throughout.',
      tags: ['morning', 'park', 'tempo']
    },
    {
      id: 2,
      distance: 3.1,
      duration: '28:45',
      pace: '9:16',
      location: 'Riverside Drive',
      date: '2025-08-19',
      calories: 279,
      notes: 'Easy recovery run. Focused on form and breathing.',
      tags: ['recovery', 'easy', 'form']
    },
    {
      id: 3,
      distance: 6.8,
      duration: '55:12',
      pace: '8:07',
      location: 'Brooklyn Bridge Path',
      date: '2025-08-17',
      calories: 612,
      notes: 'Long weekend run with beautiful views. Felt progressively stronger.',
      tags: ['long-run', 'weekend', 'progressive']
    },
    {
      id: 4,
      distance: 4.0,
      duration: '31:20',
      pace: '7:50',
      location: 'Track - McCarren Park',
      date: '2025-08-15',
      calories: 360,
      notes: 'Speed work: 8x400m intervals. Hit target times consistently.',
      tags: ['speed', 'intervals', 'track']
    },
    {
      id: 5,
      distance: 5.5,
      duration: '45:30',
      pace: '8:16',
      location: 'Prospect Park',
      date: '2025-08-13',
      calories: 495,
      notes: 'Steady tempo run with hills. Good workout prep for weekend long run.',
      tags: ['tempo', 'hills', 'workout']
    },
    
    // Previous week data
    {
      id: 6,
      distance: 7.2,
      duration: '60:24',
      pace: '8:23',
      location: 'Hudson River Greenway',
      date: '2025-08-10',
      calories: 648,
      notes: 'Long run exploring new route. Consistent pacing despite headwind.',
      tags: ['long-run', 'exploration', 'consistent']
    },
    {
      id: 7,
      distance: 3.5,
      duration: '32:55',
      pace: '9:24',
      location: 'Central Park Loop',
      date: '2025-08-08',
      calories: 315,
      notes: 'Easy shakeout run before rest day. Legs felt fresh.',
      tags: ['easy', 'recovery', 'fresh']
    },
    {
      id: 8,
      distance: 5.0,
      duration: '39:15',
      pace: '7:51',
      location: 'Track - East River Park',
      date: '2025-08-06',
      calories: 450,
      notes: 'Fartlek session: 1min hard, 1min easy x12. Great for speed endurance.',
      tags: ['fartlek', 'speed', 'endurance']
    },
    
    // Month back data  
    {
      id: 9,
      distance: 8.1,
      duration: '68:47',
      pace: '8:29',
      location: 'Manhattan Waterfront Loop',
      date: '2025-07-28',
      calories: 729,
      notes: 'Big weekend long run. Fueled well and maintained steady effort.',
      tags: ['long-run', 'weekend', 'fueling']
    },
    {
      id: 10,
      distance: 4.3,
      duration: '33:16',
      pace: '7:44',
      location: 'Track - Randalls Island',
      date: '2025-07-25',
      calories: 387,
      notes: '5K time trial effort. New PR pace! Felt controlled and strong.',
      tags: ['time-trial', 'pr', 'controlled']
    },
    {
      id: 11,
      distance: 6.0,
      duration: '51:30',
      pace: '8:35',
      location: 'Williamsburg Bridge Loop',
      date: '2025-07-22',
      calories: 540,
      notes: 'Threshold run with bridge climbs. Good power development.',
      tags: ['threshold', 'hills', 'power']
    },
    {
      id: 12,
      distance: 3.8,
      duration: '35:34',
      pace: '9:22',
      location: 'Battery Park',
      date: '2025-07-19',
      calories: 342,
      notes: 'Recovery run in the heat. Stayed hydrated and took it easy.',
      tags: ['recovery', 'heat', 'hydration']
    },
    
    // Earlier data for year view
    {
      id: 13,
      distance: 9.5,
      duration: '81:25',
      pace: '8:34',
      location: 'Central Park - Full Loop x3',
      date: '2025-06-15',
      calories: 855,
      notes: 'Peak training long run. Practiced race day fueling strategy.',
      tags: ['long-run', 'peak', 'fueling']
    },
    {
      id: 14,
      distance: 4.8,
      duration: '36:48',
      pace: '7:40',
      location: 'Track - Columbia University',
      date: '2025-06-12',
      calories: 432,
      notes: 'Mile repeats at 5K pace. 4x1600m with 400m recovery. Solid workout.',
      tags: ['mile-repeats', '5k-pace', 'solid']
    },
    {
      id: 15,
      distance: 7.8,
      duration: '66:54',
      pace: '8:35',
      location: 'Brooklyn Greenway',
      date: '2025-05-20',
      calories: 702,
      notes: 'Progressive long run. Started easy, finished at marathon pace.',
      tags: ['progressive', 'marathon-pace', 'build']
    },
    {
      id: 16,
      distance: 5.3,
      duration: '41:34',
      pace: '7:50',
      location: 'Queensboro Bridge Loop',
      date: '2025-05-03',
      calories: 477,
      notes: 'Tempo effort over bridges. Great for strength and mental toughness.',
      tags: ['tempo', 'bridges', 'mental-toughness']
    },
    {
      id: 17,
      distance: 10.2,
      duration: '89:18',
      pace: '8:45',
      location: 'NYC Marathon Route Preview',
      date: '2025-04-12',
      calories: 918,
      notes: 'Course preview run. Practiced pacing and fueling for race day.',
      tags: ['course-preview', 'pacing', 'race-prep']
    },
    {
      id: 18,
      distance: 6.5,
      duration: '52:00',
      pace: '8:00',
      location: 'High Line to Battery Park',
      date: '2025-03-28',
      calories: 585,
      notes: 'Urban exploration run. Great scenery and steady effort throughout.',
      tags: ['exploration', 'urban', 'steady']
    }
  ]);

  const [currentGoals] = useState<RunningGoal[]>([
    {
      id: 1,
      title: 'Weekly Distance Goal',
      type: 'weekly_distance',
      target: 25,
      current: 16.8,
      unit: 'miles',
      deadline: '2024-01-21'
    },
    {
      id: 2,
      title: 'Improve 5K Pace',
      type: 'pace_improvement',
      target: 8.0,
      current: 8.3,
      unit: 'min/mile',
      deadline: '2024-02-01'
    },
    {
      id: 3,
      title: 'Run 5 Days This Week',
      type: 'consistency',
      target: 5,
      current: 3,
      unit: 'days',
      deadline: '2024-01-21'
    }
  ]);

  // Calculate weekly stats
  const weeklyStats: WeeklyStats = {
    totalDistance: runningSessions.reduce((sum, session) => sum + session.distance, 0),
    totalRuns: runningSessions.length,
    averagePace: '8:35',
    totalTime: '3:09:15',
    bestPace: '8:00'
  };

  // Handle adding new run
  const handleAddRun = () => {
    setIsAddingRun(true);
  };

  const handleCancelRun = () => {
    setIsAddingRun(false);
    setNewRunDistance('');
    setNewRunDuration('');
    setNewRunLocation('');
    setNewRunNotes('');
  };

  const calculatePace = (distance: number, duration: string): string => {
    const parts = duration.split(':');
    let totalMinutes = 0;
    
    if (parts.length === 3) {
      // HH:MM:SS format
      totalMinutes = parseInt(parts[0]) * 60 + parseInt(parts[1]) + parseInt(parts[2]) / 60;
    } else if (parts.length === 2) {
      // MM:SS format
      totalMinutes = parseInt(parts[0]) + parseInt(parts[1]) / 60;
    }
    
    const paceMinutes = totalMinutes / distance;
    const minutes = Math.floor(paceMinutes);
    const seconds = Math.round((paceMinutes - minutes) * 60);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSaveRun = () => {
    if (!newRunDistance.trim() || !newRunDuration.trim()) return;

    const distance = parseFloat(newRunDistance);
    const pace = calculatePace(distance, newRunDuration);
    const calories = Math.round(distance * 90); // Rough estimate

    const newRun: RunningSession = {
      id: Date.now(),
      distance,
      duration: newRunDuration,
      pace,
      location: newRunLocation || 'Unknown Location',
      date: new Date().toISOString().split('T')[0],
      calories,
      notes: newRunNotes,
      tags: []
    };

    setRunningSessions(prev => [newRun, ...prev]);
    handleCancelRun();
  };

  // Get run days for calendar highlighting
  const runDays = runningSessions.map(session => new Date(session.date));

  // Get chart data based on timeframe
  const getChartData = () => {
    const now = new Date();
    let daysBack = 7;
    
    switch (chartTimeframe) {
      case 'week':
        daysBack = 7;
        break;
      case 'month':
        daysBack = 30;
        break;
      case 'year':
        daysBack = 365;
        break;
    }
    
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - daysBack);
    
    return runningSessions
      .filter(session => new Date(session.date) >= startDate)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const chartData = getChartData();

  return (
    <div className="h-full bg-[#1e1e1e] text-[#cccccc] flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-[#2d2d30]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[#cccccc] flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#007acc]" />
              Running Dashboard
            </h3>
            <p className="text-sm text-[#858585] mt-1">Track your runs, progress, and goals</p>
          </div>
          
          {/* Quick Stats */}
          <div className="flex gap-6 text-sm">
            <div className="text-center">
              <div className="text-[#007acc] font-semibold">{weeklyStats.totalDistance.toFixed(1)}</div>
              <div className="text-[#858585] text-xs">Miles This Week</div>
            </div>
            <div className="text-center">
              <div className="text-[#007acc] font-semibold">{weeklyStats.totalRuns}</div>
              <div className="text-[#858585] text-xs">Runs Logged</div>
            </div>
            <div className="text-center">
              <div className="text-[#007acc] font-semibold">{weeklyStats.averagePace}</div>
              <div className="text-[#858585] text-xs">Avg Pace</div>
            </div>
          </div>
        </div>

        {/* Calendar and Analytics Section - Two Column Layout */}
        <div className="mt-6 grid grid-cols-3 gap-6">
          {/* Left side - Calendar (1 column) */}
          <div className="col-span-1">
            <h5 className="text-[#cccccc] font-medium text-xs mb-3 uppercase tracking-wide flex items-center gap-2">
              <CalendarIcon className="w-3 h-3" />
              Training Calendar
            </h5>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="w-full border border-[#2d2d30] rounded-lg bg-[#252526] p-3"
              classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4",
                caption: "flex justify-center pt-1 relative items-center",
                caption_label: "text-sm font-medium text-[#cccccc]",
                nav: "space-x-1 flex items-center",
                nav_button: "h-7 w-7 bg-transparent p-0 hover:bg-[#2d2d30] rounded-md flex items-center justify-center",
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-1",
                head_row: "flex",
                head_cell: "text-[#858585] rounded-md w-8 font-normal text-[0.8rem] flex items-center justify-center",
                row: "flex w-full mt-2",
                cell: "h-8 w-8 text-center text-sm p-0 relative hover:bg-[#2d2d30] rounded-md transition-colors first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                day: "h-8 w-8 p-0 font-normal text-[#cccccc] hover:bg-[#2d2d30] rounded-md flex items-center justify-center text-sm transition-colors",
                day_range_end: "day-range-end",
                day_selected: "bg-[#007acc] text-white hover:bg-[#005a9e] focus:bg-[#007acc] focus:text-white",
                day_today: "bg-[#2d2d30] text-[#cccccc] font-medium",
                day_outside: "text-[#454545] opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
                day_disabled: "text-[#454545] opacity-50",
                day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                day_hidden: "invisible",
              }}
              modifiers={{
                runDay: runDays,
              }}
              modifiersClassNames={{
                runDay: "relative bg-green-600/20 text-green-400 hover:bg-green-600/30 after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:transform after:-translate-x-1/2 after:w-1 after:h-1 after:bg-green-400 after:rounded-full"
              }}
            />
          </div>

          {/* Right side - Analytics Charts (2 columns) */}
          <div className="col-span-2 space-y-4">
            {/* Multi-Metric Progress Chart */}
            <div className="bg-[#252526] rounded-lg p-4 border border-[#2d2d30]">
              <div className="flex items-center justify-between mb-4">
                <h5 className="text-[#cccccc] font-medium text-xs uppercase tracking-wide">Progress Over Time</h5>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setChartTimeframe('week')}
                    className={`text-xs px-2 py-1 rounded transition-colors ${
                      chartTimeframe === 'week' 
                        ? 'bg-[#007acc] text-white' 
                        : 'text-[#858585] hover:text-[#cccccc] hover:bg-[#2d2d30]'
                    }`}
                  >
                    Week
                  </button>
                  <button 
                    onClick={() => setChartTimeframe('month')}
                    className={`text-xs px-2 py-1 rounded transition-colors ${
                      chartTimeframe === 'month' 
                        ? 'bg-[#007acc] text-white' 
                        : 'text-[#858585] hover:text-[#cccccc] hover:bg-[#2d2d30]'
                    }`}
                  >
                    Month
                  </button>
                  <button 
                    onClick={() => setChartTimeframe('year')}
                    className={`text-xs px-2 py-1 rounded transition-colors ${
                      chartTimeframe === 'year' 
                        ? 'bg-[#007acc] text-white' 
                        : 'text-[#858585] hover:text-[#cccccc] hover:bg-[#2d2d30]'
                    }`}
                  >
                    Year
                  </button>
                </div>
              </div>
              
              {/* Chart Container */}
              <div className="relative h-32 mb-3">
                <svg width="100%" height="100%" viewBox="0 0 400 128" className="overflow-visible">
                  {/* Grid lines */}
                  <defs>
                    <pattern id="grid" width="40" height="26" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 26" fill="none" stroke="#2d2d30" strokeWidth="0.5" opacity="0.5"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                  
                  {/* Distance line */}
                  {chartData.length > 1 && (
                    <polyline
                      points={chartData
                        .slice(chartTimeframe === 'week' ? -7 : chartTimeframe === 'month' ? -30 : -52)
                        .map((run, index, array) => {
                          const x = array.length > 1 ? (index / (array.length - 1)) * 380 + 10 : 200;
                          const maxDistance = Math.max(...chartData.map(r => r.distance), 1);
                          const y = 118 - (run.distance / maxDistance) * 100;
                          return `${x},${y}`;
                        })
                        .join(' ')}
                      fill="none"
                      stroke="#007acc"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}
                  
                  {/* Pace line (inverted - lower is better) */}
                  {chartData.length > 1 && (
                    <polyline
                      points={chartData
                        .slice(chartTimeframe === 'week' ? -7 : chartTimeframe === 'month' ? -30 : -52)
                        .map((run, index, array) => {
                          const x = array.length > 1 ? (index / (array.length - 1)) * 380 + 10 : 200;
                          const paceSeconds = parseFloat(run.pace.split(':')[0]) * 60 + parseFloat(run.pace.split(':')[1]);
                          const allPaceSeconds = chartData.map(r => parseFloat(r.pace.split(':')[0]) * 60 + parseFloat(r.pace.split(':')[1]));
                          const maxPaceSeconds = Math.max(...allPaceSeconds);
                          const minPaceSeconds = Math.min(...allPaceSeconds);
                          const paceRange = maxPaceSeconds - minPaceSeconds || 1;
                          const y = 118 - ((maxPaceSeconds - paceSeconds) / paceRange) * 100;
                          return `${x},${y}`;
                        })
                        .join(' ')}
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}
                  
                  {/* Average distance line */}
                  {chartData.length > 0 && (
                    <line
                      x1="10"
                      y1={118 - (chartData.reduce((sum, r) => sum + r.distance, 0) / chartData.length / Math.max(...chartData.map(r => r.distance), 1)) * 100}
                      x2="390"
                      y2={118 - (chartData.reduce((sum, r) => sum + r.distance, 0) / chartData.length / Math.max(...chartData.map(r => r.distance), 1)) * 100}
                      stroke="#007acc"
                      strokeWidth="1.5"
                      strokeDasharray="6,4"
                      opacity="0.7"
                    />
                  )}
                  
                  {/* Data points for distance */}
                  {chartData
                    .slice(chartTimeframe === 'week' ? -7 : chartTimeframe === 'month' ? -30 : -52)
                    .map((run, index, array) => {
                      const x = array.length > 1 ? (index / (array.length - 1)) * 380 + 10 : 200;
                      const maxDistance = Math.max(...chartData.map(r => r.distance), 1);
                      const y = 118 - (run.distance / maxDistance) * 100;
                      return (
                        <circle
                          key={`distance-${run.id}`}
                          cx={x}
                          cy={y}
                          r="4"
                          fill="#007acc"
                          stroke="#1e1e1e"
                          strokeWidth="2"
                          className="hover:r-6 transition-all cursor-pointer"
                        >
                          <title>{run.distance} miles - {new Date(run.date).toLocaleDateString()}</title>
                        </circle>
                      );
                    })}
                  
                  {/* Data points for pace */}
                  {chartData
                    .slice(chartTimeframe === 'week' ? -7 : chartTimeframe === 'month' ? -30 : -52)
                    .map((run, index, array) => {
                      const x = array.length > 1 ? (index / (array.length - 1)) * 380 + 10 : 200;
                      const paceSeconds = parseFloat(run.pace.split(':')[0]) * 60 + parseFloat(run.pace.split(':')[1]);
                      const allPaceSeconds = chartData.map(r => parseFloat(r.pace.split(':')[0]) * 60 + parseFloat(r.pace.split(':')[1]));
                      const maxPaceSeconds = Math.max(...allPaceSeconds);
                      const minPaceSeconds = Math.min(...allPaceSeconds);
                      const paceRange = maxPaceSeconds - minPaceSeconds || 1;
                      const y = 118 - ((maxPaceSeconds - paceSeconds) / paceRange) * 100;
                      return (
                        <circle
                          key={`pace-${run.id}`}
                          cx={x}
                          cy={y}
                          r="4"
                          fill="#22c55e"
                          stroke="#1e1e1e"
                          strokeWidth="2"
                          className="hover:r-6 transition-all cursor-pointer"
                        >
                          <title>{run.pace}/mile - {new Date(run.date).toLocaleDateString()}</title>
                        </circle>
                      );
                    })}
                </svg>
                
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-[#858585] -ml-8">
                  <span>{Math.max(...chartData.map(r => r.distance), 0).toFixed(1)}mi</span>
                  <span className="text-green-400">{chartData.map(r => r.pace).sort()[0] || '0:00'}</span>
                  <span>0mi</span>
                </div>
              </div>
              
              {/* Legend */}
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-0.5 bg-[#007acc]"></div>
                  <span className="text-[#cccccc]">Distance</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-0.5 bg-[#22c55e]"></div>
                  <span className="text-[#cccccc]">Pace</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-0.5 bg-[#007acc] opacity-60 border-t border-dashed border-[#007acc]"></div>
                  <span className="text-[#858585]">Avg Distance</span>
                </div>
              </div>
            </div>

            {/* Pace Analysis */}
            <div className="bg-[#252526] rounded-lg p-4 border border-[#2d2d30]">
              <h5 className="text-[#cccccc] font-medium text-xs mb-3 uppercase tracking-wide">Pace Analysis</h5>
              <div className="space-y-2">
                {runningSessions.slice(0, 3).map((run) => {
                  const paceMinutes = parseFloat(run.pace.split(':')[0]);
                  const paceSeconds = parseFloat(run.pace.split(':')[1]);
                  const totalSeconds = paceMinutes * 60 + paceSeconds;
                  const avgPace = 530; // 8:50 average in seconds
                  const paceDeviation = ((totalSeconds - avgPace) / avgPace) * 100;
                  const isAboveAvg = totalSeconds > avgPace;
                  
                  return (
                    <div key={run.id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isAboveAvg ? 'bg-orange-500' : 'bg-green-500'}`}></div>
                        <span className="text-[#cccccc]">{new Date(run.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[#858585]">{run.pace}/mile</span>
                        <span className={`text-xs ${isAboveAvg ? 'text-orange-400' : 'text-green-400'}`}>
                          {isAboveAvg ? '+' : ''}{Math.round(paceDeviation)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Location & Distance Summary */}
            <div className="bg-[#252526] rounded-lg p-4 border border-[#2d2d30]">
              <h5 className="text-[#cccccc] font-medium text-xs mb-3 uppercase tracking-wide">Popular Routes</h5>
              <div className="space-y-2">
                {Array.from(new Set(runningSessions.map(r => r.location)))
                  .slice(0, 4)
                  .map((location) => {
                    const locationRuns = runningSessions.filter(r => r.location === location);
                    const totalDistance = locationRuns.reduce((sum, r) => sum + r.distance, 0);
                    const avgDistance = totalDistance / locationRuns.length;
                    
                    return (
                      <div key={location} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3 text-[#007acc]" />
                          <span className="text-[#cccccc] truncate flex-1">{location}</span>
                        </div>
                        <div className="text-[#858585] text-right">
                          <div>{locationRuns.length} runs</div>
                          <div>{avgDistance.toFixed(1)}mi avg</div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full Width Content Row Below */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          
          {/* Two-column layout */}
          <div className="flex gap-6">
            
            {/* First Column: Goals & Progress */}
            <div className="w-120 flex-shrink-0">
              <h4 className="text-[#cccccc] font-medium text-sm mb-4">Current Goals</h4>
              
              <div className="space-y-4">
                {currentGoals.map((goal) => (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#cccccc]">{goal.title}</span>
                      <span className="text-[#007acc]">
                        {goal.type === 'pace_improvement' 
                          ? `${goal.current} / ${goal.target} ${goal.unit}`
                          : `${goal.current} / ${goal.target} ${goal.unit}`
                        }
                      </span>
                    </div>
                    
                    {goal.type === 'weekly_distance' && (
                      <div className="space-y-2">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={(goal.current / goal.target) * 100}
                          readOnly
                          title={`Goal progress: ${Math.round((goal.current / goal.target) * 100)}% completed`}
                          className="w-full h-2 bg-[#2d2d30] rounded-lg appearance-none cursor-default [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-[#007acc] [&::-webkit-slider-thumb]:rounded-full"
                        />
                        <div className="text-xs text-[#858585]">
                          {Math.round((goal.current / goal.target) * 100)}% completed
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Second Column: Recent Performance */}
            <div className="flex-1 space-y-4">
              <h5 className="text-[#cccccc] font-medium text-sm">Performance Trends</h5>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-[#252526] rounded p-3 border border-[#2d2d30]">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-3 h-3 text-green-400" />
                    <span className="text-[#cccccc]">Pace Trend</span>
                  </div>
                  <div className="text-green-400 font-medium">Improving</div>
                  <div className="text-[#858585]">-15s/mile vs last week</div>
                </div>
                <div className="bg-[#252526] rounded p-3 border border-[#2d2d30]">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-3 h-3 text-blue-400" />
                    <span className="text-[#cccccc]">Consistency</span>
                  </div>
                  <div className="text-blue-400 font-medium">4/5 days</div>
                  <div className="text-[#858585]">This week</div>
                </div>
              </div>
            </div>
          </div>

          {/* Invisible separator for vertical spacing */}
          <div className="border-t border-[#1e1e1e] my-6"></div>

          {/* Running Sessions Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h5 className="text-[#cccccc] font-medium text-sm flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Recent Running Sessions
              </h5>
              <Button
                size="sm"
                onClick={handleAddRun}
                className="bg-[#1e1e1e] hover:bg-[#252526] text-[#cccccc] border border-[#454545] hover:border-[#007acc] transition-all duration-200"
              >
                <Plus className="w-3 h-3 mr-1" />
                Log Run
              </Button>
            </div>

            {/* Add Run Form */}
            {isAddingRun && (
              <div className="mb-6 border border-[#2d2d30] rounded-lg p-4">
                <div className="space-y-4 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Input
                        placeholder="Distance (miles)"
                        value={newRunDistance}
                        onChange={(e) => setNewRunDistance(e.target.value)}
                        className="bg-transparent border-none text-[#cccccc] placeholder:text-[#858585] focus:ring-0 focus:outline-none p-0 text-sm h-auto"
                      />
                      <div className="h-px bg-[#454545] mt-2"></div>
                    </div>
                    <div>
                      <Input
                        placeholder="Duration (HH:MM:SS)"
                        value={newRunDuration}
                        onChange={(e) => setNewRunDuration(e.target.value)}
                        className="bg-transparent border-none text-[#cccccc] placeholder:text-[#858585] focus:ring-0 focus:outline-none p-0 text-sm h-auto"
                      />
                      <div className="h-px bg-[#454545] mt-2"></div>
                    </div>
                  </div>
                  
                  <div>
                    <Input
                      placeholder="Location"
                      value={newRunLocation}
                      onChange={(e) => setNewRunLocation(e.target.value)}
                      className="bg-transparent border-none text-[#cccccc] placeholder:text-[#858585] focus:ring-0 focus:outline-none p-0 text-sm h-auto"
                    />
                    <div className="h-px bg-[#454545] mt-2"></div>
                  </div>

                  <div className="mt-4">
                    <textarea
                      placeholder="Notes about your run..."
                      value={newRunNotes}
                      onChange={(e) => setNewRunNotes(e.target.value)}
                      rows={4}
                      className="w-full bg-transparent border-none text-[#cccccc] placeholder:text-[#858585] focus:ring-0 focus:outline-none resize-none text-sm leading-relaxed p-0"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-[#454545]">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCancelRun}
                      className="text-[#858585] hover:text-[#cccccc] hover:bg-[#2d2d30] px-3 py-1 h-7 text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveRun}
                      disabled={!newRunDistance.trim() || !newRunDuration.trim()}
                      className="bg-[#007acc] hover:bg-[#005a9e] text-white disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1 h-7 text-xs"
                    >
                      Log Run
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Running Sessions List */}
            <div className="space-y-4">
              {runningSessions.map((session: RunningSession) => (
                <div
                  key={session.id}
                  className="border border-[#2d2d30] rounded-lg p-3 hover:bg-[#252526] transition-colors cursor-pointer"
                >
                  {/* Session Header */}
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-4">
                      <h6 className="text-[#cccccc] font-medium text-base">
                        {session.distance} miles
                      </h6>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="flex items-center gap-1 text-[#007acc]">
                          <Clock className="w-3 h-3" />
                          {session.duration}
                        </div>
                        <div className="flex items-center gap-1 text-[#858585]">
                          <Zap className="w-3 h-3" />
                          {session.pace}/mile
                        </div>
                        <div className="flex items-center gap-1 text-[#858585]">
                          <MapPin className="w-3 h-3" />
                          {session.location}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-[#858585] font-mono">
                      {new Date(session.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  
                  {/* Session Stats */}
                  <div className="flex items-center gap-4 text-xs text-[#858585] mb-2">
                    <span>{session.calories} calories burned</span>
                  </div>
                  
                  {/* Session Notes */}
                  {session.notes && (
                    <div className="text-[#cccccc] text-sm leading-relaxed mb-2 whitespace-pre-line">
                      {session.notes}
                    </div>
                  )}
                  
                  {/* Tags */}
                  {session.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {session.tags.map((tag: string) => (
                        <span
                          key={tag}
                          className="text-xs text-[#858585] hover:text-[#cccccc] transition-colors cursor-pointer"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              
              {runningSessions.length === 0 && !isAddingRun && (
                <div className="text-center py-12 text-[#858585] text-sm">
                  <Activity className="w-8 h-8 mx-auto mb-3 opacity-30" />
                  <p className="mb-1">No running sessions logged yet</p>
                  <p className="text-xs opacity-75">Click &ldquo;Log Run&rdquo; above to start tracking your runs</p>
                </div>
              )}
            </div>
          </div>

          {/* Invisible separator for vertical spacing */}
          <div className="pt-6 border-t border-[#1e1e1e]">
            <h6 className="text-[#858585] font-medium text-xs mb-2 uppercase tracking-wide">Additional Information</h6>
            
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[#858585]">Weekly Goal:</span>
                <span className="text-[#cccccc]">25 miles ({Math.round((weeklyStats.totalDistance / 25) * 100)}% complete)</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-[#858585]">Best Pace This Month:</span>
                <span className="text-[#cccccc]">8:15/mile</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-[#858585]">Total Distance This Month:</span>
                <span className="text-[#cccccc]">52.3 miles</span>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
