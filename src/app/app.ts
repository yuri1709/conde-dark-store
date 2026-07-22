import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Header } from './shared/header/header';
import { MATERIAL_MODULES } from './shared/materials/materials';
import { CommonModule } from '@angular/common';
import { Cart } from './shared/cart/cart';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, Header, Cart, MATERIAL_MODULES],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('conder-dark');
  public ammunationSubMenu: boolean = false;
  constructor(private readonly router: Router) {}
  ngOnInit(): void {
  }

  navigateTo(path: any) {  
    this.router.navigateByUrl(`/${path}`)
  }

  activeSubMenu() {
    this.ammunationSubMenu = !this.ammunationSubMenu;
  }
}
