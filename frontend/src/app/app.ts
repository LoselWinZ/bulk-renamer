import {Component, OnInit} from '@angular/core';
import {ButtonModule} from 'primeng/button';
import {Breadcrumb} from 'primeng/breadcrumb';
import {ListDirectory, WorkingDirectory} from '../../wailsjs/go/main/App';
import {MenuItem} from 'primeng/api';
import {main} from '../../wailsjs/go/models';
import Item = main.Item;
import {TableModule} from 'primeng/table';
import {DatePipe, DecimalPipe} from '@angular/common';
import {UnitPipe} from './pipe/unit-pipe';

@Component({
  selector: 'app-root',
  imports: [
    ButtonModule,
    Breadcrumb,
    TableModule,
    DatePipe,
    UnitPipe,
    DecimalPipe
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  pathSegments: Array<MenuItem> = [];
  items: Item[] = []

  ngOnInit() {
    WorkingDirectory().then(result => {
      console.log(result)
      this.pathSegments = result.split("/").map((item: string) => ({label: item}))

      ListDirectory(result).then((items: Item[]) => {
        console.log(items)
        this.items = items
      })
    });
  }

}
