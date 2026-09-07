import {
  Component,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  AdminMockDataService,
  AdminCategory,
} from '../../services/admin-mock-data.service';
import { AdminToastService } from '../../shared/services/admin-toast.service';
import { AdminModalComponent } from '../../shared/components/admin-modal/admin-modal.component';

export interface CategoryTreeNode extends AdminCategory {
  children: AdminCategory[];
}

export interface PresetImage {
  label: string;
  url: string;
}

@Component({
  selector: 'gp-admin-categories',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    AdminModalComponent,
  ],
  templateUrl: './admin-categories.component.html',
  styleUrls: ['./admin-categories.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCategoriesComponent {
  private readonly dataService = inject(AdminMockDataService);
  private readonly toastService = inject(AdminToastService);

  readonly categories = this.dataService.categories;

  // ── Filters & Search Signals ────────────────────────────────
  readonly searchQuery = signal<string>('');
  readonly statusFilter = signal<'All' | 'Active' | 'Hidden'>('All');

  // ── Tree Expansion Signals ──────────────────────────────────
  readonly expandedCategoryIds = signal<Set<string>>(
    new Set(['cat-audio', 'cat-peripherals', 'cat-power', 'cat-workspace', 'cat-wearables'])
  );

  // ── Drag & Drop Signals ─────────────────────────────────────
  readonly draggedCategoryId = signal<string | null>(null);
  readonly dragOverCategoryId = signal<string | null>(null);

  // ── Modal & Form Signals ────────────────────────────────────
  readonly isCategoryModalOpen = signal<boolean>(false);
  readonly isEditMode = signal<boolean>(false);
  readonly editingCategoryId = signal<string | null>(null);

  readonly formName = signal<string>('');
  readonly formSlug = signal<string>('');
  readonly formParentId = signal<string>(''); // empty string means Top-Level
  readonly formDescription = signal<string>('');
  readonly formImageUrl = signal<string>('');
  readonly formStatus = signal<'Active' | 'Hidden'>('Active');
  readonly formErrors = signal<Record<string, string>>({});

  // ── Delete Confirmation Signals ─────────────────────────────
  readonly isDeleteModalOpen = signal<boolean>(false);
  readonly categoryToDelete = signal<AdminCategory | null>(null);

  // Preset images for convenient selection
  readonly presetImages: PresetImage[] = [
    { label: 'Audio / Headphones', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&q=80' },
    { label: 'Earbuds', url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=200&q=80' },
    { label: 'Keyboards', url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=200&q=80' },
    { label: 'Precision Mice', url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=200&q=80' },
    { label: 'Power & Chargers', url: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=200&q=80' },
    { label: 'Smartwatches', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80' },
    { label: 'Workspace & Lamps', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&q=80' },
    { label: 'Docks & Hubs', url: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=200&q=80' },
  ];

  // ── Top-Level Categories for Parent Dropdown ────────────────
  readonly topLevelCategories = computed(() => {
    return this.categories().filter(c => c.parentId === null);
  });

  // ── Tree Construction & Reactive Pipeline ───────────────────
  readonly categoryTree = computed<CategoryTreeNode[]>(() => {
    const list = this.categories();
    const query = this.searchQuery().toLowerCase().trim();
    const status = this.statusFilter();

    // Map parents to their children
    const parentMap = new Map<string, AdminCategory[]>();
    list.forEach(c => {
      if (c.parentId) {
        if (!parentMap.has(c.parentId)) {
          parentMap.set(c.parentId, []);
        }
        parentMap.get(c.parentId)!.push(c);
      }
    });

    // Top level nodes sorted by displayOrder
    const roots = list
      .filter(c => c.parentId === null)
      .sort((a, b) => a.displayOrder - b.displayOrder);

    // Build tree
    const tree: CategoryTreeNode[] = roots.map(parent => {
      const children = (parentMap.get(parent.id) || []).sort(
        (a, b) => a.displayOrder - b.displayOrder
      );
      return {
        ...parent,
        children,
      };
    });

    // Apply filtering if active
    if (!query && status === 'All') {
      return tree;
    }

    return tree
      .map(node => {
        const parentMatchesQuery = !query ||
          node.name.toLowerCase().includes(query) ||
          node.slug.toLowerCase().includes(query) ||
          (node.description && node.description.toLowerCase().includes(query));

        const parentMatchesStatus = status === 'All' || node.status === status;

        const filteredChildren = node.children.filter(child => {
          const childMatchesQuery = !query ||
            child.name.toLowerCase().includes(query) ||
            child.slug.toLowerCase().includes(query) ||
            (child.description && child.description.toLowerCase().includes(query));

          const childMatchesStatus = status === 'All' || child.status === status;
          return childMatchesQuery && childMatchesStatus;
        });

        if (parentMatchesQuery && parentMatchesStatus) {
          return { ...node, children: filteredChildren };
        }

        if (filteredChildren.length > 0) {
          return { ...node, children: filteredChildren };
        }

        return null;
      })
      .filter((node): node is CategoryTreeNode => node !== null);
  });

  // ── Counters ────────────────────────────────────────────────
  readonly totalRootCount = computed(() => this.topLevelCategories().length);
  readonly totalSubCount = computed(() =>
    this.categories().filter(c => c.parentId !== null).length
  );
  readonly totalActiveCount = computed(() =>
    this.categories().filter(c => c.status === 'Active').length
  );
  readonly totalHiddenCount = computed(() =>
    this.categories().filter(c => c.status === 'Hidden').length
  );

  // ── Expand / Collapse Controls ──────────────────────────────
  isExpanded(id: string): boolean {
    return this.expandedCategoryIds().has(id);
  }

  toggleExpand(id: string, event?: Event): void {
    if (event) event.stopPropagation();
    const current = new Set(this.expandedCategoryIds());
    if (current.has(id)) {
      current.delete(id);
    } else {
      current.add(id);
    }
    this.expandedCategoryIds.set(current);
  }

  expandAll(): void {
    const allParentIds = this.topLevelCategories().map(c => c.id);
    this.expandedCategoryIds.set(new Set(allParentIds));
    this.toastService.info('Expanded all category branches');
  }

  collapseAll(): void {
    this.expandedCategoryIds.set(new Set());
    this.toastService.info('Collapsed all category branches');
  }

  // ── Status Toggle ───────────────────────────────────────────
  toggleStatus(category: AdminCategory, event?: Event): void {
    if (event) event.stopPropagation();
    this.dataService.toggleCategoryStatus(category.id);
    const newStatus = category.status === 'Active' ? 'Hidden' : 'Active';
    this.toastService.success(
      `Category "${category.name}" is now ${newStatus}.`
    );
  }

  // ── Accessible Reorder: Move Up & Move Down ─────────────────
  moveUp(category: AdminCategory, event?: Event): void {
    if (event) event.stopPropagation();
    const siblings = this.getSiblings(category);
    const index = siblings.findIndex(s => s.id === category.id);
    if (index <= 0) return; // Already at top

    const swapWith = siblings[index - 1];
    this.swapDisplayOrders(category, swapWith);
    this.toastService.info(`Moved "${category.name}" up.`);
  }

  moveDown(category: AdminCategory, event?: Event): void {
    if (event) event.stopPropagation();
    const siblings = this.getSiblings(category);
    const index = siblings.findIndex(s => s.id === category.id);
    if (index < 0 || index >= siblings.length - 1) return; // Already at bottom

    const swapWith = siblings[index + 1];
    this.swapDisplayOrders(category, swapWith);
    this.toastService.info(`Moved "${category.name}" down.`);
  }

  private getSiblings(category: AdminCategory): AdminCategory[] {
    return this.categories()
      .filter(c => c.parentId === category.parentId)
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }

  private swapDisplayOrders(catA: AdminCategory, catB: AdminCategory): void {
    const orderA = catA.displayOrder;
    const orderB = catB.displayOrder;
    this.dataService.updateCategory(catA.id, { displayOrder: orderB });
    this.dataService.updateCategory(catB.id, { displayOrder: orderA });
  }

  // ── Drag & Drop Handlers ────────────────────────────────────
  onDragStart(event: DragEvent, category: AdminCategory): void {
    this.draggedCategoryId.set(category.id);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', category.id);
    }
  }

  onDragOver(event: DragEvent, category: AdminCategory): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    const draggedId = this.draggedCategoryId();
    if (draggedId && draggedId !== category.id) {
      this.dragOverCategoryId.set(category.id);
    }
  }

  onDragLeave(event: DragEvent, category: AdminCategory): void {
    if (this.dragOverCategoryId() === category.id) {
      this.dragOverCategoryId.set(null);
    }
  }

  onDrop(event: DragEvent, targetCategory: AdminCategory): void {
    event.preventDefault();
    const draggedId = this.draggedCategoryId();
    if (!draggedId || draggedId === targetCategory.id) {
      this.onDragEnd();
      return;
    }

    const draggedCat = this.categories().find(c => c.id === draggedId);
    if (!draggedCat) {
      this.onDragEnd();
      return;
    }

    // Only allow reordering among siblings of the same parent
    if (draggedCat.parentId !== targetCategory.parentId) {
      this.toastService.warning('Drag reordering is supported among categories at the same depth.');
      this.onDragEnd();
      return;
    }

    const siblings = this.getSiblings(draggedCat);
    const draggedIndex = siblings.findIndex(s => s.id === draggedId);
    const targetIndex = siblings.findIndex(s => s.id === targetCategory.id);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      // Re-splice siblings
      const reordered = [...siblings];
      const [removed] = reordered.splice(draggedIndex, 1);
      reordered.splice(targetIndex, 0, removed);

      this.dataService.reorderCategories(reordered.map(c => c.id));
      this.toastService.success(`Reordered "${draggedCat.name}".`);
    }

    this.onDragEnd();
  }

  onDragEnd(): void {
    this.draggedCategoryId.set(null);
    this.dragOverCategoryId.set(null);
  }

  // ── Add / Edit Modal Controls ───────────────────────────────
  openAddModal(preselectedParentId?: string): void {
    this.isEditMode.set(false);
    this.editingCategoryId.set(null);
    this.formName.set('');
    this.formSlug.set('');
    this.formParentId.set(preselectedParentId || '');
    this.formDescription.set('');
    this.formImageUrl.set('');
    this.formStatus.set('Active');
    this.formErrors.set({});
    this.isCategoryModalOpen.set(true);
  }

  openEditModal(category: AdminCategory, event?: Event): void {
    if (event) event.stopPropagation();
    this.isEditMode.set(true);
    this.editingCategoryId.set(category.id);
    this.formName.set(category.name);
    this.formSlug.set(category.slug);
    this.formParentId.set(category.parentId || '');
    this.formDescription.set(category.description || '');
    this.formImageUrl.set(category.imageUrl || '');
    this.formStatus.set(category.status);
    this.formErrors.set({});
    this.isCategoryModalOpen.set(true);
  }

  closeCategoryModal(): void {
    this.isCategoryModalOpen.set(false);
    this.formErrors.set({});
  }

  onNameChange(name: string): void {
    this.formName.set(name);
    if (!this.isEditMode()) {
      // Auto-generate slug from name
      const slug = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      this.formSlug.set(slug);
    }
  }

  selectPresetImage(url: string): void {
    this.formImageUrl.set(url);
  }

  saveCategory(): void {
    const errors: Record<string, string> = {};
    const name = this.formName().trim();
    let slug = this.formSlug().trim();

    if (!name) {
      errors['name'] = 'Category name is required';
    }

    if (!slug) {
      slug = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    }

    if (Object.keys(errors).length > 0) {
      this.formErrors.set(errors);
      return;
    }

    const parentId = this.formParentId() ? this.formParentId() : null;
    const defaultImg = this.formImageUrl().trim() ||
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&q=80';

    if (this.isEditMode()) {
      const id = this.editingCategoryId();
      if (id) {
        this.dataService.updateCategory(id, {
          name,
          slug,
          parentId,
          description: this.formDescription().trim(),
          imageUrl: defaultImg,
          status: this.formStatus(),
        });
        this.toastService.success(`Category "${name}" updated successfully.`);
      }
    } else {
      const siblings = this.categories().filter(c => c.parentId === parentId);
      const newDisplayOrder = siblings.length + 1;

      const created = this.dataService.addCategory({
        name,
        slug,
        parentId,
        displayOrder: newDisplayOrder,
        description: this.formDescription().trim(),
        imageUrl: defaultImg,
        status: this.formStatus(),
      });

      // Auto-expand parent if subcategory was created
      if (parentId) {
        const expanded = new Set(this.expandedCategoryIds());
        expanded.add(parentId);
        this.expandedCategoryIds.set(expanded);
      }

      this.toastService.success(`Created category "${created.name}".`);
    }

    this.closeCategoryModal();
  }

  // ── Delete Confirmation ─────────────────────────────────────
  confirmDelete(category: AdminCategory, event?: Event): void {
    if (event) event.stopPropagation();
    this.categoryToDelete.set(category);
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen.set(false);
    this.categoryToDelete.set(null);
  }

  executeDelete(): void {
    const cat = this.categoryToDelete();
    if (!cat) return;

    this.dataService.deleteCategory(cat.id);
    this.toastService.success(`Category "${cat.name}" has been deleted.`);
    this.closeDeleteModal();
  }

  // Helper to count subcategories for delete dialog
  getSubcategoryCount(cat: AdminCategory): number {
    return this.categories().filter(c => c.parentId === cat.id).length;
  }
}
