import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { CsvService } from './_services/index';
import { ModalModule, BsDropdownModule, PaginationModule, ButtonsModule } from 'ngx-bootstrap';
import { Ng2TableModule } from 'ng2-table/ng2-table';
import { AlertModule } from 'ngx-bootstrap/alert';
import { ChartsModule } from 'ng2-charts';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule, 
    ModalModule.forRoot(), BsDropdownModule.forRoot(), PaginationModule.forRoot(), ButtonsModule.forRoot(), 
    Ng2TableModule, AlertModule.forRoot(), ChartsModule
  ],
  providers: [CsvService],
  bootstrap: [AppComponent]
})
export class AppModule { }
