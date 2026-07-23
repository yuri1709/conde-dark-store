import { Injectable } from '@angular/core';
import { Product } from '../models/stock/product.interface';
import { CartItem } from '../models/cartItem.interface';

@Injectable({
  providedIn: 'root',
})

export class ProductService {
  private STORAGE_KEY = 'cart';
  public produtos: Product[] = [
      {
        id: 'abcodokej320984',      
        name: '8x Packs of 14mm Rifle',
        qtd: 20,
        price: 400000,
        img: 'https://files.deadfrontier.com/deadfrontier/inventoryimages/large/14rifleammo.png',
        avaible: false,
        ammoPackSize: 'standard',
        ammoType: '14mm'
      }, {
        id: 'abco2okej320984',      
        name: '8x Packs of 14mm Rifle',
        qtd: 20,
        price: 400000,
        img: 'https://files.deadfrontier.com/deadfrontier/inventoryimages/large/14rifleammo.png',
        avaible: false,
        ammoPackSize: 'standard',
        ammoType: '14mm'
      },
       {
        id: 'abcodokej3212120984',      
        name: '8x Packs of 14mm Rifle',
        qtd: 20,
        price: 400000,
        img: 'https://files.deadfrontier.com/deadfrontier/inventoryimages/large/14rifleammo.png',
        avaible: false,
        ammoPackSize: 'standard',
        ammoType: '14mm'
      },
       {
        id: 'abcodokej31110984',      
        name: '8x Packs of 14mm Rifle',
        qtd: 20,
        price: 400000,
        img: 'https://files.deadfrontier.com/deadfrontier/inventoryimages/large/14rifleammo.png',
        avaible: false,
        ammoPackSize: 'standard',
        ammoType: '14mm'
      },
      {
        id: '2',      
        name: '8x Packs of 12mm Rifle',
        qtd: 10,
        price: 50000,
        img: 'https://files.deadfrontier.com/deadfrontier/inventoryimages/large/127rifleammo.png',
        avaible: false,
        ammoPackSize: 'standard',
        ammoType: '12mm'
      }
    ];
  constructor() {
    this.syncWithCart();
  }
  
  private syncWithCart(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) return;

    const cartItems: CartItem[] = JSON.parse(stored);
    
    cartItems.forEach(cartItem => {
      const productIndex = this.produtos.findIndex(product => product.id === cartItem.id);
      if (productIndex !== -1) {
        this.produtos[productIndex].qtd -= cartItem.quantity;
      }
    });
  }

  public getProducts(): Product[] {
    return this.produtos;
  }
    
  public update(products: Product[]) {
    this.produtos = products;
  } 

  public async getById(id: string): Promise<Product> {
    const selectedProduct = this.produtos.findIndex((product) => product.id === id)
    const product = this.produtos[selectedProduct]; 
    return product;
  }

  public async updateById(product1: Product): Promise<boolean> {
    const selectedIndex = this.produtos.findIndex((product) => product.id === product1.id);
    if (selectedIndex === -1) {
      return false;
    }
    this.produtos[selectedIndex] = { ...this.produtos[selectedIndex], ...product1 };
    return true;
  }
}
