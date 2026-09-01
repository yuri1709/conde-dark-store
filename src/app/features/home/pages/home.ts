import { Component } from '@angular/core';
import { Offer } from '../components/offer/offer';
import { LiniearGraphic } from '../components/graphic/liniear-graphic/liniear-graphic';

@Component({
  selector: 'app-home',
  imports: [Offer, LiniearGraphic],
  templateUrl: './home.html',
  styleUrl: './home.css',
  schemas: []
})
export class Home {

}
