import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskStore } from '../../store/task.store';
import { TaskStatus } from '../../models/task.model';
import { DialogService } from '../../services/dialog.service';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-detail.component.html',
  styles: [`
    :host {
      display: block;
      height: 100%;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskDetailComponent {
  private readonly taskStore = inject(TaskStore);
  private readonly dialogService = inject(DialogService);
  
  // Propriété signal pour accéder à la tâche sélectionnée
  private readonly selectedTask = this.taskStore.selectedTask;
  
  // Propriétés pour le template
  get hasSelectedTask(): boolean {
    return !!this.selectedTask();
  }
  
  get taskTitle(): string {
    return this.selectedTask()?.title ?? '';
  }
  
  get taskDescription(): string {
    return this.selectedTask()?.description ?? '';
  }
  
  get taskStatus(): TaskStatus {
    return this.selectedTask()?.status ?? TaskStatus.PENDING;
  }
  
  get statusLabel(): string {
    return this.getStatusLabel(this.taskStatus);
  }
  
  get priorityLabel(): string {
    return this.getPriorityLabel(this.selectedTask()?.priority ?? 'medium');
  }
  
  get hasDueDate(): boolean {
    return !!this.selectedTask()?.dueDate;
  }
  
  get dueDate(): Date | undefined {
    return this.selectedTask()?.dueDate;
  }
  
  get createdAt(): Date | undefined {
    return this.selectedTask()?.createdAt;
  }
  
  get updatedAt(): Date | undefined {
    return this.selectedTask()?.updatedAt;
  }
  
  get taskStatusClass(): Record<string, boolean> {
    const status = this.taskStatus;
    return {
      'task-pending': status === TaskStatus.PENDING,
      'task-in-progress': status === TaskStatus.IN_PROGRESS,
      'task-completed': status === TaskStatus.COMPLETED,
      'task-cancelled': status === TaskStatus.CANCELLED
    };
  }
  
  get statusBadgeClass(): Record<string, boolean> {
    const status = this.taskStatus;
    return {
      'bg-yellow-200 text-yellow-800': status === TaskStatus.PENDING,
      'bg-blue-200 text-blue-800': status === TaskStatus.IN_PROGRESS,
      'bg-green-200 text-green-800': status === TaskStatus.COMPLETED,
      'bg-red-200 text-red-800': status === TaskStatus.CANCELLED
    };
  }
  
  // Options pour le sélecteur de statut
  statusOptions = [
    { value: TaskStatus.PENDING, label: 'À faire' },
    { value: TaskStatus.IN_PROGRESS, label: 'En cours' },
    { value: TaskStatus.COMPLETED, label: 'Terminée' },
    { value: TaskStatus.CANCELLED, label: 'Annulée' }
  ];
  
  updateStatus(status: TaskStatus): void {
    const task = this.selectedTask();
    if (task?.id !== undefined) {
      this.taskStore.updateTaskStatus(task.id, status);
    }
  }
  
  deleteTask(): void {
    const task = this.selectedTask();
    if (task?.id !== undefined) {
      this.taskStore.deleteTask(task.id);
    }
  }
  
  editTask(): void {
    const task = this.selectedTask();
    if (task) {
      this.dialogService.openEditDialog(task);
    }
  }
  
  getStatusLabel(status: TaskStatus | string): string {
    const statusMap: Record<string, string> = {
      'pending': 'À faire',
      'in-progress': 'En cours',
      'completed': 'Terminée',
      'cancelled': 'Annulée'
    };
    return statusMap[status];
  }
  
  getPriorityLabel(priority: string): string {
    const priorityMap: Record<string, string> = {
      'low': 'Priorité faible',
      'medium': 'Priorité moyenne',
      'high': 'Priorité haute'
    };
    return priorityMap[priority];
  }
}
