import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';

@Component({
  selector: 'app-bot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bot.component.html',
  styleUrls: ['./bot.component.css']
})
export class BotComponent implements OnInit {
  private http = inject(HttpClient); 
  private cdr = inject(ChangeDetectorRef); // Inject ChangeDetectorRef

  userInput = '';
  loading = false;
  messages: { text: string, sender: 'user' | 'bot' }[] = [];
  sessionId: string = '';

  ngOnInit() {
    // Retrieve the session ID from localStorage, or generate a new one if not present
    this.sessionId = localStorage.getItem('sessionId') || this.generateSessionId();
    if (!localStorage.getItem('sessionId')) {
      localStorage.setItem('sessionId', this.sessionId);  // Save it for future requests
    }
  }

  // Generate a new session ID if it doesn't exist
  generateSessionId(): string {
    return 'session-' + Math.random().toString(36).substr(2, 9);
  }

  sendMessage() {
    if (!this.userInput.trim()) return;

    const userMessage = this.userInput;
    this.messages.push({ text: userMessage, sender: 'user' });
    this.userInput = '';
    this.loading = true;

    console.log('User message sent:', userMessage); // Log user message for debugging

    // Send the session ID with the message to the backend
    this.http.post<{ response: string }>('https://chat-bot-raising100x.onrender.com/chat', {
      message: userMessage,
      session_id: this.sessionId  // Send the session ID with the request
    }).subscribe({
      next: (response) => {
        console.log('Bot response:', response); // Log bot response for debugging
        this.messages.push({ text: response.response, sender: 'bot' });
        this.loading = false;

        // Manually trigger change detection
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('API error:', err);
        this.messages.push({ text: 'Sorry, something went wrong.', sender: 'bot' });
        this.loading = false;

        // Manually trigger change detection  
        this.cdr.detectChanges();
      }
    });
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.sendMessage();
    }
  }
}
