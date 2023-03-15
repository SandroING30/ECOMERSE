import { Component, OnInit } from '@angular/core';
import { ProductoService } from 'src/app/services/producto.service';
import { GLOBAL } from './../../../services/GLOBAL';
import { Workbook } from "exceljs";
import * as fs from 'file-saver';

declare var iziToast;
declare var jQuery:any;
declare var $: any;

@Component({
  selector: 'app-index-producto',
  templateUrl: './index-producto.component.html',
  styleUrls: ['./index-producto.component.css']
})
export class IndexProductoComponent implements OnInit {

  public load_data = true;
  public filtro = '';
  public token:any;
  public productos : Array<any> = [];
  public arr_productos : Array<any> = [];
  public url:any;
  public page = 1;
  public pageSize= 10;
  public load_btn = false;

  constructor(
    private _productoService : ProductoService
  ) {
    this.token = localStorage.getItem('token');
    this.url = GLOBAL.url;
  }

  ngOnInit(): void {
    this.init_data();
  }

  init_data(){
    this._productoService.listar_productos_admin(this.filtro,this.token).subscribe(
      response=>{
        console.log(response);
          this.productos = response.data;
          this.productos.forEach(element => {
            this.arr_productos.push({
              titulo: element.titulo,
              stock: element.stock,
              precio: element.precio,
              categoria: element.categoria,
              nventas: element.nventas

            });
          });
          console.log(this.arr_productos);
          

          this.load_data = false;
        
      },
      error=>{
        console.log(error);
        
      }
    )

  }

  filtrar(){
    if(this.filtro){
      this._productoService.listar_productos_admin(this.filtro,this.token).subscribe({
        next: response =>{
          this.productos = response.data;
          this.load_data = false;
        },
        error: error => {
          console.log(error);
  
        }
      });
  }else{
    iziToast.show({
      title: 'ERROR',
      titleColor: '#FC2E2E',
      class: 'text-success',
      position: 'topRight',
      message: 'Ingrese un filtro para buscar'
    });
  }
  }


  resetear(){
    this.filtro = '';
    this.init_data();
  }

  eliminar(id){
    this.load_btn = true;
    this._productoService.eliminar_producto_admin(id,this.token).subscribe({
      next: response=>{
        iziToast.show({
          title: 'CORRECTO',
          titleColor: '#1DC740',
          class: 'text-success',
          position: 'topRight',
          message: 'Se elimino correctamente el producto'
        });

        $('#delete-'+id).modal('hide');
        $('.modal-backdrop').removeClass('show');

        this.load_btn = false;

        this.init_data();

        },
          error: error=>{
            iziToast.show({
              title: 'ERROR',
              titleColor: '#1DC740',
              class: 'text-success',
              position: 'topRight',
              message: 'Ocurrio un error en el servidor'
            });
            console.log(error);
          }
        })
  }
  download_excel(){
    let workbook = new Workbook();
    let worksheet = workbook.addWorksheet("Reporte de productos");

    worksheet.addRow(undefined);
    for (let x1 of this.arr_productos){
      let x2=Object.keys(x1);

      let temp=[]
      for(let y of x2){
        temp.push(x1[y] as never);
      }
      worksheet.addRow(temp)
    }

    let fname='REP01- ';

    worksheet.columns = [
      { header: 'Producto', key: 'col1', width: 30},
      { header: 'Stock', key: 'col2', width: 15},
      { header: 'Precio', key: 'col3', width: 15},
      { header: 'Categoria', key: 'col4', width: 25},
      { header: 'N° ventas', key: 'col5', width: 15},
    ]as any;

    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      fs.saveAs(blob, fname+'-'+new Date().valueOf()+'.xlsx');
    });
  }
}