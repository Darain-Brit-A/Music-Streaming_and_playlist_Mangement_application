import { Directive, ElementRef, Input, OnChanges, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appPulse]',
  standalone: true,
})
export class PulseDirective implements OnChanges {
  @Input() appPulse = false;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnChanges(): void {
    if (this.appPulse) {
      this.renderer.setStyle(this.el.nativeElement, 'animation', 'pulse-cover 2s ease-in-out infinite');
    } else {
      this.renderer.removeStyle(this.el.nativeElement, 'animation');
    }
  }
}
