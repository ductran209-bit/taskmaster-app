import React, { useState, useEffect } from 'react';
import { Plus, Check, Trash2, Calendar, CheckCircle2, Circle } from 'lucide-react';

export default function App() {
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('taskmaster_tasks');
    if (savedTasks) {
      try {
        return JSON.parse(savedTasks);
      } catch (e) {
        console.error(e);
      }
    }
    return [
      { id: 1, text: 'Tìm hiểu về Vite & React', completed: true },
      { id: 2, text: 'Cấu hình Tailwind CSS', completed: true },
      { id: 3, text: 'Triển khai ứng dụng lên Vercel', completed: false },
    ];
  });

  const [input, setInput] = useState('');

  useEffect(() => {
    localStorage.setItem('taskmaster_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const newTask = {
      id: Date.now(),
      text: input.trim(),
      completed: false,
    };
    setTasks([newTask, ...tasks]);
    setInput('');
  };

  const toggleTask = (id) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col items-center py-10 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-indigo-600 p-6 text-white">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8" />
            <h1 className="text-2xl font-bold tracking-wide">TaskMaster</h1>
          </div>
          <p className="text-indigo-200 text-sm mt-2">
            Hoàn thành: {completedCount} / {tasks.length} công việc
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={addTask} className="p-4 border-b border-slate-100 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Thêm công việc mới..."
            className="flex-1 px-4 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-1 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Thêm
          </button>
        </form>

        {/* Task List */}
        <div className="p-4 divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
          {tasks.length === 0 ? (
            <p className="text-center text-slate-400 py-6">Chưa có công việc nào!</p>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="py-3 flex items-center justify-between gap-3 group"
              >
                <div
                  onClick={() => toggleTask(task.id)}
                  className="flex items-center gap-3 cursor-pointer flex-1"
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                  ) : (
                    <Circle className="w-6 h-6 text-slate-300 shrink-0" />
                  )}
                  <span
                    className={`text-base ${
                      task.completed
                        ? 'line-through text-slate-400'
                        : 'text-slate-700'
                    }`}
                  >
                    {task.text}
                  </span>
                </div>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-slate-300 hover:text-red-500 p-1 transition-colors"
                  title="Xóa"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-100 text-center text-xs text-slate-400">
          TaskMaster App • Sẵn sàng triển khai lên Vercel 🚀
        </div>
      </div>
    </div>
  );
}