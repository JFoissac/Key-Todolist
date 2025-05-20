import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskStore } from '../../store/task.store';
import { TaskStatus } from '../../models/task.model';

// Type pour les valeurs de filtre
type FilterValue = TaskStatus | 'all';

@Component({
  selector: 'app-task-filter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-filter.component.html',
  styles: []
})
export class TaskFilterComponent {
  private readonly taskStore = inject(TaskStore);
  
  // Propriété signal pour accéder au filtre actuel
  private readonly currentFilter = this.taskStore.filter;
  
  // Options de filtres disponibles
  filters: Array<{ label: string; value: FilterValue }> = [
    { label: 'Toutes', value: 'all' },
    { label: 'À faire', value: TaskStatus.PENDING },
    { label: 'En cours', value: TaskStatus.IN_PROGRESS },
    { label: 'Terminées', value: TaskStatus.COMPLETED },
    { label: 'Annulées', value: TaskStatus.CANCELLED }
  ];
  
  /**
   * Définit les classes CSS pour un bouton de filtre en fonction de son état actif/inactif
   */
  getFilterButtonClass(filterValue: FilterValue): Record<string, boolean> {
    const isActive = this.currentFilter() === filterValue;
    return {
      'bg-blue-500': isActive,
      'text-white': isActive,
      'bg-gray-100': !isActive,
      'text-gray-700': !isActive
    };
  }
  
  /**
   * Définit le filtre actif
   */
  setFilter(filter: FilterValue): void {
    this.taskStore.setFilter(filter);
  }
}
