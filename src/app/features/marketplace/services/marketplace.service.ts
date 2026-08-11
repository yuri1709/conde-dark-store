import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FirestoreService } from '../../../core/services/firestore.service';

export interface PaymentResponse {
  success: boolean;
  transactionId: string;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class MarketplaceService {
  private firestoreService = inject(FirestoreService);
  private http = inject(HttpClient);

  private readonly paymentEndpoint = 'http://localhost:8080/BuyAmmo';

  public generateOrder(dadosPagamento: any): Observable<PaymentResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Cloudflare-Secret': 'SenhaDoChefe123',
      'X-Turnstile-Token': 'sxxs'
    });
    console.log('HELOOOOOOOOOOOOOOOOOOOOOOOO')
    return this.http.post<PaymentResponse>(this.paymentEndpoint, dadosPagamento, { headers });
  }
}