import { Component } from '@angular/core';
import { MATERIAL_MODULES } from '../materials/materials';

@Component({
  selector: 'app-header',
  imports: [
    MATERIAL_MODULES
  ],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {

}
