import { Component, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { interval, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TaskStore } from '../../store/task.store';

enum PomodoroState {
  IDLE = 'idle',
  WORK = 'work',
  BREAK = 'break'
}

@Component({
  selector: 'app-pomodoro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pomodoro.component.html',
  styles: []
})
export class PomodoroComponent implements OnDestroy {
  private readonly taskStore = inject(TaskStore);
  private destroy$ = new Subject<void>();
  private timer: any;
  
  // Settings
  // Default values
  workDuration = 25; // minutes
  breakDuration = 5; // minutes
  targetSessions = 4;
  
  // State
  state = signal<PomodoroState>(PomodoroState.IDLE);
  timeLeft = signal(this.workDuration * 60);
  isPaused = signal(false);
  completedSessions = signal(0);
  
  // Selected task
  private readonly selectedTask = this.taskStore.selectedTask;
  
  // Propriétés pour le template
  get hasSelectedTask(): boolean {
    return !!this.selectedTask();
  }
  
  get taskTitle(): string {
    return this.selectedTask()?.title ?? '';
  }
  
  get isIdle(): boolean {
    return this.state() === PomodoroState.IDLE;
  }
  
  get formattedTimeLeft(): string {
    return this.formatTime(this.timeLeft());
  }
  
  get stateLabel(): string {
    switch (this.state()) {
      case PomodoroState.WORK:
        return 'Temps de travail';
      case PomodoroState.BREAK:
        return 'Temps de pause';
      default:
        return 'Prêt à commencer';
    }
  }
  
  get pauseButtonText(): string {
    return this.isPaused() ? 'Reprendre' : 'Pause';
  }
  
  get completedSessionsCount(): number {
    return this.completedSessions();
  }
  
  get progressPercentage(): number {
    return (this.completedSessions() / this.targetSessions) * 100;
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.stopTimer();
  }
  
  startPomodoro(): void {
    this.state.set(PomodoroState.WORK);
    this.timeLeft.set(this.workDuration * 60);
    this.isPaused.set(false);
    this.startTimer();
  }
  
  stopPomodoro(): void {
    this.state.set(PomodoroState.IDLE);
    this.timeLeft.set(this.workDuration * 60);
    this.isPaused.set(false);
    this.stopTimer();
  }
  
  pauseResumePomodoro(): void {
    if (this.isPaused()) {
      this.isPaused.set(false);
      this.startTimer();
    } else {
      this.isPaused.set(true);
      this.stopTimer();
    }
  }
  
  private startTimer(): void {
    this.stopTimer();
    
    this.timer = interval(1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.timeLeft() > 0) {
          this.timeLeft.update(time => time - 1);
        } else {
          this.handleTimerComplete();
        }
      });
  }
  
  private stopTimer(): void {
    if (this.timer) {
      this.timer.unsubscribe();
      this.timer = null;
    }
  }
  
  private handleTimerComplete(): void {
    if (this.state() === PomodoroState.WORK) {
      // Work session completed
      this.completedSessions.update(sessions => sessions + 1);
      
      // Check if all sessions completed
      if (this.completedSessions() >= this.targetSessions) {
        this.stopPomodoro();
        alert('Félicitations ! Vous avez terminé toutes vos sessions Pomodoro.');
        return;
      }
      
      // Start break
      this.state.set(PomodoroState.BREAK);
      this.timeLeft.set(this.breakDuration * 60);
      this.startTimer();
      
    } else if (this.state() === PomodoroState.BREAK) {
      
      // Start next work session
      this.state.set(PomodoroState.WORK);
      this.timeLeft.set(this.workDuration * 60);
      this.startTimer();
    }
  }
  
  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
}
