import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CuentasPageRoutingModule } from './cuentas-routing.module';

import { CuentasPage } from './cuentas.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CuentasPageRoutingModule,
    FormsModule, ReactiveFormsModule,
  ],
  declarations: [CuentasPage]
})
export class CuentasPageModule {}
