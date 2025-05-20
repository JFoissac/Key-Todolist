import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Task, TaskStatus } from '../../models/task.model';
import { TaskStore } from '../../store/task.store';
import { EventService } from '../../services/event.service';
import { DialogService } from '../../services/dialog.service';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-form.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly taskStore = inject(TaskStore);
  private readonly eventService = inject(EventService);
  private readonly dialogService = inject(DialogService);
  
  @Input() task?: Task | null;
  @Output() close = new EventEmitter<void>();
  
  taskForm!: FormGroup;
  editMode = false;
  
  // Propriétés pour le template
  formTitle = '';
  submitButtonText = '';
  showTitleError = false;
  
  // Options pour les sélecteurs
  statusOptions = [
    { value: TaskStatus.PENDING, label: 'À faire' },
    { value: TaskStatus.IN_PROGRESS, label: 'En cours' },
    { value: TaskStatus.COMPLETED, label: 'Terminée' },
    { value: TaskStatus.CANCELLED, label: 'Annulée' }
  ];
  
  priorityOptions = [
    { value: 'low', label: 'Faible' },
    { value: 'medium', label: 'Moyenne' },
    { value: 'high', label: 'Haute' }
  ];
  
  ngOnInit() {
    this.editMode = !!this.task;
    this.updateTemplateProperties();
    
    this.taskForm = this.fb.group({
      title: [this.task?.title ?? '', Validators.required],
      description: [this.task?.description ?? ''],
      status: [this.task?.status ?? TaskStatus.PENDING],
      priority: [this.task?.priority ?? 'medium'],
      dueDate: [this.task?.dueDate ? this.formatDateForInput(this.task.dueDate) : '']
    });
    
    // S'abonner aux changements du champ titre pour mettre à jour l'erreur
    this.taskForm.get('title')?.valueChanges.subscribe(() => {
      this.updateTitleError();
    });
    
    this.taskForm.get('title')?.statusChanges.subscribe(() => {
      this.updateTitleError();
    });
  }
  
  onSubmit() {
    if (this.taskForm.invalid) return;
    
    const formValue = this.taskForm.value;
    
    // Préparer la date d'échéance
    const dueDate = formValue.dueDate ? new Date(formValue.dueDate) : undefined;
    
    // Adapter les données du formulaire au modèle de tâche compatible avec le backend
    const taskData = {
      // Propriétés pour le backend
      label: formValue.title,
      description: formValue.description,
      completed: formValue.status === TaskStatus.COMPLETED,
      // Propriétés pour la compatibilité avec les composants existants
      title: formValue.title,
      status: formValue.status,
      priority: formValue.priority,
      dueDate
    };
    
    if (this.editMode && this.task?.id !== undefined) {
      this.taskStore.updateTask(this.task.id, taskData);
      // Notifier que la tâche a été mise à jour
      this.eventService.notifyTaskUpdated();
    } else {
      this.taskStore.addTask(taskData);
      // Notifier que la tâche a été ajoutée
      this.eventService.notifyTaskUpdated();
    }
    
    this.close.emit();
  }
  
  closeDialog() {
    this.close.emit();
  }
  
  /**
   * Met à jour les propriétés utilisées dans le template
   */
  private updateTemplateProperties() {
    this.formTitle = this.editMode ? 'Modifier la tâche' : 'Nouvelle tâche';
    this.submitButtonText = this.editMode ? 'Mettre à jour' : 'Créer';
  }
  
  /**
   * Met à jour l'état de l'erreur du titre
   */
  private updateTitleError() {
    const titleControl = this.taskForm.get('title');
    this.showTitleError = !!(titleControl?.invalid && titleControl?.touched);
  }
  
  private formatDateForInput(date: Date): string {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  }
}
