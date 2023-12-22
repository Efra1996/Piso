import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Cuentas } from 'src/app/interfaces/interfaces';
import { FirebaseService } from 'src/app/services/firebase.service';

@Component({
  selector: 'app-cuentas',
  templateUrl: './cuentas.page.html',
  styleUrls: ['./cuentas.page.scss'],
})
export class CuentasPage implements OnInit {
  cuentas : Cuentas[]=[];
  isModalOpen: boolean=false;
  constructor(private firebase : FirebaseService,
              private toastController: ToastController) { 
                this.getAll();
              }

  ngOnInit() {

  }
  setOpen(isOpen: boolean) {
    this.isModalOpen = isOpen;
  }

  getAll(){
    this.firebase.recuperarSaldo().then((cuentas)=>{
      this.cuentas=cuentas;
      console.log(this.cuentas)
    }).catch();
  }

  solicitarPago(){

  }

  saldarDeuda(){

  }

}
