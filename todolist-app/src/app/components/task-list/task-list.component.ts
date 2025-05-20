import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task, TaskStatus } from '../../models/task.model';

// Rendre TaskStatus disponible dans le template
type TaskStatusType = typeof TaskStatus;
import { TaskItemComponent } from '../task-item/task-item.component';
import { TaskFilterComponent } from '../task-filter/task-filter.component';
import { DialogService } from '../../services/dialog.service';
import { TaskService } from '../../services/task.service';
import { EventService } from '../../services/event.service';
import { TaskStore } from '../../store/task.store';
import { catchError, finalize } from 'rxjs/operators';
import { of, Subscription } from 'rxjs';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, TaskItemComponent, TaskFilterComponent],
  templateUrl: './task-list.component.html',
  styles: [`
    :host {
      display: block;
      height: 100%;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskListComponent implements OnInit, OnDestroy {
  // Exposer TaskStatus au template
  readonly TaskStatus = TaskStatus;
  
  private readonly taskService = inject(TaskService);
  private readonly dialogService = inject(DialogService);
  private readonly eventService = inject(EventService);
  private readonly taskStore = inject(TaskStore);
  
  private readonly subscription = new Subscription();
  
  // Reactive signals
  private readonly tasks = signal<Task[]>([]);
  private readonly loading = signal<boolean>(false);
  private readonly selectedTaskId = signal<number | null>(null);
  private readonly currentFilter = signal<TaskStatus | null>(null);
  
  constructor() {
    // Utiliser effect() pour réagir aux changements des signaux du TaskStore
    // Cette fonction sera exécutée automatiquement lorsque taskStore.tasks() change
    effect(() => {
      // Lire la valeur du signal pour s'abonner à ses changements
      const tasks = this.taskStore.tasks();
      console.log('TaskStore tasks updated via effect, refreshing list');
      
      // Ne pas recharger lors de l'initialisation (pour éviter un double chargement)
      if (tasks.length > 0) {
        this.loadTasksWithoutSignalWrites(this.currentFilter());
      }
    }, { allowSignalWrites: true });
  }
  
  // Propriétés pour le template
  get isLoading(): boolean {
    return this.loading();
  }
  
  get taskList(): Task[] {
    return this.tasks();
  }
  
  get allTasksButtonClass(): Record<string, boolean> {
    const isActive = this.currentFilter() === null;
    return {
      'bg-blue-500': isActive,
      'text-white': isActive,
      'bg-gray-100': !isActive
    };
  }
  
  getStatusButtonClass(status: TaskStatus): Record<string, boolean> {
    const isActive = this.currentFilter() === status;
    return {
      'bg-blue-500': isActive,
      'text-white': isActive,
      'bg-gray-100': !isActive
    };
  }
  
  /**
   * Vérifie si une tâche est sélectionnée
   */
  isTaskSelected(task: Task): boolean {
    return task.id === this.selectedTaskId();
  }
  
  /**
   * Sélectionne une tâche si elle a un ID
   */
  selectTaskIfHasId(task: Task): void {
    if (task.id !== undefined) {
      this.selectTask(task.id);
    }
  }
  
  /**
   * Met à jour le statut d'une tâche si elle a un ID
   */
  updateTaskStatusIfHasId(task: Task, completed: boolean): void {
    if (task.id !== undefined) {
      // Convertir le booléen en TaskStatus
      const status = completed ? TaskStatus.COMPLETED : TaskStatus.PENDING;
      this.updateTaskStatus(task.id, status);
    }
  }
  
  /**
   * Fonction de suivi pour la directive ngFor
   */
  trackById(index: number, task: Task): number {
    return task.id ?? index;
  }
  
  ngOnInit(): void {
    this.loadAllTasks();
    
    // S'abonner aux événements de mise à jour des tâches
    this.subscription.add(
      this.eventService.taskUpdated$.subscribe(() => {
        // Rafraîchir la liste des tâches en fonction de l'état actuel
        const currentFilter = this.currentFilter();
        if (currentFilter === null) {
          this.loadAllTasks();
        } else {
          this.loadTasksByStatus(currentFilter);
        }
      })
    );
  }
  
  ngOnDestroy(): void {
    // Se désabonner pour éviter les fuites de mémoire
    this.subscription.unsubscribe();
  }
  
  /**
   * Charge toutes les tâches
   */
  loadAllTasks(): void {
    this.loading.set(true);
    this.currentFilter.set(null);
    
    this.taskService.getTasks()
      .pipe(
        catchError(error => {
          console.error('Erreur lors du chargement des tâches', error);
          return of([]);
        }),
        finalize(() => this.loading.set(false))
      )
      .subscribe(tasks => {
        this.tasks.set(tasks);
      });
  }
  
  /**
   * Charge les tâches par statut
   */
  loadTasksByStatus(status: TaskStatus): void {
    this.loading.set(true);
    this.currentFilter.set(status);
    
    // Pour l'instant, nous chargeons toutes les tâches et filtrons côté client
    // Dans une version future, nous pourrions ajouter un endpoint spécifique au backend
    this.taskService.getTasks()
      .pipe(
        catchError(error => {
          console.error(`Erreur lors du chargement des tâches avec statut ${status}`, error);
          return of([]);
        }),
        finalize(() => this.loading.set(false))
      )
      .subscribe(tasks => {
        // Filtrer les tâches par statut
        const filteredTasks = tasks.filter(task => task.status === status);
        this.tasks.set(filteredTasks);
      });
  }
  
  /**
   * Méthode de compatibilité pour charger les tâches incomplètes
   * @deprecated Utiliser loadTasksByStatus(TaskStatus.PENDING) à la place
   */
  loadIncompleteTasks(): void {
    this.loadTasksByStatus(TaskStatus.PENDING);
  }
  
  /**
   * Charge les tâches sans modifier les signaux dans un effet
   * Cette méthode est utilisée par l'effet pour éviter l'erreur
   * "Writing to signals is not allowed in a `computed` or an `effect`"
   */
  private loadTasksWithoutSignalWrites(status: TaskStatus | null): void {
    // Utiliser setTimeout pour sortir du contexte de l'effet
    setTimeout(() => {
      if (status === null) {
        this.loadAllTasks();
      } else {
        this.loadTasksByStatus(status);
      }
    }, 0);
  }
  
  // Cette méthode a été remplacée par loadTasksByStatus(TaskStatus.PENDING)
  
  selectTask(taskId: number): void {
    // Mettre à jour le signal local
    this.selectedTaskId.set(taskId);
    
    // Mettre à jour le TaskStore pour que le composant de détail puisse accéder à la tâche sélectionnée
    this.taskStore.selectTask(taskId);
  }
  
  updateTaskStatus(taskId: number, status: TaskStatus): void {
    this.taskService.updateTaskStatus(taskId, status)
      .pipe(
        catchError(error => {
          console.error('Erreur lors de la mise à jour du statut', error);
          return of(null);
        })
      )
      .subscribe(updatedTask => {
        if (updatedTask) {
          // Mettre à jour la tâche dans la liste
          const currentTasks = this.tasks();
          const updatedTasks = currentTasks.map(task => 
            task.id === updatedTask.id ? updatedTask : task
          );
          this.tasks.set(updatedTasks);
          
          // Si on filtre par un statut spécifique et que le statut de la tâche a changé,
          // rafraîchir la liste
          const currentFilter = this.currentFilter();
          if (currentFilter !== null && status !== currentFilter) {
            this.loadTasksByStatus(currentFilter);
          }
        }
      });
  }
  
  openNewTaskDialog(): void {
    this.dialogService.openCreateDialog();
  }
}
