import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

export interface CurrentSongInfo {
  id: number;
  title: string;
  artist: string;
  duration: number;
  coverUrl: string;
  albumTitle: string;
}

export enum RepeatMode {
  None = 'none',
  One = 'one',
  All = 'all',
}

@Injectable({ providedIn: 'root' })
export class AudioService {
  private audio: HTMLAudioElement;
  private currentSongId: number | null = null;

  private currentSongSubject = new BehaviorSubject<CurrentSongInfo | null>(null);
  private isPlayingSubject = new BehaviorSubject<boolean>(false);
  private currentTimeSubject = new BehaviorSubject<number>(0);
  private volumeSubject = new BehaviorSubject<number>(0.8);
  private shuffleSubject = new BehaviorSubject<boolean>(false);
  private repeatModeSubject = new BehaviorSubject<RepeatMode>(RepeatMode.None);
  private songEndedSubject = new Subject<void>();

  currentSong$: Observable<CurrentSongInfo | null> = this.currentSongSubject.asObservable();
  isPlaying$: Observable<boolean> = this.isPlayingSubject.asObservable();
  currentTime$: Observable<number> = this.currentTimeSubject.asObservable();
  volume$: Observable<number> = this.volumeSubject.asObservable();
  shuffle$: Observable<boolean> = this.shuffleSubject.asObservable();
  repeatMode$: Observable<RepeatMode> = this.repeatModeSubject.asObservable();
  songEnded$: Observable<void> = this.songEndedSubject.asObservable();

  constructor() {
    this.audio = new Audio();
    this.audio.volume = 0.8;

    this.audio.addEventListener('timeupdate', () => {
      this.currentTimeSubject.next(this.audio.currentTime);
    });

    this.audio.addEventListener('ended', () => {
      const repeatMode = this.repeatModeSubject.value;
      if (repeatMode === RepeatMode.One) {
        this.audio.currentTime = 0;
        this.audio.play();
      } else {
        this.isPlayingSubject.next(false);
        this.songEndedSubject.next();
      }
    });

    this.audio.addEventListener('play', () => this.isPlayingSubject.next(true));
    this.audio.addEventListener('pause', () => this.isPlayingSubject.next(false));
  }

  playSong(
    url: string,
    id: number,
    title: string,
    artist: string,
    duration: number,
    coverUrl: string = '',
    albumTitle: string = ''
  ): void {
    if (this.currentSongId === id) {
      this.togglePlay();
      return;
    }
    this.audio.src = url;
    this.currentSongId = id;
    this.currentSongSubject.next({ id, title, artist, duration, coverUrl, albumTitle });
    this.audio.play().catch(() => {});
  }

  togglePlay(): void {
    if (this.audio.paused) {
      this.audio.play().catch(() => {});
    } else {
      this.audio.pause();
    }
  }

  pause(): void {
    this.audio.pause();
  }

  resume(): void {
    if (this.audio.src) this.audio.play().catch(() => {});
  }

  stop(): void {
    this.audio.pause();
    this.audio.currentTime = 0;
    this.currentSongId = null;
    this.isPlayingSubject.next(false);
  }

  seek(time: number): void {
    this.audio.currentTime = time;
  }

  setVolume(v: number): void {
    this.audio.volume = Math.max(0, Math.min(1, v));
    this.volumeSubject.next(this.audio.volume);
  }

  toggleShuffle(): void {
    this.shuffleSubject.next(!this.shuffleSubject.value);
  }

  toggleRepeat(): void {
    const modes = [RepeatMode.None, RepeatMode.All, RepeatMode.One];
    const idx = modes.indexOf(this.repeatModeSubject.value);
    this.repeatModeSubject.next(modes[(idx + 1) % modes.length]);
  }

  isCurrentSong(id: number): boolean {
    return this.currentSongId === id;
  }

  getCurrentSongId(): number | null {
    return this.currentSongId;
  }

  get currentTime(): number {
    return this.audio.currentTime;
  }
}

