import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FirestoreService } from '../../../../core/services/firestore.service';
import { CartItem } from '../../../../core/models/cartItem.interface';
import { CartService } from '../../../../shared/cart/cart.service';
import { ProductService } from '../../../../core/services/product.service';
import { Product } from '../../../../core/models/stock/product.interface';
import { MarketplaceService } from '../../services/marketplace.service';

// Declaramos para o TypeScript entender que a variável 'turnstile' vem do script global do HTML
declare const turnstile: any;

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './checkout.html',
  styleUrls: ['./checkout.css']
})
export class Checkout implements OnInit {  

  checkoutForm!: FormGroup;    
  carregando: boolean = false;
  private widgetId: string | null = null;

  private cartService = inject(CartService);
  private productService = inject(ProductService);
  private marketPlaceService = inject(MarketplaceService);
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

  ngAfterViewInit(): void {
    this.inicializarTurnstileNativo();
  }

  private inicializarTurnstileNativo(): void {
    // Aguarda o script global do Cloudflare carregar no navegador
    const checkInterval = setInterval(() => {
      if (typeof turnstile !== 'undefined') {
        clearInterval(checkInterval);

        // Renderiza o widget nativo no modo invisível/execução no clique
        this.widgetId = turnstile.render('#turnstile-container', {
          sitekey: '0x4AAAAAAEiaDWDEAkdrskCS', // Use a chave de teste local do Cloudflare
          execution: 'execute',            // Garante que só roda sob demanda (no clique)
          appearance: 'interaction-only',
          callback: (token: string) => {
            // Callback invocado automaticamente assim que o token é gerado no clique
            console.log('TOKEN --->', token)
            this.enviarPedidoServidor(token);
          },
          'error-callback': () => {
            alert('Falha na validação de segurança anti-bot.');          
            this.carregando = false;
          }
        });
      }
    }, 100);
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

  // Envia a ordem + o token recém-gerado para a Cloud Function em Go
  // Método acionado pelo (ngSubmit) do formulário
  placeOrder(): void {
    if (this.checkoutForm.invalid || this.items().length === 0) return;

    this.carregando = true;

    // Se o Turnstile nativo estiver carregado, dispara a geração do token agora!
    if (typeof turnstile !== 'undefined' && this.widgetId !== null) {
      turnstile.execute(this.widgetId);
    } else {
      alert('O sistema de segurança ainda está inicializando. Tente novamente em alguns segundos.');
      this.carregando = false;
    }
  }

  private enviarPedidoServidor(token: string): void {
    const formValues = this.checkoutForm.value;

    const order = {
      userUrlDrlp: formValues.userUrlDrlp,
      discordContact: formValues.discordContact || null,
      observation: formValues.observation || null,   
      items: this.items().map(item => ({
        product_id: item.id,
        qtd: item.quantity
      }))
    };

    this.marketPlaceService.generateOrder(order, token).subscribe({
      next: (response) => {
        this.carregando = false;
        if (this.widgetId) turnstile.reset(this.widgetId); // Reseta o widget para uma próxima compra
        console.log(response.transactionId)
        if (response.success) {
          alert('Pedido registrado com sucesso na coleção pending-orders! ID: ' + response.transactionId);
          this.cartService.clearCart(); 
          this.checkoutForm.reset();
          this.enviarMensagemNoJogo();
        } else {
          alert('Erro no pedido: ' + response.message);
        }
      },
      error: (error) => {
        this.carregando = false;
        if (this.widgetId) turnstile.reset(this.widgetId);
        console.log('Erro ao gravar o pedido:', error);        
      }
    });
  }
     
  async enviarMensagemNoJogo() {    
    const userId = '13552026';
    const subject = 'Vim pelo seu App Angular!';
    const bodyMenssage = 'Fala sobrevivente! Estou te enviando essa mensagem pelo site...';        
    const targetUrl = `https://fairview.deadfrontier.com/onlinezombiemmo/index.php?action=pm;sa=send;u=${userId}`;
    try {            
      window.open(targetUrl, '_blank');      
    } catch (err) {
      console.error('Failed to copy text.: ', err);      
      window.open(targetUrl, '_blank');
    }
  }
}