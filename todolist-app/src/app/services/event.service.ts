import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  // Sujet pour la notification d'ajout/mise à jour de tâche
  private readonly taskUpdatedSource = new Subject<void>();
  
  // Observable que les composants peuvent écouter
  taskUpdated$ = this.taskUpdatedSource.asObservable();
  
  // Méthode pour notifier qu'une tâche a été ajoutée ou mise à jour
  notifyTaskUpdated(): void {
    this.taskUpdatedSource.next();
  }
}
