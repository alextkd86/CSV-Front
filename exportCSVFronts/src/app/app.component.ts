import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { CsvService } from './_services/index';
import { ModalDirective } from 'ngx-bootstrap';
import {DOCUMENT} from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  private existData:boolean=false;
  
  //factura que seleccionemos de una fila de la tabla
  billRowSelected: any = {};

  public rows:Array<any> = [];
  public columns:Array<any>;
  public page:number = 1;
  public itemsPerPage:number = 10;
  public maxSize:number = 5;
  public numPages:number = 1;
  public length:number = 0;

  public config:any = {
    paging: true,
    sorting: {columns: this.columns},
    filtering: {filterString: ''},
    className: ['table-striped', 'table-bordered']
  };

  private data:Array<any>;
  private newCantidad:number=0;

  //Atributo para abrir un popup al seleccionar una fila
  @ViewChild('childModalBill')
  public childModalBill:ModalDirective;

  public constructor(private csvService: CsvService, 
                     @Inject(DOCUMENT) private document: Document) {
    //Ponemos la pagina arriba (Es decir, no dejamos que se quede en la mitad o algo cuando hemos estado y nos hemos ido)
    this.document.documentElement.scrollTop = 0;
  	//Cargamos las columnas aquí
    this.columns = [
      {title: 'Nombre', className: ['office-header', 'text-success'], name: 'nameClient', sort: 'asc', filtering: {filterString: '', placeholder: 'Nombre'}},
      {title: 'Ciudad', name: 'city', filtering: {filterString: '', placeholder: 'Ciudad'}},
      {title: 'NIF', name: 'nif', sort: false, filtering: {filterString: '', placeholder: 'NIF'}},
      {title: 'Mes', name: 'month', sort: false, filtering: {filterString: '', placeholder: 'Mes'}},
      {title: 'Año', name: 'year'},
      {title: 'Nº Factura', name: 'numberBill', sort: false, filtering: {filterString: '', placeholder: 'Num Factura'}},
      {title: 'Cantidad', name: 'price'}
    ];
  }

  public ngOnInit():void {
  	//Dentro de este método llamamos al servicio donde nos devuelve todos los registros
    this.onChangeTable(this.config);
  }

  public onChangeTable(config:any, page:any = {page: this.page, itemsPerPage: this.itemsPerPage}):any {

    if (config.filtering) {
      Object.assign(this.config.filtering, config.filtering);
    }

    if (config.sorting) {
      Object.assign(this.config.sorting, config.sorting);
    }
    // Llamamos al servicio web que nos devuelve a todos los registros y seteamos
    //los parámetros que han de cargarse en la tabla
    this.csvService.findAllBills()
      .subscribe(bills => {
          this.data =bills;
          if(null !== this.data && undefined !== this.data && this.data.length > 0) {
          	this.existData = true;
            //Cargamos los datos para mostrarlos en el grafico tambien
            let pricePersona1 = [];
            let pricePersona2 = [];
            let namePersona1 = "";
            let namePersona2 = "";
            this.barChartLabels = [];
            for(let i=0; i<bills.length; i++) {
              //Nos cercioramos que n se dupliquen
              if (this.barChartLabels.indexOf(bills[i].month) === -1) this.barChartLabels.push(bills[i].month);
              //Datos para los graficos
              //Precios por persona
              if(bills[i].nameClient === "Ale") {
                pricePersona1.push(bills[i].price);
                namePersona1=bills[i].nameClient;
              } else {
                pricePersona2.push(bills[i].price);
                namePersona2=bills[i].nameClient;
              }
            }

            this.barChartLabels.sort();

            this.barChartData = [
              {data: pricePersona1, label: namePersona1},
              {data: pricePersona2, label: namePersona2}
            ]
          } else {
          	this.existData = false;
          }

          this.length = this.data.length;
          let filteredData = this.changeFilter(this.data, this.config);
          let sortedData = this.changeSort(filteredData, this.config);
          this.rows = page && config.paging ? this.changePage(page, sortedData) : sortedData;
          this.length = sortedData.length;
        },
        error => {
          console.log("ERROR");
        },
        () => {
          console.log("Finish");
        }
      );
  }

  public changePage(page:any, data:Array<any> = this.data):Array<any> {
    let start = (page.page - 1) * page.itemsPerPage;
    let end = page.itemsPerPage > -1 ? (start + page.itemsPerPage) : data.length;
    return data.slice(start, end);
  }

  public changeSort(data:any, config:any):any {
    if (!config.sorting) {
      return data;
    }

    let columns = this.config.sorting.columns || [];
    let columnName:string = void 0;
    let sort:string = void 0;

    for (let i = 0; i < columns.length; i++) {
      if (columns[i].sort !== '' && columns[i].sort !== false) {
        columnName = columns[i].name;
        sort = columns[i].sort;
      }
    }

    if (!columnName) {
      return data;
    }

    // simple sorting
    return data.sort((previous:any, current:any) => {
      if (previous[columnName] > current[columnName]) {
        return sort === 'desc' ? -1 : 1;
      } else if (previous[columnName] < current[columnName]) {
        return sort === 'asc' ? -1 : 1;
      }
      return 0;
    });
  }

  public changeFilter(data:any, config:any):any {
    let filteredData:Array<any> = data;
    this.columns.forEach((column:any) => {
      if (column.filtering) {
        filteredData = filteredData.filter((item:any) => {
          return item[column.name].match(column.filtering.filterString);
        });
      }
    });

    if (!config.filtering) {
      return filteredData;
    }

    if (config.filtering.columnName) {
      return filteredData.filter((item:any) =>
        item[config.filtering.columnName].match(this.config.filtering.filterString));
    }

    let tempArray:Array<any> = [];
    filteredData.forEach((item:any) => {
      let flag = false;
      this.columns.forEach((column:any) => {
        if (item[column.name].toString().match(this.config.filtering.filterString)) {
          flag = true;
        }
      });
      if (flag) {
        tempArray.push(item);
      }
    });
    filteredData = tempArray;

    return filteredData;
  }

  public onCellClick(data: any): any {
  	console.log(data);
    //Introducimos el valor en el que hemos clickado en nuestro atributo
    this.billRowSelected = data.row;

  	//Seteamos la cantidad actual
  	this.newCantidad = this.billRowSelected.price;

    //Abrimos el popup
    this.showChildModalBill();
  }

  /**
  *	Actualizamos el precio de un registro
  */
  updatePrice() {
  	//Comprobamos que sea un númer0 (Acepta comas)
  	if(isNaN(this.newCantidad as any) || null === this.newCantidad || undefined === this.newCantidad) {
  		alert("Debe ser un número para poder actualizar el valor");
  	} else {
  		this.csvService.updatePrice(this.billRowSelected._id, this.newCantidad)
	      .subscribe(bills => {
	          //Una ver actualizado, recargamos la tabla.
	          this.onChangeTable(this.config);
	          //Ocultamos el modal
	          this.hideChildModalBill();
	          //Activamos la alerta de que se ha actualizado correctamente
	          let alerta = document.getElementById("idAlert");
              alerta.style.display = 'block';
              //Hacemos que a los 4 segundos desaparezca la alerta
	          setTimeout(function(){
	            alerta.style.display = 'none';
	          }, 4000);
	        },
	        error => {
	          console.log("ERROR");
	        },
	        () => {
	          console.log("Finish");
	        }
	      );
  	}
  }

  /**
  * Eliminamos un registro
  */
  removeBill() {
  	this.csvService.removeRegister(this.billRowSelected._id)
      .subscribe(bills => {
          //Una ver eliminado, recargamos la tabla.
          this.onChangeTable(this.config);
          //Ocultamos el modal
          this.hideChildModalBill();
          //Activamos la alerta de que se ha actualizado correctamente
          let alerta2 = document.getElementById("idAlert2");
          alerta2.style.display = 'block';
          //Hacemos que a los 4 segundos desaparezca la alerta
          setTimeout(function(){
            alerta2.style.display = 'none';
          }, 4000);
        },
        error => {
          console.log("ERROR");
        },
        () => {
          console.log("Finish");
        }
      );
  }

  /**
  * Importamos los datos de nuestro CSV
  */
  importData() {
  	this.csvService.loadCSVData()
      .subscribe(bills => {
          //Una ver eliminado, recargamos la tabla.
          this.onChangeTable(this.config);
        },
        error => {
          console.log("ERROR");
        },
        () => {
          console.log("Finish");
        }
      );
  }

  public showChildModalBill():void {
    this.childModalBill.show();
  }

  public hideChildModalBill():void {
    this.childModalBill.hide();
  }

  /********************************************************************************************************/
  /********************************************************************************************************/
  /************************************************ GRAFICO ***********************************************/
  /********************************************************************************************************/
  /********************************************************************************************************/

  public barChartOptions:any = {
    scaleShowVerticalLines: false,
    responsive: true
  };
  public barChartLabels:string[] = [];
  public barChartType:string = 'bar';
  public barChartLegend:boolean = true;
 
  public barChartData:any[] = [/*
    {data: [65, 59, 80, 81, 56, 55], label: 'Series A'},
    {data: [28, 48, 40, 19, 86, 27], label: 'Series B'}
  */];
 
  // events
  public chartClicked(e:any):void {
    console.log(e);
  }
 
  public chartHovered(e:any):void {
    console.log(e);
  }
}
