import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map'

/*
 * Ruta de acceso: /app/_services/csv.service.ts
 * El servicio de csv contiene todos lo métodos de la API 
*/

@Injectable()
export class CsvService {

	private url_base:string = "http://localhost:3001/v01/";

	constructor(private http: Http) {
		console.log("Constructor de CSV Service");
	}

	
	 /**
     * Método que nos devuelve todos los registros
     * @returns {Observable<R|T>}
     */
  	 findAllBills(): Observable<any[]> {
	    let headers = new Headers({ 'Content-Type': 'application/json'});
	    let options = new RequestOptions({ headers: headers });
	    let url = this.url_base+"csv/getAll";

	    return this.http.get(url, options)
	      .map((response: Response) => response.json())
	      .catch(error => Observable.throw(error));
  	  }

  	  /**
  	  *Actualizamos el precio de un registro
  	  */
	  updatePrice(id, newPrice): Observable<any[]> {
	    // add authorization header with jwt token
	    let headers = new Headers({ 'Content-Type': 'application/json'});
	    let options = new RequestOptions({ headers: headers });
	    let url = this.url_base+"csv/update/bill/";
	    url = url + id;
	    let body = {
	      "price": newPrice
	    };

	    return this.http.put(url, body, options)
	      .map((response: Response) => response.json())
	      .catch(error => Observable.throw(error));
	  }

	  /**
	  *Delete físico de un registro pasándole por parámetro su id
	  */
	  removeRegister(id: string): Observable<any[]> {
	    // add authorization header with jwt token
	    let headers = new Headers({ 'Content-Type': 'application/json'});
	    let options = new RequestOptions({ headers: headers });
	    let url = this.url_base+"csv/remove/";
	    url = url + id;

	    return this.http.delete(url, options)
	      .map((response: Response) => response.json())
	      .catch(error => Observable.throw(error));
	  }

	  /**
	  *	Cargamos los datos de un archivo CSV de prueba que guardo en el servidor.
	  */
	  loadCSVData(): Observable<any[]> {
	    // add authorization header with jwt token
	    let headers = new Headers({ 'Content-Type': 'application/json'});
	    let options = new RequestOptions({ headers: headers });
	    let url = this.url_base+"csv/upload-csv";
	    let body = undefined;

	    return this.http.post(url, body, options)
	      .map((response: Response) => response.json())
	      .catch(error => Observable.throw(error));
	  }
}