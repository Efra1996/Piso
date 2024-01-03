import { Component, ElementRef, OnInit,Renderer2, ViewChild } from '@angular/core';
import { IonicSlides } from '@ionic/angular';
import { Foto } from 'src/app/interfaces/interfaces';
import { FirebaseService } from 'src/app/services/firebase.service';
import Swiper from 'swiper';

@Component({
  selector: 'app-tickets',
  templateUrl: './tickets.page.html',
  styleUrls: ['./tickets.page.scss'],
})
export class TicketsPage implements OnInit {
  //Camera
  indexPhoto?=0;
  isGelery1Open=false;
  isGeleryOpen=false;
  swiperModules = [IonicSlides];
  guardarFoto: boolean = false;
  idFoto!: string;
  avatar: Foto[] = [];
  @ViewChild('swiper')
  swiperRef: ElementRef | undefined;
  swiper?: Swiper;
  showDeleteImga=false;
  selectAllPhotos=false;
  deleteTimeout: any;
  constructor( private firebase : FirebaseService,
    ) {
      this.getAllPhotos();
     }

  ngOnInit() {
  }
  selectAllFotos() {
    for (const nota of this.avatar!) {
      nota.seleccionada = this.selectAllPhotos;
    }
  }
  onTouchPhoto(event: any) {
    this.deleteTimeout = setTimeout(() => {
      this.showDeleteImga = true;
    }, 2000);
  }
  onTouchEndPhoto(event: any) {
    clearTimeout(this.deleteTimeout);
    this.showDeleteImga = false;
  }
  async getAllPhotos() {
    try {
      this.isGeleryOpen=false;
      this.avatar=[];
      let idImagenes : string[]=[];
      this.firebase.recuperarIdImagenes().then
      (async (resp )=>{
        resp.map((id : any)=>{
          idImagenes.push(id.idFoto);
          
        });
        for (const idFoto of idImagenes) {
        
          try {
            let id : string = idFoto;
            const url = await this.firebase.descargarImagenes(id);
            this.avatar?.push({
               id:idFoto,
               url:url,
               seleccionada:false
            });
            
          } catch (error) {
            console.error('Error al descargar imagen:', error);
            // Puedes manejar el error como creas conveniente, por ejemplo:
            // this.avatar?.push('ruta_a_imagen_de_reemplazo');
          }
        }
  
  
      }
  
      );
      
    } catch (error) {
      console.error('Error al recuperar IDs de imágenes:', error);
    }
  }
  addNewFromGallery() {
    this.firebase.addNewFromGallery()
    .then((resp) => {
      setTimeout(()=>{
         this.getAllPhotos()
      },2500)
    
    });
  }
  onCheckboxClick(event: Event, asunto?: any) {
    event.stopPropagation(); // Detiene la propagación del evento de clic
    // Puedes realizar otras acciones si es necesario
  }
  setOpenGalery(isOpen: boolean) {
    this.isGeleryOpen = isOpen;
    
    // this.navCtrl.navigateForward('/galery');
  }
  setOpenPhoto(isOpen: boolean,index? : number) {
    this.indexPhoto= index;
    this.isGelery1Open = isOpen;
    this.showDeleteImga = false;
  }
  swiperReady() {
    this.swiper = this.swiperRef?.nativeElement.swiper;
  }
  goNext() {
    this.swiper?.slideNext();
    this.indexPhoto=this.indexPhoto!<this.avatar!.length-1?this.indexPhoto!+1:0;
  }
  goPrev() {
    this.swiper?.slidePrev();
    
    this.indexPhoto=this.indexPhoto!>0?this.indexPhoto!-1:this.avatar!.length-1;
    
  }
  borrarFoto() {
    for (const foto of this.avatar!) {
      if(foto.seleccionada === true){
      this.firebase.borrarFoto(foto.id);
      }
    }
    this.avatar=[];
    setTimeout(()=>{
      this.getAllPhotos()
   },2500)
   }
}
