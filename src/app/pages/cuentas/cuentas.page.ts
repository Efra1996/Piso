import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { Cuentas, Productos } from 'src/app/interfaces/interfaces';
import { FirebaseService } from 'src/app/services/firebase.service';
import { NotificacionesService } from 'src/app/services/notificaciones.service';

@Component({
  selector: 'app-cuentas',
  templateUrl: './cuentas.page.html',
  styleUrls: ['./cuentas.page.scss'],
})
export class CuentasPage implements OnInit {
  cuentas : Cuentas[]=[];
  isModalOpen: boolean=false;
  nuevoPago: boolean=false;
  moroso : boolean = false;
  cuentaDebe! : Cuentas;
  cantidadPagada : number =0;
  formReg: FormGroup = this.fb.group({
    precio: new FormControl('', Validators.required),
    nombre: new FormControl('', Validators.required),
    pagador: new FormControl('', Validators.required),

  }
  )
  constructor(private firebase : FirebaseService,
              private toastController: ToastController,
              private notificaciones : NotificacionesService,
              private fb: FormBuilder,) { 
                this.getAll();
              }
  

  ngOnInit() {

  }
  setOpen(isOpen: boolean) {
    this.isModalOpen = isOpen;
  }
  setPago(isOpen: boolean) {
    this.nuevoPago = isOpen;
  }

  async getAll(){
    this.cuentas=[];
    await this.firebase.recuperarSaldo().then((cuentas)=>{
      this.cuentas=cuentas;
      this.cuentaDebe=this.cuentas.find((cuenta)=>cuenta.saldo>0)!;
    }).catch();
  }

  solicitarPago(){
    
  }

  saldarDeudaCompleta(){
    this.cuentas.map((cuenta)=>{
      this.firebase.actualizarSaldo(cuenta.nombre,0).then(()=>{
        this.mostrarToast('Estamos en paz!');
        this.isModalOpen=false;
        this.getAll();
      }).catch();
    })

  }
  saldarDeudaParte(){
    let saldosModificados: Cuentas[] = [...this.cuentas]; // Crear una copia del array
    let cantidadPagada : number = parseFloat(this.cantidadPagada.toString());
    let cuentaDebeIndex = saldosModificados.findIndex((cuenta) => cuenta.nombre === this.cuentaDebe.nombre);
    let cuentaPagaIndex = saldosModificados.findIndex((cuenta) => cuenta.nombre !== this.cuentaDebe.nombre);
  
    saldosModificados[cuentaDebeIndex] = { ...saldosModificados[cuentaDebeIndex] }; // Crear una copia del objeto
    saldosModificados[cuentaDebeIndex].saldo -= this.cantidadPagada; // Saldo positivo restamos lo que se ha pagado
  
    saldosModificados[cuentaPagaIndex] = { ...saldosModificados[cuentaPagaIndex] }; // Crear una copia del objeto
    let number : number =  saldosModificados[cuentaPagaIndex].saldo + cantidadPagada; // saldo negativo sumamos lo que se ha pagado
    saldosModificados[cuentaPagaIndex].saldo = number ; 
    saldosModificados.forEach(
      (cuenta)=>{
        this.firebase.actualizarSaldo(cuenta.nombre,cuenta.saldo).then(()=>{
          this.cantidadPagada=0;
          this.isModalOpen=false;
          this.moroso=false;
          this.getAll();
          this.mostrarToast('Se han actualizado los saldos!');
        }).catch();
      }
    )
  }
  
  mostrarForm(){
    this.moroso=true;
  }
  pulsarFuera(event: any){
    this.isModalOpen = false;
    this.moroso=false;
    this.nuevoPago=false;
  }
  comprobarCambios(event : any){
    this.cantidadPagada=event.detail.value;
    console.log(event.detail.value)
  }
  async registrarNuevoPago(){
    let mitadCantidad : number = this.formReg.value.precio / 2;
    const producto : Productos []= [{
      nombre : this.formReg.value.nombre,
      precio : this.formReg.value.precio,
      comprado : false
    }];
    let saldosModificados: Cuentas[] = [...this.cuentas]; // Crear una copia del array
    let cantidadPagada : number = parseFloat(mitadCantidad.toString());
    let cuentaDebeIndex = saldosModificados.findIndex((cuenta) => cuenta.nombre !== this.formReg.value.pagador);
    let cuentaPagaIndex = saldosModificados.findIndex((cuenta) => cuenta.nombre === this.formReg.value.pagador);
  
    saldosModificados[cuentaDebeIndex] = { ...saldosModificados[cuentaDebeIndex] }; // Crear una copia del objeto
    saldosModificados[cuentaDebeIndex].saldo -= mitadCantidad; // Saldo positivo restamos lo que se ha pagado
  
    saldosModificados[cuentaPagaIndex] = { ...saldosModificados[cuentaPagaIndex] }; // Crear una copia del objeto
    let number : number =  saldosModificados[cuentaPagaIndex].saldo + cantidadPagada; // saldo negativo sumamos lo que se ha pagado
    saldosModificados[cuentaPagaIndex].saldo = number ; 
    saldosModificados.forEach(
      (cuenta)=>{
        this.firebase.actualizarSaldo(cuenta.nombre,cuenta.saldo).then(()=>{
          this.cuentas=[];
          this.getAll();
        }).catch();
      }
    );
    await this.firebase.historialCompra(this.formReg.value.pagador,producto,this.formReg.value.precio,this.obtenerFechaYHoraActual()).then(
      ()=>{
        this.cantidadPagada=0;
        this.nuevoPago=false;
        this.formReg.controls['pagador'].setValue('');
        this.formReg.controls['nombre'].setValue('');
        this.formReg.controls['precio'].setValue('');

        this.mostrarToast('Se han actualizado los saldos!');
      }

    ).catch();
  }

  async mostrarToast(mensaje : string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000, // Duración en milisegundos
      position: 'bottom', // Posición del toast: 'top', 'bottom', 'middle'
      color: 'success', // Color del toast: 'primary', 'secondary', 'tertiary', 'success', 'warning', 'danger', 'light', 'medium', 'dark'
      buttons: [
        {
          side: 'end',
          icon: 'close-outline',
          role: 'cancel',
          handler: () => {
            console.log('Cerrar toast');
          }
        }
      ]
    });
  
    await toast.present();
  }
    //Metodo para recargar la pagina
    doRefresh(event: any) {
      // Lógica de recarga aquí (por ejemplo, recargar datos desde el servidor)
      this.moroso=false;
      this.cuentas=[];
      this.formReg.controls['pagador'].setValue('');
      this.formReg.controls['nombre'].setValue('');
      this.formReg.controls['precio'].setValue('');
      this.getAll();
      // Simula una tarea asíncrona
      setTimeout(() => {
        console.log('Recarga completada');
        // Completa el evento de recarga
        event.target.complete();
      }, 2000);
    }
    // Metodo para la fecha actual
    obtenerFechaYHoraActual() {
      const fecha = new Date();
    
      // Obtener día, mes y año
      const dia = fecha.getDate();
      const mes = fecha.getMonth() + 1; // Los meses van de 0 a 11
      const anio = fecha.getFullYear();
    
      // Obtener horas y minutos
      const horas = fecha.getHours();
      const minutos = fecha.getMinutes();
      let minutes = minutos < 10 ? '0' + minutos : minutos;
      // Formatear la fecha y hora
      const fechaFormateada = `${dia}/${mes}/${anio} ${horas}:${minutes}`;
    
      return fechaFormateada;
    }
}
