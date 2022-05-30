import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { AuthService } from 'src/app/service/auth.service';
import { AvatarService } from 'src/app/service/avatar.service';
import { DataService } from 'src/app/service/data.service';


@Component({
  selector: 'app-foto-perdidos',
  templateUrl: './foto-perdidos.page.html',
  styleUrls: ['./foto-perdidos.page.scss'],
})
export class FotoPerdidosPage implements OnInit {

  perdidos = [];
  profile = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private dataService : DataService ,
    private avatarService: AvatarService,
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
