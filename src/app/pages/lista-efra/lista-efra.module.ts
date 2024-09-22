import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ListaEfraPageRoutingModule } from './lista-efra-routing.module';

import { ListaEfraPage } from './lista-efra.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ListaEfraPageRoutingModule,
    FormsModule, ReactiveFormsModule
  ],
  declarations: [ListaEfraPage]
})
export class ListaEfraPageModule {}
