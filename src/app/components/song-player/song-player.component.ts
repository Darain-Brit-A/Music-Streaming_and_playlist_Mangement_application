import { Component, OnInit, OnDestroy } from '@angular/core';
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
