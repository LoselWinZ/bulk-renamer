import {AfterViewInit, Component, ElementRef, signal, ViewChild} from '@angular/core';
import {EditorPosition} from './model/EditorPosition';
import {BasicNode} from './nodes/basic-node/basic-node';
import {EditorNode} from './model/EditorNode';

@Component({
  selector: 'app-node-editor',
  imports: [
    BasicNode
  ],
  templateUrl: './node-editor.component.html',
  styleUrl: './node-editor.component.scss',
})
export class NodeEditorComponent implements AfterViewInit {
  @ViewChild('viewport', {static: true}) viewport!: ElementRef<HTMLDivElement>;
  protected pan = signal(new EditorPosition(0, 0));         // current pan
  protected zoom = signal(1);

  private last = new EditorPosition(0, 0);
  protected isDragging: boolean = false;

  private zoomFactor: number = 0.005;
  private minZoom: number = 1;
  private maxZoom: number = 2;

  protected node = new EditorNode(100, 100, 500, 500);

  ngAfterViewInit() {
    this.centerViewport();
  }

  private centerViewport() {
    const panel = this.viewport.nativeElement.parentElement!;
    const panelWidth = panel.clientWidth;
    const panelHeight = panel.clientHeight;

    const boardWidth = this.viewport.nativeElement.offsetWidth;
    const boardHeight = this.viewport.nativeElement.offsetHeight;

    const centerX = (panelWidth - boardWidth) / 2;
    const centerY = (panelHeight - boardHeight) / 2;

    this.pan.set(new EditorPosition(centerX, centerY));
  }

  onPan(event: PointerEvent) {
    if (!this.isDragging) return;
    const zoomFactor = this.zoom(); // current zoom
    const dx = event.clientX - this.last.x;
    const dy = event.clientY - this.last.y;

    let newX = this.pan().x + dx;
    let newY = this.pan().y + dy;

    const limit = 15000;
    const viewportWidth = this.viewport.nativeElement.offsetWidth;
    const viewportHeight = this.viewport.nativeElement.offsetHeight;

    // Compute visual bounds after scaling
    const minPanX = -limit;
    const maxPanX = limit - viewportWidth * zoomFactor;
    const minPanY = -limit;
    const maxPanY = limit - viewportHeight * zoomFactor;

    // Clamp
    newX = Math.max(Math.min(newX, maxPanX), minPanX);
    newY = Math.max(Math.min(newY, maxPanY), minPanY);

    this.pan.set(new EditorPosition(newX, newY));
    this.last.x = event.clientX;
    this.last.y = event.clientY;
  }

  onPanStart(event: PointerEvent) {
    event.preventDefault();
    if (event.buttons != 1) return;

    this.isDragging = true;
    this.last.x = event.clientX;
    this.last.y = event.clientY;
  }

  onPanEnd(event: PointerEvent) {
    this.isDragging = false;
  }

  onZoom(event: WheelEvent) {
    event.preventDefault()

    const rect = this.viewport.nativeElement.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const oldZoom = this.zoom();

    const delta = -event.deltaY * this.zoomFactor;
    const newZoom = Math.min(Math.max(oldZoom + delta, this.minZoom), this.maxZoom);

    const ratio = newZoom / oldZoom;
    const p = this.pan();

    const newX = mouseX - (mouseX - p.x) * ratio;
    const newY = mouseY - (mouseY - p.y) * ratio;

    this.pan.set(new EditorPosition(newX, newY));
    this.zoom.set(newZoom);
  }
}
