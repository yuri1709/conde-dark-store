import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FirestoreService } from '../../../../core/services/firestore.service';
import { CartItem } from '../../../../core/models/cartItem.interface';
import { CartService } from '../../../../shared/cart/cart.service';
import { ProductService } from '../../../../core/services/product.service';
import { Product } from '../../../../core/models/stock/product.interface';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './checkout.html',
  styleUrls: ['./checkout.css']
})
export class Checkout implements OnInit {
  checkoutForm!: FormGroup;    
  private firestoreService = inject(FirestoreService);
  private cartService = inject(CartService);
  private productService = inject(ProductService);
  private fb = inject(FormBuilder);

  items = this.cartService.items;
  total = this.cartService.cartTotal;

  ngOnInit(): void {
    this.checkoutForm = this.fb.group({
      userUrlDrlp: ['', [Validators.required, Validators.pattern('https?://.+')]],
      discordContact: [''],
      observation: ['']
    });
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

  

  
  async placeOrder(): Promise<void> {
   
    if (this.checkoutForm.invalid || this.items().length === 0) return;

    const formValues = this.checkoutForm.value;

  
    const order = {
      userUrlDrlp: formValues.userUrlDrlp,
      discordContact: formValues.discordContact || null,
      observation: formValues.observation || null,
      total: this.total(),      
      items: this.items().map(item => ({
        product_id: item.id,
        qtd: item.quantity
      }))
    };

    try {               
      const path = `pending-orders`;
           
      await this.firestoreService.createDocumentWithOutId(path, order);
      
      alert('Pedido gravado com sucesso na coleção pending-orders!');
      
      this.cartService.clearCart(); 
      this.checkoutForm.reset();    

    } catch (error) {
      console.error('Erro ao gravar o pedido:', error);
      alert('Ocorreu um erro ao finalizar o pedido.');
    }
  }
}