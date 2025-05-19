import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';

export interface PSEPaymentMethod {
  type: 'PSE';
  user_type: 'PERSON' | 'COMPANY';
  user_legal_id_type: 'CC' | 'CE' | 'NIT' | 'PASSPORT';
  user_legal_id: string;
  financial_institution_code: string;
}

export interface TransactionRequest {
  amount: number;
  email: string;
  reference: string;
  paymentMethod: PSEPaymentMethod;
  redirectUrl?: string;
}

export interface TransactionResponse {
  data: {
    id: string;
    status: string;
    amount_in_cents: number;
    currency: string;
    customer_email: string;
    payment_method: any;
    reference: string;
    redirect_url: string;
  };
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createTransaction(transaction: TransactionRequest): Observable<TransactionResponse> {
    console.log('Enviando transacción al backend:', JSON.stringify(transaction, null, 2));
    return this.http.post<TransactionResponse>(`${this.apiUrl}/wompi/payment`, transaction);
  }

  checkStatus(transactionId: string): Observable<TransactionResponse> {
    return this.http.get<TransactionResponse>(`${this.apiUrl}/wompi/transaction-status/${transactionId}`);
  }
}
