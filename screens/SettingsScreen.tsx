
import React, { useState } from 'react';
import { 
  User, 
  Target, 
  Bell, 
  Moon, 
  LogOut, 
  ChevronRight, 
  Save,
  Loader2,
  CreditCard
} from 'lucide-react';

/**
 * SettingsScreen
 * 
 * Purpose:
 * - Manage User Profile (Name, Email).
 * - Set Learning Goals (HSK Level, Daily Targets).
 * - App Preferences (Theme, Notifications).
 * 
 * Note: 
 * Backend integration for user settings is simulated here 
 * as `api.users` was not defined in previous phases.
 */
export const SettingsScreen = () => {
  // --- State ---
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  
  // Form State
  const [profile, setProfile] = useState({
    name: "Alex Chen",
    email: "alex@example.com",
    targetLevel: "HSK 4",
    dailyGoal: 10,
    notifications: true,
    darkMode: false,
  });

  // --- Handlers ---

  const handleSave = () => {
    setLoading(true);
    setSuccessMsg("");

    // Simulate Backend Update
    setTimeout(() => {
      setLoading(false);
      setSuccessMsg("Settings saved successfully.");
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMsg(""), 3000);
    }, 1000);
  };

  const handleChange = (field: string, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  // --- Render ---
  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto animate-fade-in pb-24">
      
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Settings</h1>
        <p className="text-slate-500">Manage your learning preferences and account.</p>
      </header>

      <div className="space-y-6">

        {/* --- Profile Section --- */}
        <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xl">
              AC
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">{profile.name}</h2>
              <p className="text-slate-500 text-sm">{profile.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Display Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    value={profile.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Email Address</label>
                <div className="relative">
                  <div className="absolute left-3 top-3 text-slate-400 pointer-events-none">@</div>
                  <input 
                    type="email" 
                    value={profile.email}
                    disabled
                    className="w-full pl-10 pr-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- Learning Goals --- */}
        <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Target className="text-indigo-500" size={20} />
            Learning Goals
          </h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Target HSK Level
              </label>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {["HSK 1", "HSK 2", "HSK 3", "HSK 4", "HSK 5", "HSK 6"].map((level) => (
                  <button
                    key={level}
                    onClick={() => handleChange('targetLevel', level)}
                    className={`
                      px-2 py-2 rounded-lg text-sm font-bold border transition-all
                      ${profile.targetLevel === level 
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-105' 
                        : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                      }
                    `}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-2">
                This helps AI generate appropriate example sentences.
              </p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-slate-700">Daily Sentence Goal</label>
                <span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-1 rounded text-xs">
                  {profile.dailyGoal} Sentences
                </span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="50" 
                value={profile.dailyGoal} 
                onChange={(e) => handleChange('dailyGoal', parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
          </div>
        </section>

        {/* --- Preferences --- */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                <Bell size={20} />
              </div>
              <div>
                <p className="font-medium text-slate-700">Daily Reminders</p>
                <p className="text-xs text-slate-400">Receive notifications to practice</p>
              </div>
            </div>
            <Toggle 
              checked={profile.notifications} 
              onChange={() => handleChange('notifications', !profile.notifications)} 
            />
          </div>

          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-800 text-white rounded-lg">
                <Moon size={20} />
              </div>
              <div>
                <p className="font-medium text-slate-700">Dark Mode</p>
                <p className="text-xs text-slate-400">Easier on the eyes at night</p>
              </div>
            </div>
            <Toggle 
              checked={profile.darkMode} 
              onChange={() => handleChange('darkMode', !profile.darkMode)} 
            />
          </div>

          <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <CreditCard size={20} />
              </div>
              <div>
                <p className="font-medium text-slate-700">Subscription</p>
                <p className="text-xs text-slate-400">Manage billing and plans</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-300" />
          </div>
        </section>

        {/* --- Action Buttons --- */}
        <div className="flex flex-col gap-4">
          <button 
            onClick={handleSave}
            disabled={loading}
            className="flex items-center justify-center space-x-2 bg-slate-900 text-white py-4 rounded-xl font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 active:scale-95 transition-all"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            <span>{loading ? "Saving Changes..." : "Save Settings"}</span>
          </button>
          
          <button className="flex items-center justify-center space-x-2 text-red-500 py-3 font-medium hover:bg-red-50 rounded-xl transition-colors">
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Success Toast */}
        {successMsg && (
          <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-full shadow-xl flex items-center space-x-2 animate-slide-up z-50">
            <div className="w-2 h-2 bg-green-400 rounded-full" />
            <span className="text-sm font-medium">{successMsg}</span>
          </div>
        )}

      </div>
    </div>
  );
};

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
  <button 
    onClick={onChange}
    className={`
      w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out
      ${checked ? 'bg-indigo-600' : 'bg-slate-200'}
    `}
  >
    <div 
      className={`
        bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200
        ${checked ? 'translate-x-6' : 'translate-x-0'}
      `} 
    />
  </button>
);
