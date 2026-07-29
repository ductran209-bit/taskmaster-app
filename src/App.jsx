import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  CheckCircle2, Circle, Clock, Calendar, Plus, Trash2, Edit3, Tag,
  AlertCircle, Search, Moon, Sun, Sparkles, PieChart,
  LayoutList, Volume2, X, Flag, ArrowUpDown, BellRing,
  Layers, CheckSquare, LogOut, User, Lock, Mail
} from 'lucide-react';

// Firebase Imports
import { auth, db } from './firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where 
} from 'firebase/firestore';

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

export default function App() {
  // Auth State
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // App State
  const [tasks, setTasks] = useState([]);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('taskmaster_theme') === 'dark');
  const [activeTab, setActiveTab] = useState('tasks');
  const [filter, setFilter] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('dueDate');

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCategory, setFormCategory] = useState('work');
  const [formPriority, setFormPriority] = useState('medium');
  const [formDueDate, setFormDueDate] = useState(new Date().toISOString().slice(0, 10));
  const [formDueTime, setFormDueTime] = useState('09:00');

  // 1. Lắng nghe trạng thái đăng nhập
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Lắng nghe dữ liệu công việc Realtime từ Firestore của User hiện tại
  useEffect(() => {
    if (!user) {
      setTasks([]);
      return;
    }

    const q = query(collection(db, 'tasks'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedTasks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTasks(fetchedTasks);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('taskmaster_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('taskmaster_theme', 'light');
    }
  }, [darkMode]);

  // Xử lý Xác thực (Đăng nhập / Đăng ký / Đăng xuất)
  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      setEmail('');
      setPassword('');
    } catch (err) {
      setAuthError('Xác thực thất bại! Kiểm tra lại Email/Mật khẩu.');
    }
  };

  const handleLogout = () => signOut(auth);

  // Xử lý thêm / sửa / xóa Công việc trên Firestore
  const handleSaveTask = async (e) => {
    e.preventDefault();
    if (!formTitle.trim() || !user) return;

    const taskId = editingTask ? editingTask.id : Date.now().toString();
    const taskData = {
      userId: user.uid,
      title: formTitle,
      description: formDesc,
      category: formCategory,
      priority: formPriority,
      dueDate: formDueDate,
      dueTime: formDueTime,
      completed: editingTask ? editingTask.completed : false,
      createdAt: editingTask ? editingTask.createdAt : new Date().toISOString()
    };

    await setDoc(doc(db, 'tasks', taskId), taskData, { merge: true });
    setIsModalOpen(false);
    resetForm();
  };

  const toggleTaskCompletion = async (task) => {
    await setDoc(doc(db, 'tasks', task.id), { completed: !task.completed }, { merge: true });
  };

  const deleteTask = async (id) => {
    await deleteDoc(doc(db, 'tasks', id));
  };

  const resetForm = () => {
    setFormTitle('');
    setFormDesc('');
    setFormCategory('work');
    setFormPriority('medium');
    setFormDueDate(new Date().toISOString().slice(0, 10));
    setFormDueTime('09:00');
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
    setIsModalOpen(true);
  };

  const todayStr = new Date().toISOString().slice(0, 10);

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (filter === 'today' && t.dueDate !== todayStr) return false;
      if (filter === 'upcoming' && (t.dueDate <= todayStr || t.completed)) return false;
      if (filter === 'overdue' && (t.dueDate >= todayStr || t.completed)) return false;
      if (filter === 'completed' && !t.completed) return false;
      if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
      if (searchQuery.trim() && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    }).sort((a, b) => new Date(`${a.dueDate}T${a.dueTime}`) - new Date(`${b.dueDate}T${b.dueTime}`));
  }, [tasks, filter, selectedCategory, searchQuery, todayStr]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const overdue = tasks.filter(t => !t.completed && t.dueDate < todayStr).length;
    return { total, completed, pending: total - completed, overdue };
  }, [tasks, todayStr]);

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">Đang tải...</div>;
  }

  // MÀN HÌNH ĐĂNG NHẬP / ĐĂNG KÝ
  if (!user) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
        <div className={`w-full max-w-md p-8 rounded-2xl border shadow-xl ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <CheckSquare className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">TaskMaster</h1>
          </div>

          <h2 className="text-xl font-semibold text-center mb-6">{isSignUp ? 'Tạo tài khoản mới' : 'Đăng nhập vào TaskMaster'}</h2>

          {authError && <div className="p-3 mb-4 text-xs bg-red-100 text-red-600 rounded-xl text-center">{authError}</div>}

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className={`w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border outline-none ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Mật khẩu</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border outline-none ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                />
              </div>
            </div>

            <button type="submit" className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-md transition-all">
              {isSignUp ? 'Đăng ký' : 'Đăng nhập'}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 mt-6">
            {isSignUp ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}{' '}
            <button onClick={() => setIsSignUp(!isSignUp)} className="text-blue-500 font-semibold hover:underline">
              {isSignUp ? 'Đăng nhập ngay' : 'Đăng ký ngay'}
            </button>
          </p>
        </div>
      </div>
    );
  }

  // MÀN HÌNH CHÍNH (KHI ĐÃ ĐĂNG NHẬP)
  return (
    <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      <header className={`sticky top-0 z-30 border-b backdrop-blur-md ${darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <CheckSquare className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">TaskMaster</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-500">
              <User className="w-3.5 h-3.5" />
              <span>{user.email}</span>
            </div>

            <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-xl border border-slate-200 dark:border-slate-800">
              {darkMode ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            <button onClick={handleLogout} title="Đăng xuất" className="p-2 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-950/30">
              <LogOut className="w-4 h-4" />
            </button>

            <button onClick={openCreateModal} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-md">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Tạo việc mới</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="space-y-4">
            <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Lọc trạng thái</h3>
              <nav className="space-y-1">
                {[
                  { id: 'all', label: 'Tất cả công việc', count: stats.total, icon: Layers },
                  { id: 'today', label: 'Hôm nay', icon: Calendar },
                  { id: 'overdue', label: 'Quá hạn', count: stats.overdue, icon: AlertCircle, highlight: 'text-red-500' },
                  { id: 'completed', label: 'Đã hoàn thành', count: stats.completed, icon: CheckCircle2, highlight: 'text-emerald-500' },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setFilter(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-xl transition-all ${
                      filter === item.id ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium' : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <item.icon className={`w-4 h-4 ${item.highlight || ''}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.count !== undefined && <span className="text-xs font-medium">{item.count}</span>}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-3">
            {filteredTasks.length === 0 ? (
              <div className={`p-12 text-center rounded-2xl border ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
                <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500">Chưa có công việc nào.</p>
              </div>
            ) : (
              filteredTasks.map(task => (
                <div key={task.id} className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <div className="flex items-center gap-3">
                    <button onClick={() => toggleTaskCompletion(task)}>
                      {task.completed ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : <Circle className="w-6 h-6 text-slate-400" />}
                    </button>
                    <div>
                      <h3 className={`font-semibold ${task.completed ? 'line-through text-slate-400' : ''}`}>{task.title}</h3>
                      <p className="text-xs text-slate-400">{task.dueDate} {task.dueTime}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEditModal(task)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-blue-500"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => deleteTask(task.id)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* MODAL CÔNG VIỆC */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`w-full max-w-lg p-6 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <h2 className="text-lg font-bold mb-4">{editingTask ? 'Sửa công việc' : 'Tạo công việc mới'}</h2>
            <form onSubmit={handleSaveTask} className="space-y-4">
              <input type="text" required value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="Tên công việc..." className={`w-full p-2.5 text-sm rounded-xl border outline-none ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`} />
              <textarea value={formDesc} onChange={e => setFormDesc(e.target.value)} placeholder="Mô tả..." className={`w-full p-2.5 text-sm rounded-xl border outline-none ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`} />
              <div className="grid grid-cols-2 gap-3">
                <input type="date" value={formDueDate} onChange={e => setFormDueDate(e.target.value)} className={`w-full p-2.5 text-sm rounded-xl border outline-none ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`} />
                <input type="time" value={formDueTime} onChange={e => setFormDueTime(e.target.value)} className={`w-full p-2.5 text-sm rounded-xl border outline-none ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`} />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm rounded-xl border">Hủy</button>
                <button type="submit" className="px-4 py-2 text-sm rounded-xl bg-blue-600 text-white">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}