import {Component, ElementRef, inject, Input, NgZone, OnInit, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {DatePipe, NgStyle} from "@angular/common";
import {Table, TableModule} from "primeng/table";
import {UnitPipe} from "../../pipe/unit-pipe";
import {EventsOn, Position} from '../../../../wailsjs/runtime';
import {main} from '../../../../wailsjs/go/models';
import {ListDirectory, UpdateWorkingDirectory} from '../../../../wailsjs/go/main/App';
import {ClickDoubleDirective} from '../../directive/click-double-directive';
import Item = main.Item;
import WorkingDirectoryEvent = main.WorkingDirectoryEvent;
import {State} from '../../service/state';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-files',
  imports: [
    DatePipe,
    TableModule,
    UnitPipe,
    ClickDoubleDirective
  ],
  templateUrl: './files.html',
  styleUrl: './files.scss',
})
export class Files {
  protected items: Item[] = []
  protected selectedItems: Item[] = [];
  private startPos: Position | null = null

  @Input() height!: number;

  @ViewChild('tableRef') table!: Table;
  @ViewChildren('rowRef', {read: ElementRef}) rowElements!: QueryList<ElementRef>;

  isDragging = false;
  selectionRect = {left: 0, top: 0, width: 0, height: 0};

  private state = inject(State)

  constructor(private ngZone: NgZone) {
    EventsOn('working_directory', this.onDirectoryChange.bind(this));

    this.state.selectAll$
      .pipe(takeUntilDestroyed())
      .subscribe(e => {
        if(e.target == null || (e.target as HTMLElement).className.includes('p-datatable')) return;
        if (this.selectedItems.length === this.items.length) {
          this.selectedItems = [];
        } else {
          this.selectedItems = this.items;
        }
      })
  }

  onDirectoryChange(event: WorkingDirectoryEvent): void {
    ListDirectory(event.path, true, true).then(items => {
      this.ngZone.run(() => {
        this.items = items
      });
    });
  }

  private animationId: number | null = null;
  private currentMousePos = {x: 0, y: 0};

  onMouseDown(event: MouseEvent) {
    if (event.button == 2 || (event.target as HTMLElement).closest('.p-sortable-column, button, i')) return;

    this.isDragging = true;
    this.startPos = {x: event.clientX, y: event.clientY};
    this.currentMousePos = {x: event.clientX, y: event.clientY};

    if (!event.ctrlKey && !event.metaKey) {
      this.selectedItems = [];
    }

    // Start the calculation loop
    this.startSelectionLoop();
  }

  onMouseMove(event: MouseEvent) {
    if (!this.isDragging) return;
    this.currentMousePos = {x: event.clientX, y: event.clientY};
  }

  private startSelectionLoop() {
    const loop = () => {
      if (!this.isDragging) return;

      this.updateRect();
      this.calculateSelection();
      this.handleAutoScroll();

      this.animationId = requestAnimationFrame(loop);
    };
    this.animationId = requestAnimationFrame(loop);
  }

  private updateRect() {
    if (this.startPos == null) return;

    this.selectionRect = {
      left: Math.min(this.startPos.x, this.currentMousePos.x),
      top: Math.min(this.startPos.y, this.currentMousePos.y),
      width: Math.abs(this.currentMousePos.x - this.startPos.x),
      height: Math.abs(this.currentMousePos.y - this.startPos.y)
    };
  }

  private calculateSelection() {
    const dragBox = this.selectionRect;
    const newSelection: any[] = [];

    this.rowElements.forEach((rowEl, index) => {
      const rowBox = rowEl.nativeElement.getBoundingClientRect();

      const isOverlapping = !(
        rowBox.right < dragBox.left ||
        rowBox.left > dragBox.left + dragBox.width ||
        rowBox.bottom < dragBox.top ||
        rowBox.top > dragBox.top + dragBox.height
      );

      if (isOverlapping) {
        newSelection.push(this.items[index]);
      }
    });

    // Only update if selection actually changed to prevent flickering
    if (JSON.stringify(this.selectedItems) !== JSON.stringify(newSelection)) {
      this.selectedItems = [...newSelection];
    }
  }

  private handleAutoScroll() {
    const viewport = this.table.el.nativeElement.querySelector('.p-datatable-viewport');
    if (!viewport) return;

    const rect = viewport.getBoundingClientRect();
    const speed = 10;
    const zone = 50; // pixels from edge

    if (this.currentMousePos.y > rect.bottom - zone) {
      viewport.scrollTop += speed;
    } else if (this.currentMousePos.y < rect.top + zone) {
      viewport.scrollTop -= speed;
    }
  }

  onMouseUp() {
    this.isDragging = false;
    if (this.animationId) cancelAnimationFrame(this.animationId);
    this.selectionRect = {left: 0, top: 0, width: 0, height: 0};
  }

  protected openDirectory(item: Item) {
    if (!item.isDir) return

    UpdateWorkingDirectory(new WorkingDirectoryEvent({segments: [], path: item.path})).then()
  }
}
