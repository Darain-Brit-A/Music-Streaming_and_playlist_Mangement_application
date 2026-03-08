import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface UserPreferences {
  theme: 'dark' | 'light';
  favoriteGenres: string[];
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private prefsSubject = new BehaviorSubject<UserPreferences>({
    theme: 'dark',
    favoriteGenres: [],
  });

  preferences$: Observable<UserPreferences> = this.prefsSubject.asObservable();

  get preferences(): UserPreferences {
    return this.prefsSubject.value;
  }

  toggleTheme(): void {
    const prefs = this.prefsSubject.value;
    this.prefsSubject.next({ ...prefs, theme: prefs.theme === 'dark' ? 'light' : 'dark' });
    document.body.className = prefs.theme === 'dark' ? 'light-theme' : 'dark-theme';
  }
}
