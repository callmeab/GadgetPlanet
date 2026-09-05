import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'gp-admin-form-field',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-form-field.component.html',
  styleUrls: ['./admin-form-field.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminFormFieldComponent {
  label = input<string>('');
  forId = input<string>('');
  required = input<boolean>(false);
  hint = input<string>('');
  error = input<string>('');
}
