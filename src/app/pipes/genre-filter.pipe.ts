import { Pipe, PipeTransform } from '@angular/core';
import { SongModel } from '../models/song.model';

@Pipe({ name: 'genreFilter', standalone: true, pure: false })
export class GenreFilterPipe implements PipeTransform {
  transform(songs: SongModel[], genre: string | null, search: string = ''): SongModel[] {
    if (!songs) return [];
    let result = songs;

    if (genre && genre !== 'All') {
      result = result.filter(s => s.genre === genre);
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        s =>
          s.title.toLowerCase().includes(q) ||
          s.artistName.toLowerCase().includes(q) ||
          s.albumTitle.toLowerCase().includes(q)
      );
    }

    return result;
  }
}
