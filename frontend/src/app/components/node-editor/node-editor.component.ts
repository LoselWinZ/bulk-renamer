import {Component} from '@angular/core';

@Component({
  selector: 'app-node-editor',
  imports: [],
  templateUrl: './node-editor.component.html',
  styleUrl: './node-editor.component.scss',
})
export class NodeEditorComponent {
  protected panX: number = 0;
  protected panY: number = 0;
  protected zoom: number = 1;
  protected zoomY: number = 50;
  protected zoomX: number = 50;
  private clickX: number = -1;
  private clickY: number = -1;
  protected dragging = false;
  private lastMoveTime: number = 0;

  public onScroll(event: WheelEvent) {
    event.preventDefault();
    const delta = event.deltaY * -0.005;

    if ((delta < 0 && this.zoom <= 1) || (delta > 0 && this.zoom == 4)) return;

    const {mx, my, rect} = this.mousePosition(event);

    this.zoomX = (mx / rect.width) * 100;
    this.zoomY = (my / rect.height) * 100;

    // this.zoom = Math.min(
    //   Math.max(1, this.zoom + delta),
    //   4
    // );
    this.zoom += delta;
  }

  constructor() {
  }

  protected startPan(event: MouseEvent) {
    if (event.buttons != 1) return;

    const {mx, my} = this.mousePosition(event);

    this.clickX = event.clientX;
    this.clickY = event.clientY;
    this.dragging = true;
  }

  protected stopPan(event: MouseEvent) {
    this.clickY = -1;
    this.clickX = -1;
    this.dragging = false;
  }

  protected onMouseMove(event: MouseEvent) {
    if ((event.buttons != 1 || this.clickX == -1 || this.clickY == -1) && !this.dragging) return;
    const now = performance.now();
    if (now - this.lastMoveTime < 16) return; // ~60 fps throttle
    this.lastMoveTime = now;
    const {mx, my} = this.mousePosition(event);

    const deltaX = event.clientX - this.clickX
    const deltaY = event.clientY - this.clickY

    console.log(deltaX, deltaY);

    this.panX += deltaX
    this.panY += deltaY
    this.clickX = mx
    this.clickY = my
  }

  private mousePosition(event: MouseEvent) {
    const viewport = document.getElementById('viewport') as HTMLDivElement;
    let rect = viewport.getBoundingClientRect();

    // Mouse position relative to viewport
    const mx = event.clientX - rect.left;
    const my = event.clientY - rect.top;
    return {mx, my, rect, viewport};
  }
}
