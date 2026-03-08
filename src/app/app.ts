import { Component } from '@angular/core';
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
