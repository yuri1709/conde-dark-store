import { Routes } from '@angular/router';
import { Checkout } from './pages/checkout/checkout';
import { Marketplace } from './pages/marketplace/marketplace';

// 1. Importação dos componentes
// Precisamos importar o componente principal do marketplace e o nosso novo componente de checkout


/*
  Documentação da Rota:
  A constante MARKETPLACE_ROUTES guarda uma lista (array) de objetos.
  Cada objeto representa uma página diferente dentro da funcionalidade "marketplace".
*/
export const MARKETPLACE_ROUTES: Routes = [ 
  {
    // Aqui adicionamos a nossa nova rota!
    // Exemplo de URL no navegador: www.seusite.com/marketplace/checkout
    path: 'checkout',
    component: Checkout,
    title: 'Finalizar Compra' // Opcional: Define o título na aba do navegador
  },
  {
    // Aqui está a tua ideia implementada! 
    // O ':caliber' permite capturar valores dinâmicos na URL.
    // Exemplo de URL: /marketplace/pistolas
    path: ':caliber',
    component: Marketplace
  }
];