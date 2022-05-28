import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FotoPerdidosPageRoutingModule } from './foto-perdidos-routing.module';

import { FotoPerdidosPage } from './foto-perdidos.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FotoPerdidosPageRoutingModule
  ],
  declarations: [FotoPerdidosPage]
})
export class FotoPerdidosPageModule {}
