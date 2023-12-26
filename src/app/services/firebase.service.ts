import { Injectable } from '@angular/core';
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { initializeApp } from "firebase/app";
import { environment } from 'src/environments/environment';
import { addDoc, collection, deleteDoc, getDocs, getFirestore, orderBy, query, updateDoc, where, writeBatch } from "firebase/firestore";
import { Productos } from '../interfaces/interfaces';
@Injectable({
  providedIn: 'root'
})

export class FirebaseService {
  app = initializeApp(environment.firebaseConfig);
  db = getFirestore(this.app);
  storage = getStorage();
  idFoto!: string;
  constructor() {
  }
  async nuevoProducto(nombre: string, precio: string, comprado : boolean) {
    try {


      const docRef = addDoc(collection(this.db, "productos"), {
        nombre: nombre,
        precio: precio,
        comprado:comprado
      }).then(() => {
        console.log("Document writte");
      }).catch(() => {
       console.log("Fail");
      });
    } catch (e) {
      console.error("Error adding document: ", e);
    }

  }
  recuperarTodosProductos(): Promise<any> {
    const productossRef = collection(this.db, "productos");
    const q = query(productossRef);
    const productos: any[] = [];
    return new Promise((resolve, reject) => {
      getDocs(q)
        .then((querySnapshot) => {

          querySnapshot.forEach((doc) => {
            productos.push(doc.data());
            resolve(productos);
          });
          resolve(null);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  borrarNota(asunto: string) {
    const productossRef = collection(this.db, "notas");
    const q = query(productossRef, where("asunto", "==", asunto));

    return new Promise((resolve, reject) => {
      getDocs(q)
        .then((querySnapshot) => {

          querySnapshot.forEach(async (doc) => {

            await deleteDoc(doc.ref).catch(
              (error) => {
                reject(error);
              }
            )
            const nota = doc.data();
            resolve(nota);
          });
          resolve(null);
        })
        .catch((error) => {
          reject(error);
        });
    });

  }

  recuperarNota(asunto: string): Promise<any> {
    const productossRef = collection(this.db, "notas");
    const q = query(productossRef, where("asunto", "==", asunto));
    const notas: any[] = [];
    return new Promise((resolve, reject) => {
      getDocs(q)
        .then((querySnapshot) => {

          querySnapshot.forEach((doc) => {
            notas.push(doc.data());
            resolve(notas);
          });
          resolve(null); // Si no se encuentra ningún alumno con el correo especificado
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
  actualizarEstado(productos: Productos[]): Promise<any> {
    const productossRef = collection(this.db, "productos");
    const batch = writeBatch(this.db);
  
    // Crea un array de promesas para todas las operaciones asíncronas
    const promises = productos.map(producto => {
      const q = query(productossRef, where("nombre", "==", producto.nombre));
  
      return getDocs(q)
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            batch.update(doc.ref, {
              comprado: producto.comprado
            });
          });
        })
        .catch((error) => {
          console.error("Error al obtener datos:", error);
        });
    });
  
    // Espera a que todas las promesas se completen antes de realizar el commit
    return Promise.all(promises)
      .then(() => batch.commit())
      .catch((error) => {
        console.error("Error al ejecutar operaciones asíncronas:", error);
      });
  }
  
  // public async addNewFromGallery() {

  //   const capturedPhoto2 = await Camera.pickImages({
  //     correctOrientation: false,
  //     limit: 10,
  //     quality: 100,
  //   });
  //   capturedPhoto2.photos.map(async (photos) => {
  //     this.idFoto = new Date().getTime() + '.jpeg';

  //     this.photo = {
  //       webPath: photos.webPath,
  //       saved: true,
  //       format: photos.format,
  //     }

  //     const savedImageFile = await this.savePicture(this.photo, this.idFoto);

  //     this.photos.push(savedImageFile);

  //   })
  //   return this.photos;




  // }
  // public async savePicture(photo: Photo, idFoto: string) {
  //   // Convert photo to base64 format, required by Filesystem API to save
  //   const base64Data = await this.readAsBase64(photo, idFoto);

  //   // Write the file to the data directory
  //   const fileName = idFoto;
  //   const savedFile = await Filesystem.writeFile({
  //     path: fileName,
  //     data: base64Data,
  //     directory: Directory.Data
  //   });

  //   // Use webPath to display the new image instead of base64 since it's
  //   // already loaded into memory
  //   return {
  //     filepath: fileName,
  //     webviewPath: photo.webPath
  //   };
  // }
  // private async readAsBase64(photo: Photo, idFoto: string) {
  //   // Fetch the photo, read as a blob, then convert to base64 format
  //   const response = await fetch(photo.webPath!);
  //   const blob = await response.blob();



  //   const mountainImagesRef = ref(this.storage, idFoto);
  //   uploadBytes(mountainImagesRef, blob).then((snapshot) => {
  //     this.nuevaImagen(idFoto).then(() => {
  //       console.log('Uploaded a blob or file!');

  //     })
  //   });



  //   return await this.convertBlobToBase64(blob) as string;
  // }

  private convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });

  async nuevaImagen(idFoto: string) {
    try {
      const docRef = await addDoc(collection(this.db, "imagenes"), {
        idFoto: idFoto,
      }).then(() => {
        console.log("Document writte");
      }).catch(() => {
        console.log("Fail");
      });
    } catch (e) {
      console.error("Error adding document: ", e);
    }

  }
  async recuperarIdImagenes(): Promise<any[]> {
    const imgRef = collection(this.db, "imagenes");
    const q = query(imgRef);
    // const q = query(imgRef, where("fotos", "==", "fotos"));
    let img: any[] = [];

    try {
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        img.push(doc.data());
        // img = doc.data()
      });
      return img;
    } catch (error) {
      console.error('Error al recuperar IDs de imágenes:', error);
      return [];
    }
  }


  async descargarImagenes(idFoto: string): Promise<string> {
    
    const id: string = idFoto.toString();

    const imgRef = ref(this.storage, id.toString());
    try {
      const url = await getDownloadURL(imgRef);
      return url;
    } catch (error) {
      console.error('Error al descargar la foto:', error);
      return 'ruta_a_imagen_de_reemplazo';
    }
  }
  borrarFoto(idFoto: string) {
    const deleteRef = ref(this.storage, idFoto);
    const imagenRef = collection(this.db, "imagenes");
    const q = query(imagenRef, where("idFoto", "==", idFoto));
    // Delete the file
    deleteObject(deleteRef).then(() => {
        getDocs(q)
          .then((querySnapshot) => {
  
            querySnapshot.forEach(async (doc) => {
  
              await deleteDoc(doc.ref).catch(
                (error) => {
                }
              )
              const nota = doc.data();
            });
          })
          .catch((error) => {
          });
      // File deleted successfully
    }).catch((error) => {
      // Uh-oh, an error occurred!
    });
  }
  // Metodos para el historial
  async historialCompra(nombre: string, productos: Productos[], total : number, fecha : string) {
    try {
      const docRef = addDoc(collection(this.db, "historial"), {
        nombre: nombre,
        productos: productos,
        total:total,
        fecha:fecha
      }).then(() => {
        console.log("Document writte");
      }).catch(() => {
       console.log("Fail");
      });
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }
  recuperarHistorial(): Promise<any> {
    const historialRef = collection(this.db, "historial");
    const q = query(historialRef, orderBy("fecha","desc"));
    const historial: any[] = [];
    return new Promise((resolve, reject) => {
      getDocs(q)
        .then((querySnapshot) => {

          querySnapshot.forEach((doc) => {
            historial.push(doc.data());
            resolve(historial);
          });
          resolve(null);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  //Metodos para las cuentas
  actualizarSaldo(nombre: string, saldo: number): Promise<any> {
    const productossRef = collection(this.db, "cuentas");
    const q = query(productossRef, where("nombre", "==", nombre));

    return new Promise((resolve, reject) => {
      getDocs(q)
        .then((querySnapshot) => {

          querySnapshot.forEach((doc) => {
            updateDoc(doc.ref, {
              saldo:saldo
            })
            const notas = doc.data();
            resolve(notas);
          });
          resolve(null); 
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
  recuperarSaldo(): Promise<any> {
    const historialRef = collection(this.db, "cuentas");
    const q = query(historialRef);
    const cuentas: any[] = [];
    return new Promise((resolve, reject) => {
      getDocs(q)
        .then((querySnapshot) => {

          querySnapshot.forEach((doc) => {
            cuentas.push(doc.data());
            resolve(cuentas);
          });
          resolve(null);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
  recuperarSaldoPersona(nombre : string): Promise<any> {
    const historialRef = collection(this.db, "cuentas");
    const q = query(historialRef, where("nombre", "==", nombre));
    const cuentas: any[] = [];
    return new Promise((resolve, reject) => {
      getDocs(q)
        .then((querySnapshot) => {

          querySnapshot.forEach((doc) => {
            // cuentas.push(doc.data());
            resolve(doc.data());
          });
          resolve(null);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

}