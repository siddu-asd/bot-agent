import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-bot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bot.component.html',
  styleUrls: ['./bot.component.css']
})
export class BotComponent {
  userInput = '';
  loading = false;
  messages: { text: string, sender: 'user' | 'bot' }[] = [];

  sendMessage() {
    if (!this.userInput.trim()) return;

    const userMessage = this.userInput;
    this.messages.push({ text: userMessage, sender: 'user' });
    this.userInput = '';
    this.loading = true;    

    setTimeout(() => {
      this.messages.push({ text: `You said: "${userMessage}"`, sender: 'bot' });
      this.loading = false;
    }, 1000);
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.sendMessage();
    }
  }
}
