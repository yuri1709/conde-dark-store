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
  
  // Injeções de dependência modernas usando inject()
  private firestoreService = inject(FirestoreService);
  private cartService = inject(CartService);
  private productService = inject(ProductService);
  private fb = inject(FormBuilder);

  // Referências aos sinais do serviço (para usar no TS e no HTML)
  // No HTML, você usará iterando assim: @for(item of items(); track item.id)
  items = this.cartService.items;
  total = this.cartService.cartTotal;

  ngOnInit(): void {
    this.checkoutForm = this.fb.group({
      userUrlDrlp: ['', [Validators.required, Validators.pattern('https?://.+')]],
      discordContact: [''],
      observation: ['']
    });
  }

  // 1. Delega a alteração de quantidade para o serviço
  increaseQuantity(item: CartItem): void {    
    this.cartService.updateQuantity(item.id, item.quantity + 1);
  }

  decreaseQuantity(item: CartItem): void {
    if (item.quantity > 1) {
      this.cartService.updateQuantity(item.id, item.quantity - 1);
    }
  }

 async removeItem(itemToRemove: CartItem): Promise<void> {    
  try {
    // 1. Busca o produto atualizado na base de dados
    const product = await this.productService.getById(itemToRemove.id);
    
    // 2. Garante que o produto ainda existe na base antes de tentar atualizar
    if (product) {
      product.qtd = product.qtd + itemToRemove.quantity;
      
      // 3. Faltava o 'await' aqui! Espera o banco confirmar a atualização
      await this.productService.updateById(product);
    }

    // 4. Só remove do carrinho visual se a atualização no banco der certo
    this.cartService.removeItemCart(itemToRemove.id);    

  } catch (error) {
    console.error('Erro ao remover o item e restaurar o estoque:', error);
    alert('Não foi possível remover o item no momento. Tente novamente.');
  }
}

  // O método getTotal() foi removido pois agora usamos o signal this.total()

  // Montar e gravar o pedido (4 e 5)
  async placeOrder(): Promise<void> {
    // Validamos usando this.items() porque é um Signal
    if (this.checkoutForm.invalid || this.items().length === 0) return;

    const formValues = this.checkoutForm.value;

    // 4. Montar o pedido criando o objeto "order"
    const order = {
      userUrlDrlp: formValues.userUrlDrlp,
      discordContact: formValues.discordContact || null,
      observation: formValues.observation || null,
      total: this.total(), // Pega o total calculado pelo Signal
      // Lemos os itens executando o signal: this.items()
      items: this.items().map(item => ({
        product_id: item.id,
        qtd: item.quantity
      }))
    };

    try {
      // 5. Gravar o pedido no banco Firestore, na coleção: pending-orders            
      const path = `pending-orders`;
      
      // Adicionado o await assumindo que createDocumentWithOutId retorna uma Promise
      await this.firestoreService.createDocumentWithOutId(path, order);
      
      alert('Pedido gravado com sucesso na coleção pending-orders!');
      
      this.cartService.clearCart(); // Limpa o carrinho usando o serviço!
      this.checkoutForm.reset();    // Limpa o formulário

    } catch (error) {
      console.error('Erro ao gravar o pedido:', error);
      alert('Ocorreu um erro ao finalizar o pedido.');
    }
  }
}