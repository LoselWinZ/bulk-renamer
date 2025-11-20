import {Component, Input} from '@angular/core';
import {EditorNode} from '../../model/EditorNode';
import {EditorState} from '../../../../service/editor-state';
import {EditorPosition} from '../../model/EditorPosition';

@Component({
  selector: 'app-basic-node',
  imports: [],
  templateUrl: './basic-node.html',
  styleUrl: './basic-node.scss',
  standalone: true,
})
export class BasicNode {
  @Input() node!: EditorNode

  constructor(protected editorState: EditorState) {
  }

  onPointerNodeDown(event: PointerEvent) {
    event.stopPropagation();
    event.preventDefault();

    this.editorState.selectedNode.set(this.node);
    this.editorState.last.set(new EditorPosition(event.clientX, event.clientY));
    this.node.previousPosition.set(
      new EditorPosition(
        this.node.currentPosition().x * this.editorState.zoom(),
        this.node.currentPosition().y * this.editorState.zoom(),
      )
    );
  }

  protected onPointerNodeUp(event: PointerEvent) {
    event.stopPropagation();

    this.editorState.selectedNode.set(null);
    this.editorState.isDragging.set(false);
  }

  protected onPointerNodeMove(event: PointerEvent) {
    event.preventDefault();
    if (event.buttons != 1) return
    this.editorState.isDragging.set(true);
  }
}
