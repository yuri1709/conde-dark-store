import { Component, ElementRef, HostListener, inject } from '@angular/core';
import { CartService } from './cart.service';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CurrencyPipe],  
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart {
  protected cartService = inject(CartService);
  private elementRef = inject(ElementRef);
  protected isOpen = false;

  toggleCart() {
    this.isOpen = !this.isOpen;
  }

  increase(id: string | number, currentQty: number) {
    this.cartService.updateQuantity(id, currentQty + 1);
  }

  decrease(id: string | number, currentQty: number) {
    this.cartService.updateQuantity(id, currentQty - 1);
  }

  remove(id: string | number) {
    this.cartService.removeItemCart(id);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.isOpen) return;

    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.isOpen = false;
    }
  }
}