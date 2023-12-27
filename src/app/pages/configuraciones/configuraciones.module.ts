import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConfiguracionesPageRoutingModule } from './configuraciones-routing.module';

import { ConfiguracionesPage } from './configuraciones.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ConfiguracionesPageRoutingModule,
    FormsModule, ReactiveFormsModule,
  ],
  declarations: [ConfiguracionesPage]
})
export class ConfiguracionesPageModule {}
