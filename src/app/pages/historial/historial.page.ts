import { Component, OnInit } from '@angular/core';
import { Historial } from 'src/app/interfaces/interfaces';
import { FirebaseService } from 'src/app/services/firebase.service';

@Component({
  selector: 'app-historial',
  templateUrl: './historial.page.html',
  styleUrls: ['./historial.page.scss'],
})
export class HistorialPage implements OnInit {
  historial : Historial[]=[];
  constructor(private firebase : FirebaseService) {
    this.historialCompras();
   }

  ngOnInit() {
  }

  historialCompras(){
    this.firebase.recuperarHistorial().then((historial)=>{
      this.historial=[];
      this.historial=historial;
    })
  }
  doRefresh(event: any) {
    // Lógica de recarga aquí (por ejemplo, recargar datos desde el servidor)
    this.historialCompras();
    // Simula una tarea asíncrona
    setTimeout(() => {
      console.log('Recarga completada');
      // Completa el evento de recarga
      event.target.complete();
    }, 2000);
  }

}
