import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Note {
  id: string;
  title: string;
  category: string;
  tags: string[];
  content: string;
  lastUpdated: string;
}

@Injectable({ providedIn: 'root' })
export class NotesService {
  private http = inject(HttpClient);

  loadNotes(): Observable<Note[]> {
    return this.http.get<Note[]>('assets/data/notes.json');
  }
}
