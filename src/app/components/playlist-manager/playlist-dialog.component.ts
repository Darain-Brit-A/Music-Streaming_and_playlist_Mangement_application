import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PlaylistModel } from '../../models/playlist.model';

export interface PlaylistDialogData {
  playlist?: PlaylistModel;
}

@Component({
  selector: 'app-playlist-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  template: `
    <div class="dialog-container">
      <h2 mat-dialog-title class="dialog-title">
        <mat-icon>{{ data.playlist ? 'edit' : 'playlist_add' }}</mat-icon>
        {{ data.playlist ? 'Edit Playlist' : 'Create New Playlist' }}
      </h2>
      <mat-dialog-content class="dialog-content">
        <form [formGroup]="form" class="playlist-form">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Playlist Name</mat-label>
            <mat-icon matPrefix>queue_music</mat-icon>
            <input matInput formControlName="name" placeholder="My awesome playlist...">
            <mat-hint>Choose a memorable name for your playlist</mat-hint>
            <mat-error *ngIf="form.get('name')?.hasError('required')">Playlist name is required</mat-error>
            <mat-error *ngIf="form.get('name')?.hasError('minlength')">Name must be at least 3 characters</mat-error>
            <mat-error *ngIf="form.get('name')?.hasError('maxlength')">Name cannot exceed 50 characters</mat-error>
          </mat-form-field>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Description <span class="optional">(optional)</span></mat-label>
            <mat-icon matPrefix>notes</mat-icon>
            <textarea matInput formControlName="description" rows="3" placeholder="Describe your playlist..."></textarea>
            <mat-hint align="end">{{ form.get('description')?.value?.length || 0 }}/200</mat-hint>
            <mat-error *ngIf="form.get('description')?.hasError('maxlength')">Max 200 characters</mat-error>
          </mat-form-field>
        </form>
        <div class="form-status" *ngIf="form.dirty">
          <span class="status-valid" *ngIf="form.valid">
            <mat-icon>check_circle</mat-icon> Ready to save
          </span>
          <span class="status-invalid" *ngIf="form.invalid">
            <mat-icon>error</mat-icon> Please fix the errors above
          </span>
        </div>
      </mat-dialog-content>
      <mat-dialog-actions align="end" class="dialog-actions">
        <button mat-button mat-dialog-close>Cancel</button>
        <button mat-raised-button color="primary" [disabled]="form.invalid || form.pristine" (click)="save()">
          <mat-icon>{{ data.playlist ? 'save' : 'add' }}</mat-icon>
          {{ data.playlist ? 'Save Changes' : 'Create Playlist' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container { background: var(--surface-2); border-radius: 16px; }
    .dialog-title { display: flex; align-items: center; gap: 0.5rem; color: var(--text-primary); font-family: 'Poppins', sans-serif; padding: 1.5rem 1.5rem 0.5rem; margin: 0; }
    .dialog-content { padding: 1rem 1.5rem !important; min-width: 380px; }
    .playlist-form { display: flex; flex-direction: column; gap: 1rem; }
    .full-width { width: 100%; }
    .optional { color: var(--text-muted); font-size: 0.8em; }
    .form-status { margin-top: 0.5rem; display: flex; align-items: center; }
    .status-valid, .status-invalid { display: flex; align-items: center; gap: 0.3rem; font-size: 0.85rem; }
    .status-valid { color: #4caf50; }
    .status-invalid { color: #f44336; }
    .dialog-actions { padding: 0.5rem 1.5rem 1.5rem; gap: 0.5rem; }
  `],
})
export class PlaylistDialogComponent {
  data = inject(MAT_DIALOG_DATA) as PlaylistDialogData;
  private dialogRef = inject(MatDialogRef<PlaylistDialogComponent>);
  private fb = inject(FormBuilder);

  form = this.fb.group({
    name: [
      this.data.playlist?.name ?? '',
      [Validators.required, Validators.minLength(3), Validators.maxLength(50)],
    ],
    description: [
      this.data.playlist?.description ?? '',
      [Validators.maxLength(200)],
    ],
  });

  save(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}
