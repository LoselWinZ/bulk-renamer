import { Component } from '@angular/core';
import {LocationBar} from '../widget/location-bar/location-bar';

@Component({
  selector: 'app-navigation-header',
  imports: [
    LocationBar
  ],
  templateUrl: './navigation-header.html',
  styleUrl: './navigation-header.scss',
})
export class NavigationHeader {

}
