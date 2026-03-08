import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/songs', pathMatch: 'full' },
  {
    path: 'songs',
    loadComponent: () =>
      import('./components/song-list/song-list.component').then(m => m.SongListComponent),
  },
  {
    path: 'artists',
    loadComponent: () =>
      import('./components/artists-list/artists-list.component').then(m => m.ArtistsListComponent),
  },
  {
    path: 'artists/:id',
    loadComponent: () =>
      import('./components/artist-detail/artist-detail.component').then(m => m.ArtistDetailComponent),
  },
  {
    path: 'playlists',
    loadComponent: () =>
      import('./components/playlist-manager/playlist-manager.component').then(
        m => m.PlaylistManagerComponent
      ),
  },
  {
    path: 'now-playing',
    loadComponent: () =>
      import('./components/now-playing/now-playing.component').then(m => m.NowPlayingComponent),
  },
  { path: '**', redirectTo: '/songs' },
];
