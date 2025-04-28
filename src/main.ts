import { createCustomElement } from '@angular/elements';
import { Injector } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { BotComponent } from './app/bot/bot.component'; // <-- Import your BotComponent
import { appConfig } from './app/app.config';

bootstrapApplication(BotComponent, appConfig).then((ref) => {
  const injector: Injector = ref.injector;
  const customElement = createCustomElement(BotComponent, { injector });
  customElements.define('chat-bot', customElement);
}).catch((err) => console.error(err));
