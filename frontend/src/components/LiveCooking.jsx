import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { scheduleRecipes } from '../utils/scheduler';
import './LiveCooking.css';

function LiveCooking({ sessionData }) {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(0);
  const [schedule, setSchedule] = useState([]);
  const [maxTime, setMaxTime] = useState(0);

  useEffect(() => {
    if (!sessionData || !sessionData.selectedRecipes) {
      navigate('/select');
      return;
    }

    const recipesData = api.getMockRecipes();
    const generated = scheduleRecipes(recipesData, sessionData.selectedRecipes, sessionData.chefs);
    setSchedule(generated);
    setMaxTime(generated.length > 0 ? Math.max(...generated.map(t => t.end)) : 0);
  }, [sessionData, navigate]);

  useEffect(() => {
    if (maxTime === 0) return;
    const interval = setInterval(() => {
      setCurrentTime(prev => {
        if (prev >= maxTime) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 4000); // 1 tick = 1 simulated minute
    return () => clearInterval(interval);
  }, [maxTime]);

  if (!sessionData) return null;

  const activeTasks = schedule.filter(t => t.start <= currentTime && currentTime < t.end);
  const upcomingTasks = schedule.filter(t => t.start > currentTime).sort((a, b) => a.start - b.start).slice(0, 4);
  const completedTasks = schedule.filter(t => t.end <= currentTime);

  const formatTaskName = (name) => name.replace(/_/g, ' ').toUpperCase();

  return (
    <div className="live-cooking pb-10">
      <div className="live-header">
        <h1>Live Kitchen Dashboard</h1>
        <div className="progress-section">
          <div className="time-giant">{currentTime} : {maxTime}</div>
          <div className="progress-bar-bg">
            <div 
              className="progress-bar-fill" 
              style={{ width: `${(currentTime / maxTime) * 100}%` }}
            />
          </div>
          <p className="completion-stats">{completedTasks.length} / {schedule.length} tasks completed</p>
        </div>
      </div>

      <div className="live-grid">
        <div className="active-zone">
          <h2 className="zone-title">🔥 COOKING RIGHT NOW 🔥</h2>
          {activeTasks.length === 0 ? (
            <div className="empty-state">No tasks active currently! Prepare for the next step.</div>
          ) : (
            <div className="task-cards animate-pulse-slow">
              {activeTasks.map(t => {
                const remaining = t.end - currentTime;
                const total = t.duration;
                const percent = Math.min(((total - remaining) / total) * 100, 100);

                return (
                  <div key={t.taskId} className="live-card active-card">
                    <div className="live-card-header">
                      <h3>{formatTaskName(t.taskName)}</h3>
                      <span className="chef-badge">🧑‍🍳 {t.chef}</span>
                    </div>
                    <div className="card-recipe">{t.recipe}</div>
                    <div className="card-time-left">{remaining} min remaining</div>
                    <div className="mini-progress">
                       <div className="mini-progress-fill" style={{ width: `${percent}%` }} />
                    </div>
                    <div className="resource-tag px-2 py-1 text-xs mt-2 bg-red-100 text-red-800 rounded-lg uppercase tracking-wide float-right">
                       {t.resource}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="upcoming-zone">
          <h2 className="zone-title">⏱️ UP NEXT</h2>
          {upcomingTasks.length === 0 ? (
            <div className="empty-state">All tasks scheduled! Finish what you have.</div>
          ) : (
            <div className="task-cards">
              {upcomingTasks.map(t => (
                <div key={t.taskId} className="live-card upcoming-card">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-700">{formatTaskName(t.taskName)}</h3>
                    <span className="text-sm font-bold text-slate-500">In {t.start - currentTime}m</span>
                  </div>
                  <div className="mt-2 text-sm text-slate-600 block">Chef: {t.chef} | {t.resource}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LiveCooking;
