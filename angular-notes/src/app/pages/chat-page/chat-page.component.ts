import { Component, OnInit, inject } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { NotesService, Note } from '../../core/services/notes.service';
import { MessageBubbleComponent } from '../../shared/message-bubble/message-bubble.component';

@Component({
  selector: 'app-chat-page',
  standalone: true,
  imports: [NgFor, NgIf, MessageBubbleComponent],
  templateUrl: './chat-page.component.html',
  styleUrls: ['./chat-page.component.scss']
})
export class ChatPageComponent implements OnInit {
  notes: Note[] = [];
  selected?: Note;

  private notesSvc = inject(NotesService);

  ngOnInit() {
    this.notesSvc.loadNotes().subscribe(n => this.notes = n);
  }

  open(n: Note) {
    this.selected = n;
    localStorage.setItem('lastNote', n.id);
  }
}
