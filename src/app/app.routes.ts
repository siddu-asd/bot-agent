import { Routes } from '@angular/router';
import { BotComponent } from './bot/bot.component';
import { HeroSectionComponent } from './hero-section/hero-section.component';

export const routes: Routes = [
    
    {path: '',component:HeroSectionComponent},
    {path: 'bot',component: BotComponent},
   
];
