import { Component, OnInit } from '@angular/core';
import { CuponService } from 'src/app/services/cupon.service';
declare var iziToast;
declare var jQuery:any;
declare var $:any;

@Component({
  selector: 'app-index-cupon',
  templateUrl: './index-cupon.component.html',
  styleUrls: ['./index-cupon.component.css']
})
export class IndexCuponComponent implements OnInit {

  public cupones : Array<any>=[];

  public load_data = true; 
  public page = 1;
  public pageSize = 10;

  public filtro = '';
  public token;

  constructor(
    private _cuponService: CuponService
  ) {
    this.token = localStorage.getItem('token')
   }

  ngOnInit(): void {
    this._cuponService.listar_cupones_admin(this.filtro, this.token).subscribe(
      response=>{
        this.cupones = response.data;
        this.load_data = false;
      },error=>{
        console.log(error)
      }
    )
  }

  filtrar(){
    this._cuponService.listar_cupones_admin(this.filtro, this.token).subscribe(
      response=>{
        this.cupones = response.data;
        this.load_data = false;
      },error=>{
        console.log(error)
      }
    )
  }

  eliminar(id){
    this._cuponService.eliminar_cupon_admin(id,this.token).subscribe(
      response=>{
        iziToast.show({
          title: 'CORRECTO',
          titleColor: '#13d13f',
          class:'text-success',
          position: 'topRight',
          messageColor: '#333232',
          message: 'Se ha eliminado correctamente este cupon'
          
        });
        $('#delete-'+id).modal('hide');
        $('.modal-backdrop').removeClass('show');
        
        this._cuponService.listar_cupones_admin(this.filtro, this.token).subscribe(
          response=>{
            this.cupones = response.data;
            this.load_data = false;
          },error=>{
            console.log(error)
          }
        )
      },error=>{
        console.log(error);
      }
    )
  }
}