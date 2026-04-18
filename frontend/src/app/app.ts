import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {FileList} from './file-list/file-list';
import {FileTreeSidebar} from './file-tree-sidebar/file-tree-sidebar';
import {NavigationHeader} from './navigation-header/navigation-header';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FileList, FileTreeSidebar, NavigationHeader],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  standalone: true,
})
export class App {
}
