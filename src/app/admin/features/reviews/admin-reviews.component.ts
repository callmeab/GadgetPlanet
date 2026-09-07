import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AdminMockDataService,
  AdminReview,
  ReviewStatus,
} from '../../services/admin-mock-data.service';
import { AdminModalComponent } from '../../shared/components/admin-modal/admin-modal.component';
import { StatusPillComponent } from '../../shared/components/status-pill/status-pill.component';

@Component({
  selector: 'gp-admin-reviews',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AdminModalComponent,
    StatusPillComponent,
  ],
  templateUrl: './admin-reviews.component.html',
  styleUrls: ['./admin-reviews.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminReviewsComponent {
  private readonly mockData = inject(AdminMockDataService);

  readonly reviews = this.mockData.reviews;

  // ── Filters, Search & Tabs ──────────────────────────────────
  readonly searchQuery = signal<string>('');
  readonly ratingFilter = signal<string>('all');
  readonly activeStatusTab = signal<string>('All');
  readonly statusTabs = ['All', 'Published', 'Pending', 'Flagged'] as const;

  // ── Sorting & Pagination ────────────────────────────────────
  readonly sortField = signal<'date' | 'rating' | 'product' | 'customer' | 'status'>('date');
  readonly sortOrder = signal<'asc' | 'desc'>('desc');
  readonly currentPage = signal<number>(1);
  readonly pageSize = signal<number>(10);
  readonly pageSizeOptions = [5, 10, 20, 50];

  // ── Selection State ─────────────────────────────────────────
  readonly selectedReviewIds = signal<Set<string>>(new Set());

  // ── Modal State ─────────────────────────────────────────────
  readonly isDetailModalOpen = signal<boolean>(false);
  readonly selectedReview = signal<AdminReview | null>(null);
  readonly replyDraft = signal<string>('');
  readonly isReplying = signal<boolean>(false);
  readonly deleteTarget = signal<AdminReview | null>(null);

  // ── 4-KPI Metrics Computation ───────────────────────────────
  readonly kpiMetrics = computed(() => {
    const list = this.reviews();
    const totalReviews = list.length;
    const pendingCount = list.filter(r => r.status === 'Pending').length;
    const flaggedCount = list.filter(r => r.status === 'Flagged').length;

    const published = list.filter(r => r.status === 'Published');
    const totalRatingSum = published.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = published.length > 0 ? (totalRatingSum / published.length).toFixed(1) : '5.0';

    return {
      totalReviews,
      avgRating,
      pendingCount,
      flaggedCount,
    };
  });

  // ── Tab Counts ──────────────────────────────────────────────
  readonly tabCounts = computed(() => {
    const list = this.reviews();
    return {
      All: list.length,
      Published: list.filter(r => r.status === 'Published').length,
      Pending: list.filter(r => r.status === 'Pending').length,
      Flagged: list.filter(r => r.status === 'Flagged').length,
    };
  });

  // ── Filtered & Sorted Reviews ───────────────────────────────
  readonly filteredReviews = computed(() => {
    let result = [...this.reviews()];
    const query = this.searchQuery().toLowerCase().trim();
    const rating = this.ratingFilter();
    const tab = this.activeStatusTab();

    // 1. Status Tab filter
    if (tab !== 'All') {
      result = result.filter(r => r.status === tab);
    }

    // 2. Rating filter
    if (rating !== 'all') {
      const numRating = parseInt(rating, 10);
      result = result.filter(r => r.rating === numRating);
    }

    // 3. Search query filter
    if (query) {
      result = result.filter(
        r =>
          r.customerName.toLowerCase().includes(query) ||
          r.productName.toLowerCase().includes(query) ||
          r.title.toLowerCase().includes(query) ||
          r.comment.toLowerCase().includes(query) ||
          (r.customerEmail && r.customerEmail.toLowerCase().includes(query))
      );
    }

    // 4. Sorting
    const field = this.sortField();
    const order = this.sortOrder();
    const multiplier = order === 'asc' ? 1 : -1;

    result.sort((a, b) => {
      if (field === 'date') {
        return a.date.localeCompare(b.date) * multiplier;
      }
      if (field === 'rating') {
        return (a.rating - b.rating) * multiplier;
      }
      if (field === 'product') {
        return a.productName.localeCompare(b.productName) * multiplier;
      }
      if (field === 'customer') {
        return a.customerName.localeCompare(b.customerName) * multiplier;
      }
      if (field === 'status') {
        return a.status.localeCompare(b.status) * multiplier;
      }
      return 0;
    });

    return result;
  });

  // ── Pagination Computations ─────────────────────────────────
  readonly totalPages = computed(() => {
    const total = this.filteredReviews().length;
    return Math.max(1, Math.ceil(total / this.pageSize()));
  });

  readonly paginatedReviews = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredReviews().slice(start, start + this.pageSize());
  });

  readonly paginationStartIndex = computed(() => {
    if (this.filteredReviews().length === 0) return 0;
    return (this.currentPage() - 1) * this.pageSize() + 1;
  });

  readonly paginationEndIndex = computed(() => {
    return Math.min(
      this.currentPage() * this.pageSize(),
      this.filteredReviews().length
    );
  });

  readonly pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    const maxVisible = 5;

    let start = Math.max(1, current - 2);
    let end = Math.min(total, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  });

  // ── Selection Computations ──────────────────────────────────
  readonly selectedCount = computed(() => this.selectedReviewIds().size);

  readonly isAllSelected = computed(() => {
    const currentList = this.paginatedReviews();
    if (currentList.length === 0) return false;
    const selected = this.selectedReviewIds();
    return currentList.every(r => selected.has(r.id));
  });

  readonly isIndeterminate = computed(() => {
    const currentList = this.paginatedReviews();
    if (currentList.length === 0) return false;
    const selected = this.selectedReviewIds();
    const someSelected = currentList.some(r => selected.has(r.id));
    return someSelected && !this.isAllSelected();
  });

  // ── Filter & Search Handlers ────────────────────────────────
  onSearchInput(val: string): void {
    this.searchQuery.set(val);
    this.currentPage.set(1);
  }

  onRatingFilterChange(val: string): void {
    this.ratingFilter.set(val);
    this.currentPage.set(1);
  }

  setStatusTab(tab: string): void {
    this.activeStatusTab.set(tab);
    this.currentPage.set(1);
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.ratingFilter.set('all');
    this.activeStatusTab.set('All');
    this.currentPage.set(1);
  }

  // ── Sorting Handlers ────────────────────────────────────────
  toggleSort(field: 'date' | 'rating' | 'product' | 'customer' | 'status'): void {
    if (this.sortField() === field) {
      this.sortOrder.update(o => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortField.set(field);
      this.sortOrder.set('desc');
    }
    this.currentPage.set(1);
  }

  // ── Pagination Handlers ─────────────────────────────────────
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
  }

  // ── Selection Handlers ──────────────────────────────────────
  toggleSelectAll(): void {
    const currentList = this.paginatedReviews();
    const selected = new Set(this.selectedReviewIds());
    if (this.isAllSelected()) {
      currentList.forEach(r => selected.delete(r.id));
    } else {
      currentList.forEach(r => selected.add(r.id));
    }
    this.selectedReviewIds.set(selected);
  }

  toggleSelectOne(id: string): void {
    const selected = new Set(this.selectedReviewIds());
    if (selected.has(id)) {
      selected.delete(id);
    } else {
      selected.add(id);
    }
    this.selectedReviewIds.set(selected);
  }

  deselectAll(): void {
    this.selectedReviewIds.set(new Set());
  }

  // ── Moderation Actions (Approve / Flag / Reject / Delete) ───
  approveReview(id: string, event?: MouseEvent): void {
    if (event) event.stopPropagation();
    this.mockData.approveReview(id);
    // If viewing in modal, update modal state
    if (this.selectedReview()?.id === id) {
      const updated = this.reviews().find(r => r.id === id);
      if (updated) this.selectedReview.set(updated);
    }
  }

  flagReview(id: string, reason?: string, event?: MouseEvent): void {
    if (event) event.stopPropagation();
    this.mockData.flagReview(id, reason || 'Flagged by administrator for review');
    if (this.selectedReview()?.id === id) {
      const updated = this.reviews().find(r => r.id === id);
      if (updated) this.selectedReview.set(updated);
    }
  }

  promptDelete(review: AdminReview, event?: MouseEvent): void {
    if (event) event.stopPropagation();
    this.deleteTarget.set(review);
  }

  cancelDelete(): void {
    this.deleteTarget.set(null);
  }

  confirmDelete(): void {
    const target = this.deleteTarget();
    if (target) {
      this.mockData.deleteReview(target.id);
      const selected = new Set(this.selectedReviewIds());
      selected.delete(target.id);
      this.selectedReviewIds.set(selected);
      if (this.selectedReview()?.id === target.id) {
        this.closeDetailModal();
      }
      this.deleteTarget.set(null);
    }
  }

  // ── Bulk Actions ────────────────────────────────────────────
  bulkApprove(): void {
    const ids = Array.from(this.selectedReviewIds());
    this.mockData.bulkApproveReviews(ids);
    this.deselectAll();
  }

  bulkFlag(): void {
    const ids = Array.from(this.selectedReviewIds());
    this.mockData.bulkFlagReviews(ids, 'Bulk flagged by administrator');
    this.deselectAll();
  }

  bulkDelete(): void {
    const ids = Array.from(this.selectedReviewIds());
    this.mockData.bulkDeleteReviews(ids);
    this.deselectAll();
  }

  // ── Detail & Reply Modal Handlers ───────────────────────────
  openDetailModal(review: AdminReview, event?: MouseEvent): void {
    if (event) event.stopPropagation();
    this.selectedReview.set(review);
    this.replyDraft.set(review.adminReply?.comment || '');
    this.isReplying.set(false);
    this.isDetailModalOpen.set(true);
  }

  closeDetailModal(): void {
    this.isDetailModalOpen.set(false);
    this.selectedReview.set(null);
    this.replyDraft.set('');
  }

  submitStaffReply(): void {
    const current = this.selectedReview();
    const text = this.replyDraft().trim();
    if (!current || !text) return;
    this.mockData.replyToReview(current.id, text);
    // Refresh modal review view
    const updated = this.reviews().find(r => r.id === current.id);
    if (updated) this.selectedReview.set(updated);
    this.isReplying.set(false);
  }

  // ── Presentation Helpers ────────────────────────────────────
  getStars(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => i + 1);
  }

  getInitials(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
}
