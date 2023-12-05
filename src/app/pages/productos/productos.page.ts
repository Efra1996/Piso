import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Productos } from 'src/app/interfaces/interfaces';
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
    const comprado = event.detail.checked;
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
      this.mostrarToast('Pues toca ir a comprar! ☺');
      this.cambios=true;
      console.log('Los cambios son de productos a comprar')
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
    console.log('ionChange fired with value: ' + event.detail.value);
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
    this.firebase.actualizarEstado(this.productosComprados).then(()=>{
      this.mostrarToast('Se ha realizado la compra!');
      this.productosComprados=[];
      this.allProducts();
      this.openPersona=false;
    }      
    )
  }
  
  
}
