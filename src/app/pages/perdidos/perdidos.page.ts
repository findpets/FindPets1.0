import { Component } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { AlertController ,LoadingController } from '@ionic/angular';
import { AuthService } from '../../service/auth.service';
import { AvatarService } from '../../service/avatar.service';
import { DataService } from '../../service/data.service';
import { ViewChild, ElementRef } from '@angular/core';
import { Geolocation, Geoposition } from '@awesome-cordova-plugins/geolocation/ngx';
import { GoogleMap } from '@capacitor/google-maps';


declare var google: any;

@Component({
  selector: 'app-perdidos',
  templateUrl: './perdidos.page.html',
  styleUrls: ['./perdidos.page.scss'],
})
export class PerdidosPage  {

  perdidos = [];
  profile = null;
  mapa: GoogleMap;

  @ViewChild('mapa',{read:ElementRef, static:false}) mapRef:ElementRef;



  constructor(
    private avatarService: AvatarService,
    private authService: AuthService,
    private router: Router,
    private loadingController: LoadingController,
    private alertController : AlertController,
    private dataService : DataService ,
    private geolocation: Geolocation,
  ) 
  {
    this.avatarService.getUserProfile().subscribe((data => {
      this.profile = data;
    }));
    this.dataService.getFind().subscribe(res => {
      console.log(res);
      this.perdidos = res;
    })
  }

  ngAfterViewInit(){
    this.geolocationNative();
  }

  volver(){
    let navigationExtras: NavigationExtras={
    
    }
    this.router.navigate(['../home'], navigationExtras);
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
          name : 'direccion',
          placeholder: 'Ingrese Dirección donde se perdió',
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
            tamano :res.tamano,direccion : res.direccion,fecha: res.fecha })
          
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


origin = { lat:  -33.03343733392729, lng: -71.53323774706229 }; 
infoWindow: any=[];
service:any
directionsService = new google.maps.DirectionsService();
directionsDisplay = new google.maps.DirectionsRenderer();
lat:number;
lon: number;

geolocationNative(){
  this.geolocation.getCurrentPosition().then((geoposition:Geoposition) =>{
    this.showMap(geoposition);
    this.lat = geoposition.coords.latitude;
    this.lon = geoposition.coords.longitude;
    console.log(geoposition);
  })
}
//cada vez q se abre la pag, llama al método, para ver el mapa
ionViewDidEnter(){

}
 //mostrar google map
 showMap(position){
  const location = new google.maps.LatLng(this.origin) 
   const options ={
     center: location,
     zoom: 15,
     disableDefaultUI: true //zoom in o zoom out del mapa
   }
   this.mapa = new google.maps.Map(this.mapRef.nativeElement,options);
   this.infoWindow = new google.maps.InfoWindow();
   this.directionsDisplay.setMap(this.mapa); //para mostrar los puntos edl mapa
  }



  
  }
