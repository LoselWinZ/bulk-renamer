export class EditorNode {
  height!: number;
  width!: number;
  top!: number;
  left!: number;

  constructor(height: number, width: number, top: number, left: number) {
    this.height = height;
    this.width = width;
    this.top = top;
    this.left = left
  }
}
