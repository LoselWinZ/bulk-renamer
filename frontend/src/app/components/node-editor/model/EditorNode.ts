import {signal, WritableSignal} from '@angular/core';
import {EditorPosition} from './EditorPosition';

export class EditorNode {
  readonly height: number;
  readonly width: number;

  readonly currentPosition: WritableSignal<EditorPosition>;
  readonly previousPosition: WritableSignal<EditorPosition>;

  constructor(height: number, width: number, currentPosition: EditorPosition) {
    this.height = height;
    this.width = width;

    this.currentPosition = signal(currentPosition);
    this.previousPosition = signal(currentPosition);
  }

  moveTo(x: number, y: number) {
    this.previousPosition.set(this.currentPosition());
    this.currentPosition.set(new EditorPosition(x, y));
  }
}
