import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PaymentResponse {
  success: boolean;
  transactionId: string;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class MarketplaceService {
  private http = inject(HttpClient);
  private readonly paymentEndpoint = 'http://localhost:8080/buyAmmoFunction';

  public generateOrder(orderData: any, turnstileToken: string): Observable<PaymentResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Turnstile-Token': turnstileToken,
      'X-Cloudflare-Secret': 'SenhaDoChefe123'
    });

    return this.http.post<PaymentResponse>(this.paymentEndpoint, orderData, { headers });
  }
}