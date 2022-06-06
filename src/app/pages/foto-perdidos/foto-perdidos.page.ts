import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { AuthService } from 'src/app/service/auth.service';
import { AvatarService } from 'src/app/service/avatar.service';
import { DataService } from 'src/app/service/data.service';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import {Directory, Filesystem} from '@capacitor/filesystem';
import { LoadingController, Platform } from '@ionic/angular';



const IMAGE_DIR = 'upload';
interface Historial{
  name:string;
  path: string;
  data: string;
}
@Component({
  selector: 'app-foto-perdidos',
  templateUrl: './foto-perdidos.page.html',
  styleUrls: ['./foto-perdidos.page.scss'],
})
export class FotoPerdidosPage implements OnInit {

  perdidos = [];
  profile = null;
  images: Historial[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    private dataService : DataService ,
    private avatarService: AvatarService,
    private platform : Platform,
    private loadingController : LoadingController,
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

  ngOnInit() {
   this.loadFiles()
  }

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

  volver(){
    let navigationExtras: NavigationExtras={
    
    }
    this.router.navigate(['../home'], navigationExtras);
  }
  
  async logout(){
    await this.authService.logout();
    this.router.navigateByUrl('/home', {replaceUrl:true});
  }
 

  


}
