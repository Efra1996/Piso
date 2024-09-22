import { Component } from '@angular/core';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  public appPages = [
    { title: 'Lista de la compra', url: '/productos', icon: 'bag-handle' },
    { title: 'Historial', url: '/historial', icon: 'receipt' },
    { title: 'Cuentas', url: '/cuentas', icon: 'wallet' },
    { title: 'Configuraciones', url: '/configuraciones', icon: 'settings' },
    { title: 'Tickets', url: '/tickets', icon: 'ticket' },
    { title: 'Lista Efra', url: '/lista-efra', icon: 'bag-handle' },
    { title: 'Inicio', url: '/folder/Inbox', icon: 'home' },

  ];
  constructor() {}
}
