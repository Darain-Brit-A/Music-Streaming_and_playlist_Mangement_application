import { Directive, ElementRef, Input, OnChanges, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appHighlight]',
  standalone: true,
})
export class HighlightDirective implements OnChanges {
  @Input() appHighlight = false;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnChanges(): void {
    if (this.appHighlight) {
      this.renderer.addClass(this.el.nativeElement, 'now-playing-row');
      this.renderer.setStyle(this.el.nativeElement, 'background', 'rgba(63,81,181,0.18)');
      this.renderer.setStyle(this.el.nativeElement, 'border-left', '3px solid #3f51b5');
    } else {
      this.renderer.removeClass(this.el.nativeElement, 'now-playing-row');
      this.renderer.removeStyle(this.el.nativeElement, 'background');
      this.renderer.removeStyle(this.el.nativeElement, 'border-left');
    }
  }
}
