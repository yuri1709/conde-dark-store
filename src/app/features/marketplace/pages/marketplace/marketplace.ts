import { Component, inject, Inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '../../../../core/models/stock/product.interface';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { CartService } from '../../../../shared/cart/cart.service';
import { ProductService } from '../../../../core/services/product.service';

@Component({
  selector: 'app-marketplace',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './marketplace.html',
  styleUrls: ['./marketplace.css']
})
export class Marketplace implements OnInit, OnDestroy {

  private readonly route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  caliber: string | null = null;
  private paramSub!: Subscription;
  produtos: Product[] = []

  ngOnInit(): void {           
    this.getCaliberFromUrl();   
    this.produtos = this.productService.getProducts();
  }
  readonly categorias: any[] = ['standard', 'extended', 'tactical', 'combat', 'arsenal'];

  searchTerm = '';
  categoriaSelecionada = 'todas';
  ordenacao: 'padrao' | 'menor' | 'maior' = 'padrao';

  cartTotal = 0;
  pulseCart = false;
  addedButtonId: string | null = null;

  
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
      if (termo.length > 1) {
        return matchTermo;
      }
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
    this.productService.update(this.produtos);
  }

   ngOnDestroy() {
    this.paramSub.unsubscribe();
  }
}