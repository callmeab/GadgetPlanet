import {
  Component,
  inject,
  signal,
  computed,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  AdminMockDataService,
  AdminProduct,
  AdminProductMedia,
  ProductVariant,
  ProductVariantOption,
} from '../../../services/admin-mock-data.service';
import { AdminToastService } from '../../../shared/services/admin-toast.service';
import { StatusPillComponent } from '../../../shared/components/status-pill/status-pill.component';

@Component({
  selector: 'gp-admin-product-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    CurrencyPipe,
    StatusPillComponent,
  ],
  templateUrl: './admin-product-edit.component.html',
  styleUrls: ['./admin-product-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminProductEditComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dataService = inject(AdminMockDataService);
  private readonly toastService = inject(AdminToastService);

  private formSub?: Subscription;

  // ── Route & Edit State ────────────────────────────────────────
  readonly isEditMode = signal<boolean>(false);
  readonly productId = signal<string | null>(null);
  readonly isDirty = signal<boolean>(false);
  readonly isSaving = signal<boolean>(false);
  readonly isDraggingMedia = signal<boolean>(false);

  // ── Form Model ────────────────────────────────────────────────
  readonly form: FormGroup = this.initForm();

  // ── Dynamic Sections State ────────────────────────────────────
  readonly mediaList = signal<AdminProductMedia[]>([]);
  readonly tags = signal<string[]>([]);
  readonly variantOptions = signal<ProductVariantOption[]>([]);
  readonly generatedVariants = signal<ProductVariant[]>([]);

  // Input states
  readonly newTagInput = signal<string>('');
  readonly newImageUrlInput = signal<string>('');
  readonly isUrlInputVisible = signal<boolean>(false);

  // ── Static Master Data ────────────────────────────────────────
  readonly categories = [
    'Audio',
    'Accessories',
    'Peripherals',
    'Workspace',
    'Docks & Hubs',
  ];

  readonly statusOptions: AdminProduct['status'][] = [
    'Active',
    'Draft',
    'Low Stock',
    'Out of Stock',
  ];

  // ── Computed Values ───────────────────────────────────────────
  readonly primaryImage = computed(() => {
    const list = this.mediaList();
    if (list.length === 0) return null;
    return list.find(m => m.isPrimary) || list[0];
  });

  readonly calculatedProfit = computed(() => {
    const price = Number(this.form.get('price')?.value) || 0;
    const cost = Number(this.form.get('costPerItem')?.value) || 0;
    if (cost <= 0) return null;
    return price - cost;
  });

  readonly calculatedMargin = computed(() => {
    const price = Number(this.form.get('price')?.value) || 0;
    const cost = Number(this.form.get('costPerItem')?.value) || 0;
    if (price <= 0 || cost <= 0) return null;
    const profit = price - cost;
    return Math.round((profit / price) * 100);
  });

  readonly effectiveSlug = computed(() => {
    const rawSlug = this.form.get('seoSlug')?.value;
    if (rawSlug && rawSlug.trim() !== '') {
      return this.slugify(rawSlug);
    }
    const name = this.form.get('name')?.value || 'new-product';
    return this.slugify(name);
  });

  readonly seoTitleCount = computed(() => {
    const val = this.form.get('seoTitle')?.value || '';
    return val.length;
  });

  readonly seoDescriptionCount = computed(() => {
    const val = this.form.get('seoDescription')?.value || '';
    return val.length;
  });

  ngOnInit(): void {
    const paramId = this.route.snapshot.paramMap.get('id');

    if (paramId && paramId !== 'new') {
      this.isEditMode.set(true);
      this.productId.set(paramId);
      this.loadProductData(paramId);
    } else {
      this.isEditMode.set(false);
      this.productId.set(null);
      this.initNewProductDefaults();
    }

    // Track unsaved changes
    this.formSub = this.form.valueChanges.subscribe(() => {
      this.isDirty.set(true);
    });
  }

  ngOnDestroy(): void {
    this.formSub?.unsubscribe();
  }

  // ── Form Initialization ───────────────────────────────────────
  private initForm(): FormGroup {
    return this.fb.group({
      // Basic Info
      name: ['', [Validators.required, Validators.minLength(3)]],
      sku: ['', [Validators.required]],
      category: ['Audio', [Validators.required]],
      description: [''],

      // Pricing
      price: [0, [Validators.required, Validators.min(0)]],
      compareAtPrice: [null],
      costPerItem: [null],
      chargeTax: [true],

      // Inventory
      stock: [0, [Validators.required, Validators.min(0)]],
      lowStockThreshold: [5],
      trackInventory: [true],
      continueSellingWhenOutOfStock: [false],

      // Status
      status: ['Active' as AdminProduct['status'], [Validators.required]],

      // Variants toggle
      hasVariants: [false],

      // Shipping
      isPhysicalProduct: [true],
      weight: [0.5],
      weightUnit: ['kg'],
      dimensionLength: [null],
      dimensionWidth: [null],
      dimensionHeight: [null],
      dimensionUnit: ['cm'],

      // SEO
      seoTitle: [''],
      seoDescription: [''],
      seoSlug: [''],
    });
  }

  private initNewProductDefaults(): void {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    this.form.patchValue({
      name: '',
      sku: `GP-AUD-${randomSuffix}`,
      category: 'Audio',
      price: 99.99,
      compareAtPrice: 129.99,
      costPerItem: 50.00,
      stock: 25,
      lowStockThreshold: 5,
      status: 'Draft',
      description: 'Enter a detailed description highlighting product features, specifications, and what comes in the box.',
    });

    this.mediaList.set([
      {
        id: 'm-default',
        url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
        isPrimary: true,
        altText: 'Product main image',
      },
    ]);

    this.tags.set(['New Arrival', 'Gadgets', 'Featured']);
    this.isDirty.set(false);
  }

  private loadProductData(id: string): void {
    const product = this.dataService.getProductById(id);

    if (!product) {
      this.toastService.error(`Product with ID "${id}" was not found.`);
      this.router.navigate(['/admin/products']);
      return;
    }

    this.form.patchValue({
      name: product.name,
      sku: product.sku,
      category: product.category,
      description: product.description || '',
      price: product.price,
      compareAtPrice: product.compareAtPrice || null,
      costPerItem: product.costPerItem || null,
      chargeTax: product.chargeTax ?? true,
      stock: product.stock,
      lowStockThreshold: product.lowStockThreshold ?? 5,
      trackInventory: product.trackInventory ?? true,
      continueSellingWhenOutOfStock: product.continueSellingWhenOutOfStock ?? false,
      status: product.status,
      hasVariants: product.hasVariants ?? false,
      isPhysicalProduct: true,
      weight: product.weight ?? 0.5,
      weightUnit: product.weightUnit ?? 'kg',
      dimensionLength: product.dimensions?.length ?? null,
      dimensionWidth: product.dimensions?.width ?? null,
      dimensionHeight: product.dimensions?.height ?? null,
      dimensionUnit: product.dimensions?.unit ?? 'cm',
      seoTitle: product.seo?.title || product.name,
      seoDescription: product.seo?.description || '',
      seoSlug: product.seo?.slug || this.slugify(product.name),
    });

    // Populate media
    if (product.images && product.images.length > 0) {
      this.mediaList.set([...product.images]);
    } else if (product.imageUrl) {
      this.mediaList.set([
        { id: `m-${Date.now()}`, url: product.imageUrl, isPrimary: true, altText: product.name },
      ]);
    }

    // Populate tags
    if (product.tags && product.tags.length > 0) {
      this.tags.set([...product.tags]);
    }

    // Populate variants
    if (product.variantOptions && product.variantOptions.length > 0) {
      this.variantOptions.set([...product.variantOptions]);
    }
    if (product.variants && product.variants.length > 0) {
      this.generatedVariants.set([...product.variants]);
    }

    this.isDirty.set(false);
  }

  // ── Media Handlers ──────────────────────────────────────────
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const files = Array.from(input.files);
    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const url = e.target?.result as string;
        if (url) {
          const current = this.mediaList();
          const isFirst = current.length === 0 && index === 0;
          const newMedia: AdminProductMedia = {
            id: `m-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            url,
            isPrimary: isFirst,
            altText: file.name,
          };
          this.mediaList.update(list => [...list, newMedia]);
          this.isDirty.set(true);
        }
      };
      reader.readAsDataURL(file);
    });

    input.value = '';
    this.toastService.success(`Added ${files.length} image(s).`);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingMedia.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingMedia.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingMedia.set(false);

    if (!event.dataTransfer?.files || event.dataTransfer.files.length === 0) return;

    const files = Array.from(event.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files.length === 0) {
      this.toastService.warning('Only image files are supported.');
      return;
    }

    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const url = e.target?.result as string;
        if (url) {
          const current = this.mediaList();
          const isFirst = current.length === 0 && index === 0;
          this.mediaList.update(list => [
            ...list,
            {
              id: `m-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              url,
              isPrimary: isFirst,
              altText: file.name,
            },
          ]);
          this.isDirty.set(true);
        }
      };
      reader.readAsDataURL(file);
    });

    this.toastService.success(`Uploaded ${files.length} image(s).`);
  }

  addMediaByUrl(): void {
    const url = this.newImageUrlInput().trim();
    if (!url) return;

    const current = this.mediaList();
    const isFirst = current.length === 0;
    const newMedia: AdminProductMedia = {
      id: `m-${Date.now()}`,
      url,
      isPrimary: isFirst,
      altText: 'Product image',
    };

    this.mediaList.update(list => [...list, newMedia]);
    this.newImageUrlInput.set('');
    this.isUrlInputVisible.set(false);
    this.isDirty.set(true);
    this.toastService.success('Image URL added.');
  }

  setPrimaryMedia(id: string): void {
    this.mediaList.update(list =>
      list.map(m => ({ ...m, isPrimary: m.id === id }))
    );
    this.isDirty.set(true);
  }

  removeMedia(id: string): void {
    const list = this.mediaList();
    const removing = list.find(m => m.id === id);
    const updated = list.filter(m => m.id !== id);

    // If removing primary, assign next as primary
    if (removing?.isPrimary && updated.length > 0) {
      updated[0].isPrimary = true;
    }

    this.mediaList.set(updated);
    this.isDirty.set(true);
    this.toastService.info('Image removed.');
  }

  moveMedia(index: number, direction: 'prev' | 'next'): void {
    const list = [...this.mediaList()];
    const targetIndex = direction === 'prev' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    this.mediaList.set(list);
    this.isDirty.set(true);
  }

  // ── Tags Handlers ───────────────────────────────────────────
  addTag(inputElement?: HTMLInputElement): void {
    const val = (inputElement ? inputElement.value : this.newTagInput()).trim();
    if (!val) return;

    const current = this.tags();
    if (current.includes(val)) {
      this.toastService.warning(`Tag "${val}" already exists.`);
      if (inputElement) inputElement.value = '';
      return;
    }

    this.tags.update(t => [...t, val]);
    this.newTagInput.set('');
    if (inputElement) inputElement.value = '';
    this.isDirty.set(true);
  }

  removeTag(tag: string): void {
    this.tags.update(t => t.filter(item => item !== tag));
    this.isDirty.set(true);
  }

  // ── Description Rich Text Toolbar ───────────────────────────
  insertFormat(type: 'bold' | 'italic' | 'h2' | 'h3' | 'bullet' | 'link'): void {
    const descControl = this.form.get('description');
    const current = descControl?.value || '';

    let formatted = '';
    switch (type) {
      case 'bold':
        formatted = `${current} **Bold Text** `;
        break;
      case 'italic':
        formatted = `${current} *Italic Text* `;
        break;
      case 'h2':
        formatted = `${current}\n\n## Section Heading\n`;
        break;
      case 'h3':
        formatted = `${current}\n\n### Sub-heading\n`;
        break;
      case 'bullet':
        formatted = `${current}\n- Feature item\n- Specification item\n`;
        break;
      case 'link':
        formatted = `${current} [Link Text](https://example.com) `;
        break;
    }

    descControl?.setValue(formatted);
    this.isDirty.set(true);
  }

  // ── Variants Handlers ───────────────────────────────────────
  toggleVariants(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.form.patchValue({ hasVariants: isChecked });

    if (isChecked && this.variantOptions().length === 0) {
      // Default initial option
      this.addVariantOption('Color', ['Midnight Black', 'Platinum Silver']);
    }
  }

  addVariantOption(defaultName: string = 'Size', defaultValues: string[] = []): void {
    this.variantOptions.update(options => [
      ...options,
      { name: defaultName, values: defaultValues },
    ]);
    this.regenerateVariantCombinations();
    this.isDirty.set(true);
  }

  removeVariantOption(index: number): void {
    this.variantOptions.update(options => options.filter((_, i) => i !== index));
    this.regenerateVariantCombinations();
    this.isDirty.set(true);
  }

  addOptionValue(optionIndex: number, input: HTMLInputElement): void {
    const val = input.value.trim();
    if (!val) return;

    this.variantOptions.update(options => {
      return options.map((opt, i) => {
        if (i !== optionIndex) return opt;
        if (opt.values.includes(val)) return opt;
        return { ...opt, values: [...opt.values, val] };
      });
    });

    input.value = '';
    this.regenerateVariantCombinations();
    this.isDirty.set(true);
  }

  removeOptionValue(optionIndex: number, valueIndex: number): void {
    this.variantOptions.update(options => {
      return options.map((opt, i) => {
        if (i !== optionIndex) return opt;
        return { ...opt, values: opt.values.filter((_, vi) => vi !== valueIndex) };
      });
    });

    this.regenerateVariantCombinations();
    this.isDirty.set(true);
  }

  regenerateVariantCombinations(): void {
    const options = this.variantOptions().filter(o => o.values.length > 0);
    if (options.length === 0) {
      this.generatedVariants.set([]);
      return;
    }

    // Cartesian Product of options values
    const combinations: string[][] = options.reduce<string[][]>(
      (acc, opt) => {
        const next: string[][] = [];
        acc.forEach(prevCombo => {
          opt.values.forEach(val => {
            next.push([...prevCombo, val]);
          });
        });
        return next;
      },
      [[]]
    );

    const baseSku = this.form.get('sku')?.value || 'SKU';
    const basePrice = Number(this.form.get('price')?.value) || 0;
    const baseStock = Math.max(1, Math.floor(Number(this.form.get('stock')?.value) / combinations.length) || 10);

    const existingMap = new Map<string, ProductVariant>();
    this.generatedVariants().forEach(v => existingMap.set(v.combination, v));

    const newVariants: ProductVariant[] = combinations.map((comboArr, idx) => {
      const combinationName = comboArr.join(' / ');
      const existing = existingMap.get(combinationName);

      if (existing) {
        return existing;
      }

      const skuSuffix = comboArr
        .map(c => c.substring(0, 3).toUpperCase())
        .join('-');

      return {
        id: `v-${Date.now()}-${idx}`,
        combination: combinationName,
        sku: `${baseSku}-${skuSuffix}`,
        price: basePrice,
        stock: baseStock,
      };
    });

    this.generatedVariants.set(newVariants);
  }

  updateVariantRow(variantId: string, field: 'sku' | 'price' | 'stock', value: any): void {
    this.generatedVariants.update(variants =>
      variants.map(v => {
        if (v.id !== variantId) return v;
        return {
          ...v,
          [field]: field === 'sku' ? String(value).toUpperCase() : Number(value),
        };
      })
    );
    this.isDirty.set(true);
  }

  // ── Save & Publish Handlers ─────────────────────────────────
  saveProduct(statusOverride?: AdminProduct['status']): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastService.error('Please fix the validation errors before saving.');
      return;
    }

    this.isSaving.set(true);
    const formVals = this.form.value;

    const finalStatus: AdminProduct['status'] =
      statusOverride || formVals.status;

    const primaryImg = this.primaryImage();
    const mainImageUrl = primaryImg ? primaryImg.url : formVals.imageUrl;

    const productPayload: Omit<AdminProduct, 'id' | 'salesCount'> = {
      name: formVals.name.trim(),
      sku: formVals.sku.trim().toUpperCase(),
      category: formVals.category,
      price: Number(formVals.price),
      compareAtPrice: formVals.compareAtPrice ? Number(formVals.compareAtPrice) : undefined,
      costPerItem: formVals.costPerItem ? Number(formVals.costPerItem) : undefined,
      chargeTax: Boolean(formVals.chargeTax),
      stock: Number(formVals.stock),
      lowStockThreshold: Number(formVals.lowStockThreshold) || 5,
      trackInventory: Boolean(formVals.trackInventory),
      continueSellingWhenOutOfStock: Boolean(formVals.continueSellingWhenOutOfStock),
      status: finalStatus,
      imageUrl: mainImageUrl,
      images: this.mediaList(),
      description: formVals.description,
      tags: this.tags(),
      hasVariants: Boolean(formVals.hasVariants),
      variantOptions: formVals.hasVariants ? this.variantOptions() : undefined,
      variants: formVals.hasVariants ? this.generatedVariants() : undefined,
      weight: formVals.weight ? Number(formVals.weight) : undefined,
      weightUnit: formVals.weightUnit,
      dimensions: {
        length: Number(formVals.dimensionLength) || 0,
        width: Number(formVals.dimensionWidth) || 0,
        height: Number(formVals.dimensionHeight) || 0,
        unit: formVals.dimensionUnit || 'cm',
      },
      seo: {
        title: formVals.seoTitle || formVals.name,
        description: formVals.seoDescription || '',
        slug: this.effectiveSlug(),
      },
    };

    if (this.isEditMode() && this.productId()) {
      // Update existing
      this.dataService.updateProduct(this.productId()!, productPayload);
      this.toastService.success(
        `Updated "${productPayload.name}".`,
        'Product Saved'
      );
    } else {
      // Create new
      this.dataService.addProduct(productPayload);
      this.toastService.success(
        `"${productPayload.name}" was added to the catalog.`,
        'Product Published'
      );
    }

    this.isDirty.set(false);
    this.isSaving.set(false);
    this.router.navigate(['/admin/products']);
  }

  discardChanges(): void {
    if (this.isDirty()) {
      if (!confirm('You have unsaved changes. Are you sure you want to discard them?')) {
        return;
      }
    }
    this.router.navigate(['/admin/products']);
  }

  // ── Helper Utilities ────────────────────────────────────────
  private slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  }
}
