import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Subscription } from 'rxjs';
import { SongModel, Genre, ALL_GENRES } from '../../models/song.model';
import { PlaylistModel } from '../../models/playlist.model';
import { MusicService } from '../../services/music.service';
import { AudioService } from '../../services/audio.service';
import { PlaylistService } from '../../services/playlist.service';
import { GenreFilterPipe } from '../../pipes/genre-filter.pipe';
import { DurationPipe } from '../../pipes/duration.pipe';
import { HighlightDirective } from '../../directives/highlight.directive';

@Component({
  selector: 'app-song-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatButtonModule, MatIconModule,
    MatInputModule, MatFormFieldModule, MatChipsModule, MatMenuModule,
    MatSnackBarModule, MatTooltipModule, MatButtonToggleModule, MatDividerModule,
    MatProgressBarModule, GenreFilterPipe, DurationPipe, HighlightDirective,
  ],
  template: `
    <div class="song-list-container">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-title">
          <mat-icon class="header-icon">library_music</mat-icon>
          <div>
            <h1>Your Library</h1>
            <p class="subtitle">{{ (songs$ | async)?.length || 0 }} songs in your collection</p>
          </div>
        </div>
        <div class="header-controls">
          <mat-form-field appearance="outline" class="search-field">
            <mat-icon matPrefix>search</mat-icon>
            <input matInput [(ngModel)]="searchQuery" placeholder="Search songs, artists, albums..." autocomplete="off">
            <button mat-icon-button matSuffix *ngIf="searchQuery" (click)="searchQuery = ''">
              <mat-icon>close</mat-icon>
            </button>
          </mat-form-field>
          <mat-button-toggle-group [(ngModel)]="viewMode" class="view-toggle">
            <mat-button-toggle value="list" matTooltip="List View">
              <mat-icon>view_list</mat-icon>
            </mat-button-toggle>
            <mat-button-toggle value="grid" matTooltip="Grid View">
              <mat-icon>grid_view</mat-icon>
            </mat-button-toggle>
          </mat-button-toggle-group>
        </div>
      </div>

      <!-- Genre Filter Chips -->
      <div class="genre-filter">
        <mat-chip-listbox [(ngModel)]="selectedGenre" class="genre-chips" aria-label="Genre filter">
          <mat-chip-option value="">All Genres</mat-chip-option>
          <mat-chip-option *ngFor="let g of genres" [value]="g">{{ g }}</mat-chip-option>
        </mat-chip-listbox>
      </div>

      <!-- GRID VIEW -->
      <div class="songs-grid" *ngIf="viewMode === 'grid'">
        <mat-card class="song-card"
          *ngFor="let song of (songs$ | async) ?? [] | genreFilter:selectedGenre:searchQuery"
          [appHighlight]="isCurrentSong(song.id)"
          [class.is-playing]="isCurrentSong(song.id)">
          <div class="card-cover" (click)="playSong(song.id)">
            <img [src]="song.coverUrl" [alt]="song.albumTitle" loading="lazy">
            <div class="play-overlay">
              <mat-icon class="play-icon">
                {{ isCurrentSong(song.id) && isPlaying ? 'pause_circle_filled' : 'play_circle_filled' }}
              </mat-icon>
            </div>
            <span class="genre-badge" [ngClass]="'genre-' + song.genre.toLowerCase()">{{ song.genre }}</span>
          </div>
          <mat-card-content class="card-body">
            <p class="card-title" [matTooltip]="song.title">{{ song.title }}</p>
            <p class="card-artist" (click)="goToArtist(song.artistId)">{{ song.artistName }}</p>
            <p class="card-album">{{ song.albumTitle }} · {{ song.releaseYear }}</p>
          </mat-card-content>
          <mat-card-actions class="card-actions">
            <button mat-icon-button
              (click)="toggleFavorite(song.id)"
              [class.fav-active]="song.isFavorite"
              [matTooltip]="song.isFavorite ? 'Remove from favorites' : 'Add to favorites'">
              <mat-icon>{{ song.isFavorite ? 'favorite' : 'favorite_border' }}</mat-icon>
            </button>
            <span class="duration-label">{{ song.duration | duration }}</span>
            <button mat-icon-button [matMenuTriggerFor]="playlistMenu"
              (click)="pendingSongId = song.id" matTooltip="Add to playlist">
              <mat-icon>playlist_add</mat-icon>
            </button>
          </mat-card-actions>
        </mat-card>
      </div>

      <!-- LIST VIEW -->
      <div class="songs-list-view" *ngIf="viewMode === 'list'">
        <div class="list-header-row">
          <span class="col-num">#</span>
          <span class="col-title">Title</span>
          <span class="col-album">Album</span>
          <span class="col-genre">Genre</span>
          <span class="col-duration">
            <mat-icon style="font-size:1rem">schedule</mat-icon>
          </span>
        </div>
        <mat-divider></mat-divider>
        <div class="song-row"
          *ngFor="let song of (songs$ | async) ?? [] | genreFilter:selectedGenre:searchQuery; let i = index"
          [appHighlight]="isCurrentSong(song.id)"
          [class.is-playing]="isCurrentSong(song.id)"
          (click)="playSong(song.id)">
          <span class="col-num">
            <span class="track-num" *ngIf="!isCurrentSong(song.id)">{{ i + 1 }}</span>
            <mat-icon class="playing-icon" *ngIf="isCurrentSong(song.id) && isPlaying">graphic_eq</mat-icon>
            <mat-icon class="playing-icon" *ngIf="isCurrentSong(song.id) && !isPlaying">pause</mat-icon>
          </span>
          <div class="col-title-cell">
            <img class="row-thumb" [src]="song.coverUrl" [alt]="song.title" loading="lazy">
            <div class="row-info">
              <span class="row-title" [class.active-title]="isCurrentSong(song.id)">{{ song.title }}</span>
              <span class="row-artist" (click)="goToArtist(song.artistId); $event.stopPropagation()">{{ song.artistName }}</span>
            </div>
          </div>
          <span class="col-album row-album">{{ song.albumTitle }}</span>
          <span class="col-genre">
            <span class="genre-badge-sm" [ngClass]="'genre-' + song.genre.toLowerCase()">{{ song.genre }}</span>
          </span>
          <span class="col-duration">{{ song.duration | duration }}</span>
          <div class="row-hover-actions" (click)="$event.stopPropagation()">
            <button mat-icon-button
              (click)="toggleFavorite(song.id)"
              [class.fav-active]="song.isFavorite">
              <mat-icon>{{ song.isFavorite ? 'favorite' : 'favorite_border' }}</mat-icon>
            </button>
            <button mat-icon-button [matMenuTriggerFor]="playlistMenu" (click)="pendingSongId = song.id">
              <mat-icon>playlist_add</mat-icon>
            </button>
          </div>
        </div>
      </div>

      <!-- Playlist Menu -->
      <mat-menu #playlistMenu="matMenu" class="playlist-menu">
        <button mat-menu-item *ngFor="let pl of playlists" (click)="addToPlaylist(pl.id)">
          <mat-icon>queue_music</mat-icon>
          <span>{{ pl.name }}</span>
        </button>
        <mat-divider></mat-divider>
        <button mat-menu-item (click)="navigateToPlaylists()">
          <mat-icon>add_circle_outline</mat-icon>
          <span>Manage Playlists</span>
        </button>
      </mat-menu>
    </div>
  `,
  styles: [`
    .song-list-container { padding: 2rem; max-width: 1400px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
    .header-title { display: flex; align-items: center; gap: 1rem; }
    .header-icon { font-size: 3rem; width: 3rem; height: 3rem; color: var(--primary); }
    h1 { font-family: 'Poppins', sans-serif; font-size: 2rem; font-weight: 700; margin: 0; color: var(--text-primary); }
    .subtitle { margin: 0; color: var(--text-secondary); font-size: 0.9rem; }
    .header-controls { display: flex; align-items: center; gap: 1rem; }
    .search-field { min-width: 280px; }
    .search-field ::ng-deep .mat-mdc-form-field-flex { background: var(--surface-2); }
    .view-toggle ::ng-deep .mat-button-toggle { background: var(--surface-2); color: var(--text-secondary); }
    .view-toggle ::ng-deep .mat-button-toggle-checked { background: var(--primary); color: white; }
    .genre-filter { margin-bottom: 2rem; }
    .genre-chips { display: flex; flex-wrap: wrap; gap: 0.4rem; }
    .genre-chips ::ng-deep .mat-mdc-chip { background: var(--surface-2) !important; color: var(--text-secondary) !important; border: 1px solid var(--border-color); }
    .genre-chips ::ng-deep .mat-mdc-chip-selected { background: var(--primary) !important; color: white !important; border-color: var(--primary) !important; }

    /* GRID */
    .songs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1.25rem; }
    .song-card { background: var(--surface-2) !important; border-radius: 12px !important; overflow: hidden; transition: transform 0.2s, box-shadow 0.2s; cursor: pointer; border: 1px solid transparent; }
    .song-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.5) !important; }
    .song-card.is-playing { border-color: var(--primary) !important; }
    .card-cover { position: relative; aspect-ratio: 1; overflow: hidden; }
    .card-cover img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.3s; }
    .song-card:hover .card-cover img { transform: scale(1.05); }
    .play-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s; }
    .song-card:hover .play-overlay, .song-card.is-playing .play-overlay { opacity: 1; }
    .play-icon { font-size: 3.5rem !important; width: 3.5rem !important; height: 3.5rem !important; color: white; filter: drop-shadow(0 2px 8px rgba(0,0,0,0.5)); }
    .genre-badge { position: absolute; top: 0.5rem; right: 0.5rem; font-size: 0.65rem; font-weight: 600; padding: 0.2rem 0.5rem; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px; }
    .card-body { padding: 0.75rem 1rem 0 !important; }
    .card-title { font-weight: 600; color: var(--text-primary); margin: 0 0 0.2rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.9rem; }
    .card-artist { color: var(--primary); margin: 0 0 0.2rem; font-size: 0.8rem; cursor: pointer; }
    .card-artist:hover { text-decoration: underline; }
    .card-album { color: var(--text-muted); margin: 0; font-size: 0.75rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .card-actions { display: flex; align-items: center; padding: 0.25rem 0.5rem !important; }
    .duration-label { flex: 1; text-align: center; color: var(--text-muted); font-size: 0.8rem; }
    .fav-active mat-icon { color: #e91e63 !important; }

    /* LIST */
    .songs-list-view { background: var(--surface-2); border-radius: 12px; overflow: hidden; }
    .list-header-row { display: grid; grid-template-columns: 40px 2fr 1.5fr 120px 60px; gap: 1rem; align-items: center; padding: 0.75rem 1.5rem; color: var(--text-muted); font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    .song-row { display: grid; grid-template-columns: 40px 2fr 1.5fr 120px 60px; gap: 1rem; align-items: center; padding: 0.5rem 1.5rem; border-radius: 6px; cursor: pointer; transition: background 0.15s; position: relative; }
    .song-row:hover { background: rgba(255,255,255,0.05); }
    .song-row.is-playing { background: rgba(63,81,181,0.12); }
    .col-num { color: var(--text-muted); font-size: 0.9rem; text-align: center; }
    .track-num { color: var(--text-muted); }
    .playing-icon { color: var(--primary); font-size: 1.1rem; width: 1.1rem; height: 1.1rem; }
    .col-title-cell { display: flex; align-items: center; gap: 0.75rem; overflow: hidden; }
    .row-thumb { width: 44px; height: 44px; border-radius: 6px; object-fit: cover; flex-shrink: 0; }
    .row-info { display: flex; flex-direction: column; overflow: hidden; }
    .row-title { color: var(--text-primary); font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.9rem; }
    .active-title { color: var(--primary) !important; }
    .row-artist { color: var(--text-secondary); font-size: 0.8rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; cursor: pointer; }
    .row-artist:hover { color: var(--primary); text-decoration: underline; }
    .row-album { color: var(--text-secondary); font-size: 0.85rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .col-duration { color: var(--text-muted); font-size: 0.85rem; text-align: right; }
    .row-hover-actions { position: absolute; right: 1rem; display: flex; gap: 0.25rem; opacity: 0; transition: opacity 0.15s; }
    .song-row:hover .row-hover-actions { opacity: 1; }
    .genre-badge-sm { font-size: 0.65rem; font-weight: 600; padding: 0.15rem 0.45rem; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.4px; display: inline-block; }

    /* Genre colors */
    .genre-ambient { background: rgba(76,175,80,0.2); color: #81c784; }
    .genre-electronic { background: rgba(33,150,243,0.2); color: #64b5f6; }
    .genre-classical { background: rgba(255,193,7,0.2); color: #ffd54f; }
    .genre-jazz { background: rgba(156,39,176,0.2); color: #ce93d8; }
    .genre-pop { background: rgba(233,30,99,0.2); color: #f48fb1; }
    .genre-rock { background: rgba(244,67,54,0.2); color: #ef9a9a; }
    .genre-acoustic { background: rgba(255,152,0,0.2); color: #ffcc80; }

    @media (max-width: 900px) {
      .list-header-row { grid-template-columns: 40px 2fr 60px; }
      .song-row { grid-template-columns: 40px 2fr 60px; }
      .col-album, .col-genre { display: none; }
      .songs-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); }
    }
    @media (max-width: 600px) {
      .song-list-container { padding: 1rem; }
      h1 { font-size: 1.5rem; }
      .header-controls { flex-direction: column; width: 100%; }
      .search-field { min-width: 100%; }
    }
  `],
})
export class SongListComponent implements OnInit, OnDestroy {
  private musicService = inject(MusicService);
  private audioService = inject(AudioService);
  private playlistService = inject(PlaylistService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  songs$ = this.musicService.songs$;
  playlists: PlaylistModel[] = [];
  genres = ALL_GENRES;
  selectedGenre: string = '';
  searchQuery: string = '';
  viewMode: 'list' | 'grid' = 'list';
  pendingSongId: number | null = null;
  isPlaying = false;
  currentSongId: number | null = null;
  private subs: Subscription[] = []

  constructor() {}

  ngOnInit(): void {
    this.musicService.loadData().subscribe();
    this.subs.push(
      this.playlistService.playlists$.subscribe(p => (this.playlists = p)),
      this.audioService.isPlaying$.subscribe(p => (this.isPlaying = p)),
      this.audioService.currentSong$.subscribe(s => (this.currentSongId = s?.id ?? null))
    );
  }

  isCurrentSong(id: number): boolean {
    return this.currentSongId === id;
  }

  playSong(id: number): void {
    this.musicService.playSong(id);
  }

  toggleFavorite(id: number): void {
    this.musicService.toggleFavorite(id);
    const song = this.musicService.getSongById(id);
    const msg = song?.isFavorite ? 'Added to favorites' : 'Removed from favorites';
    this.snackBar.open(msg, '', { duration: 2000, panelClass: 'snack-dark' });
  }

  addToPlaylist(playlistId: number): void {
    if (this.pendingSongId === null) return;
    const added = this.playlistService.addSongToPlaylist(playlistId, this.pendingSongId);
    const pl = this.playlists.find(p => p.id === playlistId);
    const msg = added ? `Added to "${pl?.name}"` : `Already in "${pl?.name}"`;
    this.snackBar.open(msg, '', { duration: 2500, panelClass: 'snack-dark' });
    this.pendingSongId = null;
  }

  navigateToPlaylists(): void {
    this.router.navigate(['/playlists']);
  }

  goToArtist(artistId: number): void {
    this.router.navigate(['/artists', artistId]);
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }
}
