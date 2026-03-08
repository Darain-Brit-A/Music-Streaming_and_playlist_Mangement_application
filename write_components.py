import os

BASE = r"d:\Christ\4th Semister\L&T\Projects\music-app\src\app"

files = {}

# ─── SONG-LIST COMPONENT ─────────────────────────────────────────────────────
files["components/song-list/song-list.component.ts"] = r"""import { Component, OnInit, OnDestroy } from '@angular/core';
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
          *ngFor="let song of (songs$ | async) | genreFilter:selectedGenre:searchQuery"
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
          *ngFor="let song of (songs$ | async) | genreFilter:selectedGenre:searchQuery; let i = index"
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
  songs$ = this.musicService.songs$;
  playlists: PlaylistModel[] = [];
  genres = ALL_GENRES;
  selectedGenre: string = '';
  searchQuery: string = '';
  viewMode: 'list' | 'grid' = 'list';
  pendingSongId: number | null = null;
  isPlaying = false;
  currentSongId: number | null = null;
  private subs: Subscription[] = [];

  constructor(
    private musicService: MusicService,
    private audioService: AudioService,
    private playlistService: PlaylistService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

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
"""

# ─── SONG-PLAYER COMPONENT ────────────────────────────────────────────────────
files["components/song-player/song-player.component.ts"] = r"""import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatSliderModule } from '@angular/material/slider';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subscription } from 'rxjs';
import { AudioService, CurrentSongInfo, RepeatMode } from '../../services/audio.service';
import { MusicService } from '../../services/music.service';
import { DurationPipe } from '../../pipes/duration.pipe';
import { PulseDirective } from '../../directives/pulse.directive';

@Component({
  selector: 'app-song-player',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatSliderModule, MatButtonModule, MatIconModule, MatTooltipModule, DurationPipe, PulseDirective],
  template: `
    <div class="player-bar" *ngIf="currentSong">
      <!-- Left: Song Info -->
      <div class="player-left">
        <div class="cover-wrap">
          <img class="cover-art" [src]="currentSong.coverUrl || 'https://picsum.photos/seed/default/60/60'"
               [alt]="currentSong.albumTitle" [appPulse]="isPlaying">
        </div>
        <div class="song-meta">
          <span class="song-title-player" [matTooltip]="currentSong.title">{{ currentSong.title }}</span>
          <span class="song-artist-player">{{ currentSong.artist }}</span>
        </div>
        <button mat-icon-button class="fav-btn" matTooltip="Favorite">
          <mat-icon>favorite_border</mat-icon>
        </button>
      </div>

      <!-- Center: Controls + Progress -->
      <div class="player-center">
        <div class="controls">
          <button mat-icon-button (click)="toggleShuffle()" [class.ctrl-active]="shuffle" matTooltip="Shuffle">
            <mat-icon>shuffle</mat-icon>
          </button>
          <button mat-icon-button class="ctrl-btn" (click)="previous()" matTooltip="Previous">
            <mat-icon>skip_previous</mat-icon>
          </button>
          <button mat-fab class="play-fab" (click)="togglePlay()" [matTooltip]="isPlaying ? 'Pause' : 'Play'">
            <mat-icon>{{ isPlaying ? 'pause' : 'play_arrow' }}</mat-icon>
          </button>
          <button mat-icon-button class="ctrl-btn" (click)="next()" matTooltip="Next">
            <mat-icon>skip_next</mat-icon>
          </button>
          <button mat-icon-button (click)="toggleRepeat()" [class.ctrl-active]="repeatMode !== 'none'" matTooltip="Repeat">
            <mat-icon>{{ repeatMode === 'one' ? 'repeat_one' : 'repeat' }}</mat-icon>
          </button>
        </div>
        <div class="progress-row">
          <span class="time-label">{{ currentTime | duration }}</span>
          <mat-slider class="progress-slider" min="0" [max]="currentSong.duration" step="1" [discrete]="false">
            <input matSliderThumb [value]="currentTime" (valueChange)="seek($event)">
          </mat-slider>
          <span class="time-label">{{ currentSong.duration | duration }}</span>
        </div>
      </div>

      <!-- Right: Volume + extras -->
      <div class="player-right">
        <a mat-icon-button routerLink="/now-playing" matTooltip="Full player">
          <mat-icon>open_in_full</mat-icon>
        </a>
        <mat-icon class="vol-icon">{{ volume > 0.5 ? 'volume_up' : volume > 0 ? 'volume_down' : 'volume_off' }}</mat-icon>
        <mat-slider class="volume-slider" min="0" max="1" step="0.01" [discrete]="false">
          <input matSliderThumb [value]="volume" (valueChange)="setVolume($event)">
        </mat-slider>
      </div>
    </div>

    <!-- Mini placeholder when nothing playing -->
    <div class="player-placeholder" *ngIf="!currentSong">
      <mat-icon>music_note</mat-icon>
      <span>Select a song to start listening</span>
    </div>
  `,
  styles: [`
    .player-bar {
      position: fixed; bottom: 0; left: 0; right: 0;
      background: var(--surface-1);
      border-top: 1px solid var(--border-color);
      display: grid; grid-template-columns: 1fr 2fr 1fr;
      align-items: center; gap: 1rem; padding: 0.5rem 1.5rem;
      z-index: 999; box-shadow: 0 -4px 30px rgba(0,0,0,0.5);
      height: 88px;
    }
    .player-placeholder {
      position: fixed; bottom: 0; left: 0; right: 0;
      background: var(--surface-1); border-top: 1px solid var(--border-color);
      display: flex; align-items: center; justify-content: center; gap: 0.75rem;
      height: 60px; color: var(--text-muted); font-size: 0.9rem; z-index: 999;
    }
    /* Left */
    .player-left { display: flex; align-items: center; gap: 0.75rem; overflow: hidden; }
    .cover-wrap { flex-shrink: 0; }
    .cover-art { width: 56px; height: 56px; border-radius: 8px; object-fit: cover; box-shadow: 0 4px 12px rgba(0,0,0,0.5); }
    .song-meta { display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
    .song-title-player { font-weight: 600; color: var(--text-primary); font-size: 0.87rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .song-artist-player { color: var(--text-secondary); font-size: 0.78rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .fav-btn mat-icon { font-size: 1.1rem; color: var(--text-muted); }
    /* Center */
    .player-center { display: flex; flex-direction: column; align-items: center; gap: 0.25rem; }
    .controls { display: flex; align-items: center; gap: 0.5rem; }
    .ctrl-btn mat-icon { font-size: 1.8rem !important; width: 1.8rem !important; height: 1.8rem !important; }
    .play-fab { background: var(--primary) !important; color: white !important; width: 44px !important; height: 44px !important; min-height: 44px !important; box-shadow: 0 4px 16px rgba(63,81,181,0.5) !important; }
    .play-fab mat-icon { font-size: 1.5rem !important; }
    .ctrl-active mat-icon { color: var(--primary) !important; }
    .progress-row { display: flex; align-items: center; gap: 0.5rem; width: 100%; }
    .progress-slider { flex: 1; --mdc-slider-handle-color: var(--primary); --mdc-slider-active-track-color: var(--primary); --mdc-slider-inactive-track-color: var(--border-color); }
    .time-label { color: var(--text-muted); font-size: 0.72rem; min-width: 36px; text-align: center; }
    /* Right */
    .player-right { display: flex; align-items: center; gap: 0.5rem; justify-content: flex-end; }
    .vol-icon { color: var(--text-muted); font-size: 1.2rem; }
    .volume-slider { width: 90px; --mdc-slider-handle-color: var(--primary); --mdc-slider-active-track-color: var(--primary); --mdc-slider-inactive-track-color: var(--border-color); }
    @keyframes pulse-cover { 0%,100% { box-shadow: 0 0 0 0 rgba(63,81,181,0.4); } 70% { box-shadow: 0 0 0 8px rgba(63,81,181,0); } }
    @media (max-width: 768px) {
      .player-bar { grid-template-columns: 1fr auto; }
      .player-right { display: none; }
      .player-left .fav-btn { display: none; }
    }
    @media (max-width: 500px) {
      .player-left { max-width: 35%; }
    }
  `],
})
export class SongPlayerComponent implements OnInit, OnDestroy {
  currentSong: CurrentSongInfo | null = null;
  isPlaying = false;
  currentTime = 0;
  volume = 0.8;
  shuffle = false;
  repeatMode: string = 'none';
  private subs: Subscription[] = [];

  constructor(private audioService: AudioService, private musicService: MusicService) {}

  ngOnInit(): void {
    this.subs.push(
      this.audioService.currentSong$.subscribe(s => (this.currentSong = s)),
      this.audioService.isPlaying$.subscribe(p => (this.isPlaying = p)),
      this.audioService.currentTime$.subscribe(t => (this.currentTime = t)),
      this.audioService.volume$.subscribe(v => (this.volume = v)),
      this.audioService.shuffle$.subscribe(s => (this.shuffle = s)),
      this.audioService.repeatMode$.subscribe(r => (this.repeatMode = r))
    );
  }

  togglePlay(): void { this.audioService.togglePlay(); }
  previous(): void { this.musicService.previousSong(); }
  next(): void { this.musicService.nextSong(); }
  seek(time: number): void { this.audioService.seek(time); }
  setVolume(v: number): void { this.audioService.setVolume(v); }
  toggleShuffle(): void { this.audioService.toggleShuffle(); }
  toggleRepeat(): void { this.audioService.toggleRepeat(); }

  ngOnDestroy(): void { this.subs.forEach(s => s.unsubscribe()); }
}
"""

# ─── PLAYLIST DIALOG COMPONENT ────────────────────────────────────────────────
files["components/playlist-manager/playlist-dialog.component.ts"] = r"""import { Component, inject } from '@angular/core';
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
"""

# ─── PLAYLIST MANAGER COMPONENT ───────────────────────────────────────────────
files["components/playlist-manager/playlist-manager.component.ts"] = r"""import { Component, OnInit, OnDestroy } from '@angular/core';
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
"""

# ─── ARTISTS-LIST COMPONENT ───────────────────────────────────────────────────
files["components/artists-list/artists-list.component.ts"] = r"""import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subscription } from 'rxjs';
import { ArtistModel } from '../../models/artist.model';
import { MusicService } from '../../services/music.service';

@Component({
  selector: 'app-artists-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule, MatChipsModule, MatTooltipModule],
  template: `
    <div class="artists-container">
      <div class="page-header">
        <div class="header-title">
          <mat-icon class="header-icon">people</mat-icon>
          <div>
            <h1>Artists</h1>
            <p class="subtitle">Discover amazing artists</p>
          </div>
        </div>
        <mat-form-field appearance="outline" class="search-field">
          <mat-icon matPrefix>search</mat-icon>
          <input matInput [(ngModel)]="searchQuery" placeholder="Search artists...">
          <button mat-icon-button matSuffix *ngIf="searchQuery" (click)="searchQuery = ''">
            <mat-icon>close</mat-icon>
          </button>
        </mat-form-field>
      </div>

      <div class="artists-grid">
        <mat-card class="artist-card" *ngFor="let artist of filteredArtists"
                  (click)="goToArtist(artist.id)">
          <div class="artist-image-wrap">
            <img class="artist-image" [src]="artist.imageUrl" [alt]="artist.name" loading="lazy">
            <div class="artist-overlay">
              <button mat-fab class="artist-play-btn" (click)="playArtist(artist); $event.stopPropagation()">
                <mat-icon>play_arrow</mat-icon>
              </button>
            </div>
          </div>
          <mat-card-content class="artist-body">
            <h3 class="artist-name">{{ artist.name }}</h3>
            <div class="genre-tags">
              <span class="genre-tag" *ngFor="let g of artist.genres">{{ g }}</span>
            </div>
            <div class="artist-stats">
              <span class="followers">
                <mat-icon>people</mat-icon>
                {{ formatFollowers(artist.followers) }} followers
              </span>
              <span class="track-count">
                <mat-icon>music_note</mat-icon>
                {{ getTrackCount(artist.id) }} songs
              </span>
            </div>
          </mat-card-content>
          <mat-card-actions>
            <button mat-button color="primary" (click)="goToArtist(artist.id); $event.stopPropagation()">
              View Profile
            </button>
          </mat-card-actions>
        </mat-card>
      </div>

      <div class="no-results" *ngIf="filteredArtists.length === 0 && searchQuery">
        <mat-icon>search_off</mat-icon>
        <p>No artists found for "{{ searchQuery }}"</p>
      </div>
    </div>
  `,
  styles: [`
    .artists-container { padding: 2rem; max-width: 1400px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
    .header-title { display: flex; align-items: center; gap: 1rem; }
    .header-icon { font-size: 3rem; width: 3rem; height: 3rem; color: var(--primary); }
    h1 { font-family: 'Poppins', sans-serif; font-size: 2rem; font-weight: 700; margin: 0; color: var(--text-primary); }
    .subtitle { margin: 0; color: var(--text-secondary); }
    .search-field { min-width: 260px; }
    .artists-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1.5rem; }
    .artist-card { background: var(--surface-2) !important; border-radius: 20px !important; overflow: hidden; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; border: 1px solid var(--border-color); }
    .artist-card:hover { transform: translateY(-5px); box-shadow: 0 16px 48px rgba(0,0,0,0.5) !important; }
    .artist-image-wrap { position: relative; aspect-ratio: 1; overflow: hidden; }
    .artist-image { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.4s; }
    .artist-card:hover .artist-image { transform: scale(1.06); }
    .artist-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.7), transparent 60%); display: flex; align-items: flex-end; justify-content: flex-end; padding: 1rem; opacity: 0; transition: opacity 0.25s; }
    .artist-card:hover .artist-overlay { opacity: 1; }
    .artist-play-btn { background: var(--primary) !important; width: 48px !important; height: 48px !important; min-height: 48px !important; }
    .artist-body { padding: 1rem 1.25rem 0.5rem !important; }
    .artist-name { font-size: 1.15rem; font-weight: 700; color: var(--text-primary); margin: 0 0 0.5rem; font-family: 'Poppins', sans-serif; }
    .genre-tags { display: flex; flex-wrap: wrap; gap: 0.35rem; margin-bottom: 0.75rem; }
    .genre-tag { font-size: 0.7rem; font-weight: 600; padding: 0.2rem 0.6rem; border-radius: 20px; background: rgba(63,81,181,0.2); color: #9fa8da; text-transform: uppercase; letter-spacing: 0.4px; }
    .artist-stats { display: flex; gap: 1rem; color: var(--text-muted); font-size: 0.8rem; }
    .followers, .track-count { display: flex; align-items: center; gap: 0.25rem; }
    .followers mat-icon, .track-count mat-icon { font-size: 0.9rem; width: 0.9rem; height: 0.9rem; color: var(--primary); }
    .no-results { text-align: center; padding: 4rem; color: var(--text-muted); }
    .no-results mat-icon { font-size: 4rem; width: 4rem; height: 4rem; margin-bottom: 1rem; }
    @media (max-width: 600px) { .artists-container { padding: 1rem; } .artists-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); } }
  `],
})
export class ArtistsListComponent implements OnInit, OnDestroy {
  allArtists: ArtistModel[] = [];
  searchQuery = '';
  private subs: Subscription[] = [];

  get filteredArtists(): ArtistModel[] {
    if (!this.searchQuery.trim()) return this.allArtists;
    const q = this.searchQuery.toLowerCase();
    return this.allArtists.filter(a => a.name.toLowerCase().includes(q) || a.genres.some(g => g.toLowerCase().includes(q)));
  }

  constructor(private musicService: MusicService, private router: Router) {}

  ngOnInit(): void {
    this.subs.push(this.musicService.artists$.subscribe(a => (this.allArtists = a)));
    if (this.musicService.artists.length === 0) {
      this.musicService.loadData().subscribe();
    }
  }

  formatFollowers(n: number): string {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(0) + 'K';
    return n.toString();
  }

  getTrackCount(artistId: number): number {
    return this.musicService.getSongsByArtist(artistId).length;
  }

  goToArtist(id: number): void { this.router.navigate(['/artists', id]); }

  playArtist(artist: ArtistModel): void {
    if (artist.topTrackIds.length > 0) {
      this.musicService.playSong(artist.topTrackIds[0]);
    }
  }

  ngOnDestroy(): void { this.subs.forEach(s => s.unsubscribe()); }
}
"""

# ─── ARTIST-DETAIL COMPONENT ──────────────────────────────────────────────────
files["components/artist-detail/artist-detail.component.ts"] = r"""import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { Subscription } from 'rxjs';
import { ArtistModel } from '../../models/artist.model';
import { SongModel } from '../../models/song.model';
import { Album } from '../../models/album.model';
import { MusicService } from '../../services/music.service';
import { AudioService } from '../../services/audio.service';
import { DurationPipe } from '../../pipes/duration.pipe';
import { HighlightDirective } from '../../directives/highlight.directive';

@Component({
  selector: 'app-artist-detail',
  standalone: true,
  imports: [CommonModule, MatTabsModule, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule, MatTooltipModule, MatDividerModule, DurationPipe, HighlightDirective],
  template: `
    <div class="artist-detail" *ngIf="artist; else loading">
      <!-- Hero Section -->
      <div class="artist-hero" [style.background]="heroGradient">
        <img class="hero-bg" [src]="artist.imageUrl" [alt]="artist.name">
        <div class="hero-overlay"></div>
        <button mat-icon-button class="back-btn" (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div class="hero-content">
          <img class="artist-avatar" [src]="artist.imageUrl" [alt]="artist.name">
          <div class="hero-info">
            <span class="artist-label">Artist</span>
            <h1 class="artist-name">{{ artist.name }}</h1>
            <div class="genre-tags">
              <span class="genre-tag" *ngFor="let g of artist.genres">{{ g }}</span>
            </div>
            <div class="artist-stats">
              <span><mat-icon>people</mat-icon>{{ formatFollowers(artist.followers) }} followers</span>
              <span><mat-icon>music_note</mat-icon>{{ songs.length }} songs</span>
            </div>
            <div class="hero-actions">
              <button mat-raised-button class="play-btn" (click)="playAll()">
                <mat-icon>play_arrow</mat-icon> Play All
              </button>
              <button mat-stroked-button class="follow-btn" (click)="following = !following">
                <mat-icon>{{ following ? 'favorite' : 'favorite_border' }}</mat-icon>
                {{ following ? 'Following' : 'Follow' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="content-section">
        <mat-tab-group animationDuration="300ms" class="artist-tabs">
          <!-- Top Tracks Tab -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon class="tab-icon">music_note</mat-icon>
              Top Tracks
            </ng-template>
            <div class="tab-content">
              <div class="track-row"
                *ngFor="let song of songs; let i = index"
                [appHighlight]="isCurrentSong(song.id)"
                [class.is-playing]="isCurrentSong(song.id)"
                (click)="playSong(song.id)">
                <span class="track-num">
                  <span *ngIf="!isCurrentSong(song.id)">{{ i + 1 }}</span>
                  <mat-icon *ngIf="isCurrentSong(song.id) && isPlaying">graphic_eq</mat-icon>
                  <mat-icon *ngIf="isCurrentSong(song.id) && !isPlaying">pause</mat-icon>
                </span>
                <img class="track-thumb" [src]="song.coverUrl" [alt]="song.albumTitle">
                <div class="track-info">
                  <span class="track-title" [class.active]="isCurrentSong(song.id)">{{ song.title }}</span>
                  <span class="track-album">{{ song.albumTitle }}</span>
                </div>
                <span class="track-genre">{{ song.genre }}</span>
                <span class="track-year">{{ song.releaseYear }}</span>
                <span class="track-duration">{{ song.duration | duration }}</span>
              </div>
            </div>
          </mat-tab>

          <!-- Albums Tab -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon class="tab-icon">album</mat-icon>
              Albums
            </ng-template>
            <div class="tab-content albums-grid">
              <mat-card class="album-card" *ngFor="let album of albums">
                <div class="album-cover-wrap">
                  <img class="album-cover" [src]="album.coverUrl" [alt]="album.title" loading="lazy">
                </div>
                <mat-card-content>
                  <p class="album-title">{{ album.title }}</p>
                  <p class="album-year">{{ album.releaseYear }}</p>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

          <!-- Bio Tab -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon class="tab-icon">info</mat-icon>
              About
            </ng-template>
            <div class="tab-content bio-section">
              <div class="bio-card">
                <div class="bio-header">
                  <img class="bio-avatar" [src]="artist.imageUrl" [alt]="artist.name">
                  <div>
                    <h2>{{ artist.name }}</h2>
                    <div class="genre-tags">
                      <span class="genre-tag" *ngFor="let g of artist.genres">{{ g }}</span>
                    </div>
                  </div>
                </div>
                <mat-divider></mat-divider>
                <p class="bio-text">{{ artist.bio }}</p>
                <div class="bio-stats">
                  <div class="stat-item">
                    <span class="stat-value">{{ formatFollowers(artist.followers) }}</span>
                    <span class="stat-label">Followers</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-value">{{ songs.length }}</span>
                    <span class="stat-label">Songs</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-value">{{ albums.length }}</span>
                    <span class="stat-label">Albums</span>
                  </div>
                </div>
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    </div>

    <ng-template #loading>
      <div class="loading-state">
        <mat-icon>hourglass_empty</mat-icon>
        <p>Loading artist...</p>
      </div>
    </ng-template>
  `,
  styles: [`
    .artist-detail { min-height: 100vh; }
    .artist-hero { position: relative; min-height: 380px; display: flex; align-items: flex-end; overflow: hidden; }
    .hero-bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; filter: blur(20px) brightness(0.4); transform: scale(1.1); }
    .hero-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(18,18,30,1) 10%, rgba(18,18,30,0.6) 60%, transparent); }
    .back-btn { position: absolute; top: 1.5rem; left: 1.5rem; color: white !important; background: rgba(0,0,0,0.4) !important; z-index: 10; }
    .hero-content { position: relative; z-index: 5; display: flex; align-items: flex-end; gap: 2rem; padding: 2rem; width: 100%; }
    .artist-avatar { width: 180px; height: 180px; border-radius: 50%; object-fit: cover; box-shadow: 0 8px 40px rgba(0,0,0,0.6); border: 4px solid rgba(255,255,255,0.2); flex-shrink: 0; }
    .hero-info { flex: 1; }
    .artist-label { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: rgba(255,255,255,0.7); }
    .artist-name { font-family: 'Poppins', sans-serif; font-size: 3.5rem; font-weight: 800; color: white; margin: 0.25rem 0; line-height: 1.1; }
    .genre-tags { display: flex; gap: 0.4rem; flex-wrap: wrap; margin-bottom: 0.75rem; }
    .genre-tag { background: rgba(255,255,255,0.15); color: white; border-radius: 20px; font-size: 0.72rem; font-weight: 600; padding: 0.2rem 0.7rem; text-transform: uppercase; letter-spacing: 0.5px; }
    .artist-stats { display: flex; gap: 1.5rem; color: rgba(255,255,255,0.75); font-size: 0.88rem; margin-bottom: 1rem; }
    .artist-stats span { display: flex; align-items: center; gap: 0.3rem; }
    .artist-stats mat-icon { font-size: 1rem; width: 1rem; height: 1rem; }
    .hero-actions { display: flex; gap: 1rem; }
    .play-btn { background: var(--primary) !important; color: white !important; border-radius: 24px !important; padding: 0 1.5rem !important; font-weight: 700 !important; }
    .follow-btn { border-color: rgba(255,255,255,0.5) !important; color: white !important; border-radius: 24px !important; }
    .content-section { padding: 0 2rem 2rem; }
    .artist-tabs ::ng-deep .mat-mdc-tab { color: var(--text-secondary); }
    .artist-tabs ::ng-deep .mdc-tab--active .mdc-tab__text-label { color: var(--primary) !important; }
    .artist-tabs ::ng-deep .mdc-tab-indicator__content { border-color: var(--primary) !important; }
    .tab-icon { margin-right: 0.4rem; font-size: 1.1rem; }
    .tab-content { padding: 1.5rem 0; }
    .track-row { display: grid; grid-template-columns: 36px 48px 1fr 100px 60px 60px; align-items: center; gap: 1rem; padding: 0.5rem 0.75rem; border-radius: 8px; cursor: pointer; transition: background 0.15s; }
    .track-row:hover { background: rgba(255,255,255,0.05); }
    .track-row.is-playing { background: rgba(63,81,181,0.12); }
    .track-num { color: var(--text-muted); text-align: center; font-size: 0.85rem; }
    .track-num mat-icon { color: var(--primary); font-size: 1rem; width: 1rem; height: 1rem; }
    .track-thumb { width: 44px; height: 44px; border-radius: 6px; object-fit: cover; }
    .track-info { overflow: hidden; }
    .track-title { display: block; font-weight: 500; color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.9rem; }
    .track-title.active { color: var(--primary); }
    .track-album { display: block; color: var(--text-secondary); font-size: 0.78rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .track-genre { color: var(--text-muted); font-size: 0.78rem; }
    .track-year, .track-duration { color: var(--text-muted); font-size: 0.82rem; text-align: right; }
    .albums-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 1.25rem; }
    .album-card { background: var(--surface-2) !important; border-radius: 12px !important; overflow: hidden; cursor: pointer; transition: transform 0.2s; }
    .album-card:hover { transform: translateY(-3px); }
    .album-cover-wrap { aspect-ratio: 1; overflow: hidden; }
    .album-cover { width: 100%; height: 100%; object-fit: cover; }
    .album-title { font-weight: 600; color: var(--text-primary); margin: 0 0 0.2rem; font-size: 0.9rem; }
    .album-year { color: var(--text-muted); margin: 0; font-size: 0.8rem; }
    .bio-section { max-width: 800px; }
    .bio-card { background: var(--surface-2); border-radius: 16px; padding: 1.5rem; }
    .bio-header { display: flex; align-items: center; gap: 1.5rem; margin-bottom: 1.25rem; }
    .bio-avatar { width: 80px; height: 80px; border-radius: 50%; object-fit: cover; }
    .bio-card h2 { font-family: 'Poppins', sans-serif; font-size: 1.5rem; margin: 0 0 0.4rem; color: var(--text-primary); }
    .bio-text { color: var(--text-secondary); line-height: 1.8; margin: 1.25rem 0; }
    .bio-stats { display: flex; gap: 2rem; margin-top: 1.5rem; }
    .stat-item { display: flex; flex-direction: column; align-items: center; }
    .stat-value { font-size: 1.5rem; font-weight: 700; color: var(--text-primary); font-family: 'Poppins', sans-serif; }
    .stat-label { font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
    .loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 6rem; color: var(--text-muted); }
    .loading-state mat-icon { font-size: 3rem; width: 3rem; height: 3rem; margin-bottom: 1rem; }
    @media (max-width: 768px) {
      .hero-content { flex-direction: column; align-items: flex-start; }
      .artist-avatar { width: 100px; height: 100px; }
      .artist-name { font-size: 2rem; }
      .track-row { grid-template-columns: 36px 1fr 60px; }
      .track-thumb, .track-genre, .track-year { display: none; }
      .content-section { padding: 0 1rem 1rem; }
    }
  `],
})
export class ArtistDetailComponent implements OnInit, OnDestroy {
  artist: ArtistModel | null = null;
  songs: SongModel[] = [];
  albums: Album[] = [];
  isPlaying = false;
  currentSongId: number | null = null;
  following = false;
  heroGradient = 'linear-gradient(135deg, #1a1a2e, #16213e)';
  private subs: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private musicService: MusicService,
    private audioService: AudioService
  ) {}

  ngOnInit(): void {
    this.subs.push(
      this.audioService.isPlaying$.subscribe(p => (this.isPlaying = p)),
      this.audioService.currentSong$.subscribe(s => (this.currentSongId = s?.id ?? null))
    );
    const load = () => {
      const id = Number(this.route.snapshot.paramMap.get('id'));
      this.artist = this.musicService.getArtistById(id) ?? null;
      if (this.artist) {
        this.songs = this.musicService.getSongsByArtist(id);
        this.albums = this.musicService.albums.filter(a => a.artistId === id);
        this.setGradient(id);
      }
    };
    if (this.musicService.artists.length === 0) {
      this.musicService.loadData().subscribe(load);
    } else {
      load();
    }
  }

  setGradient(id: number): void {
    const gradients = [
      'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)',
      'linear-gradient(135deg, #1f1c2c, #928dab)',
      'linear-gradient(135deg, #0f2027, #203a43, #2c5364)',
      'linear-gradient(135deg, #16222a, #3a6186)',
    ];
    this.heroGradient = gradients[id % gradients.length];
  }

  isCurrentSong(id: number): boolean { return this.currentSongId === id; }
  playSong(id: number): void { this.musicService.playSong(id); }
  playAll(): void { if (this.songs.length > 0) this.musicService.playSong(this.songs[0].id); }
  formatFollowers(n: number): string {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(0) + 'K';
    return n.toString();
  }
  goBack(): void { this.router.navigate(['/artists']); }
  ngOnDestroy(): void { this.subs.forEach(s => s.unsubscribe()); }
}
"""

# ─── NOW PLAYING COMPONENT ────────────────────────────────────────────────────
files["components/now-playing/now-playing.component.ts"] = r"""import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSliderModule } from '@angular/material/slider';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subscription } from 'rxjs';
import { AudioService, CurrentSongInfo, RepeatMode } from '../../services/audio.service';
import { MusicService } from '../../services/music.service';
import { DurationPipe } from '../../pipes/duration.pipe';
import { PulseDirective } from '../../directives/pulse.directive';

@Component({
  selector: 'app-now-playing',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSliderModule, MatButtonModule, MatIconModule, MatTooltipModule, DurationPipe, PulseDirective],
  template: `
    <div class="now-playing-screen" [class.has-song]="currentSong">
      <!-- Background art blur -->
      <div class="bg-art" *ngIf="currentSong" [style.background-image]="'url(' + currentSong.coverUrl + ')'"></div>
      <div class="bg-overlay"></div>

      <div class="np-content" *ngIf="currentSong; else noSong">
        <!-- Album Art -->
        <div class="art-section">
          <div class="art-wrapper" [class.is-playing]="isPlaying">
            <img class="album-art" [src]="currentSong.coverUrl" [alt]="currentSong.albumTitle" [appPulse]="isPlaying">
          </div>
          <div class="vinyl-ring" [class.spin]="isPlaying"></div>
        </div>

        <!-- Info & Controls -->
        <div class="info-section">
          <div class="song-info">
            <h2 class="np-title">{{ currentSong.title }}</h2>
            <p class="np-artist">{{ currentSong.artist }}</p>
            <p class="np-album">{{ currentSong.albumTitle }}</p>
          </div>

          <div class="action-row">
            <button mat-icon-button class="action-btn" [class.heart-active]="liked" (click)="liked = !liked" matTooltip="Like">
              <mat-icon>{{ liked ? 'favorite' : 'favorite_border' }}</mat-icon>
            </button>
            <button mat-icon-button class="action-btn" matTooltip="Share">
              <mat-icon>share</mat-icon>
            </button>
          </div>

          <!-- Progress -->
          <div class="progress-section">
            <mat-slider class="np-slider" min="0" [max]="currentSong.duration" step="1">
              <input matSliderThumb [value]="currentTime" (valueChange)="seek($event)">
            </mat-slider>
            <div class="time-row">
              <span>{{ currentTime | duration }}</span>
              <span>{{ currentSong.duration | duration }}</span>
            </div>
          </div>

          <!-- Controls -->
          <div class="controls-section">
            <button mat-icon-button class="ctrl-icon" [class.active]="shuffle" (click)="toggleShuffle()" matTooltip="Shuffle">
              <mat-icon>shuffle</mat-icon>
            </button>
            <button mat-icon-button class="ctrl-big" (click)="previous()">
              <mat-icon>skip_previous</mat-icon>
            </button>
            <button mat-fab class="np-play-btn" (click)="togglePlay()">
              <mat-icon>{{ isPlaying ? 'pause' : 'play_arrow' }}</mat-icon>
            </button>
            <button mat-icon-button class="ctrl-big" (click)="next()">
              <mat-icon>skip_next</mat-icon>
            </button>
            <button mat-icon-button class="ctrl-icon" [class.active]="repeatMode !== 'none'" (click)="toggleRepeat()" matTooltip="Repeat">
              <mat-icon>{{ repeatMode === 'one' ? 'repeat_one' : 'repeat' }}</mat-icon>
            </button>
          </div>

          <!-- Volume -->
          <div class="volume-section">
            <mat-icon class="vol-icon">{{ volume > 0.5 ? 'volume_up' : volume > 0 ? 'volume_down' : 'volume_off' }}</mat-icon>
            <mat-slider class="np-volume" min="0" max="1" step="0.01">
              <input matSliderThumb [value]="volume" (valueChange)="setVolume($event)">
            </mat-slider>
          </div>
        </div>
      </div>

      <ng-template #noSong>
        <div class="no-song">
          <div class="no-song-art">
            <mat-icon>headphones</mat-icon>
          </div>
          <h2>Nothing playing right now</h2>
          <p>Pick a song from your library to start listening</p>
          <button mat-raised-button color="primary" (click)="goToSongs()">
            <mat-icon>library_music</mat-icon>
            Browse Songs
          </button>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .now-playing-screen {
      min-height: calc(100vh - 144px);
      display: flex; align-items: center; justify-content: center;
      position: relative; overflow: hidden; padding: 2rem;
    }
    .bg-art {
      position: absolute; inset: -20px;
      background-size: cover; background-position: center;
      filter: blur(60px) brightness(0.25);
      transform: scale(1.2);
    }
    .bg-overlay { position: absolute; inset: 0; background: rgba(10,10,20,0.65); }
    .np-content {
      position: relative; z-index: 5;
      display: flex; gap: 4rem; align-items: center;
      max-width: 900px; width: 100%;
    }
    /* Art */
    .art-section { position: relative; flex-shrink: 0; }
    .art-wrapper { width: 320px; height: 320px; position: relative; z-index: 2; transition: transform 0.3s; }
    .art-wrapper.is-playing { transform: scale(1.02); }
    .album-art { width: 100%; height: 100%; object-fit: cover; border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.6); display: block; }
    .vinyl-ring {
      Position: absolute; top: 50%; left: 50%;
      width: 120px; height: 120px;
      border: 3px solid rgba(255,255,255,0.1);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      z-index: 1;
    }
    .vinyl-ring.spin { animation: spin 8s linear infinite; }
    @keyframes spin { to { transform: translate(-50%, -50%) rotate(360deg); } }
    /* Info */
    .info-section { flex: 1; display: flex; flex-direction: column; gap: 1.5rem; }
    .np-title { font-family: 'Poppins', sans-serif; font-size: 2rem; font-weight: 700; color: white; margin: 0; }
    .np-artist { font-size: 1.1rem; color: rgba(255,255,255,0.7); margin: 0.25rem 0 0.1rem; cursor: pointer; }
    .np-album { font-size: 0.9rem; color: rgba(255,255,255,0.5); margin: 0; }
    .action-row { display: flex; gap: 0.5rem; }
    .action-btn mat-icon { color: rgba(255,255,255,0.6); }
    .heart-active mat-icon { color: #e91e63 !important; }
    /* Progress */
    .progress-section {}
    .np-slider { width: 100%; --mdc-slider-handle-color: white; --mdc-slider-active-track-color: white; --mdc-slider-inactive-track-color: rgba(255,255,255,0.3); }
    .time-row { display: flex; justify-content: space-between; color: rgba(255,255,255,0.5); font-size: 0.8rem; margin-top: 0.25rem; }
    /* Controls */
    .controls-section { display: flex; align-items: center; justify-content: center; gap: 1rem; }
    .ctrl-icon mat-icon { color: rgba(255,255,255,0.6) !important; }
    .ctrl-icon.active mat-icon { color: white !important; }
    .ctrl-big { color: white !important; }
    .ctrl-big mat-icon { font-size: 2rem !important; width: 2rem !important; height: 2rem !important; }
    .np-play-btn { background: white !important; color: #1a1a2e !important; width: 64px !important; height: 64px !important; min-height: 64px !important; box-shadow: 0 8px 32px rgba(255,255,255,0.25) !important; }
    .np-play-btn mat-icon { font-size: 2rem !important; }
    /* Volume */
    .volume-section { display: flex; align-items: center; gap: 0.75rem; }
    .vol-icon { color: rgba(255,255,255,0.5); }
    .np-volume { flex: 1; --mdc-slider-handle-color: white; --mdc-slider-active-track-color: white; --mdc-slider-inactive-track-color: rgba(255,255,255,0.3); }
    /* No song */
    .no-song { position: relative; z-index: 5; text-align: center; color: white; }
    .no-song-art { width: 160px; height: 160px; background: rgba(255,255,255,0.06); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 2rem; }
    .no-song-art mat-icon { font-size: 5rem; width: 5rem; height: 5rem; color: rgba(255,255,255,0.3); }
    .no-song h2 { font-family: 'Poppins', sans-serif; font-size: 2rem; margin: 0 0 0.5rem; }
    .no-song p { color: rgba(255,255,255,0.6); margin: 0 0 2rem; }
    @keyframes pulse-cover { 0%,100% { box-shadow: 0 0 0 0 rgba(255,255,255,0.3); } 70% { box-shadow: 0 0 0 20px rgba(255,255,255,0); } }
    @media (max-width: 768px) {
      .np-content { flex-direction: column; gap: 2rem; align-items: center; }
      .art-wrapper { width: 240px; height: 240px; }
      .info-section { width: 100%; }
      .np-title { font-size: 1.5rem; }
    }
  `],
})
export class NowPlayingComponent implements OnInit, OnDestroy {
  currentSong: CurrentSongInfo | null = null;
  isPlaying = false;
  currentTime = 0;
  volume = 0.8;
  shuffle = false;
  repeatMode = 'none';
  liked = false;
  private subs: Subscription[] = [];

  constructor(private audioService: AudioService, private musicService: MusicService, private router: Router) {}

  ngOnInit(): void {
    this.subs.push(
      this.audioService.currentSong$.subscribe(s => (this.currentSong = s)),
      this.audioService.isPlaying$.subscribe(p => (this.isPlaying = p)),
      this.audioService.currentTime$.subscribe(t => (this.currentTime = t)),
      this.audioService.volume$.subscribe(v => (this.volume = v)),
      this.audioService.shuffle$.subscribe(s => (this.shuffle = s)),
      this.audioService.repeatMode$.subscribe(r => (this.repeatMode = r))
    );
  }

  togglePlay(): void { this.audioService.togglePlay(); }
  previous(): void { this.musicService.previousSong(); }
  next(): void { this.musicService.nextSong(); }
  seek(t: number): void { this.audioService.seek(t); }
  setVolume(v: number): void { this.audioService.setVolume(v); }
  toggleShuffle(): void { this.audioService.toggleShuffle(); }
  toggleRepeat(): void { this.audioService.toggleRepeat(); }
  goToSongs(): void { this.router.navigate(['/songs']); }
  ngOnDestroy(): void { this.subs.forEach(s => s.unsubscribe()); }
}
"""

# ─── APP ROOT COMPONENT ───────────────────────────────────────────────────────
files["app.ts"] = r"""import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SongPlayerComponent } from './components/song-player/song-player.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, SongPlayerComponent],
  template: `
    <div class="app-container">
      <app-navbar></app-navbar>
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
      <app-song-player></app-song-player>
    </div>
  `,
  styles: [`
    .app-container { min-height: 100vh; background: var(--bg-primary); display: flex; flex-direction: column; }
    .main-content { flex: 1; padding-bottom: 96px; }
  `],
})
export class App {}
"""

# Write all files
for rel_path, content in files.items():
    full_path = os.path.join(BASE, rel_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Written: {rel_path}")

print("\nAll component files written successfully!")
