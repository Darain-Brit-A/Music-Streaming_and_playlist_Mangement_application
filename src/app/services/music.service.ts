import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { SongModel, Song, Genre } from '../models/song.model';
import { ArtistModel, Artist } from '../models/artist.model';
import { Album } from '../models/album.model';
import { AudioService } from './audio.service';

@Injectable({ providedIn: 'root' })
export class MusicService {
  private songsSubject = new BehaviorSubject<SongModel[]>([]);
  private artistsSubject = new BehaviorSubject<ArtistModel[]>([]);
  private albumsSubject = new BehaviorSubject<Album[]>([]);
  private queueSubject = new BehaviorSubject<SongModel[]>([]);
  private currentIndexSubject = new BehaviorSubject<number>(-1);

  songs$: Observable<SongModel[]> = this.songsSubject.asObservable();
  artists$: Observable<ArtistModel[]> = this.artistsSubject.asObservable();
  albums$: Observable<Album[]> = this.albumsSubject.asObservable();
  queue$: Observable<SongModel[]> = this.queueSubject.asObservable();

  constructor(private http: HttpClient, private audioService: AudioService) {
    this.audioService.songEnded$.subscribe(() => this.nextSong());
  }

  loadData(): Observable<Song[]> {
    this.http.get<ArtistModel[]>('/data/artists.json').subscribe(data => {
      this.artistsSubject.next(data.map(a => new ArtistModel(a.id, a.name, a.bio, a.imageUrl, a.genres, a.followers, a.topTrackIds)));
    });
    this.http.get<Album[]>('/data/albums.json').subscribe(data => this.albumsSubject.next(data));

    return this.http.get<Song[]>('/data/songs.json').pipe(
      tap(data => {
        const songs = data.map(s => new SongModel(s.id, s.title, s.duration, s.artistId, s.artistName, s.albumId, s.albumTitle, s.genre as Genre, s.isFavorite, s.url, s.coverUrl, s.releaseYear));
        this.songsSubject.next(songs);
        this.queueSubject.next(songs);
      })
    );
  }

  playSong(songId: number): void {
    const songs = this.songsSubject.value;
    const idx = songs.findIndex(s => s.id === songId);
    if (idx === -1) return;
    this.currentIndexSubject.next(idx);
    const song = songs[idx];
    this.audioService.playSong(song.url, song.id, song.title, song.artistName, song.duration, song.coverUrl, song.albumTitle);
  }

  nextSong(): void {
    const songs = this.songsSubject.value;
    const shuffle = this.audioService['shuffleSubject'].value;
    let idx: number;
    if (shuffle) {
      idx = Math.floor(Math.random() * songs.length);
    } else {
      idx = (this.currentIndexSubject.value + 1) % songs.length;
    }
    this.currentIndexSubject.next(idx);
    this.playSong(songs[idx].id);
  }

  previousSong(): void {
    const songs = this.songsSubject.value;
    const idx = Math.max(0, this.currentIndexSubject.value - 1);
    this.currentIndexSubject.next(idx);
    this.playSong(songs[idx].id);
  }

  toggleFavorite(songId: number): void {
    const songs = this.songsSubject.value;
    const song = songs.find(s => s.id === songId);
    if (song) {
      song.toggleFavorite();
      this.songsSubject.next([...songs]);
    }
  }

  getSongById(id: number): SongModel | undefined {
    return this.songsSubject.value.find(s => s.id === id);
  }

  getSongsByArtist(artistId: number): SongModel[] {
    return this.songsSubject.value.filter(s => s.artistId === artistId);
  }

  getSongsByGenre(genre: Genre): SongModel[] {
    return this.songsSubject.value.filter(s => s.genre === genre);
  }

  getArtistById(id: number): ArtistModel | undefined {
    return this.artistsSubject.value.find(a => a.id === id);
  }

  getFavorites(): SongModel[] {
    return this.songsSubject.value.filter(s => s.isFavorite);
  }

  get songs(): SongModel[] {
    return this.songsSubject.value;
  }

  get artists(): ArtistModel[] {
    return this.artistsSubject.value;
  }

  get albums(): Album[] {
    return this.albumsSubject.value;
  }
}
