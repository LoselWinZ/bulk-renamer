import {Component, OnInit} from '@angular/core';
import {ButtonModule} from 'primeng/button';
import {WorkingDirectory} from '../../wailsjs/go/main/App';
import {TableModule} from 'primeng/table';
import {Path} from './components/path/path';
import {Files} from './components/files/files';
import {Splitter, SplitterResizeEndEvent} from 'primeng/splitter';
import {FilesystemTree} from './components/filesystem-tree/filesystem-tree';
import {NodeEditorComponent} from './components/node-editor/node-editor.component';

@Component({
  selector: 'app-root',
  imports: [
    ButtonModule,
    TableModule,
    Path,
    Files,
    Splitter,
    FilesystemTree,
    NodeEditorComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected topVerticalPanelSize: number = 50;

  ngOnInit() {
    WorkingDirectory().then((directory) => {})
  }

  protected resizeEnd(event: SplitterResizeEndEvent) {
    this.topVerticalPanelSize = event.sizes[0] as number;
  }
}
