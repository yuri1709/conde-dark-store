import { inject, Injectable } from '@angular/core';
import { FirestoreService } from '../../../core/services/firestore.service';
import { Product } from '../../../core/models/stock/product.interface';

@Injectable({
  providedIn: 'root',
})
export class MarketplaceService {
    private firestoreService = inject(FirestoreService);
    
    //DO FIRE RULES
    public async getProducts(path:string, caliber: string): Promise<Product[]> {
        const collection = await this.firestoreService.singleQueryCollection(path, 'ammoType', '==', caliber);
        return collection as unknown as Product[];
    }    


}
