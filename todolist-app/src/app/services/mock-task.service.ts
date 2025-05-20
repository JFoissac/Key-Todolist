import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Task, TaskStatus } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class MockTaskService {
  // ID counter pour générer des IDs numériques uniques
  private nextId = 8; // Commencer après les IDs déjà attribués
  
  // Données mockées adaptées au nouveau modèle Task
  private tasks: Task[] = [
    {
      id: 1,
      label: 'Apprendre Angular 18',
      description: 'Étudier les nouveautés d\'Angular 18, notamment les signaux et les composants autonomes.',
      completed: false,
      // Propriétés pour la compatibilité avec les composants existants
      title: 'Apprendre Angular 18',
      status: TaskStatus.IN_PROGRESS,
      createdAt: new Date(2025, 4, 10),
      updatedAt: new Date(2025, 4, 12),
      dueDate: new Date(2025, 5, 1),
      priority: 'high'
    },
    {
      id: 2,
      label: 'Implémenter l\'authentification',
      description: 'Ajouter un système d\'authentification avec JWT pour sécuriser l\'application.',
      completed: false,
      // Propriétés pour la compatibilité avec les composants existants
      title: 'Implémenter l\'authentification',
      status: TaskStatus.PENDING,
      createdAt: new Date(2025, 4, 8),
      updatedAt: new Date(2025, 4, 8),
      dueDate: new Date(2025, 5, 15),
      priority: 'medium'
    },
    {
      id: 3,
      label: 'Créer des tests unitaires',
      description: 'Écrire des tests unitaires pour les composants et services principaux.',
      completed: false,
      // Propriétés pour la compatibilité avec les composants existants
      title: 'Créer des tests unitaires',
      status: TaskStatus.PENDING,
      createdAt: new Date(2025, 4, 5),
      updatedAt: new Date(2025, 4, 5),
      dueDate: new Date(2025, 5, 20),
      priority: 'medium'
    },
    {
      id: 4,
      label: 'Optimiser les performances',
      description: 'Analyser et améliorer les performances de l\'application (lazy loading, SSR, etc.).',
      completed: false,
      // Propriétés pour la compatibilité avec les composants existants
      title: 'Optimiser les performances',
      status: TaskStatus.PENDING,
      createdAt: new Date(2025, 4, 1),
      updatedAt: new Date(2025, 4, 1),
      dueDate: new Date(2025, 6, 1),
      priority: 'low'
    },
    {
      id: 5,
      label: 'Déployer l\'application',
      description: 'Configurer le pipeline CI/CD et déployer l\'application en production.',
      completed: false,
      // Propriétés pour la compatibilité avec les composants existants
      title: 'Déployer l\'application',
      status: TaskStatus.PENDING,
      createdAt: new Date(2025, 3, 28),
      updatedAt: new Date(2025, 3, 28),
      dueDate: new Date(2025, 6, 15),
      priority: 'high'
    },
    {
      id: 6,
      label: 'Documentation utilisateur',
      description: 'Rédiger une documentation complète pour les utilisateurs finaux.',
      completed: true,
      // Propriétés pour la compatibilité avec les composants existants
      title: 'Documentation utilisateur',
      status: TaskStatus.COMPLETED,
      createdAt: new Date(2025, 3, 15),
      updatedAt: new Date(2025, 4, 5),
      priority: 'medium'
    },
    {
      id: 7,
      label: 'Réunion de planification',
      description: 'Participer à la réunion de planification du sprint avec l\'équipe.',
      completed: false,
      // Propriétés pour la compatibilité avec les composants existants
      title: 'Réunion de planification',
      status: TaskStatus.CANCELLED,
      createdAt: new Date(2025, 3, 10),
      updatedAt: new Date(2025, 3, 12),
      priority: 'low'
    }
  ];

  // Simuler un délai réseau
  private readonly delay = 300;

  getTasks(): Observable<Task[]> {
    return of([...this.tasks]).pipe(delay(this.delay));
  }

  getTaskById(id: number): Observable<Task> {
    const task = this.tasks.find(t => t.id === id);
    if (!task) {
      throw new Error(`Task with id ${id} not found`);
    }
    return of({...task}).pipe(delay(this.delay));
  }

  createTask(taskData: Omit<Task, 'id'>): Observable<Task> {
    const now = new Date();
    
    // S'assurer que les propriétés requises sont présentes
    const label = taskData.title ?? taskData.label ?? '';
    
    const newTask: Task = {
      ...taskData,
      id: this.nextId++,
      label: label,
      title: label,  // Pour la compatibilité avec les composants existants
      completed: taskData.status === TaskStatus.COMPLETED || taskData.completed || false,
      createdAt: now,
      updatedAt: now
    };
    
    this.tasks.push(newTask);
    return of({...newTask}).pipe(delay(this.delay));
  }

  updateTask(id: number, updates: Partial<Task>): Observable<Task> {
    const index = this.tasks.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error(`Task with id ${id} not found`);
    }
    
    const updatedTask: Task = {
      ...this.tasks[index],
      ...updates,
      updatedAt: new Date()
    };
    
    this.tasks[index] = updatedTask;
    return of({...updatedTask}).pipe(delay(this.delay));
  }

  updateTaskStatus(id: number, completed: boolean): Observable<Task> {
    // Convertir le boolean en TaskStatus pour la compatibilité
    const status = completed ? TaskStatus.COMPLETED : TaskStatus.PENDING;
    
    return this.updateTask(id, { status });
  }

  deleteTask(id: number): Observable<void> {
    const index = this.tasks.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error(`Task with id ${id} not found`);
    }
    
    this.tasks.splice(index, 1);
    return of(void 0).pipe(delay(this.delay));
  }
}
