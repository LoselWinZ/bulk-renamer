import {Component, OnInit} from '@angular/core';
import {ButtonModule} from 'primeng/button';
import {WorkingDirectory} from '../../wailsjs/go/main/App';
import {TableModule} from 'primeng/table';
import {Path} from './path/path';
import {Files} from './files/files';
import {Splitter, SplitterResizeEndEvent} from 'primeng/splitter';
import {FilesystemTree} from './filesystem-tree/filesystem-tree';

@Component({
  selector: 'app-root',
  imports: [
    ButtonModule,
    TableModule,
    Path,
    Files,
    Splitter,
    FilesystemTree,
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
