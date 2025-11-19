import {Component, ElementRef, HostListener, ViewChild} from '@angular/core';
import {Breadcrumb, BreadcrumbItemClickEvent} from "primeng/breadcrumb";
import {MenuItem, MenuItemCommandEvent} from 'primeng/api';
import {EventsOn} from '../../../../wailsjs/runtime';
import {GetBackStack, UpdateWorkingDirectory} from '../../../../wailsjs/go/main/App';
import {InputText} from 'primeng/inputtext';
import {FormsModule} from '@angular/forms';
import {main} from '../../../../wailsjs/go/models';
import {Button} from 'primeng/button';
import {ContextMenu} from 'primeng/contextmenu';
import WorkingDirectoryEvent = main.WorkingDirectoryEvent;

@Component({
  selector: 'app-path',
  imports: [
    Breadcrumb,
    InputText,
    FormsModule,
    Button,
    ContextMenu
  ],
  templateUrl: './path.html',
  styleUrl: './path.scss',
})
export class Path {
  protected pathSegments: Array<MenuItem> = [];
  protected pathText: string = "";
  protected isInput = false;

  @ViewChild("pathInput") pathInput: ElementRef<HTMLInputElement> | undefined
  protected pathBackStack: MenuItem[] = [];

  @HostListener('window:keyup.escape', ['$event'])
  escapeKeyEvent(_: Event) {
    this.switchToBreadcrumb()
  }

  constructor() {
    EventsOn('working_directory', this.onDirectoryChange.bind(this));
  }

  onDirectoryChange(event: WorkingDirectoryEvent): void {
    console.log(event)
    this.pathText = event.path;
    this.pathSegments = event.segments.map((item: string) => ({label: item}))
  }

  protected onDirectoryClick(event: BreadcrumbItemClickEvent) {
    event.originalEvent.preventDefault()
    event.originalEvent.stopPropagation()

    let index = this.pathSegments.indexOf(event.item);
    let items = this.pathSegments
      .slice(0, index + 1)
      .map(item => item.label)
      .filter(item => item !== undefined);

    UpdateWorkingDirectory(new WorkingDirectoryEvent({segments: items, path: ''})).then();
  }

  protected switchToInput() {
    this.isInput = true

    setTimeout(() => {
      this.pathInput?.nativeElement?.focus();
    });
  }

  protected confirmNewPath(): void {
    this.isInput = false;
    UpdateWorkingDirectory(new WorkingDirectoryEvent({segments: [], path: this.pathText})).then()
  }

  protected menuButtonClicked(eventType: string) {
    UpdateWorkingDirectory(new WorkingDirectoryEvent({
      segments: this.pathSegments.map(value => value.label),
      path: this.pathText,
      eventType: eventType
    })).then()
  }

  protected openBackStackMenu(event: PointerEvent, cm: ContextMenu) {
    event.preventDefault();
    event.stopPropagation();

    GetBackStack().then((backStack: string[]) => {
      this.pathBackStack = backStack.map(value => ({
        label: value, command(_: MenuItemCommandEvent) {
          UpdateWorkingDirectory(new WorkingDirectoryEvent({segments: [], path: value})).then();
        }
      }));
      if (this.pathBackStack.length > 0) {
        cm.show(event)
      }
    })
  }

  protected switchToBreadcrumb() {
    this.isInput = false
  }
}
