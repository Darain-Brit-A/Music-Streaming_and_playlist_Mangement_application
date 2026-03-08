import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { PlaylistModel } from '../models/playlist.model';

@Injectable({ providedIn: 'root' })
export class PlaylistService {
  private playlistsSubject = new BehaviorSubject<PlaylistModel[]>([
    new PlaylistModel(1, 'Relaxation Mix', 'Perfect for meditation and relaxation', [1, 4, 11], new Date('2024-01-15'), 'https://picsum.photos/seed/relax/300/300'),
    new PlaylistModel(2, 'Night Drive', 'Songs for a late-night drive', [6, 7, 12, 13], new Date('2024-02-10'), 'https://picsum.photos/seed/nightdrive/300/300'),
    new PlaylistModel(3, 'Morning Energy', 'Start your day with energy', [3, 5, 18, 19], new Date('2024-03-01'), 'https://picsum.photos/seed/morning/300/300'),
    new PlaylistModel(4, 'Favorites', 'Your all-time favourite tracks', [1, 4, 7, 9, 13, 15, 18], new Date('2024-01-01'), 'https://picsum.photos/seed/favorites/300/300'),
  ]);

  playlists$: Observable<PlaylistModel[]> = this.playlistsSubject.asObservable();

  getPlaylists(): PlaylistModel[] {
    return this.playlistsSubject.value;
  }

  getPlaylistById(id: number): PlaylistModel | undefined {
    return this.playlistsSubject.value.find(p => p.id === id);
  }

  addSongToPlaylist(playlistId: number, songId: number): boolean {
    const playlists = this.playlistsSubject.value;
    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist) return false;
    if (playlist.songIds.includes(songId)) return false;
    playlist.addSong(songId);
    this.playlistsSubject.next([...playlists]);
    return true;
  }

  removeSongFromPlaylist(playlistId: number, songId: number): void {
    const playlists = this.playlistsSubject.value;
    const playlist = playlists.find(p => p.id === playlistId);
    if (playlist) {
      playlist.removeSong(songId);
      this.playlistsSubject.next([...playlists]);
    }
  }

  createPlaylist(name: string, description: string, coverUrl: string = ''): PlaylistModel {
    const playlists = this.playlistsSubject.value;
    const newId = Math.max(...playlists.map(p => p.id), 0) + 1;
    const cover = coverUrl || `https://picsum.photos/seed/playlist${newId}/300/300`;
    const newPlaylist = new PlaylistModel(newId, name, description, [], new Date(), cover);
    this.playlistsSubject.next([...playlists, newPlaylist]);
    return newPlaylist;
  }

  updatePlaylist(id: number, name: string, description: string): void {
    const playlists = this.playlistsSubject.value;
    const playlist = playlists.find(p => p.id === id);
    if (playlist) {
      playlist.name = name;
      playlist.description = description;
      this.playlistsSubject.next([...playlists]);
    }
  }

  deletePlaylist(id: number): void {
    this.playlistsSubject.next(this.playlistsSubject.value.filter(p => p.id !== id));
  }
}

