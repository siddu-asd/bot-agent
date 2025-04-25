import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-bot',
  templateUrl: './bot.component.html',
  styleUrls: ['./bot.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class BotComponent implements OnInit {
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  userInput = '';
  loading = false;
  messages: { text: string, sender: 'user' | 'bot' }[] = [];
  sessionId: string = '';

  ngOnInit() {
    this.initializeSession();
    this.showDefaultGreeting(); // Frontend-only welcome message
  }

  initializeSession() {
    if (typeof window === 'undefined') return; // ✅ SSR guard

    const localSession = localStorage.getItem('sessionId');

    if (localSession) {
      this.sessionId = localSession;
      console.log('Session ID restored:', this.sessionId);
    } else {
      this.http.get<{ session_id: string }>('https://chat-bot-raising100x.onrender.com/generate_session').subscribe({
        next: (response) => {
          this.sessionId = response.session_id;
          localStorage.setItem('sessionId', this.sessionId);
          console.log('New session ID generated:', this.sessionId);
        },
        error: (err) => {
          console.error('Error generating session ID:', err);
        }
      });
    }
  }

  showDefaultGreeting() {
    this.messages.push({
      text: '👋 Hello! How can I help you today?',
      sender: 'bot'
    });
  }

  sendMessage() {
    if (!this.userInput.trim()) return;

    const userMessage = this.userInput.trim();
    this.messages.push({ text: userMessage, sender: 'user' });
    this.userInput = '';
    this.sendMessageToBot(userMessage);
  }

  sendMessageToBot(message: string) {
    this.loading = true;

    // ⏳ Show "Typing..." placeholder
    const typingPlaceholder: { text: string, sender: 'bot' } = { text: 'Typing...', sender: 'bot' };
    this.messages.push(typingPlaceholder);
    this.cdr.detectChanges();

    this.http.post<{ response: string }>('https://chat-bot-raising100x.onrender.com/chat', {
      message,
      session_id: this.sessionId
    }).subscribe({
      next: (response) => {
        this.loading = false;

        // 🧹 Remove "Typing..." placeholder
        const index = this.messages.indexOf(typingPlaceholder);
        if (index > -1) {
          this.messages.splice(index, 1);
        }

        // ✍️ Animate bot response
        this.displayBotResponse(response.response);
      },
      error: (err) => {
        console.error('Bot error:', err);

        const index = this.messages.indexOf(typingPlaceholder);
        if (index > -1) {
          this.messages.splice(index, 1);
        }

        this.messages.push({ text: 'Oops! Something went wrong.', sender: 'bot' });
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  displayBotResponse(fullText: string) {
    const typingMessage: { text: string, sender: 'bot' } = { text: '', sender: 'bot' };
    this.messages.push(typingMessage);

    let index = 0;
    const typingSpeed = 40;

    const typeChar = () => {
      if (index < fullText.length) {
        typingMessage.text += fullText.charAt(index++);
        this.cdr.detectChanges();
        setTimeout(typeChar, typingSpeed);
      }
    };

    typeChar(); // Start animation
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.sendMessage();
    }
  }
}
