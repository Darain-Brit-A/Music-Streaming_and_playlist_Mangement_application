import { Component, OnInit, OnDestroy } from '@angular/core';
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
