import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  CheckCircle2, Circle, Clock, Calendar, Plus, Trash2, Edit3, Tag,
  AlertCircle, Search, Moon, Sun, Sparkles, PieChart,
  LayoutList, Volume2, X, Flag, ArrowUpDown, BellRing,
  Layers, CheckSquare, ListPlus, LogIn, LogOut, User, Lock, UserPlus
} from 'lucide-react';

const CATEGORIES = [
  { id: 'work', name: 'Công việc', color: 'bg-blue-500', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
  { id: 'personal', name: 'Cá nhân', color: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
  { id: 'study', name: 'Học tập', color: 'bg-purple-500', badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' },
  { id: 'health', name: 'Sức khỏe', color: 'bg-rose-500', badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300' },
  { id: 'finance', name: 'Tài chính', color: 'bg-amber-500', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
];

const PRIORITIES = [
  { id: 'urgent', name: 'Khẩn cấp', color: 'border-red-500 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30' },
  { id: 'high', name: 'Cao', color: 'border-orange-500 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30' },
  { id: 'medium', name: 'Trung bình', color: 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30' },
  { id: 'low', name: 'Thấp', color: 'border-slate-400 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/30' },
];

const REMINDER_OPTIONS = [
  { value: 0, label: 'Đúng thời điểm' },
  { value: 15, label: 'Trước 15 phút' },
  { value: 30, label: 'Trước 30 phút' },
  { value: 60, label: 'Trước 1 giờ' },
  { value: 1440, label: 'Trước 1 ngày' },
];

const INITIAL_TASKS = [
  {
    id: '1',
    title: 'Họp đánh giá kế hoạch dự án Q3',
    description: 'Chuẩn bị slide báo cáo tiến độ và thảo luận với nhóm phát triển.',
    category: 'work',
    priority: 'urgent',
    dueDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    dueTime: '14:30',
    reminderOffset: 30,
    completed: false,
    createdAt: new Date().toISOString(),
    subtasks: [
      { id: 's1', title: 'Hoàn thiện bản phác thảo Slide', completed: true },
      { id: 's2', title: 'Tổng hợp số liệu từ các thành viên', completed: false }
    ]
  }
];

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    return localStorage.getItem('taskmaster_logged_user') || null;
  });
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Tasks State (tự động tải theo User đang đăng nhập)
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (currentUser) {
      const saved = localStorage.getItem(`taskmaster_tasks_${currentUser}`);
      setTasks(saved ? JSON.parse(saved) : INITIAL_TASKS);
    } else {
      setTasks([]);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`taskmaster_tasks_${currentUser}`, JSON.stringify(tasks));
    }
  }, [tasks, currentUser]);

  // App Theme State
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('taskmaster_theme') === 'dark');

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('taskmaster_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('taskmaster_theme', 'light');
    }
  }, [darkMode]);

  // View & Filter States
  const [activeTab, setActiveTab] = useState('tasks');
  const [filter, setFilter] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('dueDate');

  // Modal & Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCategory, setFormCategory] = useState('work');
  const [formPriority, setFormPriority] = useState('medium');
  const [formDueDate, setFormDueDate] = useState(new Date().toISOString().slice(0, 10));
  const [formDueTime, setFormDueTime] = useState('09:00');
  const [formReminder, setFormReminder] = useState(15);
  const [formSubtasks, setFormSubtasks] = useState([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  // Toast / Alert Notification State
  const [activeAlert, setActiveAlert] = useState(null);

  // Audio trigger
  const playNotificationSound = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch (e) {
      console.log('Audio not supported or blocked');
    }
  }, []);

  // Reminder interval
  useEffect(() => {
    if (!currentUser) return;
    const interval = setInterval(() => {
      const now = new Date();
      tasks.forEach((t) => {
        if (t.completed) return;
        const taskDateTime = new Date(`${t.dueDate}T${t.dueTime}:00`);
        const reminderTime = new Date(taskDateTime.getTime() - t.reminderOffset * 60000);

        const diffSecs = Math.floor((now.getTime() - reminderTime.getTime()) / 1000);
        if (diffSecs >= 0 && diffSecs < 30 && !t.notified) {
          playNotificationSound();
          setActiveAlert({ title: t.title, time: `${t.dueDate} ${t.dueTime}` });
          setTasks(prev => prev.map(item => item.id === t.id ? { ...item, notified: true } : item));
        }
      });
    }, 15000);
    return () => clearInterval(interval);
  }, [tasks, currentUser, playNotificationSound]);

  // Auth Handlers
  const handleAuth = (e) => {
    e.preventDefault();
    setAuthError('');
    if (!authUsername.trim() || !authPassword.trim()) {
      setAuthError('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    const users = JSON.parse(localStorage.getItem('taskmaster_users_db') || '{}');

    if (authMode === 'register') {
      if (users[authUsername]) {
        setAuthError('Tên tài khoản đã tồn tại!');
        return;
      }
      users[authUsername] = authPassword;
      localStorage.setItem('taskmaster_users_db', JSON.stringify(users));
      localStorage.setItem('taskmaster_logged_user', authUsername);
      setCurrentUser(authUsername);
    } else {
      if (!users[authUsername] || users[authUsername] !== authPassword) {
        setAuthError('Mật khẩu hoặc tên tài khoản không chính xác!');
        return;
      }
      localStorage.setItem('taskmaster_logged_user', authUsername);
      setCurrentUser(authUsername);
    }

    setAuthUsername('');
    setAuthPassword('');
  };

  const handleLogout = () => {
    localStorage.removeItem('taskmaster_logged_user');
    setCurrentUser(null);
  };

  // Form Handlers
  const resetForm = () => {
    setFormTitle('');
    setFormDesc('');
    setFormCategory('work');
    setFormPriority('medium');
    setFormDueDate(new Date().toISOString().slice(0, 10));
    setFormDueTime('09:00');
    setFormReminder(15);
    setFormSubtasks([]);
    setNewSubtaskTitle('');
    setEditingTask(null);
  };

  const openCreateModal = () => { resetForm(); setIsModalOpen(true); };

  const openEditModal = (task) => {
    setEditingTask(task);
    setFormTitle(task.title);
    setFormDesc(task.description || '');
    setFormCategory(task.category);
    setFormPriority(task.priority);
    setFormDueDate(task.dueDate);
    setFormDueTime(task.dueTime);
    setFormReminder(task.reminderOffset || 0);
    setFormSubtasks(task.subtasks || []);
    setIsModalOpen(true);
  };

  const handleSaveTask = (e) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingTask) {
      setTasks(prev => prev.map(t => t.id === editingTask.id ? {
        ...t,
        title: formTitle,
        description: formDesc,
        category: formCategory,
        priority: formPriority,
        dueDate: formDueDate,
        dueTime: formDueTime,
        reminderOffset: Number(formReminder),
        subtasks: formSubtasks,
        notified: false
      } : t));
    } else {
      const newTask = {
        id: Date.now().toString(),
        title: formTitle,
        description: formDesc,
        category: formCategory,
        priority: formPriority,
        dueDate: formDueDate,
        dueTime: formDueTime,
        reminderOffset: Number(formReminder),
        completed: false,
        createdAt: new Date().toISOString(),
        subtasks: formSubtasks,
        notified: false
      };
      setTasks(prev => [newTask, ...prev]);
    }
    setIsModalOpen(false);
    resetForm();
  };

  const toggleTaskCompletion = (id) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const nextState = !t.completed;
        return {
          ...t,
          completed: nextState,
          subtasks: (t.subtasks || []).map(s => ({ ...s, completed: nextState }))
        };
      }
      return t;
    }));
  };

  const toggleSubtask = (taskId, subtaskId) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const updatedSubtasks = (t.subtasks || []).map(s => s.id === subtaskId ? { ...s, completed: !s.completed } : s);
        const allDone = updatedSubtasks.length > 0 && updatedSubtasks.every(s => s.completed);
        return {
          ...t,
          subtasks: updatedSubtasks,
          completed: allDone ? true : t.completed
        };
      }
      return t;
    }));
  };

  const deleteTask = (id) => setTasks(prev => prev.filter(t => t.id !== id));

  const addSubtaskToForm = () => {
    if (!newSubtaskTitle.trim()) return;
    setFormSubtasks(prev => [...prev, { id: Date.now().toString(), title: newSubtaskTitle.trim(), completed: false }]);
    setNewSubtaskTitle('');
  };

  const removeSubtaskFromForm = (subId) => {
    setFormSubtasks(prev => prev.filter(s => s.id !== subId));
  };

  const todayStr = new Date().toISOString().slice(0, 10);

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (filter === 'today' && t.dueDate !== todayStr) return false;
      if (filter === 'upcoming' && (t.dueDate <= todayStr || t.completed)) return false;
      if (filter === 'overdue' && (t.dueDate >= todayStr || t.completed)) return false;
      if (filter === 'completed' && !t.completed) return false;

      if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
      if (selectedPriority !== 'all' && t.priority !== selectedPriority) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        if (!t.title.toLowerCase().includes(query) && !(t.description || '').toLowerCase().includes(query)) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'dueDate') return new Date(`${a.dueDate}T${a.dueTime}`) - new Date(`${b.dueDate}T${b.dueTime}`);
      if (sortBy === 'priority') {
        const pMap = { urgent: 4, high: 3, medium: 2, low: 1 };
        return pMap[b.priority] - pMap[a.priority];
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [tasks, filter, selectedCategory, selectedPriority, searchQuery, sortBy, todayStr]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const overdue = tasks.filter(t => !t.completed && t.dueDate < todayStr).length;
    const todayCount = tasks.filter(t => t.dueDate === todayStr && !t.completed).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, pending, overdue, todayCount, completionRate };
  }, [tasks, todayStr]);

  // UNAUTHENTICATED: LOGIN / REGISTER VIEW
  if (!currentUser) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 transition-colors ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-800'}`}>
        <div className={`w-full max-w-md p-8 rounded-3xl border shadow-xl ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 mx-auto flex items-center justify-center text-white shadow-lg mb-3">
              <CheckSquare className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold">TaskMaster</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Đăng nhập để quản lý công việc cá nhân</p>
          </div>

          {authError && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-medium text-center">
              {authError}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Tên tài khoản</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Nhập username..."
                  value={authUsername}
                  onChange={(e) => setAuthUsername(e.target.value)}
                  className={`w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border outline-none ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Mật khẩu</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="Nhập mật khẩu..."
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className={`w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border outline-none ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              {authMode === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
              {authMode === 'login' ? 'Đăng nhập' : 'Đăng ký ngay'}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            {authMode === 'login' ? (
              <p>Chưa có tài khoản? <button onClick={() => { setAuthMode('register'); setAuthError(''); }} className="text-blue-500 font-semibold hover:underline">Đăng ký mới</button></p>
            ) : (
              <p>Đã có tài khoản? <button onClick={() => { setAuthMode('login'); setAuthError(''); }} className="text-blue-500 font-semibold hover:underline">Đăng nhập</button></p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // AUTHENTICATED MAIN APPLICATION
  return (
    <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      
      {/* Toast Alert Pop-up */}
      {activeAlert && (
        <div className="fixed top-5 right-5 z-50 max-w-sm w-full bg-amber-500 text-white shadow-2xl rounded-2xl p-4 flex items-start gap-3 border border-amber-400 animate-bounce">
          <BellRing className="w-6 h-6 shrink-0 mt-0.5 animate-pulse" />
          <div className="flex-1">
            <p className="font-bold text-sm">LỜI NHẮC CÔNG VIỆC!</p>
            <p className="text-sm font-medium">{activeAlert.title}</p>
            <p className="text-xs text-amber-100 mt-1">Hạn làm: {activeAlert.time}</p>
          </div>
          <button onClick={() => setActiveAlert(null)} className="p-1 hover:bg-amber-600 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Header */}
      <header className={`sticky top-0 z-30 border-b backdrop-blur-md ${darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg">
              <CheckSquare className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                TaskMaster
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">Xin chào, {currentUser}</p>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-md mx-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-9 pr-4 py-2 text-sm rounded-xl border outline-none ${
                  darkMode ? 'bg-slate-800/80 border-slate-700 text-slate-100' : 'bg-slate-100/80 border-slate-200'
                }`}
              />
            </div>
          </div>

          {/* Controls & Logout */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-xl border ${darkMode ? 'border-slate-800 bg-slate-900 text-yellow-400' : 'border-slate-200 bg-white text-slate-600'}`}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={openCreateModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Tạo việc mới</span>
            </button>

            <button
              onClick={handleLogout}
              title="Đăng xuất"
              className="p-2 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* Main Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between mb-6 border-b border-slate-200 dark:border-slate-800 pb-2">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`flex items-center gap-2 pb-2 text-sm font-semibold border-b-2 ${
                activeTab === 'tasks' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500'
              }`}
            >
              <LayoutList className="w-4 h-4" />
              Danh sách ({stats.pending})
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 pb-2 text-sm font-semibold border-b-2 ${
                activeTab === 'analytics' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500'
              }`}
            >
              <PieChart className="w-4 h-4" />
              Thống kê & Tiến độ
            </button>
          </div>
        </div>

        {/* TAB 1: TASKS LIST VIEW */}
        {activeTab === 'tasks' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Left Sidebar Filters */}
            <div className="space-y-6">
              <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">Trạng thái</h3>
                <nav className="space-y-1">
                  {[
                    { id: 'all', label: 'Tất cả công việc', count: stats.total, icon: Layers },
                    { id: 'today', label: 'Hôm nay', count: stats.todayCount, icon: Calendar, highlight: 'text-blue-500' },
                    { id: 'upcoming', label: 'Sắp tới', icon: Clock },
                    { id: 'overdue', label: 'Quá hạn', count: stats.overdue, icon: AlertCircle, highlight: 'text-red-500' },
                    { id: 'completed', label: 'Đã hoàn thành', count: stats.completed, icon: CheckCircle2, highlight: 'text-emerald-500' },
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => setFilter(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-xl ${
                        filter === item.id ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <item.icon className={`w-4 h-4 ${item.highlight || ''}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.count !== undefined && <span className="text-xs font-semibold">{item.count}</span>}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Right Task List */}
            <div className="lg:col-span-3 space-y-4">
              <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  Hiển thị: <strong>{filteredTasks.length}</strong> công việc
                </span>
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-slate-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className={`text-xs rounded-lg px-2.5 py-1.5 border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
                  >
                    <option value="dueDate">Thời hạn</option>
                    <option value="priority">Độ ưu tiên</option>
                    <option value="createdAt">Ngày tạo</option>
                  </select>
                </div>
              </div>

              {filteredTasks.length === 0 ? (
                <div className={`p-12 text-center rounded-2xl border ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-base font-semibold">Không tìm thấy công việc nào</h3>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTasks.map((task) => {
                    const categoryObj = CATEGORIES.find(c => c.id === task.category) || CATEGORIES[0];
                    const priorityObj = PRIORITIES.find(p => p.id === task.priority) || PRIORITIES[2];

                    return (
                      <div
                        key={task.id}
                        className={`p-4 rounded-2xl border ${
                          task.completed
                            ? 'opacity-60 bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <div className="flex items-start gap-3.5">
                          <button onClick={() => toggleTaskCompletion(task.id)} className="mt-1">
                            {task.completed ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : <Circle className="w-6 h-6 text-slate-300" />}
                          </button>

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className={`font-semibold ${task.completed ? 'line-through text-slate-400' : ''}`}>{task.title}</h3>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${categoryObj.badge}`}>{categoryObj.name}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-lg border ${priorityObj.color}`}>{priorityObj.name}</span>
                            </div>

                            {task.description && <p className="text-sm text-slate-500 mb-2">{task.description}</p>}

                            {/* Subtasks */}
                            {task.subtasks && task.subtasks.length > 0 && (
                              <div className="my-2 pl-3 border-l-2 border-slate-200 dark:border-slate-800 space-y-1">
                                {task.subtasks.map(s => (
                                  <div key={s.id} className="flex items-center gap-2 text-xs">
                                    <button onClick={() => toggleSubtask(task.id, s.id)}>
                                      {s.completed ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Circle className="w-3.5 h-3.5 text-slate-400" />}
                                    </button>
                                    <span className={s.completed ? 'line-through text-slate-400' : ''}>{s.title}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
                              <span><Calendar className="w-3.5 h-3.5 inline mr-1" />{task.dueDate} {task.dueTime}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <button onClick={() => openEditModal(task)} className="p-1.5 hover:text-blue-500"><Edit3 className="w-4 h-4" /></button>
                            <button onClick={() => deleteTask(task.id)} className="p-1.5 hover:text-rose-500"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: ANALYTICS VIEW */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <p className="text-xs font-semibold text-slate-400 uppercase">Tổng số công việc</p>
              <p className="text-3xl font-bold mt-2">{stats.total}</p>
            </div>
            <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <p className="text-xs font-semibold text-emerald-500 uppercase">Tỷ lệ hoàn thành</p>
              <p className="text-3xl font-bold mt-2 text-emerald-500">{stats.completionRate}%</p>
            </div>
            <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <p className="text-xs font-semibold text-blue-500 uppercase">Đang chờ xử lý</p>
              <p className="text-3xl font-bold mt-2 text-blue-500">{stats.pending}</p>
            </div>
            <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <p className="text-xs font-semibold text-rose-500 uppercase">Công việc quá hạn</p>
              <p className="text-3xl font-bold mt-2 text-rose-500">{stats.overdue}</p>
            </div>
          </div>
        )}

      </main>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-lg rounded-2xl p-6 shadow-2xl border max-h-[90vh] overflow-y-auto ${
            darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
              <h2 className="text-lg font-bold">{editingTask ? 'Chỉnh sửa' : 'Tạo mới'}</h2>
              <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSaveTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Tên công việc *</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className={`w-full px-3.5 py-2 text-sm rounded-xl border outline-none ${
                    darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Mô tả chi tiết</label>
                <textarea
                  rows={2}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className={`w-full px-3.5 py-2 text-sm rounded-xl border outline-none ${
                    darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              {/* Subtasks */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Công việc con</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    placeholder="Nhập việc con..."
                    className={`flex-1 px-3 py-1.5 text-xs rounded-xl border outline-none ${
                      darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                  <button type="button" onClick={addSubtaskToForm} className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 rounded-xl text-xs font-semibold">Thêm</button>
                </div>
                {formSubtasks.map((st) => (
                  <div key={st.id} className="flex items-center justify-between text-xs p-1.5 rounded bg-slate-100 dark:bg-slate-800/50 mb-1">
                    <span>{st.title}</span>
                    <button type="button" onClick={() => removeSubtaskFromForm(st.id)} className="text-red-400"><X className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Danh mục</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className={`w-full px-3 py-2 text-sm rounded-xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                  >
                    {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Độ ưu tiên</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value)}
                    className={`w-full px-3 py-2 text-sm rounded-xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                  >
                    {PRIORITIES.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Ngày hết hạn</label>
                  <input
                    type="date"
                    required
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className={`w-full px-3 py-2 text-sm rounded-xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Giờ hết hạn</label>
                  <input
                    type="time"
                    required
                    value={formDueTime}
                    onChange={(e) => setFormDueTime(e.target.value)}
                    className={`w-full px-3 py-2 text-sm rounded-xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-slate-500">Hủy</button>
                <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-xl font-medium">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}