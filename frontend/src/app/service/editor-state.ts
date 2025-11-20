import {Injectable, signal} from '@angular/core';
import {EditorNode} from '../components/node-editor/model/EditorNode';
import {EditorPosition} from '../components/node-editor/model/EditorPosition';

@Injectable({
  providedIn: 'root',
})
export class EditorState {
  selectedNode = signal<EditorNode | null>(null)
  isDragging = signal<boolean>(false);
  last = signal<EditorPosition>(new EditorPosition(0, 0))
  zoom = signal(1);
}
