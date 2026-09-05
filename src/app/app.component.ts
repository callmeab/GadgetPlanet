import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { RouterOutlet, Router, NavigationEnd, NavigationStart } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { HeaderComponent } from './layout/header/header.component';
import { FooterComponent } from './layout/footer/footer.component';
import { CartDrawerComponent } from './shared/components/cart-drawer/cart-drawer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, CartDrawerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  // Immediate sync signal
  private readonly _manualAdminState = signal<boolean>(
    typeof window !== 'undefined'
      ? window.location.pathname.includes('/admin') || window.location.href.includes('/admin')
      : false
  );

  private readonly navEvent = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd || e instanceof NavigationStart)
    )
  );

  readonly isAdminRoute = computed<boolean>(() => {
    // 1. Manual sync state
    if (this._manualAdminState()) return true;

    // 2. Active Router Navigation Event
    const event = this.navEvent();
    if (event && 'url' in event) {
      const url = ('urlAfterRedirects' in event ? event.urlAfterRedirects : null) || event.url;
      if (url && (url.startsWith('/admin') || url.includes('/admin'))) {
        return true;
      }
    }

    // 3. Router current URL
    if (this.router.url && (this.router.url.startsWith('/admin') || this.router.url.includes('/admin'))) {
      return true;
    }

    // 4. Browser window location fallback
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const hash = window.location.hash;
      return path.startsWith('/admin') || path.includes('/admin') || hash.includes('/admin');
    }

    return false;
  });

  constructor() {
    // Update manual signal and trigger immediate change detection on all navigation
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart || event instanceof NavigationEnd) {
        const url = ('urlAfterRedirects' in event ? event.urlAfterRedirects : null) || event.url;
        const isAdmin = url ? (url.startsWith('/admin') || url.includes('/admin')) : false;
        this._manualAdminState.set(isAdmin);
        this.cdr.markForCheck();
      }
    });

    // Synchronize global body / html attributes for absolute CSS-level suppression
    effect(() => {
      const isAdmin = this.isAdminRoute();
      if (typeof document !== 'undefined') {
        if (isAdmin) {
          document.body.classList.add('admin-page');
          document.documentElement.setAttribute('data-admin', 'true');
        } else {
          document.body.classList.remove('admin-page');
          document.documentElement.removeAttribute('data-admin');
        }
      }
    });
  }
}
