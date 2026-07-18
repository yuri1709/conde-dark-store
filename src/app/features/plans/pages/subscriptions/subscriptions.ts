import { Component, inject, Injectable, OnInit } from '@angular/core';
import { Card } from '../../../../core/models/offer/card.interface';
import { FirestoreService } from '../../../../core/services/firestore.service';

@Component({
  selector: 'app-subscriptions',
  imports: [],
  templateUrl: './subscriptions.html',
  styleUrl: './subscriptions.css',
})

export class Subscriptions implements OnInit {
  private firestoreService = inject(FirestoreService);
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

  async teste() {
    console.log('clickou!!')
    const x = await this.firestoreService.createDocument('player', {name: 'BlackSabbath13'}, '1234');
    console.log('return ', x)
  }

}
