export interface Artist {
  id: number;
  name: string;
  bio: string;
  imageUrl: string;
  genres: string[];
  followers: number;
  topTrackIds: number[];
}

export class ArtistModel implements Artist {
  constructor(
    public id: number,
    public name: string,
    public bio: string,
    public imageUrl: string = '',
    public genres: string[] = [],
    public followers: number = 0,
    public topTrackIds: number[] = []
  ) {}

  get formattedFollowers(): string {
    if (this.followers >= 1_000_000) {
      return (this.followers / 1_000_000).toFixed(1) + 'M';
    }
    if (this.followers >= 1_000) {
      return (this.followers / 1_000).toFixed(0) + 'K';
    }
    return this.followers.toString();
  }
}
