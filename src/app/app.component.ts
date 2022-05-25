import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { Platform } from '@ionic/angular';
import { SplashScreen } from '@awesome-cordova-plugins/splash-screen/ngx';
import { StatusBar } from '@awesome-cordova-plugins/status-bar/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  items: Observable<any[]>;
  constructor(
    private firestore: AngularFirestore,
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar) {
    this.items = firestore.collection('items').valueChanges();
    this.initializeApp();
  }


 
initializeApp() {
  this.platform.ready().then(() => {
    this.statusBar.styleDefault();
    this.splashScreen.hide();
  });
}

}
