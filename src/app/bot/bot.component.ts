import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
  AfterViewInit,
  inject
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-bot',
  templateUrl: './bot.component.html',
  styleUrls: ['./bot.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class BotComponent implements OnInit, AfterViewInit {
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  private platformId = inject(PLATFORM_ID);

  userInput = '';
  loading = false;
  messages: { text: string; sender: 'user' | 'bot' }[] = [];
  sessionId: string = '';

  @ViewChild('bottomAnchor') bottomAnchor!: ElementRef;

  ngOnInit() {
    this.initializeSession();
    this.showDefaultGreeting();
  }

  ngAfterViewInit() {
    this.scrollToBottom();
  }

  scrollToBottom() {
    // Ensure scroll only occurs in the browser
    if (isPlatformBrowser(this.platformId) && this.bottomAnchor?.nativeElement instanceof HTMLElement) {
      setTimeout(() => {
        this.bottomAnchor.nativeElement.scrollIntoView({ behavior: 'smooth' });
      }, 0);
    }
  }

  initializeSession() {
    if (typeof window === 'undefined') return;

    const localSession = localStorage.getItem('sessionId');
    if (localSession) {
      this.sessionId = localSession;
      console.log('Retrieved session ID from localStorage:', this.sessionId);
    } else {
      this.http.get<{ session_id: string }>('https://chat-bot-raising100x.onrender.com/generate_session')
        .subscribe({
          next: (res) => {
            this.sessionId = res.session_id;
            localStorage.setItem('sessionId', this.sessionId);
            console.log('Generated new session ID:', this.sessionId); 
          },
          error: (err) => {
            console.error('Error generating session:', err);
          }
        });
    }
  }

  showDefaultGreeting() {
    this.messages.push({ text: '👋 Hello! How can I help you today?', sender: 'bot' });
    this.scrollToBottom();
  }

  sendMessage() {
    if (!this.userInput.trim()) return;
    const userMsg = this.userInput.trim();
    this.messages.push({ text: userMsg, sender: 'user' });
    this.userInput = '';
    this.scrollToBottom();
    this.sendMessageToBot(userMsg);
  }

  sendMessageToBot(message: string) {
    this.loading = true;

    const typingMsg: { text: string; sender: 'bot' } = { text: 'Typing...', sender: 'bot' };
    this.messages.push(typingMsg);
    this.cdr.detectChanges();
    this.scrollToBottom();

    this.http.post<{ response: string }>('https://chat-bot-raising100x.onrender.com/chat', {
      message,
      session_id: this.sessionId
    }).subscribe({
      next: (res) => {
        this.loading = false;
        const idx = this.messages.indexOf(typingMsg);
        if (idx > -1) this.messages.splice(idx, 1);
        this.displayBotResponse(res.response);
      },
      error: (err) => {
        console.error('Bot error:', err);
        this.loading = false;
        const idx = this.messages.indexOf(typingMsg);
        if (idx > -1) this.messages.splice(idx, 1);
        this.messages.push({ text: 'Oops! Something went wrong.', sender: 'bot' });
        this.scrollToBottom();
      }
    });
  }

  displayBotResponse(fullText: string) {
    const typing: { text: string; sender: 'bot' } = { text: '', sender: 'bot' };
    this.messages.push(typing);
    this.scrollToBottom();

    let i = 0;
    const speed = 30;

    const type = () => {
      if (i < fullText.length) {
        typing.text += fullText.charAt(i++);
        this.cdr.detectChanges();
        this.scrollToBottom();
        setTimeout(type, speed);
      }
    };

    type();
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.sendMessage();
    }
  }
}
