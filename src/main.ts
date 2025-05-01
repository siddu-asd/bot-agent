import { bootstrapApplication } from '@angular/platform-browser';
import { HeroSectionComponent } from './app/hero-section/hero-section.component';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(HeroSectionComponent, appConfig)
  .catch(err => console.error(err));
