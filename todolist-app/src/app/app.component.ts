import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TaskListComponent } from './components/task-list/task-list.component';
import { TaskDetailComponent } from './components/task-detail/task-detail.component';
import { PomodoroComponent } from './components/pomodoro/pomodoro.component';
import { DialogService } from './services/dialog.service';
import { TaskDialogComponent } from './components/task-dialog/task-dialog.component';
import { TaskStore } from './store/task.store';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, 
    CommonModule,
    TaskListComponent,
    TaskDetailComponent,
    PomodoroComponent,
    TaskDialogComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'todolist-app';
  currentYear = new Date().getFullYear();
  
  // Injecter le service de dialogue pour qu'il soit disponible dans l'application
  private readonly dialogService = inject(DialogService);
  
  // Injecter le store des tâches pour accéder à la tâche sélectionnée
  readonly taskStore = inject(TaskStore);
  
  // Vérifier si une tâche est sélectionnée
  get hasSelectedTask(): boolean {
    return this.taskStore.selectedTaskId() !== null;
  }
}
