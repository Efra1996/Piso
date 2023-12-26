import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-folder',
  templateUrl: './folder.page.html',
  styleUrls: ['./folder.page.scss'],
})
export class FolderPage implements OnInit {
  public folder!: string;
  private activatedRoute = inject(ActivatedRoute);
  public appPages = [
    { title: 'Lista de la compra', url: '/productos', icon: 'bag-handle' },
    { title: 'Historial', url: '/historial', icon: 'receipt' },
    { title: 'Cuentas', url: '/cuentas', icon: 'wallet' },
    { title: 'Configuraciones', url: '/cuentas', icon: 'settings' },
    { title: 'Tickets', url: '/cuentas', icon: 'ticket' },


  ];
  constructor() {}

  ngOnInit() {
    this.folder = this.activatedRoute.snapshot.paramMap.get('id') as string;
  }
}
