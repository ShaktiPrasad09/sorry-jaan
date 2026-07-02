import { Component, Renderer2, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Question {
    text: string;
    options: string[];
}

@Component({
    selector: 'app-cute-questions',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './cute-questions.component.html',
    styleUrl: './cute-questions.component.scss',
})
export class CuteQuestionsComponent {
    questions: Question[] = [
        {
            text: 'Do you know what I think about first every morning?',
            options: ['Coffee \u2615', 'You \ud83d\udc95', 'Both, if I\u2019m honest'],
        },
        {
            text: 'What\u2019s your favorite memory of us so far?',
            options: ['Too many to pick', 'The day we met', 'Every little moment'],
        },
        {
            text: 'On a scale of cute to adorable, how are you feeling today?',
            options: ['Cute', 'Adorable', 'Both, obviously'],
        },
        {
            text: 'Do you know how much I like you?',
            options: ['A little', 'A lot', 'More than pizza \ud83c\udf55'],
        },
        {
            text: 'If I could give you one thing right now, what would you want it to be?',
            options: ['A hug', 'Time together', 'Your favorite snack'],
        },
        {
            text: 'Do you know why I\u2019m asking you all this?',
            options: ['No, tell me', 'Maybe\u2026', 'I have a guess'],
        },
        {
            text: 'Last one \u2014 Please come back to me',
            options: ['Yes \u2764\ufe0f', 'No'],
        },
    ];

    fireflyIndices = Array.from({ length: 12 }, (_, i) => i + 1);
    heartBubbleIndices = Array.from({ length: 16 }, (_, i) => i + 1);

    currentIndex = signal(0);
    transitioning = signal(false);
    finished = signal(false);
    answers = signal<string[]>([]);

    private dodgeActivated = false;
    private noBtnEl: HTMLElement | null = null;
    private dodgeContainer: HTMLElement | null = null;

    constructor(private renderer: Renderer2) { }

    currentQuestion = computed<Question | null>(() =>
        this.currentIndex() < this.questions.length ? this.questions[this.currentIndex()] : null
    );

    progress = computed(() => Math.round((this.currentIndex() / this.questions.length) * 100));

    isLastQuestion = computed(() => this.currentIndex() === this.questions.length - 1);

    answer(option: string) {
        if (this.transitioning()) return;
        this.transitioning.set(true);
        this.answers.update((a) => [...a, option]);

        setTimeout(() => {
            const next = this.currentIndex() + 1;
            if (next >= this.questions.length) {
                this.finished.set(true);
                this.cleanupDodgeButton();
            } else {
                this.currentIndex.set(next);
            }
            this.transitioning.set(false);
        }, 380);
    }

    /**
     * Handles hover / touch / click on the "No" button.
     * On the FIRST real interaction only, it:
     *  1. Captures the button's current on-screen position (so the switch is invisible)
     *  2. Reparents it to .card-wrap and switches it to position:absolute, so it can
     *     only roam within the card's own bounds instead of the whole viewport.
     * Every call after that just recalculates a new random spot within .card-wrap.
     */
    dodgeNoButton(event: Event) {
        event.preventDefault();
        const btn = event.currentTarget as HTMLElement;

        if (!this.dodgeActivated) {
            const container = btn.closest('.card-wrap') as HTMLElement | null;
            if (!container) return;

            const btnRect = btn.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            this.renderer.appendChild(container, btn);
            this.renderer.setStyle(btn, 'position', 'absolute');
            this.renderer.setStyle(btn, 'left', `${btnRect.left - containerRect.left}px`);
            this.renderer.setStyle(btn, 'top', `${btnRect.top - containerRect.top}px`);
            this.renderer.setStyle(btn, 'margin', '0');
            this.renderer.setStyle(btn, 'transition', 'left 0.22s ease, top 0.22s ease');
            this.renderer.setStyle(btn, 'z-index', '20');
            this.dodgeActivated = true;
            this.noBtnEl = btn;
            this.dodgeContainer = container;
        }

        const container = this.dodgeContainer;
        if (!container) return;

        const containerRect = container.getBoundingClientRect();
        const w = btn.offsetWidth;
        const h = btn.offsetHeight;
        const maxX = Math.max(0, containerRect.width - w);
        const maxY = Math.max(0, containerRect.height - h);
        const x = Math.random() * maxX;
        const y = Math.random() * maxY;
        this.renderer.setStyle(btn, 'left', `${x}px`);
        this.renderer.setStyle(btn, 'top', `${y}px`);
    }

    private cleanupDodgeButton() {
        if (this.noBtnEl && this.noBtnEl.parentNode) {
            this.noBtnEl.parentNode.removeChild(this.noBtnEl);
        }
        this.noBtnEl = null;
        this.dodgeContainer = null;
        this.dodgeActivated = false;
    }
}