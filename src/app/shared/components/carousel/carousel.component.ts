import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  signal,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'gp-carousel',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.scss',
})
export class CarouselComponent implements AfterViewInit, OnDestroy {
  @Input() id = 'carousel';
  @Input() visibleSlides = 1;
  @Input() gap = 16;
  @Input() loop = false;
  @Input() autoPlay = false;
  @Input() autoPlayInterval = 4000;
  @Input() showArrows = true;
  @Input() showDots = true;

  readonly currentIndex = signal(0);
  totalSlides = 0;
  private autoPlayTimer?: ReturnType<typeof setInterval>;

  get slideWidthPercent(): number {
    return 100 / this.visibleSlides;
  }

  get totalDots(): number {
    return Math.max(0, this.totalSlides - this.visibleSlides + 1);
  }

  get dotsArray(): number[] {
    return Array.from({ length: this.totalDots });
  }

  @ViewChild('track') trackRef!: ElementRef<HTMLElement>;

  ngAfterViewInit(): void {
    this.countSlides();
    if (this.autoPlay) {
      this.startAutoPlay();
    }
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
  }

  private countSlides(): void {
    if (this.trackRef) {
      this.totalSlides = this.trackRef.nativeElement.children.length;
    }
  }

  next(): void {
    const max = Math.max(0, this.totalSlides - this.visibleSlides);
    if (this.currentIndex() < max) {
      this.currentIndex.update(i => i + 1);
    } else if (this.loop) {
      this.currentIndex.set(0);
    }
  }

  prev(): void {
    if (this.currentIndex() > 0) {
      this.currentIndex.update(i => i - 1);
    } else if (this.loop) {
      this.currentIndex.set(Math.max(0, this.totalSlides - this.visibleSlides));
    }
  }

  goTo(index: number): void {
    this.currentIndex.set(index);
  }

  private startAutoPlay(): void {
    this.autoPlayTimer = setInterval(() => this.next(), this.autoPlayInterval);
  }

  private stopAutoPlay(): void {
    if (this.autoPlayTimer) {
      clearInterval(this.autoPlayTimer);
    }
  }
}
