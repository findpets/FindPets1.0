import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { AlertController ,LoadingController } from '@ionic/angular';
import { DataService } from 'src/app/service/data.service';
import { AuthService } from '../../service/auth.service';
import { AvatarService } from '../../service/avatar.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage {
  perfil = [];

  constructor( 
    private avatarService: AvatarService,
    private authService: AuthService,
    private router: Router,
    private loadingController: LoadingController,
    private alertCtrl : AlertController,
   private dataService : DataService )
  {
    this.dataService.getProfile().subscribe(res =>{
      console.log(res);
      this.perfil = res;
    })
  }
  async logout(){
    await this.authService.logout();
    this.router.navigateByUrl('/', {replaceUrl:true});}

  volver(){
    let navigationExtras: NavigationExtras={
    
    }
    this.router.navigate(['../home'], navigationExtras);
  }


 openNote(note){
  }
  async addProfile(){
    const alert = await this.alertCtrl.create({
      header :'Confirme sus Datos',
      inputs: [
        {
          name : 'namep',
          placeholder: 'Nombre Completo',
          type:'text'
        },
        {
          name : 'edad',
          placeholder: 'Edad',
          type:'text'
        },
        {
          name : 'telefono',
          placeholder: 'Número de Contacto',
          type:'text'
        },
        {
          name : 'email',
          placeholder: 'Confirme Correo ',
          type:'text'
        },
      ],
      buttons:[
        {
          text : 'Cancelar',
          role : 'cancel'
        },
        {
          text: 'Agregar',
          handler: (res) => {
            this.dataService.addProfile({ namep : res.namep , edad : res.edad , telefono : res.telefono, email: res.email})
          }
        }
      ]
    });
    await alert.present();
  }

 async getProfileById(id){
   return this.dataService.addProfile

 }


}
