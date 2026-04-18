import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class State {
  private _selectAll: BehaviorSubject<Event> = new BehaviorSubject(new Event('selectAll'));
  selectAll$ = this._selectAll.asObservable()

  public fireEventSelectAll(event: KeyboardEvent) {
    this._selectAll.next(event);
  }
}
