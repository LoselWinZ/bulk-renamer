import {Component, Input} from '@angular/core';
import {EditorNode} from '../../model/EditorNode';

@Component({
  selector: 'app-basic-node',
  imports: [],
  templateUrl: './basic-node.html',
  styleUrl: './basic-node.scss',
})
export class BasicNode {
  @Input() node!: EditorNode

  onNodeDrag(event: PointerEvent) {
    event.preventDefault();
    event.stopPropagation();
  }
}
