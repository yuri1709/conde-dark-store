import { Component, inject, Inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '../../../../core/models/stock/product.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-marketplace',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './marketplace.html',
  styleUrls: ['./marketplace.css']
})
export class Marketplace implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

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
  addedButtonId: number | null = null;

  produtos: Product[] = [
   
  ];

  private getCaliberFromUrl() {
    this.paramSub = this.route.paramMap.subscribe(params => {
      this.caliber = params.get('caliber');      
    });
  }
  private getAmmosStock() {
    this.caliber;
  }

  get produtosFiltrados(): Product[] {
    const termo = this.searchTerm.trim().toLowerCase();
    let lista = this.produtos.filter(p => {
      const matchTermo = p.name.toLowerCase().includes(termo);
      const matchCategoria = this.categoriaSelecionada === 'todas' || p.ammoPackSize === this.categoriaSelecionada;
      return matchTermo && matchCategoria;
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

  addToCart(id: number): void {
    this.cartTotal++;

    this.pulseCart = false;
    // força reflow para reiniciar a animação
    setTimeout(() => (this.pulseCart = true), 0);

    this.addedButtonId = null;
    setTimeout(() => (this.addedButtonId = id), 0);
  }

   ngOnDestroy() {
    this.paramSub.unsubscribe();
  }
}