import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { AlertController ,LoadingController, Platform, ToastController } from '@ionic/angular';
import { AuthService } from '../../service/auth.service';
import { AvatarService } from '../../service/avatar.service';
import { DataService} from '../../service/data.service';
import { Geolocation} from '@awesome-cordova-plugins/geolocation/ngx';
import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@awesome-cordova-plugins/native-geocoder/ngx';
import { Directory, Filesystem } from '@capacitor/filesystem';


declare var google: any;
const IMAGE_DIR = 'upload';

interface Perdidos{
  name:string;
  path: string;
  data: string;
}

@Component({
  selector: 'app-perdidos',
  templateUrl: './perdidos.page.html',
  styleUrls: ['./perdidos.page.scss'],
})

export class PerdidosPage implements OnInit  {

  perdidos = [];
  profile = null;
 
  images: Perdidos[] = [];


  @ViewChild('map',{static:false}) mapElement:ElementRef;

  map: any;
  address:string;
  lat: string;
  long: string;  
  autocomplete: { input: string; };
  autocompleteItems: any[];
  location: any;
  placeid: any;
  GoogleAutocomplete: any;  


  constructor(
    private avatarService: AvatarService,
    private authService: AuthService,
    private router: Router,
    private loadingController: LoadingController,
    private alertController : AlertController,
    private dataService : DataService ,
    private geolocation: Geolocation,
    private nativeGeocoder: NativeGeocoder,    
    public zone: NgZone,
    public toastController: ToastController,
    private platform : Platform,
  ) 
  {
    this.avatarService.getUserProfile().subscribe((data => {
      this.profile = data;
    }));
    this.dataService.getFind().subscribe(res => {
      console.log(res);
      this.perdidos = res;
    })
    this.GoogleAutocomplete = new google.maps.places.AutocompleteService();
    this.autocomplete = { input: '' };
    this.autocompleteItems = [];
  }

  ngOnInit(){
    this.loadMap();
    this.loadFiles()

  
  }

  volver(){
    let navigationExtras: NavigationExtras={
    
    }
    this.router.navigate(['../home'], navigationExtras);
  }

  historial(){
    let navigationExtras: NavigationExtras={
    
    }
    this.router.navigate(['../foto-perdidos'], navigationExtras);
  }
  
  //foto mascota perdida
  
async loadFiles(){
  this.images=[];

  const loading = await this.loadingController.create({
    message:'Cargando...'
  });
  await loading.present();

  Filesystem.readdir({
    directory: Directory.Data,
    path: IMAGE_DIR
  }).then(result =>{

  console.log('HERE: ', result);
  this.loadFileData(result.files);

  }, async err =>{
    console.log('err: ', err);
    await Filesystem.mkdir({
      directory: Directory.Data,
      path: IMAGE_DIR
    });
  }).then (_ =>{
      loading.dismiss();
    })

}

async loadFileData(fileNames: string[]){
   for (let file of fileNames){
     const filePath = `${IMAGE_DIR}/${file}`;

     const readFile = await Filesystem.readFile({
       directory: Directory.Data,
       path: filePath
     });

     this.images.push({
       name: file,
       path: filePath,
       data: `data:image/jpeg;base64,${readFile.data}`
     });
 
   }
}
async selectImage(){
  const image = await Camera.getPhoto({
    quality:90,
    allowEditing: false,
    resultType: CameraResultType.Uri,
    source: CameraSource.Photos,  //.Camera  para tomar fotos
  });
  console.log(image); //para ver si carga la img

  if (image){
    this.saveImage(image);
  }
}

async saveImage(photo:Photo){

const base64Data = await this.readAsBase64(photo);
console.log(base64Data);
const fileName = new Date().getTime() + '.jpeg';
const savedFile = await Filesystem.writeFile({
  directory: Directory.Data,
  path: `${IMAGE_DIR}/${fileName}`,
  data: base64Data,
});
console.log('saved: ', savedFile);
this.loadFiles();
}

async readAsBase64(photo: Photo) {

if (this.platform.is('hybrid')) {
  const file = await Filesystem.readFile({
    path: photo.path
  });

  return file.data;
}
else {
  const response = await fetch(photo.webPath);
  const blob = await response.blob();

  return await this.convertBlobToBase64(blob) as string;
}
}

convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
const reader = new FileReader();
reader.onerror = reject;
reader.onload = () => {
    resolve(reader.result);
};
reader.readAsDataURL(blob);
});


  //formulario
  async addFind(){
    const alert = await this.alertController.create({
      header :'Ingrese Mascota Extraviada',
      inputs: [
        {
          name : 'nameM',
          placeholder: 'Ingrese Nombre de la mascota',
          type:'text'
        },
        {
          name : 'tipoM',
          placeholder: 'Ingrese tipo de la mascota',
          type:'text'
        },
        {
          name : 'color',
          placeholder: 'Ingrese color de la mascota',
          type:'text'
        },
        {
          name : 'tamano',
          placeholder: 'Ingrese Tamaño de la mascota',
          type:'text'
        },
        {
          name : 'fecha',
          placeholder: 'Ingrese fecha en la que se perdió',
          type:'date'
        }
      ],
      buttons:[
        {
          text : 'Cancelar',
          role : 'cancel'
        },
        {
          text: 'Agregar',
          handler: (res) => {
            this.dataService.addFind({nameM : res.nameM,tipoM : res.tipoM , color: res.color,
            tamano :res.tamano, direccion: this.placeid, fecha: res.fecha, name:this.images ,path: this.images, data:this.images})
          
          }
        }
      ]
    });
    await alert.present();
  }
  
//
async logout(){
  await this.authService.logout();
  this.router.navigateByUrl('/home', {replaceUrl:true});
}

//mostrar google map
 
  loadMap() {
    
this.geolocation.getCurrentPosition().then((resp) => {
  let latLng = new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude);
  let mapOptions = {
    center: latLng,
    zoom: 15,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  } 
  
  //CUANDO TENEMOS LAS COORDENADAS SIMPLEMENTE NECESITAMOS PASAR AL MAPA DE GOOGLE TODOS LOS PARAMETROS.
  this.getAddressFromCoords(resp.coords.latitude, resp.coords.longitude); 
  this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions); 
  this.map.addListener('tilesloaded', () => {
    console.log('accuracy',this.map, this.map.center.lat());
    this.getAddressFromCoords(this.map.center.lat(), this.map.center.lng())
    this.lat = this.map.center.lat()
    this.long = this.map.center.lng()
  }); 

}).catch((error) => {
  console.log('Error getting location', error);
});
}


getAddressFromCoords(latitude, longitude) {
console.log("getAddressFromCoords "+latitude+" "+longitude);
let options: NativeGeocoderOptions = {
  useLocale: true,
  maxResults: 5    
}; 
this.nativeGeocoder.reverseGeocode(latitude, longitude, options)
  .then((result: NativeGeocoderResult[]) => {
    this.address = "";
    let responseAddress = [];
    for (let [key, value] of Object.entries(result[0])) {
      if(value.length>0)
      responseAddress.push(value); 
    }
    responseAddress.reverse();
    for (let value of responseAddress) {
      this.address += value+", ";
    }
    this.address = this.address.slice(0, -2);
  })
  .catch((error: any) =>{ 
    this.address = "Address Not Available!";
  }); 
}

//FUNCION DEL BOTON INFERIOR PARA QUE NOS DIGA LAS COORDENADAS DEL LUGAR EN EL QUE POSICIONAMOS EL PIN.
ShowCords(){
alert('lat' +this.lat+', long'+this.long )
}

//AUTOCOMPLETE, SIMPLEMENTE ACTUALIZAMOS LA LISTA CON CADA EVENTO DE ION CHANGE EN LA VISTA.
UpdateSearchResults(){
if (this.autocomplete.input == '') {
  this.autocompleteItems = [];
  return;
}
this.GoogleAutocomplete.getPlacePredictions({ input: this.autocomplete.input },
(predictions, status) => {
  this.autocompleteItems = [];
  this.zone.run(() => {
    predictions.forEach((prediction) => {
      this.autocompleteItems.push(prediction);
    });
  });
});
}

//FUNCION QUE LLAMAMOS DESDE EL ITEM DE LA LISTA.
SelectSearchResult(item) {

this.placeid = item.description

this.map.addListener('tilesloaded', () => {
  console.log('accuracy',this.map, this.map.center.lat());
  this.getAddressFromCoords(this.map.center.lat(), this.map.center.lng())
  this.lat = this.map.center.lat()
  this.long = this.map.center.lng()
}); 

}


//LLAMAMOS A ESTA FUNCION PARA LIMPIAR LA LISTA CUANDO PULSAMOS IONCLEAR.
ClearAutocomplete(){
this.autocompleteItems = []
this.autocomplete.input = ''
}

//EJEMPLO PARA IR A UN LUGAR DESDE UN LINK EXTERNO, ABRIR GOOGLE MAPS PARA DIRECCIONES. 
GoTo(){
return window.location.href = 'https://www.google.com/maps/search/?api=1&query=Google&query_place_id='+this.placeid;
}

}
  







  
  