import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task, TaskStatus } from '../../models/task.model';

@Component({
  selector: 'app-task-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-item.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskItemComponent {
  @Input() task!: Task;
  @Input() isSelected = false;
  @Output() statusChange = new EventEmitter<boolean>();
  
  /**
   * Texte d'accessibilité pour la case à cocher
   */
  get checkboxAriaLabel(): string {
    const isCompleted = this.task.status === TaskStatus.COMPLETED || this.task.status === TaskStatus.CANCELLED;
    return 'Marquer comme ' + (isCompleted ? 'non terminée' : 'terminée');
  }
  
  /**
   * Classes CSS pour l'indicateur de statut
   */
  get statusClass(): Record<string, boolean> {
    return {
      'bg-yellow-200 text-yellow-800': this.task.status === TaskStatus.PENDING,
      'bg-blue-200 text-blue-800': this.task.status === TaskStatus.IN_PROGRESS,
      'bg-green-200 text-green-800': this.task.status === TaskStatus.COMPLETED,
      'bg-red-200 text-red-800': this.task.status === TaskStatus.CANCELLED
    };
  }
  
  /**
   * Libellé du statut de la tâche
   */
  get statusLabel(): string {
    if (!this.task.status) {
      // Rétrocompatibilité avec l'ancien système basé sur completed
      // Utiliser une vérification plus sûre pour éviter l'avertissement de dépréciation
      const isCompleted = this.task.status === TaskStatus.COMPLETED || 
                          (this.task as any).completed === true;
      return isCompleted ? 'Terminée' : 'À faire';
    }
    
    switch (this.task.status) {
      case TaskStatus.PENDING:
        return 'À faire';
      case TaskStatus.IN_PROGRESS:
        return 'En cours';
      case TaskStatus.COMPLETED:
        return 'Terminée';
      case TaskStatus.CANCELLED:
        return 'Annulée';
      default:
        return 'À faire';
    }
  }
  
  /**
   * Symbole de priorité (flèche haut ou bas)
   */
  get prioritySymbol(): string {
    if (!this.task.priority) return '';
    
    switch (this.task.priority) {
      case 'high':
        return '⬆️'; // Flèche vers le haut
      case 'low':
        return '⬇️'; // Flèche vers le bas
      case 'medium':
      default:
        return '➡️'; // Flèche vers la droite
    }
  }
  
  /**
   * Classes CSS pour l'indicateur de priorité
   */
  get priorityClass(): Record<string, boolean> {
    if (!this.task.priority) return {};
    
    return {
      'text-red-600 font-bold': this.task.priority === 'high',
      'text-yellow-600': this.task.priority === 'medium',
      'text-blue-600': this.task.priority === 'low'
    };
  }
  
  /**
   * Libellé de la priorité
   */
  get priorityLabel(): string {
    if (!this.task.priority) return '';
    
    switch (this.task.priority) {
      case 'high':
        return 'Priorité haute';
      case 'medium':
        return 'Priorité moyenne';
      case 'low':
        return 'Priorité basse';
      default:
        return '';
    }
  }
  
  /**
   * Classes CSS pour le badge de priorité
   */
  get priorityBadgeClass(): Record<string, boolean> {
    if (!this.task.priority) return {};
    
    return {
      'bg-red-100 text-red-800': this.task.priority === 'high',
      'bg-yellow-100 text-yellow-800': this.task.priority === 'medium',
      'bg-blue-100 text-blue-800': this.task.priority === 'low'
    };
  }
  
  /**
   * Gère le changement d'état de la case à cocher
   */
  toggleCompleted(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    // Si la tâche est annulée, on ne peut pas changer son statut via la checkbox
    if (this.task.status === TaskStatus.CANCELLED) {
      // Remettre la checkbox dans son état précédent (cochée)
      checkbox.checked = true;
      return;
    }
    // Émettre le changement de statut
    this.statusChange.emit(checkbox.checked);
  }
}
