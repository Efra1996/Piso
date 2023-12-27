import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { Productos } from 'src/app/interfaces/interfaces';
import { FirebaseService } from 'src/app/services/firebase.service';

@Component({
  selector: 'app-configuraciones',
  templateUrl: './configuraciones.page.html',
  styleUrls: ['./configuraciones.page.scss'],
})
export class ConfiguracionesPage implements OnInit {
  productos : Productos [] = [];
  productosModificar : Productos [] = [];
  nuevoProducto :boolean=false;
  formReg: FormGroup = this.fb.group({
    precio: new FormControl('', Validators.required),
    nombre: new FormControl('', Validators.required),
  });
  isAlertOpen = false;
  public alertButtons = [
    {
      text: 'No',
      role: 'cancel',
      cssClass: 'alert-button-cancel',
    },
    {
      text: 'Si',
      role: 'confirm',
      cssClass: 'alert-button-confirm',
    },
  ];
  constructor(
    private firebase : FirebaseService,
    private toastController: ToastController,
    private fb: FormBuilder,
  ) {
    this.allProducts();
   }


  ngOnInit() {
  }
  setOpen(isOpen: boolean) {
    this.isAlertOpen = isOpen;
  }
  setProducto(isOpen: boolean) {
    this.nuevoProducto = isOpen;
  }
  allProducts(){
    this.productos=[];
    this.firebase.recuperarTodosProductos().then(
      (productos : Productos[])=>{
        productos.map((producto : Productos)=>{
          this.productos.push({
          nombre : producto.nombre,
          precio : producto.precio,
          comprado : true
        })

        })
        this.productos = this.productos.sort((a, b) => a.nombre.localeCompare(b.nombre));
       // this.productosOriginal=this.productos;
       this.productosModificar = [...this.productos];
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
   pulsarFuera(event: any){

    this.nuevoProducto=false;
  }
  registrarNuevoProducto(){
    const nombre = this.formReg.value.nombre;
    const precio = this.formReg.value.precio;
    this.firebase.nuevoProducto(nombre,precio,false).then(
      ()=>{
          this.nuevoProducto=false;
          this.productos=[];
          this.productosModificar=[];
          this.formReg.controls['nombre'].setValue('');
          this.formReg.controls['precio'].setValue('');
          this.allProducts();
        
      }
    ).catch(
      ()=>{
        this.nuevoProducto=false;
        this.productos=[];
        this.productosModificar=[];
        this.formReg.controls['nombre'].setValue('');
        this.formReg.controls['precio'].setValue('');
        this.allProducts();
      }

    );
  }
    // Método para activar/desactivar el botón del producto seleccionado
    verificarCambios(event: any ,i : number) {
      const nombreInputValue = (<HTMLInputElement>document.getElementById('nombreInput_' + i)).value;
      const precioInputValue = parseFloat( (<HTMLInputElement>document.getElementById('precioInput_' + i)).value);
      console.log(nombreInputValue,precioInputValue)
      let nuevoPrecio : number=parseFloat( event.detail.value);
      if((precioInputValue>0&&precioInputValue!==this.productos[i].precio)||(nombreInputValue.length>0&&nombreInputValue!==this.productos[i].nombre)){
        this.productosModificar[i].comprado = false;
      }else{
        this.productosModificar[i].comprado = true;
      }
      
    }
      //Metodo para recargar la pagina
  doRefresh(event: any) {
        // Lógica de recarga aquí (por ejemplo, recargar datos desde el servidor)
        this.nuevoProducto=false;
        this.productosModificar=[];
        this.productos=[];
        this.formReg.controls['nombre'].setValue('');
        this.formReg.controls['precio'].setValue('');
        this.allProducts();
        // Simula una tarea asíncrona
        setTimeout(() => {
          console.log('Recarga completada');
          // Completa el evento de recarga
          event.target.complete();
        }, 2000);
  }
  confirmarCambios(producto : Productos,index: number) {
    // Ahora puedes acceder al valor del input con el índice
    const nombreInputValue = (<HTMLInputElement>document.getElementById('nombreInput_' + index)).value;
    const precioInputValue = parseFloat( (<HTMLInputElement>document.getElementById('precioInput_' + index)).value);
    this.firebase.actualizarProducto(producto.nombre,nombreInputValue,precioInputValue).then(
      ()=>{
        this.mostrarToast('Se ha actualizado el producto '+nombreInputValue+' con '+ precioInputValue+'€');
        this.productosModificar[index].comprado=true;
        this.productos[index].precio=precioInputValue;
      }
    ).catch(
      ()=>{
        this.nuevoProducto=false;
        this.productos=[];
        this.productosModificar=[];
        this.formReg.controls['nombre'].setValue('');
        this.formReg.controls['precio'].setValue('');
        this.allProducts();
      }

    );
  }
  setResult(ev : any,producto: Productos) {
    if(ev.detail.role==='confirm'){
      this.borrarProducto(producto);
    }
    console.log(`Dismissed with role: ${ev.detail.role}`);
  }
  borrarProducto(producto : Productos){
    this.firebase.borrarProducto(producto.nombre).then(
      ()=>{
        this.productos=[];
        this.productosModificar=[];
        this.allProducts();
        this.mostrarToast('Se ha elimiado el producto '+producto.nombre);
      }
    ).catch(
      ()=>{
        this.nuevoProducto=false;
        this.productos=[];
        this.productosModificar=[];
        this.formReg.controls['nombre'].setValue('');
        this.formReg.controls['precio'].setValue('');
        this.allProducts();
      }
    )
  }
  
}
