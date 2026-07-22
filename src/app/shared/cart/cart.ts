import { Component, ElementRef, HostListener, inject } from '@angular/core';
import { CartService } from './cart.service';
import { CurrencyPipe } from '@angular/common';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../core/models/stock/product.interface';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CurrencyPipe],  
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart {
  protected cartService = inject(CartService);
  private productService = inject(ProductService);
  private elementRef = inject(ElementRef);
  protected isOpen = false;

  toggleCart() {
    this.isOpen = !this.isOpen;
  }

  async increase(id: string, currentQty: number) {
    const product: Product = await this.productService.getById(id);
    if (product.qtd <=0) {
      return;
    }
    product.qtd -= 1;
    this.productService.updateById(product);
    this.cartService.updateQuantity(id, currentQty + 1);
  }

  async decrease(id: string, currentQty: number) {
    const product: Product = await this.productService.getById(id);
    product.qtd += 1;
    this.productService.updateById(product)
    this.cartService.updateQuantity(id, currentQty - 1);
  }

  async remove(id: string, currentQty: number) {
    const product: Product = await this.productService.getById(id);
    product.qtd = product.qtd + currentQty;
    this.productService.updateById(product)
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