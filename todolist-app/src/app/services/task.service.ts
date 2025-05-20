import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, map, catchError, throwError, switchMap } from 'rxjs';
import { Task, TaskStatus, TaskStatusUpdate, TaskCompletionUpdate, adaptTaskForUI, adaptTaskForBackend } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/tasks'; // URL de l'API Spring Boot

  /**
   * Gère les erreurs HTTP et les transforme en messages d'erreur utilisables
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = '';
    
    if (error.status === 0) {
      // Une erreur côté client ou un problème réseau
      errorMessage = `Erreur réseau: ${error.error}`;
      console.error('Une erreur de connexion est survenue:', error.error);
    } else if (error.status === 404) {
      // Ressource non trouvée
      errorMessage = `Ressource non trouvée: ${error.error.message ?? 'La tâche demandée n\'existe pas'}`;
    } else if (error.status === 400) {
      // Requête incorrecte
      errorMessage = `Requête incorrecte: ${error.error.message ?? 'Données invalides'}`;
    } else {
      // Erreur côté serveur
      errorMessage = `Erreur ${error.status}: ${error.error.message ?? error.statusText}`;
      console.error(`API a retourné le code ${error.status}:`, error.error);
    }
    
    // Retourne un Observable avec un message d'erreur convivial
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Récupère toutes les tâches
   */
  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl).pipe(
      map(tasks => tasks.map(task => adaptTaskForUI(task))),
      catchError(this.handleError)
    );
  }

  /**
   * Récupère uniquement les tâches non complétées
   */
  getIncompleteTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/incomplete`).pipe(
      map(tasks => tasks.map(task => adaptTaskForUI(task))),
      catchError(this.handleError)
    );
  }

  /**
   * Récupère une tâche par son ID
   */
  getTaskById(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/${id}`).pipe(
      map(task => adaptTaskForUI(task)),
      catchError(this.handleError)
    );
  }

  /**
   * Crée une nouvelle tâche
   */
  createTask(task: Omit<Task, 'id'>): Observable<Task> {
    const backendTask = adaptTaskForBackend(task as Task);
    return this.http.post<Task>(this.apiUrl, backendTask).pipe(
      map(task => adaptTaskForUI(task)),
      catchError(this.handleError)
    );
  }

  /**
   * Met à jour le statut d'une tâche avec un statut spécifique
   */
  updateTaskStatus(id: number, status: TaskStatus): Observable<Task> {
    const statusUpdate: TaskStatusUpdate = { status };
    return this.http.patch<Task>(`${this.apiUrl}/${id}/status`, statusUpdate).pipe(
      map(task => adaptTaskForUI(task)),
      catchError(this.handleError)
    );
  }
  
  /**
   * Met à jour le statut de complétion d'une tâche (complétée ou non)
   * @deprecated Utiliser updateTaskStatus avec un statut spécifique à la place
   */
  updateTaskCompletionStatus(id: number, completed: boolean): Observable<Task> {
    const completionUpdate: TaskCompletionUpdate = { completed };
    return this.http.patch<Task>(`${this.apiUrl}/${id}/completion`, completionUpdate).pipe(
      map(task => adaptTaskForUI(task)),
      catchError(this.handleError)
    );
  }
  
  /**
   * Met à jour une tâche
   */
  updateTask(id: number, updates: Partial<Task>): Observable<Task> {
    const backendUpdates = adaptTaskForBackend(updates as Task);
    
    // Utiliser le nouvel endpoint PATCH pour la mise à jour complète
    // Nous devons d'abord récupérer la tâche existante pour la mettre à jour
    return this.getTaskById(id).pipe(
      map(existingTask => {
        // Fusionner les données existantes avec les mises à jour
        const updatedTask = {
          ...existingTask,
          ...backendUpdates,
          id // S'assurer que l'ID est préservé
        };
        
        // Appeler l'endpoint PATCH pour la mise à jour complète
        return this.http.patch<Task>(`${this.apiUrl}/${id}/update`, updatedTask).pipe(
          map(task => adaptTaskForUI(task)),
          catchError(this.handleError)
        );
      }),
      switchMap(observable => observable),
      catchError(this.handleError)
    );
  }
  
  /**
   * Supprime une tâche
   */
  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }
}
