import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { AlertController ,LoadingController } from '@ionic/angular';
import { AuthService } from '../../service/auth.service';
import { AvatarService } from '../../service/avatar.service';
import { DataService } from '../../service/data.service';
import { Geolocation} from '@awesome-cordova-plugins/geolocation/ngx';
import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@awesome-cordova-plugins/native-geocoder/ngx';


declare var google: any;


@Component({
  selector: 'app-perdidos',
  templateUrl: './perdidos.page.html',
  styleUrls: ['./perdidos.page.scss'],
})

export class PerdidosPage implements OnInit  {

  perdidos = [];
  profile = null;
 

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
   // this.geolocationNative();
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
  
  async addFind(){
    const alert = await this.alertController.create({
      header :'Ingrese animal perdido',
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
          type:'text'
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
            tamano :res.tamano,direccion: this.placeid ,fecha: res.fecha })
          
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
  async changeImage(){
    const image = await Camera.getPhoto({
      quality:90,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Photos, 
    });
    console.log(image); //para ver si carga la img
    if (image){
      const loading = await this.loadingController.create();
      await loading.present();

      const result = await this.avatarService.uploadImage(image);
      loading.dismiss();

      if(!result){
        const alert = await this.alertController.create({
          header: 'No se pudo subir la imagen',
          message: 'Hubo un problema',
          buttons: ['Aceptar'],
        });
        await alert.present();
      }
    }
  }

  
//mostrar google map
 


  //CARGAR EL MAPA TIENE DOS PARTES 
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


getAddressFromCoords(lattitude, longitude) {
console.log("getAddressFromCoords "+lattitude+" "+longitude);
let options: NativeGeocoderOptions = {
  useLocale: true,
  maxResults: 5    
}; 
this.nativeGeocoder.reverseGeocode(lattitude, longitude, options)
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
//AQUI PONDREMOS LO QUE QUERAMOS QUE PASE CON EL PLACE ESCOGIDO, GUARDARLO, SUBIRLO A FIRESTORE.
//HE AÑADIDO UN ALERT PARA VER EL CONTENIDO QUE NOS OFRECE GOOGLE Y GUARDAMOS EL PLACEID PARA UTILIZARLO POSTERIORMENTE SI QUEREMOS.  
alert(JSON.stringify(item))  

this.placeid = item.place_id
this.map.addListener('click', () => {
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
  







  
  