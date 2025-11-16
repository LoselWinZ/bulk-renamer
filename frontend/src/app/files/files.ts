import {Component, ElementRef, NgZone, QueryList, ViewChildren} from '@angular/core';
import {DatePipe, NgStyle} from "@angular/common";
import {TableModule} from "primeng/table";
import {UnitPipe} from "../pipe/unit-pipe";
import {EventsOn, Position} from '../../../wailsjs/runtime';
import {main} from '../../../wailsjs/go/models';
import {ListDirectory, UpdateWorkingDirectory} from '../../../wailsjs/go/main/App';
import {ClickDoubleDirective} from '../directive/click-double-directive';
import Item = main.Item;
import WorkingDirectoryEvent = main.WorkingDirectoryEvent;

@Component({
  selector: 'app-files',
  imports: [
    DatePipe,
    TableModule,
    UnitPipe,
    NgStyle,
    ClickDoubleDirective
  ],
  templateUrl: './files.html',
  styleUrl: './files.scss',
})
export class Files {
  protected items: Item[] = []
  protected selectedItems: Item[] = [];
  protected selectionBox: DOMRect = new DOMRect(0, 0, 0, 0);
  protected isSelectionActive = false;
  private startPos: Position | null = null
  private lastMoveTime = 0;

  @ViewChildren('rowRef') rowElements!: QueryList<ElementRef<HTMLTableRowElement>>;

  constructor(private ngZone: NgZone) {
    EventsOn('working_directory', this.onDirectoryChange.bind(this));
  }

  onDirectoryChange(event: WorkingDirectoryEvent): void {
    ListDirectory(event.path).then(items => {
      this.ngZone.run(() => {
        this.items = items
      });
    });
  }

  onMouseEnter(_: MouseEvent, item: Item) {
    if (this.isSelectionActive) {
      if (!this.selectedItems.some(s => s.name === item.name)) {
        this.selectedItems = [...this.selectedItems, item];
      }
    }
  }

  protected toggleSelection(event: MouseEvent) {
    if (event.buttons == 1) {
      this.startPos = {x: event.clientX, y: event.clientY}
      this.selectionBox = new DOMRect(
        event.clientX,
        event.clientY,
        0,
        0
      )

      this.selectedItems = []
    } else {
      this.startPos = null;
      this.selectionBox = new DOMRect();
    }
    this.isSelectionActive = event.buttons == 1;
  }

  protected onMouseMove(event: MouseEvent) {
    if (!this.startPos) return;
    const now = performance.now();
    if (now - this.lastMoveTime < 16) return; // ~60 fps throttle
    this.lastMoveTime = now;

    this.updateSelectionBox(event);
    this.updateSelectedItemsFromBox()
  }

  private updateSelectionBox(event: MouseEvent) {
    if (!this.startPos) return;
    const x = Math.min(event.clientX, this.startPos.x);
    const y = Math.min(event.clientY, this.startPos.y);
    const width = Math.abs(event.clientX - this.startPos.x);
    const height = Math.abs(event.clientY - this.startPos.y);

    this.selectionBox = new DOMRect(x, y, width, height);
  }

  private updateSelectedItemsFromBox() {
    if (!this.isSelectionActive) return

    const box = this.selectionBox;
    const rowEls = this.rowElements.toArray();

    const newSelected: Item[] = [];

    rowEls.forEach((row: any, i: number) => {
      const rect = row.nativeElement.getBoundingClientRect();

      // simple rectangle intersection
      const intersects =
        rect.left < box.left + box.width &&
        rect.right > box.left &&
        rect.top < box.top + box.height &&
        rect.bottom > box.top;

      if (intersects) {
        newSelected.push(this.items[i]);
      }
    });

    this.selectedItems = newSelected;

  }

  protected openDirectory(item: Item) {
    if (!item.isDir) return

    UpdateWorkingDirectory(new WorkingDirectoryEvent({segments: [], path: item.path})).then()
  }
}
