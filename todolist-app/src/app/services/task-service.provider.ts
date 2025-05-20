import { Provider } from '@angular/core';
import { TaskService } from './task.service';
import { MockTaskService } from './mock-task.service';

// Utilisez cette constante pour basculer entre le service réel et le service mockée
export const USE_MOCK_SERVICE = false;

export const taskServiceProvider: Provider = {
  provide: TaskService,
  useClass: USE_MOCK_SERVICE ? MockTaskService : TaskService
};
