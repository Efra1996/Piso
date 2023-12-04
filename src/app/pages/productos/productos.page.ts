import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Productos } from 'src/app/interfaces/interfaces';
import { FirebaseService } from 'src/app/services/firebase.service';
import { ModalController } from '@ionic/angular';


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
  productosOriginal: Productos [] = [];
  productos : Productos [] = [];
  productosActualizados : Productos [] =[];
  constructor(private fb: FormBuilder,
              private firebase : FirebaseService,
              private modalController: ModalController) { 
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

    


    this.cambios=!this.comrpobarCambios();
    
    console.log(this.productosActualizados,this.productosOriginal,this.cambios);
  }

  guardarCambios(){
    if(this.comrpobarCambios()){
     const productoComprado= this.productosActualizados.find(producto => producto.comprado===true);
     if(productoComprado){
      console.log('Hay un producto comprado')

      this.openPersona=true;
     }else{
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
  
}
