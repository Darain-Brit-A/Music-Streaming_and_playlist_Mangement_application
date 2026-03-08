import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { Subscription } from 'rxjs';
import { PlaylistModel } from '../../models/playlist.model';
import { SongModel } from '../../models/song.model';
import { PlaylistService } from '../../services/playlist.service';
import { MusicService } from '../../services/music.service';
import { PlaylistDialogComponent, PlaylistDialogData } from './playlist-dialog.component';
import { DurationPipe } from '../../pipes/duration.pipe';

@Component({
  selector: 'app-playlist-manager',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatDialogModule,
    MatSnackBarModule, MatTooltipModule, MatChipsModule, MatExpansionModule,
    MatDividerModule, DurationPipe
  ],
  template: `
    <div class="playlist-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-title">
          <mat-icon class="header-icon">queue_music</mat-icon>
          <div>
            <h1>Playlists</h1>
            <p class="subtitle">{{ playlists.length }} playlists · {{ totalSongs }} songs</p>
          </div>
        </div>
        <button mat-raised-button color="primary" class="create-btn" (click)="openCreateDialog()">
          <mat-icon>add</mat-icon>
          New Playlist
        </button>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="playlists.length === 0">
        <mat-icon>library_music</mat-icon>
        <h3>No playlists yet</h3>
        <p>Create your first playlist and start adding songs!</p>
        <button mat-raised-button color="primary" (click)="openCreateDialog()">
          <mat-icon>add</mat-icon> Create Playlist
        </button>
      </div>

      <!-- Playlist Cards -->
      <div class="playlists-grid" *ngIf="playlists.length > 0">
        <mat-card class="playlist-card" *ngFor="let playlist of playlists">
          <!-- Card Header with Cover -->
          <div class="playlist-header" [style.background]="getGradient(playlist.id)">
            <img *ngIf="playlist.coverUrl" class="playlist-cover" [src]="playlist.coverUrl" [alt]="playlist.name">
            <div class="playlist-overlay">
              <button mat-fab class="play-playlist-btn" (click)="playPlaylist(playlist)" matTooltip="Play all">
                <mat-icon>play_arrow</mat-icon>
              </button>
            </div>
          </div>
          <mat-card-content class="playlist-body">
            <h3 class="playlist-name">{{ playlist.name }}</h3>
            <p class="playlist-desc">{{ playlist.description || 'No description' }}</p>
            <div class="playlist-stats">
              <mat-chip class="stat-chip">
                <mat-icon matChipAvatar>music_note</mat-icon>
                {{ playlist.songCount }} songs
              </mat-chip>
              <mat-chip class="stat-chip">
                <mat-icon matChipAvatar>event</mat-icon>
                {{ playlist.createdAt | date:'mediumDate' }}
              </mat-chip>
            </div>
          </mat-card-content>
          <mat-card-actions class="playlist-actions">
            <button mat-button color="primary" (click)="toggleExpand(playlist.id)">
              <mat-icon>{{ expandedId === playlist.id ? 'expand_less' : 'expand_more' }}</mat-icon>
              {{ expandedId === playlist.id ? 'Hide' : 'Songs' }}
            </button>
            <button mat-icon-button (click)="openEditDialog(playlist)" matTooltip="Edit">
              <mat-icon>edit</mat-icon>
            </button>
            <button mat-icon-button (click)="deletePlaylist(playlist.id)" matTooltip="Delete" class="delete-btn">
              <mat-icon>delete_outline</mat-icon>
            </button>
          </mat-card-actions>

          <!-- Expanded Song List -->
          <div class="expanded-songs" *ngIf="expandedId === playlist.id">
            <mat-divider></mat-divider>
            <div class="no-songs" *ngIf="getSongs(playlist).length === 0">
              <mat-icon>music_off</mat-icon>
              <span>No songs yet. Go to Songs to add some!</span>
            </div>
            <div class="playlist-song-row" *ngFor="let song of getSongs(playlist); let i = index"
                 (click)="playSongFromPlaylist(song.id)">
              <span class="ps-num">{{ i + 1 }}</span>
              <img class="ps-thumb" [src]="song.coverUrl" [alt]="song.title">
              <div class="ps-info">
                <span class="ps-title">{{ song.title }}</span>
                <span class="ps-artist">{{ song.artistName }}</span>
              </div>
              <span class="ps-duration">{{ song.duration | duration }}</span>
              <button mat-icon-button class="ps-remove" (click)="removeSong(playlist.id, song.id); $event.stopPropagation()" matTooltip="Remove">
                <mat-icon>remove_circle_outline</mat-icon>
              </button>
            </div>
          </div>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .playlist-container { padding: 2rem; max-width: 1400px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
    .header-title { display: flex; align-items: center; gap: 1rem; }
    .header-icon { font-size: 3rem; width: 3rem; height: 3rem; color: var(--primary); }
    h1 { font-family: 'Poppins', sans-serif; font-size: 2rem; font-weight: 700; margin: 0; color: var(--text-primary); }
    .subtitle { margin: 0; color: var(--text-secondary); font-size: 0.9rem; }
    .create-btn { border-radius: 24px !important; padding: 0 1.5rem !important; background: var(--primary) !important; }
    .empty-state { text-align: center; padding: 4rem 2rem; color: var(--text-secondary); }
    .empty-state mat-icon { font-size: 5rem; width: 5rem; height: 5rem; margin-bottom: 1rem; color: var(--text-muted); }
    .empty-state h3 { font-size: 1.5rem; color: var(--text-primary); margin: 0 0 0.5rem; }
    .playlists-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.25rem; }
    .playlist-card { background: var(--surface-2) !important; border-radius: 16px !important; overflow: hidden; transition: transform 0.2s, box-shadow 0.2s; border: 1px solid var(--border-color); }
    .playlist-card:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(0,0,0,0.5) !important; }
    .playlist-header { position: relative; height: 180px; overflow: hidden; }
    .playlist-cover { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.3s; }
    .playlist-card:hover .playlist-cover { transform: scale(1.04); }
    .playlist-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s; }
    .playlist-card:hover .playlist-overlay { opacity: 1; }
    .play-playlist-btn { background: var(--primary) !important; }
    .playlist-body { padding: 1rem !important; }
    .playlist-name { font-size: 1.1rem; font-weight: 700; color: var(--text-primary); margin: 0 0 0.25rem; font-family: 'Poppins', sans-serif; }
    .playlist-desc { color: var(--text-secondary); font-size: 0.83rem; margin: 0 0 0.75rem; line-height: 1.4; height: 2.8em; overflow: hidden; }
    .playlist-stats { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .stat-chip { background: var(--surface-1) !important; color: var(--text-secondary) !important; font-size: 0.75rem !important; height: 26px !important; }
    .stat-chip mat-icon { font-size: 0.9rem; color: var(--primary); }
    .playlist-actions { display: flex; align-items: center; padding: 0 0.5rem 0.5rem !important; }
    .playlist-actions button:first-child { flex: 1; }
    .delete-btn mat-icon { color: #ef5350; }
    .expanded-songs { background: var(--surface-1); }
    .no-songs { display: flex; align-items: center; gap: 0.5rem; padding: 1rem 1.25rem; color: var(--text-muted); font-size: 0.85rem; }
    .playlist-song-row { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem 1rem; cursor: pointer; transition: background 0.15s; }
    .playlist-song-row:hover { background: rgba(255,255,255,0.04); }
    .ps-num { color: var(--text-muted); font-size: 0.8rem; min-width: 20px; text-align: center; }
    .ps-thumb { width: 36px; height: 36px; border-radius: 4px; object-fit: cover; }
    .ps-info { display: flex; flex-direction: column; flex: 1; overflow: hidden; }
    .ps-title { font-size: 0.85rem; font-weight: 500; color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .ps-artist { font-size: 0.75rem; color: var(--text-secondary); }
    .ps-duration { color: var(--text-muted); font-size: 0.8rem; }
    .ps-remove mat-icon { color: var(--text-muted); font-size: 1rem; }
    .ps-remove:hover mat-icon { color: #ef5350; }
    @media (max-width: 600px) { .playlist-container { padding: 1rem; } h1 { font-size: 1.5rem; } .playlists-grid { grid-template-columns: 1fr; } }
  `],
})
export class PlaylistManagerComponent implements OnInit, OnDestroy {
  playlists: PlaylistModel[] = [];
  expandedId: number | null = null;
  private subs: Subscription[] = [];

  get totalSongs(): number {
    return this.playlists.reduce((acc, p) => acc + p.songCount, 0);
  }

  constructor(
    private playlistService: PlaylistService,
    private musicService: MusicService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.subs.push(
      this.playlistService.playlists$.subscribe(p => (this.playlists = p))
    );
    if (this.musicService.songs.length === 0) {
      this.musicService.loadData().subscribe();
    }
  }

  getGradient(id: number): string {
    const gradients = [
      'linear-gradient(135deg, #667eea, #764ba2)',
      'linear-gradient(135deg, #f093fb, #f5576c)',
      'linear-gradient(135deg, #4facfe, #00f2fe)',
      'linear-gradient(135deg, #43e97b, #38f9d7)',
      'linear-gradient(135deg, #fa709a, #fee140)',
    ];
    return gradients[id % gradients.length];
  }

  getSongs(playlist: PlaylistModel): SongModel[] {
    return playlist.songIds.map(id => this.musicService.getSongById(id)).filter(Boolean) as SongModel[];
  }

  toggleExpand(id: number): void {
    this.expandedId = this.expandedId === id ? null : id;
  }

  openCreateDialog(): void {
    const ref = this.dialog.open(PlaylistDialogComponent, {
      data: {} as PlaylistDialogData,
      panelClass: 'dark-dialog',
      width: '460px',
    });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.playlistService.createPlaylist(result.name, result.description);
        this.snackBar.open(`Playlist "${result.name}" created!`, '', { duration: 3000, panelClass: 'snack-dark' });
      }
    });
  }

  openEditDialog(playlist: PlaylistModel): void {
    const ref = this.dialog.open(PlaylistDialogComponent, {
      data: { playlist } as PlaylistDialogData,
      panelClass: 'dark-dialog',
      width: '460px',
    });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.playlistService.updatePlaylist(playlist.id, result.name, result.description);
        this.snackBar.open('Playlist updated!', '', { duration: 2500, panelClass: 'snack-dark' });
      }
    });
  }

  deletePlaylist(id: number): void {
    const playlist = this.playlists.find(p => p.id === id);
    this.playlistService.deletePlaylist(id);
    this.snackBar.open(`"${playlist?.name}" deleted`, 'UNDO', { duration: 4000, panelClass: 'snack-dark' }).onAction().subscribe(() => {
      if (playlist) {
        this.playlistService.createPlaylist(playlist.name, playlist.description);
      }
    });
  }

  playPlaylist(playlist: PlaylistModel): void {
    if (playlist.songIds.length > 0) {
      this.musicService.playSong(playlist.songIds[0]);
    }
  }

  playSongFromPlaylist(songId: number): void {
    this.musicService.playSong(songId);
  }

  removeSong(playlistId: number, songId: number): void {
    this.playlistService.removeSongFromPlaylist(playlistId, songId);
    this.snackBar.open('Song removed from playlist', '', { duration: 2000, panelClass: 'snack-dark' });
  }

  ngOnDestroy(): void { this.subs.forEach(s => s.unsubscribe()); }
}
