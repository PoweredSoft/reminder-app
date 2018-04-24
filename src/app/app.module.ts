import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import {FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonsModule, TimepickerModule, BsDatepickerModule } from 'ngx-bootstrap';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { HomeComponent } from '../pages/home/home.component';
import { ReminderService } from '../services/reminder.service';
import { ReminderComponent } from '../components/reminder/reminder.component';

let components = [AppComponent, ReminderComponent, HomeComponent];
let services = [ReminderService];

@NgModule({
  declarations: [
    components
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,

    ButtonsModule,
    TimepickerModule.forRoot(),
    BsDatepickerModule.forRoot() 
  ],
  providers: [services],
  bootstrap: [AppComponent]
})
export class AppModule { }
