import { Component, OnInit, OnDestroy } from '@angular/core';
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
