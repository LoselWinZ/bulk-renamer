import {Component, OnInit} from '@angular/core';
import {ButtonModule} from 'primeng/button';
import {WorkingDirectory} from '../../wailsjs/go/main/App';
import {TableModule} from 'primeng/table';
import {Path} from './path/path';
import {Files} from './files/files';
import {Splitter} from 'primeng/splitter';

@Component({
  selector: 'app-root',
  imports: [
    ButtonModule,
    TableModule,
    Path,
    Files,
    Splitter,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  ngOnInit() {
    WorkingDirectory().then((directory) => {})
  }
}
