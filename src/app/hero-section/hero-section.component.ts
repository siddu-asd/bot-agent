import { AfterViewInit, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BotComponent } from '../bot/bot.component'; // Import directly

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [CommonModule, BotComponent], // ✅ Include BotComponent here
  templateUrl: './hero-section.component.html',
  styleUrls: ['./hero-section.component.css'],
})
export class HeroSectionComponent implements AfterViewInit {
  isBotModalVisible: boolean = false;
  isMobileNavVisible = false;

  ngAfterViewInit(): void {}

  openBotModal(): void {
    this.isBotModalVisible = true;
  }

  closeBotModal(): void {
    this.isBotModalVisible = false;
  }
  toggleMobileNav() {
    this.isMobileNavVisible = !this.isMobileNavVisible;
  }
  
}
