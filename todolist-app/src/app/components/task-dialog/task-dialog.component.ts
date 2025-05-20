import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogService } from '../../services/dialog.service';
import { TaskFormComponent } from '../task-form/task-form.component';

@Component({
  selector: 'app-task-dialog',
  standalone: true,
  imports: [CommonModule, TaskFormComponent],
  templateUrl: './task-dialog.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskDialogComponent {
  readonly dialogService = inject(DialogService);
  
  // Propriétés pour le template
  get isDialogOpen(): boolean {
    return this.dialogService.isOpen();
  }
  
  get taskForForm() {
    return this.dialogState.type === 'edit' ? this.dialogState.task : undefined;
  }
  
  private get dialogState() {
    return this.dialogService.getDialogState();
  }
  
  closeDialog() {
    this.dialogService.closeDialog();
  }
  
  handleFormClose() {
    // Utiliser setTimeout pour s'assurer que la fermeture se produit après la fin du cycle de détection de changements
    setTimeout(() => {
      this.dialogService.closeDialog();
    }, 0);
  }
  
  getTaskForForm() {
    // Return undefined instead of null when not in edit mode
    return this.dialogState.type === 'edit' ? this.dialogState.task : undefined;
  }
}
