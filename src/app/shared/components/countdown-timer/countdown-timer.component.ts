import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

@Component({
  selector: 'gp-countdown-timer',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './countdown-timer.component.html',
  styleUrl: './countdown-timer.component.scss',
})
export class CountdownTimerComponent implements OnInit, OnDestroy {
  /** ISO date string or Date for the target end time */
  @Input() targetDate!: string | Date;
  /** Duration in seconds (alternative to targetDate) */
  @Input() durationSeconds?: number;
  @Input() showDays = true;

  private intervalId?: ReturnType<typeof setInterval>;
  private endTime!: number;

  private readonly _timeLeft = signal<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  private readonly _isExpired = signal(false);

  readonly timeLeft = this._timeLeft.asReadonly();
  readonly isExpired = this._isExpired.asReadonly();

  ngOnInit(): void {
    if (this.durationSeconds !== undefined) {
      this.endTime = Date.now() + this.durationSeconds * 1000;
    } else if (this.targetDate) {
      this.endTime = new Date(this.targetDate).getTime();
    } else {
      this.endTime = Date.now() + 24 * 60 * 60 * 1000;
    }

    this.tick();
    this.intervalId = setInterval(() => this.tick(), 1000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private tick(): void {
    const remaining = Math.max(0, this.endTime - Date.now());
    if (remaining <= 0) {
      this._isExpired.set(true);
      this._timeLeft.set({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      if (this.intervalId) clearInterval(this.intervalId);
      return;
    }

    const totalSeconds = Math.floor(remaining / 1000);
    const days    = Math.floor(totalSeconds / 86400);
    const hours   = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    this._timeLeft.set({ days, hours, minutes, seconds });
  }
}
