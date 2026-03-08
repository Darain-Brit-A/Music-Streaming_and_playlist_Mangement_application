import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AudioService, CurrentSongInfo } from '../../services/audio.service';
import { UserService } from '../../services/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatToolbarModule, MatButtonModule, MatIconModule, MatTooltipModule],
  template: `
    <mat-toolbar class="navbar-toolbar">
      <div class="nav-brand">
        <mat-icon class="brand-icon">graphic_eq</mat-icon>
        <span class="brand-name">VibeStream</span>
      </div>
      <div class="nav-links">
        <a mat-button routerLink="/songs" routerLinkActive="nav-active">
          <mat-icon>music_note</mat-icon><span>Songs</span>
        </a>
        <a mat-button routerLink="/artists" routerLinkActive="nav-active">
          <mat-icon>people</mat-icon><span>Artists</span>
        </a>
        <a mat-button routerLink="/playlists" routerLinkActive="nav-active">
          <mat-icon>queue_music</mat-icon><span>Playlists</span>
        </a>
        <a mat-button routerLink="/now-playing" routerLinkActive="nav-active">
          <mat-icon>headphones</mat-icon><span>Now Playing</span>
        </a>
      </div>
      <div class="nav-actions">
        <span *ngIf="currentSong" class="mini-player-bar">
          <mat-icon class="eq-icon" *ngIf="isPlaying">graphic_eq</mat-icon>
          <span class="mini-title">{{ currentSong.title }}</span>
        </span>
        <button mat-icon-button (click)="toggleTheme()" matTooltip="Toggle theme">
          <mat-icon>{{ isDark ? 'light_mode' : 'dark_mode' }}</mat-icon>
        </button>
      </div>
    </mat-toolbar>
  `,
  styles: [` 
    .navbar-toolbar { background: var(--surface-1) !important; border-bottom: 1px solid var(--border-color); box-shadow: 0 2px 20px rgba(0,0,0,0.4); position: sticky; top: 0; z-index: 1000; padding: 0 1.5rem; gap: 1rem; }
    .nav-brand { display: flex; align-items: center; gap: 0.5rem; margin-right: 2rem; }
    .brand-icon { font-size: 2rem; width: 2rem; height: 2rem; color: var(--primary); animation: eq-bounce 1.4s ease-in-out infinite; }
    @keyframes eq-bounce { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(1.3); } }
    .brand-name { font-family: 'Poppins', sans-serif; font-size: 1.4rem; font-weight: 800; background: linear-gradient(135deg, var(--primary), var(--accent)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .nav-links { display: flex; align-items: center; gap: 0.25rem; flex: 1; }
    .nav-links a { color: var(--text-secondary) !important; border-radius: 8px !important; display: flex; align-items: center; gap: 0.3rem; transition: all 0.2s ease; font-weight: 500; }
    .nav-links a:hover { color: var(--text-primary) !important; background: rgba(255,255,255,0.07) !important; }
    .nav-links a.nav-active { color: var(--primary) !important; background: rgba(63,81,181,0.15) !important; }
    .nav-actions { display: flex; align-items: center; gap: 0.5rem; }
    .mini-player-bar { display: flex; align-items: center; gap: 0.4rem; background: rgba(255,255,255,0.05); padding: 0.25rem 0.75rem; border-radius: 20px; border: 1px solid var(--border-color); }
    .eq-icon { font-size: 1rem; width: 1rem; height: 1rem; color: var(--primary); animation: eq-bounce 0.8s ease-in-out infinite; }
    .mini-title { font-size: 0.75rem; color: var(--text-secondary); max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    @media (max-width: 768px) { .brand-name { display: none; } .nav-links span { display: none; } .mini-player-bar { display: none; } }
  `],
})
export class NavbarComponent implements OnInit, OnDestroy {
  currentSong: CurrentSongInfo | null = null;
  isPlaying = false;
  isDark = true;
  private subs: Subscription[] = [];

  constructor(private audioService: AudioService, private userService: UserService) {}

  ngOnInit(): void {
    this.subs.push(
      this.audioService.currentSong$.subscribe(s => (this.currentSong = s)),
      this.audioService.isPlaying$.subscribe(p => (this.isPlaying = p))
    );
  }

  toggleTheme(): void {
    this.userService.toggleTheme();
    this.isDark = !this.isDark;
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }
}
