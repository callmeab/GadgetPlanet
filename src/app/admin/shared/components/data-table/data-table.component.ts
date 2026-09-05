import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
  TemplateRef,
  ContentChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface DataTableColumn {
  key: string;
  title: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

@Component({
  selector: 'gp-admin-data-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss',
})
export class DataTableComponent {
  // Inputs
  readonly columns = input.required<DataTableColumn[]>();
  readonly data = input.required<any[]>();
  readonly keyField = input<string>('id');
  readonly selectable = input<boolean>(true);
  readonly searchPlaceholder = input<string>('Filter records...');
  readonly initialPageSize = input<number>(10);
  readonly emptyMessage = input<string>('No records found.');

  // Custom template slots
  @ContentChild('customCell') customCellTemplate?: TemplateRef<any>;

  // Outputs
  readonly rowClick = output<any>();
  readonly selectionChange = output<any[]>();
  readonly bulkAction = output<{ action: string; selectedRows: any[] }>();

  // Internal Signals
  readonly searchQuery = signal<string>('');
  readonly sortColumn = signal<string | null>(null);
  readonly sortDirection = signal<'asc' | 'desc'>('asc');
  readonly currentPage = signal<number>(1);
  readonly pageSize = signal<number>(10);
  readonly selectedIds = signal<Set<string | number>>(new Set());

  // Available page size options
  readonly pageSizeOptions = [5, 10, 20, 50];

  // ── Reactive Pipeline ───────────────────────────────────────

  // 1. Search Filter
  readonly filteredData = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const rows = this.data();
    if (!query) return rows;

    return rows.filter(row => {
      return Object.values(row).some(val => {
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(query);
      });
    });
  });

  // 2. Column Sorting
  readonly sortedData = computed(() => {
    const col = this.sortColumn();
    const dir = this.sortDirection();
    const items = [...this.filteredData()];

    if (!col) return items;

    return items.sort((a, b) => {
      const valA = a[col];
      const valB = b[col];

      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      let comparison = 0;
      if (typeof valA === 'number' && typeof valB === 'number') {
        comparison = valA - valB;
      } else if (valA instanceof Date && valB instanceof Date) {
        comparison = valA.getTime() - valB.getTime();
      } else {
        comparison = String(valA).localeCompare(String(valB), undefined, {
          numeric: true,
          sensitivity: 'base',
        });
      }

      return dir === 'asc' ? comparison : -comparison;
    });
  });

  // 3. Pagination
  readonly totalItems = computed(() => this.sortedData().length);
  readonly totalPages = computed(() => {
    return Math.max(1, Math.ceil(this.totalItems() / this.pageSize()));
  });

  readonly paginatedData = computed(() => {
    const page = Math.min(this.currentPage(), this.totalPages());
    const size = this.pageSize();
    const start = (page - 1) * size;
    return this.sortedData().slice(start, start + size);
  });

  readonly startIndex = computed(() => {
    if (this.totalItems() === 0) return 0;
    return (this.currentPage() - 1) * this.pageSize() + 1;
  });

  readonly endIndex = computed(() => {
    return Math.min(this.currentPage() * this.pageSize(), this.totalItems());
  });

  // 4. Selection State
  readonly isAllSelected = computed(() => {
    const currentRows = this.paginatedData();
    if (currentRows.length === 0) return false;
    const selected = this.selectedIds();
    const key = this.keyField();
    return currentRows.every(r => selected.has(r[key]));
  });

  readonly isSomeSelected = computed(() => {
    const currentRows = this.paginatedData();
    if (currentRows.length === 0) return false;
    const selected = this.selectedIds();
    const key = this.keyField();
    const some = currentRows.some(r => selected.has(r[key]));
    return some && !this.isAllSelected();
  });

  readonly selectedCount = computed(() => this.selectedIds().size);

  // ── Actions ─────────────────────────────────────────────────

  toggleSort(columnKey: string, sortable?: boolean): void {
    if (sortable === false) return;

    if (this.sortColumn() === columnKey) {
      if (this.sortDirection() === 'asc') {
        this.sortDirection.set('desc');
      } else {
        // Reset sort
        this.sortColumn.set(null);
        this.sortDirection.set('asc');
      }
    } else {
      this.sortColumn.set(columnKey);
      this.sortDirection.set('asc');
    }
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
    this.currentPage.set(1); // reset to first page on search
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.currentPage.set(1);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  nextPage(): void {
    this.goToPage(this.currentPage() + 1);
  }

  prevPage(): void {
    this.goToPage(this.currentPage() - 1);
  }

  onPageSizeChange(event: Event): void {
    const size = Number((event.target as HTMLSelectElement).value);
    this.pageSize.set(size);
    this.currentPage.set(1);
  }

  toggleSelectAll(): void {
    const key = this.keyField();
    const currentRows = this.paginatedData();
    const currentSelected = new Set(this.selectedIds());

    if (this.isAllSelected()) {
      // Deselect all on current page
      currentRows.forEach(r => currentSelected.delete(r[key]));
    } else {
      // Select all on current page
      currentRows.forEach(r => currentSelected.add(r[key]));
    }

    this.selectedIds.set(currentSelected);
    this.emitSelection();
  }

  toggleSelectRow(row: any, event: Event): void {
    event.stopPropagation();
    const key = this.keyField();
    const id = row[key];
    const currentSelected = new Set(this.selectedIds());

    if (currentSelected.has(id)) {
      currentSelected.delete(id);
    } else {
      currentSelected.add(id);
    }

    this.selectedIds.set(currentSelected);
    this.emitSelection();
  }

  isRowSelected(row: any): boolean {
    const key = this.keyField();
    return this.selectedIds().has(row[key]);
  }

  onRowClicked(row: any): void {
    this.rowClick.emit(row);
  }

  clearAllSelected(): void {
    this.selectedIds.set(new Set());
    this.emitSelection();
  }

  triggerBulkAction(action: string): void {
    const key = this.keyField();
    const selected = this.selectedIds();
    const selectedRows = this.data().filter(r => selected.has(r[key]));
    this.bulkAction.emit({ action, selectedRows });
  }

  private emitSelection(): void {
    const key = this.keyField();
    const selected = this.selectedIds();
    const selectedRows = this.data().filter(r => selected.has(r[key]));
    this.selectionChange.emit(selectedRows);
  }
}
