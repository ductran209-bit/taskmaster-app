import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  CheckCircle2, Circle, Clock, Calendar, Plus, Trash2, Edit3, Tag,
  AlertCircle, Search, Filter, Moon, Sun, Check, Sparkles, PieChart,
  LayoutList, ChevronRight, Volume2, X, Flag, ArrowUpDown, BellRing,
  Layers, CheckSquare, RotateCcw, ListPlus, ShieldAlert
} from 'lucide-react';

const CATEGORIES = [
  { id: 'work', name: 'Công việc', color: 'bg-blue-500', text: 'text-blue-500', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
  { id: 'personal', name: 'Cá nhân', color: 'bg-emerald-500', text: 'text-emerald-500', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
  { id: 'study', name: 'Học tập', color: 'bg-purple-500', text: 'text-purple-500', badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' },
  { id: 'health', name: 'Sức khỏe', color: 'bg-rose-500', text: 'text-rose-500', badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300' },
  { id: 'finance', name: 'Tài chính', color: 'bg-amber-500', text: 'text-amber-500', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
];

const PRIORITIES = [
  { id: 'urgent', name: 'Khẩn cấp', color: 'border-red-500 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30', level: 4 },
  { id: 'high', name: 'Cao', color: 'border-orange-500 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30', level: 3 },
  { id: 'medium', name: 'Trung bình', color: 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30', level: 2 },
  { id: 'low', name: 'Thấp', color: 'border-slate-400 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/30', level: 1 },
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
    description: 'Chuẩn bị slide báo cáo tiến độ và thảo luận với nhóm phát triển ứng dụng.',
    category: 'work',
    priority: 'urgent',
    dueDate: new Date(Date.now() + 86400000 * 1).toISOString().slice(0, 10),
    dueTime: '14:30',
    reminderOffset: 30,
    completed: false,
    createdAt: new Date().toISOString(),
    subtasks: [
      { id: 's1', title: 'Hoàn thiện bản phác thảo Slide', completed: true },
      { id: 's2', title: 'Tổng hợp số liệu từ các thành viên', completed: false }
    ]
  },
  {
    id: '2',
    title: 'Tập thể dục & Chạy bộ 5km',
    description: 'Duy trì thói quen luyện tập sức khỏe hàng ngày tại công viên.',
    category: 'health',
    priority: 'medium',
    dueDate: new Date().toISOString().slice(0, 10),
    dueTime: '18:00',
    reminderOffset: 15,
    completed: false,
    createdAt: new Date().toISOString(),
    subtasks: []
  },
  {
    id: '3',
    title: 'Đọc 2 chương sách Thiết kế Hệ thống',
    description: 'Ghi chú lại các mô hình kiến trúc Microservices.',
    category: 'study',
    priority: 'low',
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10),
    dueTime: '21:00',
    reminderOffset: 0,
    completed: true,
    createdAt: new Date().toISOString(),
    subtasks: []
  }
];

export default function App() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('taskmaster_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('taskmaster_theme') === 'dark';
  });

  const [activeTab, setActiveTab] = useState('tasks'); // 'tasks', 'analytics'
  const [filter, setFilter] = useState('all'); // 'all', 'today', 'upcoming', 'overdue', 'completed'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('dueDate'); // 'dueDate', 'priority', 'createdAt'

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCategory, setFormCategory] = useState('work');
  const [formPriority, setFormPriority] = useState('medium');
  const [formDueDate, setFormDueDate] = useState(new Date().toISOString().slice(0, 10));
  const [formDueTime, setFormDueTime] = useState('09:00');
  const [formReminder, setFormReminder] = useState(15);
  const [formSubtasks, setFormSubtasks] = useState([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  // Toast / Notification Popup State
  const [activeAlert, setActiveAlert] = useState(null);

  useEffect(() => {
    localStorage.setItem('taskmaster_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('taskmaster_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('taskmaster_theme', 'light');
    }
  }, [darkMode]);

  // Audio trigger for reminder test / trigger
  const playNotificationSound = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch (e) {
      console.log('Audio playback not supported or blocked');
    }
  }, []);

  // Check reminders periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      tasks.forEach((t) => {
        if (t.completed) return;
        const taskDateTime = new Date(`${t.dueDate}T${t.dueTime}:00`);
        const reminderTime = new Date(taskDateTime.getTime() - t.reminderOffset * 60000);

        // If reminder falls within current minute window and not already notified
        const diffSecs = Math.floor((now.getTime() - reminderTime.getTime()) / 1000);
        if (diffSecs >= 0 && diffSecs < 30 && !t.notified) {
          playNotificationSound();
          setActiveAlert({
            title: t.title,
            time: `${t.dueDate} ${t.dueTime}`,
            category: t.category
          });
          // Mark task as notified in state
          setTasks(prev => prev.map(item => item.id === t.id ? { ...item, notified: true } : item));
        }
      });
    }, 15000);

    return () => clearInterval(interval);
  }, [tasks, playNotificationSound]);

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

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

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
        notified: false // reset notification trigger on edit
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
          // If task completed, mark subtasks done too
          subtasks: t.subtasks.map(s => ({ ...s, completed: nextState }))
        };
      }
      return t;
    }));
  };

  const toggleSubtask = (taskId, subtaskId) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const updatedSubtasks = t.subtasks.map(s => s.id === subtaskId ? { ...s, completed: !s.completed } : s);
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

  const deleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

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
      // Status Filter
      if (filter === 'today' && t.dueDate !== todayStr) return false;
      if (filter === 'upcoming' && (t.dueDate <= todayStr || t.completed)) return false;
      if (filter === 'overdue' && (t.dueDate >= todayStr || t.completed)) return false;
      if (filter === 'completed' && !t.completed) return false;

      // Category Filter
      if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;

      // Priority Filter
      if (selectedPriority !== 'all' && t.priority !== selectedPriority) return false;

      // Search Filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(query);
        const matchesDesc = (t.description || '').toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'dueDate') {
        return new Date(`${a.dueDate}T${a.dueTime}`) - new Date(`${b.dueDate}T${b.dueTime}`);
      }
      if (sortBy === 'priority') {
        const pMap = { urgent: 4, high: 3, medium: 2, low: 1 };
        return pMap[b.priority] - pMap[a.priority];
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [tasks, filter, selectedCategory, selectedPriority, searchQuery, sortBy, todayStr]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const overdue = tasks.filter(t => !t.completed && t.dueDate < todayStr).length;
    const todayCount = tasks.filter(t => t.dueDate === todayStr && !t.completed).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, pending, overdue, todayCount, completionRate };
  }, [tasks, todayStr]);

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
          <button 
            onClick={() => setActiveAlert(null)}
            className="p-1 hover:bg-amber-600 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Layout Header */}
      <header className={`sticky top-0 z-30 border-b backdrop-blur-md ${darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <CheckSquare className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                TaskMaster
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">Quản lý & Nhắc nhở tiến độ</p>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-md mx-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm công việc..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-9 pr-4 py-2 text-sm rounded-xl border outline-none transition-all ${
                  darkMode 
                    ? 'bg-slate-800/80 border-slate-700 text-slate-100 focus:border-blue-500' 
                    : 'bg-slate-100/80 border-slate-200 text-slate-900 focus:border-blue-500'
                }`}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                playNotificationSound();
                setActiveAlert({
                  title: 'Thử nghiệm âm thanh nhắc nhở!',
                  time: 'Ngay bây giờ',
                  category: 'system'
                });
              }}
              title="Thử âm thanh thông báo"
              className={`p-2 rounded-xl border transition-all ${
                darkMode ? 'border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300' : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-600'
              }`}
            >
              <Volume2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-xl border transition-all ${
                darkMode ? 'border-slate-800 bg-slate-900 hover:bg-slate-800 text-yellow-400' : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-600'
              }`}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={openCreateModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-md shadow-blue-500/20 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Tạo việc mới</span>
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
              className={`flex items-center gap-2 pb-2 text-sm font-semibold transition-all border-b-2 ${
                activeTab === 'tasks'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <LayoutList className="w-4 h-4" />
              Danh sách công việc ({stats.pending})
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 pb-2 text-sm font-semibold transition-all border-b-2 ${
                activeTab === 'analytics'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <PieChart className="w-4 h-4" />
              Thống kê & Tiến độ
            </button>
          </div>

          {/* Quick Stats overview pill */}
          <div className="hidden md:flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span>Hoàn thành: <strong className="text-emerald-600 dark:text-emerald-400">{stats.completed}/{stats.total}</strong> ({stats.completionRate}%)</span>
            {stats.overdue > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400 font-medium">
                {stats.overdue} Quá hạn
              </span>
            )}
          </div>
        </div>

        {/* TAB 1: TASKS LIST VIEW */}
        {activeTab === 'tasks' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Left Sidebar Filters */}
            <div className="space-y-6">
              
              {/* Quick Status Filters */}
              <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Lọc trạng thái</h3>
                <nav className="space-y-1">
                  {[
                    { id: 'all', label: 'Tất cả công việc', count: stats.total, icon: Layers },
                    { id: 'today', label: 'Hôm nay', count: stats.todayCount, icon: Calendar, highlight: 'text-blue-500' },
                    { id: 'upcoming', label: 'Sắp tới', icon: Clock },
                    { id: 'overdue', label: 'Quá hạn', count: stats.overdue, icon: AlertCircle, highlight: 'text-red-500' },
                    { id: 'completed', label: 'Đã hoàn thành', count: stats.completed, icon: CheckCircle2, highlight: 'text-emerald-500' },
                  ].map(item => {
                    const Icon = item.icon;
                    const isActive = filter === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setFilter(item.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-xl transition-all ${
                          isActive 
                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium' 
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={`w-4 h-4 ${item.highlight || ''}`} />
                          <span>{item.label}</span>
                        </div>
                        {item.count !== undefined && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${isActive ? 'bg-blue-200 dark:bg-blue-800/50' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                            {item.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Categories Filter */}
              <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Danh mục</h3>
                  {selectedCategory !== 'all' && (
                    <button onClick={() => setSelectedCategory('all')} className="text-xs text-blue-500 hover:underline">Đặt lại</button>
                  )}
                </div>
                <div className="space-y-1">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-xl transition-all ${
                      selectedCategory === 'all'
                        ? 'bg-slate-200 dark:bg-slate-800 font-medium'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Tag className="w-3.5 h-3.5" />
                    <span>Tất cả danh mục</span>
                  </button>
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-xl transition-all ${
                        selectedCategory === cat.id
                          ? 'bg-slate-200 dark:bg-slate-800 font-medium'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${cat.color}`}></span>
                        <span>{cat.name}</span>
                      </div>
                      <span className="text-xs text-slate-400">
                        {tasks.filter(t => t.category === cat.id).length}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority Filter */}
              <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Độ ưu tiên</h3>
                  {selectedPriority !== 'all' && (
                    <button onClick={() => setSelectedPriority('all')} className="text-xs text-blue-500 hover:underline">Đặt lại</button>
                  )}
                </div>
                <div className="space-y-1">
                  <button
                    onClick={() => setSelectedPriority('all')}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm rounded-xl transition-all ${
                      selectedPriority === 'all' ? 'bg-slate-200 dark:bg-slate-800 font-medium' : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Flag className="w-3.5 h-3.5" />
                    <span>Tất cả mức độ</span>
                  </button>
                  {PRIORITIES.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPriority(p.id)}
                      className={`w-full flex items-center justify-between px-3 py-1.5 text-sm rounded-xl transition-all ${
                        selectedPriority === p.id ? 'bg-slate-200 dark:bg-slate-800 font-medium' : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Flag className={`w-3.5 h-3.5 ${p.color.split(' ')[1]}`} />
                        <span>{p.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Main Task List */}
            <div className="lg:col-span-3 space-y-4">
              
              {/* Sorting Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-100 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                <div className="text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center gap-2">
                  <span>Hiển thị: <strong>{filteredTasks.length}</strong> công việc</span>
                </div>

                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-slate-400" />
                  <span className="text-xs text-slate-500">Sắp xếp:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className={`text-xs rounded-lg px-2.5 py-1.5 border outline-none font-medium ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    <option value="dueDate">Thời hạn (Gần nhất)</option>
                    <option value="priority">Độ ưu tiên (Mạnh nhất)</option>
                    <option value="createdAt">Mới tạo nhất</option>
                  </select>
                </div>
              </div>

              {/* Task Cards Container */}
              {filteredTasks.length === 0 ? (
                <div className={`p-12 text-center rounded-2xl border ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-3 animate-bounce" />
                  <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">Không tìm thấy công việc nào</h3>
                  <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
                    Thử thay đổi bộ lọc hoặc bấm nút bên dưới để thêm công việc mới.
                  </p>
                  <button
                    onClick={openCreateModal}
                    className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Thêm công việc
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTasks.map((task) => {
                    const categoryObj = CATEGORIES.find(c => c.id === task.category) || CATEGORIES[0];
                    const priorityObj = PRIORITIES.find(p => p.id === task.priority) || PRIORITIES[2];
                    const isOverdue = !task.completed && task.dueDate < todayStr;
                    const isToday = task.dueDate === todayStr;

                    const completedSubtaskCount = task.subtasks ? task.subtasks.filter(s => s.completed).length : 0;
                    const totalSubtasks = task.subtasks ? task.subtasks.length : 0;

                    return (
                      <div
                        key={task.id}
                        className={`group relative p-4 rounded-2xl border transition-all duration-200 ${
                          task.completed
                            ? darkMode ? 'bg-slate-900/40 border-slate-800/80 opacity-60' : 'bg-slate-50 border-slate-200/80 opacity-70'
                            : darkMode ? 'bg-slate-900 border-slate-800 hover:border-slate-700 shadow-lg shadow-black/10' : 'bg-white border-slate-200 hover:border-blue-200 shadow-sm'
                        }`}
                      >
                        <div className="flex items-start gap-3.5">
                          
                          {/* Complete Checkbox */}
                          <button
                            onClick={() => toggleTaskCompletion(task.id)}
                            className="mt-1 transition-transform active:scale-90"
                          >
                            {task.completed ? (
                              <CheckCircle2 className="w-6 h-6 text-emerald-500 fill-emerald-100 dark:fill-emerald-950/40" />
                            ) : (
                              <Circle className="w-6 h-6 text-slate-300 dark:text-slate-600 hover:text-blue-500 transition-colors" />
                            )}
                          </button>

                          {/* Task Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                              {/* Title */}
                              <h3 className={`font-semibold text-base leading-snug break-words ${
                                task.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-100'
                              }`}>
                                {task.title}
                              </h3>

                              {/* Category Badge */}
                              <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${categoryObj.badge}`}>
                                {categoryObj.name}
                              </span>

                              {/* Priority Badge */}
                              <span className={`text-xs px-2 py-0.5 rounded-lg border font-medium flex items-center gap-1 ${priorityObj.color}`}>
                                <Flag className="w-3 h-3" />
                                {priorityObj.name}
                              </span>
                            </div>

                            {/* Description */}
                            {task.description && (
                              <p className={`text-sm mb-3 line-clamp-2 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                {task.description}
                              </p>
                            )}

                            {/* Subtasks listing */}
                            {totalSubtasks > 0 && (
                              <div className="mt-3 mb-3 pl-3 border-l-2 border-slate-200 dark:border-slate-800 space-y-1.5">
                                <div className="text-xs font-semibold text-slate-400 flex items-center justify-between max-w-xs">
                                  <span>Công việc con ({completedSubtaskCount}/{totalSubtasks})</span>
                                </div>
                                {task.subtasks.map(s => (
                                  <div 
                                    key={s.id} 
                                    onClick={() => toggleSubtask(task.id, s.id)}
                                    className="flex items-center gap-2 cursor-pointer text-xs group/sub"
                                  >
                                    <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${
                                      s.completed 
                                        ? 'bg-emerald-500 border-emerald-500 text-white' 
                                        : 'border-slate-300 dark:border-slate-600 group-hover/sub:border-blue-500'
                                    }`}>
                                      {s.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                    </div>
                                    <span className={`${s.completed ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                      {s.title}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Footer Information */}
                            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-2">
                              {/* Due Date & Time */}
                              <div className={`flex items-center gap-1.5 font-medium ${
                                isOverdue ? 'text-red-500 font-semibold' : isToday ? 'text-blue-500 font-semibold' : ''
                              }`}>
                                <Calendar className="w-3.5 h-3.5" />
                                <span>{task.dueDate} lúc {task.dueTime}</span>
                                {isOverdue && <span className="bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-300 text-[10px] px-1.5 py-0.2 rounded font-bold">QUÁ HẠN</span>}
                                {isToday && !isOverdue && <span className="bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300 text-[10px] px-1.5 py-0.2 rounded font-bold">HÔM NAY</span>}
                              </div>

                              {/* Reminder settings info */}
                              {task.reminderOffset > 0 && (
                                <div className="flex items-center gap-1 text-slate-400" title={`Nhắc trước ${task.reminderOffset} phút`}>
                                  <BellRing className="w-3.5 h-3.5 text-amber-500" />
                                  <span>Nhắc trước {task.reminderOffset} phút</span>
                                </div>
                              )}
                            </div>

                          </div>

                          {/* Quick Action Buttons */}
                          <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openEditModal(task)}
                              className={`p-1.5 rounded-lg border transition-colors ${
                                darkMode ? 'border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200' : 'border-slate-200 hover:bg-slate-100 text-slate-500'
                              }`}
                              title="Chỉnh sửa"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteTask(task.id)}
                              className="p-1.5 rounded-lg border border-transparent hover:border-red-200 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                              title="Xóa công việc"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
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

        {/* TAB 2: ANALYTICS & DASHBOARD */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            
            {/* Top Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase">Tổng số việc</span>
                  <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                    <Layers className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-3xl font-extrabold mt-3">{stats.total}</p>
                <p className="text-xs text-slate-400 mt-1">Nhiệm vụ đã được khởi tạo</p>
              </div>

              <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase">Tỷ lệ hoàn thành</span>
                  <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-3xl font-extrabold mt-3 text-emerald-600 dark:text-emerald-400">{stats.completionRate}%</p>
                <p className="text-xs text-slate-400 mt-1">{stats.completed} việc đã xong</p>
              </div>

              <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase">Đang chờ xử lý</span>
                  <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-3xl font-extrabold mt-3 text-amber-600 dark:text-amber-400">{stats.pending}</p>
                <p className="text-xs text-slate-400 mt-1">Bao gồm {stats.todayCount} việc hôm nay</p>
              </div>

              <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase">Việc quá hạn</span>
                  <div className="p-2 rounded-xl bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-3xl font-extrabold mt-3 text-red-500">{stats.overdue}</p>
                <p className="text-xs text-slate-400 mt-1">Cần ưu tiên hoàn thành ngay</p>
              </div>
            </div>

            {/* Category Breakdown Progress Bars */}
            <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
              <h3 className="text-base font-bold mb-4">Phân bố công việc theo Danh mục</h3>
              
              <div className="space-y-4">
                {CATEGORIES.map(cat => {
                  const catTasks = tasks.filter(t => t.category === cat.id);
                  const catCompleted = catTasks.filter(t => t.completed).length;
                  const catTotal = catTasks.length;
                  const percent = catTotal > 0 ? Math.round((catCompleted / catTotal) * 100) : 0;

                  return (
                    <div key={cat.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className={`w-3 h-3 rounded-full ${cat.color}`}></span>
                          <span className="font-medium">{cat.name}</span>
                        </div>
                        <span className="text-xs text-slate-500">
                          {catCompleted}/{catTotal} completed ({percent}%)
                        </span>
                      </div>
                      
                      <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${cat.color} transition-all duration-500 rounded-full`}
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

      </main>

      {/* CREATE / EDIT TASK MODAL */}
      {}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className={`w-full max-w-lg rounded-3xl border shadow-2xl p-6 overflow-hidden max-h-[90vh] flex flex-col ${
            darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-500" />
                {editingTask ? 'Chỉnh sửa công việc' : 'Tạo công việc mới'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveTask} className="flex-1 overflow-y-auto space-y-4 py-4 pr-1">
              
              {/* Title Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">
                  Tên công việc <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Chuẩn bị tài liệu họp tuần..."
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-all ${
                    darkMode ? 'bg-slate-800 border-slate-700 focus:border-blue-500' : 'bg-slate-50 border-slate-200 focus:border-blue-500'
                  }`}
                />
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">
                  Ghi chú / Mô tả chi tiết
                </label>
                <textarea
                  rows={2}
                  placeholder="Thêm chi tiết nội dung công việc..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-all ${
                    darkMode ? 'bg-slate-800 border-slate-700 focus:border-blue-500' : 'bg-slate-50 border-slate-200 focus:border-blue-500'
                  }`}
                />
              </div>

              {/* Category & Priority Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">
                    Danh mục
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border text-sm outline-none ${
                      darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">
                    Mức ưu tiên
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border text-sm outline-none ${
                      darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    {PRIORITIES.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Due Date & Time Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">
                    Hạn chót (Ngày)
                  </label>
                  <input
                    type="date"
                    required
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border text-sm outline-none ${
                      darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">
                    Thời gian
                  </label>
                  <input
                    type="time"
                    required
                    value={formDueTime}
                    onChange={(e) => setFormDueTime(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border text-sm outline-none ${
                      darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
              </div>

              {/* Reminder Settings */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">
                  Cấu hình lịch nhắc nhở
                </label>
                <div className="flex items-center gap-2">
                  <BellRing className="w-4 h-4 text-amber-500" />
                  <select
                    value={formReminder}
                    onChange={(e) => setFormReminder(e.target.value)}
                    className={`flex-1 px-3 py-2 rounded-xl border text-sm outline-none ${
                      darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    {REMINDER_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Subtasks Builder */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">
                  Công việc con (Checklist)
                </label>

                {formSubtasks.length > 0 && (
                  <div className="space-y-1.5 mb-2">
                    {formSubtasks.map(sub => (
                      <div key={sub.id} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                        <span>{sub.title}</span>
                        <button
                          type="button"
                          onClick={() => removeSubtaskFromForm(sub.id)}
                          className="text-slate-400 hover:text-red-500"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Thêm mục cần làm con..."
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSubtaskToForm(); } }}
                    className={`flex-1 px-3 py-1.5 rounded-xl border text-xs outline-none ${
                      darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={addSubtaskToForm}
                    className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-xs font-medium transition-colors"
                  >
                    Thêm
                  </button>
                </div>
              </div>

              {/* Form Action Footer */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-md shadow-blue-500/20 active:scale-95 transition-all"
                >
                  {editingTask ? 'Lưu thay đổi' : 'Tạo mới'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}