import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal, computed } from '@angular/core';

@Component({
  selector: 'app-offer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './offer.html',
  styleUrl: './offer.css'
})
export class Offer implements OnInit, OnDestroy {
  products = [
    { id: 1, title: 'Resident Evil 4', price: 29 },
    { id: 2, title: 'Resident Evil Village', price: 35 },
    { id: 3, title: 'Resident Evil 2', price: 18 }
  ];

  currentIndex = signal(0);

  currentProduct = computed(() => this.products[this.currentIndex()]);

  private intervalId?: ReturnType<typeof setInterval>;

  ngOnInit() {
    this.startAutoplay();
  }

  ngOnDestroy() {
    this.stopAutoplay();
  }

  startAutoplay() {
    this.intervalId = setInterval(() => this.next(), 3000);
  }

  stopAutoplay() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  next() {
    this.currentIndex.set((this.currentIndex() + 1) % this.products.length);
  }

  prev() {
    this.currentIndex.set(
      (this.currentIndex() - 1 + this.products.length) % this.products.length
    );
  }

  goTo(index: number) {
    this.currentIndex.set(index);
  }
}