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
    // Generate or retrieve session ID and send initial greeting
    const localSession = localStorage.getItem('sessionId');
    if (localSession) {
      this.sessionId = localSession;
      this.sendMessageToBot('Hi'); // Initial greeting
    } else {
      this.http.get<{ session_id: string }>('https://chat-bot-raising100x.onrender.com/generate_session').subscribe({
        next: (response) => {
          this.sessionId = response.session_id;
          localStorage.setItem('sessionId', this.sessionId);
          console.log('Generated session ID:', this.sessionId);
          this.sendMessageToBot('Hi'); // Initial greeting
        },
        error: (err) => {
          console.error('Failed to generate session ID:', err);
        }
      });
    }
  }

  sendMessageToBot(message: string) {
    this.loading = true;

    this.http.post<{ response: string }>('https://chat-bot-raising100x.onrender.com/chat', {
      message,
      session_id: this.sessionId
    }).subscribe({
      next: (response) => {
        this.loading = false;
        this.displayBotResponse(response.response);
      },
      error: (err) => {
        console.error('Bot error:', err);
        this.messages.push({ text: 'Oops! Something went wrong.', sender: 'bot' });
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  sendMessage() {
    if (!this.userInput.trim()) return;

    const userMessage = this.userInput;
    this.messages.push({ text: userMessage, sender: 'user' });
    this.userInput = '';
    this.loading = true;

    this.http.post<{ response: string }>('https://chat-bot-raising100x.onrender.com/chat', {
      message: userMessage,
      session_id: this.sessionId
    }).subscribe({
      next: (response) => {
        this.loading = false;
        this.displayBotResponse(response.response);
      },
      error: (err) => {
        console.error('Send error:', err);
        this.messages.push({ text: 'Sorry, something went wrong.', sender: 'bot' });
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  displayBotResponse(fullText: string) {
    const typingMessage: { text: string, sender: 'user' | 'bot' } = { text: '', sender: 'bot' };
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
  
    typeChar(); // Start typing effect
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.sendMessage();
    }
  }
}
