export interface Playlist {
  id: number;
  name: string;
  description: string;
  songIds: number[];
  createdAt: Date;
  coverUrl?: string;
}

export class PlaylistModel implements Playlist {
  constructor(
    public id: number,
    public name: string,
    public description: string,
    public songIds: number[] = [],
    public createdAt: Date = new Date(),
    public coverUrl: string = ''
  ) {}

  addSong(songId: number): void {
    if (!this.songIds.includes(songId)) {
      this.songIds.push(songId);
    }
  }

  removeSong(songId: number): void {
    this.songIds = this.songIds.filter(id => id !== songId);
  }

  get songCount(): number {
    return this.songIds.length;
  }
}
