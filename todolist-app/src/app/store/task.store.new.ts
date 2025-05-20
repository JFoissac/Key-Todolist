import { Injectable, computed, inject, signal } from '@angular/core';
import { Task, TaskStatus } from '../models/task.model';
import { TaskService } from '../services/task.service';
import { EventService } from '../services/event.service';
import { catchError, tap, takeUntil } from 'rxjs/operators';
import { of, Subject } from 'rxjs';

interface TaskState {
  tasks: Task[];
  selectedTaskId: number | null;
  loading: boolean;
  error: string | null;
  filter: TaskStatus | 'all';
}

@Injectable({ providedIn: 'root' })
export class TaskStore {
  private readonly destroy$ = new Subject<void>();
  private readonly taskService = inject(TaskService);
  private readonly eventService = inject(EventService);
  
  // State
  private readonly state = signal<TaskState>({
    tasks: [],
    selectedTaskId: null,
    loading: false,
    error: null,
    filter: 'all'
  });
  
  // Selectors (Computed values)
  tasks = computed(() => this.state().tasks);
  selectedTaskId = computed(() => this.state().selectedTaskId);
  loading = computed(() => this.state().loading);
  error = computed(() => this.state().error);
  filter = computed(() => this.state().filter);
  
  // Computed selector for filtered tasks
  filteredTasks = computed(() => {
    const filter = this.state().filter;
    const tasks = this.state().tasks;
    
    if (filter === 'all') {
      return tasks;
    }
    
    return tasks.filter(task => task.status === filter);
  });
  
  // Computed selector for selected task
  selectedTask = computed(() => {
    const selectedId = this.state().selectedTaskId;
    if (!selectedId) return null;
    return this.state().tasks.find(task => task.id === selectedId) || null;
  });
  
  constructor() {
    // Load tasks on initialization
    this.loadTasks();
  }
  
  // Actions
  loadTasks() {
    this.state.update(state => ({ ...state, loading: true, error: null }));
    
    this.taskService.getTasks().pipe(
      takeUntil(this.destroy$),
      tap(tasks => {
        this.state.update(state => ({ 
          ...state, 
          tasks, 
          loading: false 
        }));
      }),
      catchError(error => {
        this.state.update(state => ({ 
          ...state, 
          error: 'Failed to load tasks', 
          loading: false 
        }));
        return of([]);
      })
    ).subscribe();
  }
  
  selectTask(taskId: number) {
    this.state.update(state => ({ ...state, selectedTaskId: taskId }));
  }
  
  clearSelectedTask() {
    this.state.update(state => ({ ...state, selectedTaskId: null }));
  }
  
  setFilter(filter: TaskStatus | 'all') {
    this.state.update(state => ({ ...state, filter }));
  }
  
  addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) {
    this.state.update(state => ({ ...state, loading: true, error: null }));
    
    this.taskService.createTask(task).pipe(
      takeUntil(this.destroy$),
      tap(newTask => {
        this.state.update(state => ({
          ...state,
          tasks: [...state.tasks, newTask],
          loading: false
        }));
        
        // Notifier les autres composants qu'une tâche a été ajoutée
        this.eventService.notifyTaskUpdated();
      }),
      catchError(error => {
        this.state.update(state => ({ 
          ...state, 
          error: 'Failed to create task', 
          loading: false 
        }));
        return of(null);
      })
    ).subscribe();
  }
  
  updateTask(id: number, updates: Partial<Task>) {
    this.state.update(state => ({ ...state, loading: true, error: null }));
    
    this.taskService.updateTask(id, updates).pipe(
      takeUntil(this.destroy$),
      tap(updatedTask => {
        this.state.update(state => ({
          ...state,
          loading: false,
          tasks: state.tasks.map(task =>
            task.id === id ? updatedTask : task
          )
        }));
        
        // Notifier les autres composants qu'une tâche a été mise à jour
        this.eventService.notifyTaskUpdated();
      }),
      catchError(error => {
        this.state.update(state => ({
          ...state,
          loading: false,
          error: 'Failed to update task'
        }));
        return of(null);
      })
    ).subscribe();
  }
  
  updateTaskStatus(id: number, status: TaskStatus) {
    this.state.update(state => ({ ...state, loading: true, error: null }));
    
    // Convertir le TaskStatus en boolean completed pour l'API
    const completed = status === TaskStatus.COMPLETED;
    
    this.taskService.updateTaskStatus(id, completed).pipe(
      takeUntil(this.destroy$),
      tap(updatedTask => {
        this.state.update(state => ({
          ...state,
          loading: false,
          tasks: state.tasks.map(task =>
            task.id === id ? updatedTask : task
          )
        }));
        
        // Notifier les autres composants qu'une tâche a été mise à jour
        this.eventService.notifyTaskUpdated();
      }),
      catchError(error => {
        this.state.update(state => ({
          ...state,
          loading: false,
          error: 'Failed to update task status'
        }));
        return of(null);
      })
    ).subscribe();
  }
  
  deleteTask(id: number) {
    this.state.update(state => ({ ...state, loading: true, error: null }));
    
    this.taskService.deleteTask(id).pipe(
      takeUntil(this.destroy$),
      tap(() => {
        this.state.update(state => {
          // If the deleted task was selected, clear selection
          const newState = { 
            ...state,
            tasks: state.tasks.filter(task => task.id !== id),
            loading: false
          };
          
          if (state.selectedTaskId === id) {
            newState.selectedTaskId = null;
          }
          
          return newState;
        });
        
        // Notifier les autres composants qu'une tâche a été supprimée
        this.eventService.notifyTaskUpdated();
      }),
      catchError(error => {
        this.state.update(state => ({ 
          ...state, 
          error: 'Failed to delete task', 
          loading: false 
        }));
        return of(null);
      })
    ).subscribe();
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
