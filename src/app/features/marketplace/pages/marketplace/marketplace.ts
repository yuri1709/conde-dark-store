import { Component, inject, Inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '../../../../core/models/stock/product.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Cart } from '../../../../shared/cart/cart';
import { CartService } from '../../../../shared/cart/cart.service';

@Component({
  selector: 'app-marketplace',
  standalone: true,
  imports: [CommonModule, FormsModule, Cart],
  templateUrl: './marketplace.html',
  styleUrls: ['./marketplace.css']
})
export class Marketplace implements OnInit, OnDestroy {

  private readonly route = inject(ActivatedRoute);
private cartService = inject(CartService);
  caliber: string | null = null;
  private paramSub!: Subscription;

  ngOnInit(): void {    
    this.getCaliberFromUrl();
  }
  readonly categorias: any[] = ['standard', 'extended', 'tactical', 'combat', 'arsenal'];

  searchTerm = '';
  categoriaSelecionada = 'todas';
  ordenacao: 'padrao' | 'menor' | 'maior' = 'padrao';

  cartTotal = 0;
  pulseCart = false;
  addedButtonId: string | null = null;

  produtos: Product[] = [
    {
      id: 'abcodokej320984',      
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

  private getCaliberFromUrl() {
    this.paramSub = this.route.paramMap.subscribe(params => {
      this.caliber = params.get('caliber');      
    });
  }

  get produtosFiltrados(): Product[] {
    const termo = this.searchTerm.trim().toLowerCase();
    let lista = this.produtos.filter(p => {
      const matchTermo = p.name.toLowerCase().includes(termo);
      const matchCategoria = this.categoriaSelecionada === 'todas' || p.ammoPackSize === this.categoriaSelecionada;
      const matchAmmoCaliber = p.ammoType === this.caliber;
      return matchTermo && matchCategoria && matchAmmoCaliber;
    });

    if (this.ordenacao === 'menor') {
      lista = [...lista].sort((a, b) => a.price - b.price);
    } else if (this.ordenacao === 'maior') {
      lista = [...lista].sort((a, b) => b.price - a.price );
    }

    return lista;
  }

  formatPreco(valor: number): string {
    return valor.toLocaleString('pt-BR');
  }

  addToCart(product1: Product): void {
    const selectedProduct = this.produtos.findIndex((product) => product.id === product1.id)           
    if (this.produtos[selectedProduct].qtd <= 0) {
      return;
    }    
    this.produtos[selectedProduct].qtd -= 1;
    this.cartTotal++;
    this.cartService.addItemCart(product1)
    this.pulseCart = false;
    // força reflow para reiniciar a animação
    setTimeout(() => (this.pulseCart = true), 0);
    this.addedButtonId = null;
    setTimeout(() => (this.addedButtonId = product1.id), 0);
    this.produtos[selectedProduct].id
  }

   ngOnDestroy() {
    this.paramSub.unsubscribe();
  }
}