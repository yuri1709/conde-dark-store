import { Component, OnInit } from '@angular/core';
import { Card } from '../../../../core/models/offer/card.interface';

@Component({
  selector: 'app-subscriptions',
  imports: [],
  templateUrl: './subscriptions.html',
  styleUrl: './subscriptions.css',
})

export class Subscriptions implements OnInit {

  public plans: Card[] = [];
  ngOnInit(): void {
    this.getAllSubsCards();
   
  }

  private getAllSubsCards() {
    return this.plans = [
    {
      title: 'conde bronze',
      price: '200.000',
      color: 'var(--bronze)',
      description: 'There some ammo like: TESTEEEEEEEEEEEEEEEEE',
      topics: [
          { name: '14mm Rifle ammo', img:'https://files.deadfrontier.com/deadfrontier/inventoryimages/large/14rifleammo.png'}, 
          { name: '14mm Rifle ammo', img:'https://files.deadfrontier.com/deadfrontier/inventoryimages/large/14rifleammo.png'}, 
            
        ] 
      },
      {
      title: 'conde golden',
      color: 'var(--golden)',
      description: 'teste',
      price: '400.000'
      }
    ]
  } 

}
