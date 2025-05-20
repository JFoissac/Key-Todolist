export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

// Modèle adapté pour être compatible avec le backend Spring Boot et les composants existants
export interface Task {
  // Propriétés du backend
  id?: number;
  label: string;
  description: string;
  status: TaskStatus;
  
  // Propriétés pour la compatibilité avec les composants existants
  title?: string;
  createdAt?: Date;
  updatedAt?: Date;
  dueDate?: Date;
  priority?: 'low' | 'medium' | 'high';
  
  /**
   * @deprecated Utiliser status au lieu de completed
   */
  completed?: boolean;
}

// Interface pour la mise à jour du statut
export interface TaskStatusUpdate {
  status: string;
}

// Interface pour la mise à jour de la complétion (pour la rétrocompatibilité)
export interface TaskCompletionUpdate {
  completed: boolean;
}

// Fonctions utilitaires pour la conversion entre les modèles
export function adaptTaskForUI(task: Task): Task {
  // S'assurer que le statut est toujours défini
  const status = task.status ?? TaskStatus.PENDING;
  
  return {
    ...task,
    title: task.label,
    status: status,
    // Pour la rétrocompatibilité
    completed: status === TaskStatus.COMPLETED
  };
}

export function adaptTaskForBackend(task: Task): Task {
  // Déterminer le statut en fonction des données disponibles
  let status = task.status;
  if (!status && task.completed !== undefined) {
    // Rétrocompatibilité
    status = task.completed ? TaskStatus.COMPLETED : TaskStatus.PENDING;
  }
  
  return {
    id: task.id,
    label: task.title ?? task.label,
    description: task.description,
    status: status ?? TaskStatus.PENDING,
    priority: task.priority // Ajouter la priorité pour qu'elle soit envoyée au backend
  };
}
