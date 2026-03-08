export enum SongStatus {
  Playing = 'PLAYING',
  Paused = 'PAUSED',
  Stopped = 'STOPPED'
}

export enum Genre {
  Ambient = 'Ambient',
  Electronic = 'Electronic',
  Classical = 'Classical',
  Jazz = 'Jazz',
  Pop = 'Pop',
  Rock = 'Rock',
  Acoustic = 'Acoustic'
}

export interface Song {
  id: number;
  title: string;
  duration: number;
  artistId: number;
  artistName: string;
  albumId: number;
  albumTitle: string;
  genre: Genre;
  isFavorite: boolean;
  url: string;
  coverUrl: string;
  releaseYear: number;
}

export class SongModel implements Song {
  constructor(
    public id: number,
    public title: string,
    public duration: number,
    public artistId: number,
    public artistName: string,
    public albumId: number,
    public albumTitle: string,
    public genre: Genre,
    public isFavorite: boolean = false,
    public url: string = '',
    public coverUrl: string = '',
    public releaseYear: number = new Date().getFullYear()
  ) {}

  toggleFavorite(): void {
    this.isFavorite = !this.isFavorite;
  }

  getDurationFormatted(): string {
    const minutes = Math.floor(this.duration / 60);
    const seconds = this.duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}

export const ALL_GENRES: Genre[] = Object.values(Genre);
