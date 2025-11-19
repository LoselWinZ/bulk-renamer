export class EditorPosition {
  x: number = -1;
  y: number = -1;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  reset() {
    this.x = -1;
    this.y = -1;
  }

  isEmpty() {
    return this.x === -1 && this.y === -1;
  }
}
