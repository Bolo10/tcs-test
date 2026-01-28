import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.css'],
})
export class ConfirmDialogComponent {
  @Input({ required: true }) open = false;
  @Input({ required: true }) title = '';
  @Input() cancelText = 'Cancelar';
  @Input() confirmText = 'Confirmar';

  @Output() cancel = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();

  onBackdrop(e: MouseEvent) {
    if (e.target === e.currentTarget) this.cancel.emit();
  }
}
