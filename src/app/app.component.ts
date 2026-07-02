import { Component } from '@angular/core';
import { CuteQuestionsComponent } from './cute-questions/cute-questions.component';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CuteQuestionsComponent],
    template: `<app-cute-questions></app-cute-questions>`,
    styles: [`:host { display: block; min-height: 100vh; }`],
})
export class AppComponent { }