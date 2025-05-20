import { Injectable, computed, signal } from '@angular/core';
import { Task } from '../models/task.model';

export type DialogType = 'create' | 'edit' | 'none';

interface DialogState {
  isOpen: boolean;
  type: DialogType;
  task: Task | null;
}

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  private state = signal<DialogState>({
    isOpen: false,
    type: 'none',
    task: null
  });

  // Exposer uniquement la propriété isOpen comme un signal en lecture seule
  isOpen = computed(() => this.state().isOpen);

  openCreateDialog() {
    this.state.update(state => ({
      ...state,
      isOpen: true,
      type: 'create',
      task: null
    }));
  }

  openEditDialog(task: Task) {
    this.state.update(state => ({
      ...state,
      isOpen: true,
      type: 'edit',
      task
    }));
  }

  closeDialog() {
    this.state.update(state => ({
      ...state,
      isOpen: false,
      type: 'none',
      task: null
    }));
  }

  getDialogState() {
    return this.state();
  }
}
