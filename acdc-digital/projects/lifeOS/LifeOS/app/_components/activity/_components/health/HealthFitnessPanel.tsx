// HEALTH FITNESS PANEL - Health and fitness tracking interface
// /Users/matthewsimon/Projects/LifeOS/LifeOS/app/_components/activity/_components/health/HealthFitnessPanel.tsx

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, Plus, Target, Calendar, TrendingUp, Heart, Zap } from "lucide-react";
import { useEditorStore } from "@/lib/store";

export function HealthFitnessPanel() {
  const [activeTab, setActiveTab] = useState<'overview' | 'workouts' | 'goals'>('overview');
  const { openRunningTab } = useEditorStore();

  const mockStats = {
    todaySteps: 8543,
    stepGoal: 10000,
    weeklyWorkouts: 4,
    workoutGoal: 5,
    calories: 2156,
    calorieGoal: 2200
  };

  const recentWorkouts = [
    {
      id: 1,
      type: "Cardio",
      duration: 45,
      calories: 320,
      date: "Today",
      intensity: "High"
    },
    {
      id: 2,
      type: "Strength",
      duration: 60,
      calories: 280,
      date: "Yesterday",
      intensity: "Medium"
    },
    {
      id: 3,
      type: "Yoga",
      duration: 30,
      calories: 150,
      date: "2 days ago",
      intensity: "Low"
    }
  ];

  const goals = [
    {
      id: 1,
      title: "Daily Steps",
      current: mockStats.todaySteps,
      target: mockStats.stepGoal,
      unit: "steps",
      progress: (mockStats.todaySteps / mockStats.stepGoal) * 100
    },
    {
      id: 2,
      title: "Weekly Workouts",
      current: mockStats.weeklyWorkouts,
      target: mockStats.workoutGoal,
      unit: "workouts",
      progress: (mockStats.weeklyWorkouts / mockStats.workoutGoal) * 100
    },
    {
      id: 3,
      title: "Daily Calories",
      current: mockStats.calories,
      target: mockStats.calorieGoal,
      unit: "cal",
      progress: (mockStats.calories / mockStats.calorieGoal) * 100
    }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'workouts', label: 'Workouts', icon: Activity },
    { id: 'goals', label: 'Goals', icon: Target }
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-[#454545]">
        <h3 className="text-[#cccccc] font-medium mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4" />
          HEALTH & FITNESS
        </h3>
        
        {/* Tabs */}
        <div className="flex bg-[#3c3c3c] rounded">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'overview' | 'workouts' | 'goals')}
                className={`flex-1 px-3 py-2 text-xs rounded flex items-center justify-center gap-1 transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#007acc] text-white'
                    : 'text-[#858585] hover:text-[#cccccc] hover:bg-[#404040]'
                }`}
              >
                <Icon className="w-3 h-3" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Running Dashboard Link */}
              <div className="bg-[#3c3c3c] rounded-lg p-4 border border-[#007acc]/30">
                <h4 className="text-[#cccccc] font-medium mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#007acc]" />
                  Running Dashboard
                </h4>
                <p className="text-[#858585] text-sm mb-3">
                  Access your complete running analytics, training logs, and goal tracking in the main dashboard area.
                </p>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-[#007acc]">
                    ✓ Available in Dashboard → Running Dashboard tab
                  </div>
                  <Button
                    size="sm"
                    onClick={openRunningTab}
                    className="bg-[#007acc] hover:bg-[#005a9e] text-white px-3 py-1 h-7 text-xs"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    New Tab
                  </Button>
                </div>
              </div>

              {/* Today's Stats */}
              <div className="bg-[#3c3c3c] rounded-lg p-4">
                <h4 className="text-[#cccccc] font-medium mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Today&apos;s Progress
                </h4>
                
                {/* Steps */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-[#cccccc]">Steps</span>
                    <span className="text-[#858585]">
                      {mockStats.todaySteps.toLocaleString()} / {mockStats.stepGoal.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-[#2d2d2d] rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${(mockStats.todaySteps / mockStats.stepGoal) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Calories */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-[#cccccc]">Calories Burned</span>
                    <span className="text-[#858585]">
                      {mockStats.calories} / {mockStats.calorieGoal}
                    </span>
                  </div>
                  <div className="w-full bg-[#2d2d2d] rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full transition-all"
                      style={{ width: `${(mockStats.calories / mockStats.calorieGoal) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#3c3c3c] rounded-lg p-3 text-center">
                  <Heart className="w-6 h-6 text-red-500 mx-auto mb-2" />
                  <div className="text-[#cccccc] font-medium">72 bpm</div>
                  <div className="text-xs text-[#858585]">Resting HR</div>
                </div>
                <div className="bg-[#3c3c3c] rounded-lg p-3 text-center">
                  <Zap className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                  <div className="text-[#cccccc] font-medium">85</div>
                  <div className="text-xs text-[#858585]">Energy Score</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'workouts' && (
            <div className="space-y-4">
              <Button 
                size="sm" 
                className="w-full bg-[#007acc] hover:bg-[#005a9e] text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Log Workout
              </Button>

              <div className="space-y-3">
                {recentWorkouts.map((workout) => (
                  <div
                    key={workout.id}
                    className="bg-[#3c3c3c] rounded-lg p-3 hover:bg-[#404040] transition-colors cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-[#cccccc] font-medium">{workout.type}</h4>
                      <span className="text-xs text-[#858585]">{workout.date}</span>
                    </div>
                    <div className="flex justify-between text-sm text-[#858585]">
                      <span>{workout.duration} min</span>
                      <span>{workout.calories} cal</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        workout.intensity === 'High' ? 'bg-red-500/20 text-red-400' :
                        workout.intensity === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {workout.intensity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'goals' && (
            <div className="space-y-4">
              <Button 
                size="sm" 
                className="w-full bg-[#007acc] hover:bg-[#005a9e] text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Goal
              </Button>

              <div className="space-y-3">
                {goals.map((goal) => (
                  <div
                    key={goal.id}
                    className="bg-[#3c3c3c] rounded-lg p-4"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-[#cccccc] font-medium">{goal.title}</h4>
                      <span className="text-xs text-[#858585]">
                        {Math.round(goal.progress)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-[#858585] mb-2">
                      <span>{goal.current.toLocaleString()} {goal.unit}</span>
                      <span>Goal: {goal.target.toLocaleString()} {goal.unit}</span>
                    </div>
                    <div className="w-full bg-[#2d2d2d] rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          goal.progress >= 100 ? 'bg-green-500' : 'bg-[#007acc]'
                        }`}
                        style={{ width: `${Math.min(goal.progress, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
