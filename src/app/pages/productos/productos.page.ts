import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Cuentas, Productos } from 'src/app/interfaces/interfaces';
import { FirebaseService } from 'src/app/services/firebase.service';
import { ModalController } from '@ionic/angular';
import { ToastController } from '@ionic/angular';



@Component({
  selector: 'app-productos',
  templateUrl: './productos.page.html',
  styleUrls: ['./productos.page.scss'],
})
export class ProductosPage implements OnInit {
  isModalOpen =false;// Boleano para abrir modal nuevo producto
  cambios : Boolean= true;// Boleano para activar o descactivar boton de guardar cambios 
  openPersona = false; // Bolean para abrir modal de quien paga 
  nombrePagador : string ='';
  formReg: FormGroup = this.fb.group({
    precio: new FormControl('', Validators.required),
    nombre: new FormControl('', Validators.required),
  }
  )
  listaCompra: Productos [] = [];
  productosComprados: Productos [] = [];
  productos : Productos [] = [];
  productosActualizados : Productos [] =[];
  constructor(private fb: FormBuilder,
              private firebase : FirebaseService,
              //private modalController: ModalController,
              private toastController: ToastController
              ) { 
                this.allProducts();
              }

  ngOnInit() {
    
  }

  nuevoProducto(){
    this.firebase.nuevoProducto(this.formReg.value.nombre,this.formReg.value.precio,false).then(()=>{
      this.allProducts();
    });
    this.productos.push({
      nombre : this.formReg.value.nombre,
      precio : this.formReg.value.precio,
      comprado : false
    });
    this.isModalOpen=false;
  }
  setOpen(isOpen: boolean) {
    this.isModalOpen = isOpen;
  }
  setOpenPagador(isOpen: boolean) {
    this.openPersona = isOpen;
  }
  pulsarFuera(event: any){
    this.openPersona = false;
    this.isModalOpen = false;
    console.log(this.openPersona)

  }

  allProducts(){
    this.productos=[];
    this.firebase.recuperarTodosProductos().then(
      (productos : Productos[])=>{
        productos.map((producto : Productos)=>{
          this.productos.push({
          nombre : producto.nombre,
          precio : producto.precio,
          comprado : producto.comprado
        })

        })
        this.productos = this.productos.sort((a, b) => a.nombre.localeCompare(b.nombre));
       // this.productosOriginal=this.productos;
      }
    ).catch();
  }
  cambiaEstado(event: any, nombre: string, precio: number) {
    const comprado = event.detail.value;
    console.log(event);
    // Buscar si ya hay un producto con el mismo nombre
    const indiceExistente = this.productosActualizados.findIndex(producto => producto.nombre === nombre);
    if (indiceExistente !== -1) {
      // Si ya existe, eliminar el producto existente
      this.productosActualizados.splice(indiceExistente, 1);
    } 
    // Agregar el nuevo producto al array
    this.productosActualizados.push({
      nombre: nombre,
      precio: precio,
      comprado: comprado
    });
    if(comprado===false){
      
      const indiceExistente = this.listaCompra.findIndex(producto => producto.nombre === nombre);
      if (indiceExistente !== -1) {
        // Si ya existe, eliminar el producto existente
        this.listaCompra.splice(indiceExistente, 1);

      }else{
        this.listaCompra.push({
          nombre: nombre,
          precio: precio,
          comprado: comprado
        });
      }
      
    }else{
      const indiceExistente = this.productosComprados.findIndex(producto => producto.nombre === nombre);
      if (indiceExistente !== -1) {
        // Si ya existe, eliminar el producto existente
        this.productosComprados.splice(indiceExistente, 1);

      }else{
        this.productosComprados.push({
          nombre: nombre,
          precio: precio,
          comprado: comprado
        });
      }
    }
    this.cambios=!this.comrpobarCambios();
    
    console.log(this.productosActualizados,this.listaCompra,this.cambios);
  }

  guardarCambios(){
    if(this.comrpobarCambios()){
     const productoComprado= this.productosActualizados.find(producto => producto.comprado===true);
     if(productoComprado){
      this.openPersona=true;
     }else{
      this.firebase.actualizarEstado(this.listaCompra).then(()=>{
        this.listaCompra=[];
        this.mostrarToast('Pues toca ir a comprar! ☺');
        this.cambios=true;
        this.allProducts();
      });
     }
    }else{
      console.log('No hay cambios')
    }

  }
  comrpobarCambios (): Boolean{
    let cambios =0;
    this.productosActualizados.map(
      (productoActualizado : Productos)=>{
        const productoEncontrado =  this.productos.find(producto => producto.nombre === productoActualizado.nombre);
        if(!productoEncontrado || productoEncontrado.comprado !== productoActualizado.comprado){
          cambios++;
        }
      }
    );
    return cambios>0;
  }
  elegirPagador(event: any) {
    this.nombrePagador=event.detail.value;
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
  calcularTotal(): number {
    return this.productosComprados.reduce((total, producto) => total + producto.precio, 0);
  }
  realizaraCompra(){
    const totalCommpra = this.calcularTotal();
    this.firebase.historialCompra(this.nombrePagador,this.productosComprados,totalCommpra,this.obtenerFechaYHoraActual()).then(()=>{
      this.firebase.actualizarEstado(this.productosComprados).then(async ()=>{
        await this.actualizarSaldos(this.nombrePagador,totalCommpra);
        this.mostrarToast('Se ha realizado la compra!');
        this.productosComprados=[];
        this.allProducts();
        this.openPersona=false;
        this.cambios=true;
        this.nombrePagador='';
      }      
      );
    });
  }
  obtenerFechaYHoraActual() {
    const fecha = new Date();
  
    // Obtener día, mes y año
    const dia = fecha.getDate();
    let diaFormat = dia < 10 ? '0'+ dia :dia;
    const mes = fecha.getMonth() + 1; // Los meses van de 0 a 11
    let mesFormat = mes<10 ? '0'+mes : mes;
    const anio = fecha.getFullYear();
  
    // Obtener horas y minutos
    const horas = fecha.getHours();
    const minutos = fecha.getMinutes();
    let minutes = minutos < 10 ? '0' + minutos : minutos;
    // Formatear la fecha y hora
    const fechaFormateada = `${diaFormat}/${mesFormat}/${anio} ${horas}:${minutes}`;
  
    return fechaFormateada;
  }
  //Metodo para recargar la pagina
  doRefresh(event: any) {
    // Lógica de recarga aquí (por ejemplo, recargar datos desde el servidor)
    this.cambios=true;
    this.listaCompra=[];
    this.productosComprados=[];
    this.allProducts();
    // Simula una tarea asíncrona
    setTimeout(() => {
      console.log('Recarga completada');
      // Completa el evento de recarga
      event.target.complete();
    }, 2000);
  }
  //Metodo para actualizar el salario despues de una compra
  actualizarSaldos(nombrePagador : string,totalCommpra : number){
    let saldoActualPagador : Cuentas;
    let saldoActualDebe : Cuentas;
    const importeCompra =totalCommpra/2;
    let cuentasTotal : Cuentas[] =[];
    this.firebase.recuperarSaldo().then((cuentas)=>{
      cuentasTotal=cuentas;
      saldoActualPagador=cuentasTotal.find(cuentaPagador => cuentaPagador.nombre===nombrePagador)!;
      saldoActualDebe=cuentasTotal.find(cuentaDebe => cuentaDebe.nombre!==nombrePagador)!;
      saldoActualPagador.saldo = saldoActualPagador.saldo+importeCompra;
      saldoActualDebe.saldo = saldoActualDebe.saldo-importeCompra;
      this.recorrerCuentasCambiandoSaldos(cuentasTotal);
    }).catch();
  }

  recorrerCuentasCambiandoSaldos(cuentasActualizadas : Cuentas[]){
    cuentasActualizadas.forEach(
      (cuentaPersonal)=>{
        this.firebase.actualizarSaldo(cuentaPersonal.nombre,cuentaPersonal.saldo).then(()=>{
        });
      }
    )
  }
  
}
