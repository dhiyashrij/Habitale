import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Todo, TodoPriority } from '../types';
import { loadLocalTodos, saveLocalTodos } from '../services/storage';
import {
  fetchUserTodos,
  saveUserTodo,
  deleteUserTodo as deleteFirestoreTodo,
  carryForwardUserTodos,
} from '../services/firestore';
import { playGentleChime } from '../services/audio';
import { useTheme } from './ThemeContext';
import { useAuth } from './AuthContext';
import { getTodayString } from './RoutinesContext';

export type TodoFilterType = 'today' | 'upcoming' | 'overdue' | 'completed' | 'all';

interface TodosContextType {
  todos: Todo[];
  categories: string[];
  addCategory: (name: string) => void;
  addTodo: (todo: { title: string; category?: string; priority?: TodoPriority; dueDate?: string; description?: string }) => Promise<void>;
  toggleTodo: (id: string) => Promise<void>;
  updateTodo: (id: string, updates: Partial<Todo>) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  clearCompleted: () => Promise<void>;
  carryForwardTask: (id: string) => Promise<void>;
  carryForwardAllOverdue: () => Promise<void>;
  loadStarterTodos: () => Promise<void>;
  overdueCount: number;
}

const TodosContext = createContext<TodosContextType | undefined>(undefined);

const DEFAULT_CATEGORIES = ['Personal', 'Work', 'Wellness', 'Study', 'Creative'];

export const TodosProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [todos, setTodos] = useState<Todo[]>(() => loadLocalTodos());
  const [categories, setCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('habitale_custom_lists');
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });

  const { theme } = useTheme();
  const todayStr = getTodayString();

  // Load from Cloud Firestore on login
  useEffect(() => {
    if (!user) {
      setTodos(loadLocalTodos());
      return;
    }

    const loadCloudTodos = async () => {
      try {
        const cloudTodos = await fetchUserTodos(user.id);
        if (cloudTodos.length > 0) {
          setTodos(cloudTodos);
          saveLocalTodos(cloudTodos);
        } else {
          const local = loadLocalTodos();
          if (local.length > 0) {
            setTodos(local);
            for (const t of local) {
              await saveUserTodo(user.id, t);
            }
          } else {
            setTodos([]);
          }
        }
      } catch (err) {
        console.error('Error fetching todos from Firestore:', err);
      }
    };

    loadCloudTodos();
  }, [user?.id]);

  useEffect(() => {
    saveLocalTodos(todos);
  }, [todos]);

  useEffect(() => {
    localStorage.setItem('habitale_custom_lists', JSON.stringify(categories));
  }, [categories]);

  const addCategory = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || categories.includes(trimmed)) return;
    setCategories(prev => [...prev, trimmed]);
  };

  const addTodo = async ({
    title,
    category = 'Personal',
    priority = 'medium',
    dueDate,
    description,
  }: {
    title: string;
    category?: string;
    priority?: TodoPriority;
    dueDate?: string;
    description?: string;
  }) => {
    if (!title.trim()) return;

    const newTodo: Todo = {
      id: 'todo-' + Date.now(),
      title: title.trim(),
      description,
      category,
      priority,
      dueDate: dueDate || todayStr,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    setTodos(prev => [newTodo, ...prev]);

    if (user) {
      try {
        await saveUserTodo(user.id, newTodo);
      } catch (err) {
        console.error('Failed to sync new todo to Firestore:', err);
      }
    }
  };

  const toggleTodo = async (id: string) => {
    let updatedTodo: Todo | undefined;

    setTodos(prev =>
      prev.map(todo => {
        if (todo.id !== id) return todo;
        const willBeCompleted = !todo.completed;
        if (willBeCompleted && theme.soundEnabled) {
          playGentleChime(true);
        }
        updatedTodo = {
          ...todo,
          completed: willBeCompleted,
          completedAt: willBeCompleted ? new Date().toISOString() : undefined,
        };
        return updatedTodo;
      })
    );

    if (user && updatedTodo) {
      try {
        await saveUserTodo(user.id, updatedTodo);
      } catch (err) {
        console.error('Failed to sync todo toggle to Firestore:', err);
      }
    }
  };

  const updateTodo = async (id: string, updates: Partial<Todo>) => {
    let targetTodo: Todo | undefined;
    setTodos(prev =>
      prev.map(t => {
        if (t.id === id) {
          targetTodo = { ...t, ...updates, updatedAt: new Date().toISOString() };
          return targetTodo;
        }
        return t;
      })
    );

    if (user && targetTodo) {
      try {
        await saveUserTodo(user.id, targetTodo);
      } catch (err) {
        console.error('Failed to sync todo update to Firestore:', err);
      }
    }
  };

  const deleteTodo = async (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));

    if (user) {
      try {
        await deleteFirestoreTodo(user.id, id);
      } catch (err) {
        console.error('Failed to delete todo from Firestore:', err);
      }
    }
  };

  const clearCompleted = async () => {
    const toDelete = todos.filter(t => t.completed);
    setTodos(prev => prev.filter(t => !t.completed));

    if (user) {
      for (const t of toDelete) {
        await deleteFirestoreTodo(user.id, t.id);
      }
    }
  };

  // Carry forward single overdue task to today
  const carryForwardTask = async (id: string) => {
    await updateTodo(id, { dueDate: todayStr });
  };

  // Carry forward all overdue tasks to today in bulk
  const carryForwardAllOverdue = async () => {
    const overdueIds = todos
      .filter(t => !t.completed && t.dueDate && t.dueDate < todayStr)
      .map(t => t.id);

    if (overdueIds.length === 0) return;

    setTodos(prev =>
      prev.map(t => (overdueIds.includes(t.id) ? { ...t, dueDate: todayStr } : t))
    );

    if (user) {
      await carryForwardUserTodos(user.id, overdueIds, todayStr);
    }
  };

  const loadStarterTodos = async () => {
    const { starterTodos } = await import('../services/storage');
    setTodos(starterTodos);
    if (user) {
      for (const t of starterTodos) {
        await saveUserTodo(user.id, t);
      }
    }
  };

  // Calculate overdue count for active badges
  const overdueCount = todos.filter(t => !t.completed && t.dueDate && t.dueDate < todayStr).length;

  return (
    <TodosContext.Provider
      value={{
        todos,
        categories,
        addCategory,
        addTodo,
        toggleTodo,
        updateTodo,
        deleteTodo,
        clearCompleted,
        carryForwardTask,
        carryForwardAllOverdue,
        loadStarterTodos,
        overdueCount,
      }}
    >
      {children}
    </TodosContext.Provider>
  );
};

export const useTodos = () => {
  const context = useContext(TodosContext);
  if (!context) {
    throw new Error('useTodos must be used within a TodosProvider');
  }
  return context;
};
