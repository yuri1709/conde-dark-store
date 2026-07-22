import { Injectable, signal, computed } from '@angular/core';


const STORAGE_KEY = 'cart';
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  img?: string;
  ammoPackSize: string;

}
@Injectable({
  providedIn: 'root',
})
export class CartService {
  // estado privado, só o service escreve
  private readonly _items = signal<CartItem[]>(this.loadFromStorage());

  // exposto como somente leitura pros componentes
  public readonly items = this._items.asReadonly();

  public readonly cartCount = computed(() =>
    this._items().reduce((total, item) => total + item.quantity, 0)
  );

  public readonly cartTotal = computed(() =>
    this._items().reduce((total, item) => total + item.price * item.quantity, 0)
  );

  private loadFromStorage(): CartItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private persist(items: CartItem[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  public addItemCart(item: Omit<CartItem, 'quantity'>, quantity = 1) {
    this._items.update(current => {
      const existing = current.find(i => i.id === item.id);
      let updated: CartItem[];

      if (existing) {
        updated = current.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      } else {
        updated = [...current, { ...item, quantity }];
      }

      this.persist(updated);
      return updated;
    });
  }

  public removeItemCart(id: string | number) {
    this._items.update(current => {
      const updated = current.filter(i => i.id !== id);
      this.persist(updated);
      return updated;
    });
  }

  public updateQuantity(id: string | number, quantity: number) {
    if (quantity <= 0) {
      this.removeItemCart(id);
      return;
    }
    this._items.update(current => {
      const updated = current.map(i => (i.id === id ? { ...i, quantity } : i));
      this.persist(updated);
      return updated;
    });
  }

  public clearCart() {
    this._items.set([]);
    this.persist([]);
  }
}