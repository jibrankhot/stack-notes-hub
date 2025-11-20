// chat-page.component.ts
import { Component, OnInit, HostListener, inject } from '@angular/core';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotesService, Note } from '../../core/services/notes.service';
import { MessageBubbleComponent } from '../../shared/message-bubble/message-bubble.component';

@Component({
  selector: 'app-chat-page',
  standalone: true,
  imports: [NgFor, NgIf, NgClass, FormsModule, MessageBubbleComponent],
  templateUrl: './chat-page.component.html',
  styleUrls: ['./chat-page.component.scss'],
})
export class ChatPageComponent implements OnInit {
  notes: Note[] = [];
  filteredNotes: Note[] = [];
  selected?: Note;

  searchTerm = '';
  isDarkMode = false;
  sidebarOpen = false;
  screenWidth = window.innerWidth;

  private notesSvc = inject(NotesService);

  ngOnInit() {
    // load notes from service
    this.notesSvc.loadNotes().subscribe(notes => {
      this.notes = notes || [];
      this.filteredNotes = [...this.notes];

      // restore last note
      const last = localStorage.getItem('lastNote');
      if (last) {
        const found = this.notes.find(x => x.id === last);
        if (found) this.selected = found;
      }
    });

    // restore theme
    this.isDarkMode = localStorage.getItem('theme') === 'dark';
  }

  @HostListener('window:resize')
  onResize() {
    this.screenWidth = window.innerWidth;
    if (this.screenWidth > 900 && this.sidebarOpen) {
      this.sidebarOpen = false;
      document.body.style.overflow = '';
    }
  }

  open(n: Note) {
    this.selected = n;
    localStorage.setItem('lastNote', n.id);
    if (this.screenWidth < 900) {
      this.closeSidebar();
    }
    // center the selected item in the list
    setTimeout(() => {
      const el = document.querySelector(`[data-note-id="${n.id}"]`);
      el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }, 80);
  }

  search() {
    const t = (this.searchTerm || '').trim().toLowerCase();
    if (!t) {
      this.filteredNotes = [...this.notes];
      return;
    }
    this.filteredNotes = this.notes.filter(n =>
      (n.title || '').toLowerCase().includes(t) ||
      (n.content || '').toLowerCase().includes(t) ||
      (n.category || '').toLowerCase().includes(t)
    );
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
  }

  openSidebar() {
    this.sidebarOpen = true;
    document.body.style.overflow = 'hidden';
  }
  closeSidebar() {
    this.sidebarOpen = false;
    document.body.style.overflow = '';
  }
  toggleSidebar() {
    this.sidebarOpen ? this.closeSidebar() : this.openSidebar();
  }

  // keyboard shortcuts
  @HostListener('document:keydown', ['$event'])
  onKeydown(ev: KeyboardEvent) {
    const key = ev.key.toLowerCase();
    const cmd = ev.metaKey || ev.ctrlKey;

    // Cmd/Ctrl + K => focus search (open middle panel on mobile)
    if (cmd && key === 'k') {
      ev.preventDefault();
      this.openSidebar();
      setTimeout(() => {
        const input = document.querySelector<HTMLInputElement>('.mid-search .search');
        input?.focus();
        input?.select();
      }, 120);
    }

    // Cmd/Ctrl + N => new note
    if (cmd && key === 'n') {
      ev.preventDefault();
      this.createNew();
    }

    // ESC => close panels
    if (ev.key === 'Escape') {
      this.closeSidebar();
    }
  }

  // lightweight create; replace with NotesService.create(...) if available
  createNew() {
    const id = 'note_' + Math.random().toString(36).slice(2, 9);
    const today = new Date().toISOString().slice(0, 10);
    const note: Note = {
      id,
      title: 'Untitled note',
      content: 'Start writing your note here...',
      category: 'General',
      lastUpdated: today,
      tags: []
    };
    this.notes.unshift(note);
    this.filteredNotes = [...this.notes];
    this.open(note);
  }

  // placeholders for actions (hook into services)
  share() { if (!this.selected) return; console.log('share', this.selected.id); }
  publish() { if (!this.selected) return; console.log('publish', this.selected.id); }
  edit(n?: Note) { console.log('edit', n?.id); }

  // list performance
  trackById(_: number, it: Note) { return it.id; }
}
