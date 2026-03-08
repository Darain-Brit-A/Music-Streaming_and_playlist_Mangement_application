import { Component, OnInit, OnDestroy } from '@angular/core';
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
