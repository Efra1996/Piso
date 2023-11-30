import { Component } from '@angular/core';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  public appPages = [
    { title: 'Productos', url: '/productos', icon: 'bag-handle' },
    { title: 'Historial', url: '/historial', icon: 'receipt' },
  ];
  constructor() {}
}
