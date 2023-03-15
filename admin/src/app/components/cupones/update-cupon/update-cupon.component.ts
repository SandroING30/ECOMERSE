import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CuponService } from 'src/app/services/cupon.service';
declare var iziToast;

@Component({
  selector: 'app-update-cupon',
  templateUrl: './update-cupon.component.html',
  styleUrls: ['./update-cupon.component.css']
})
export class UpdateCuponComponent implements OnInit {
  public token;
  public cupon : any = {
    tipo:''
  };

  public load_btn = false;
  public id;
  public load_data = true;
  

  constructor(
    private _cuponService : CuponService,
    private _router : Router,
    private _route : ActivatedRoute
  ) {
    this.token = localStorage.getItem('token');
   }

  ngOnInit(): void { 
    this._route.params.subscribe(
      params=>{
        this.id = params['id'];
        //console.log(this.id);

        this._cuponService.obtener_cupon_admin(this.id,this.token).subscribe(
          response=>{
            console.log(response);

            if(response.data == undefined){
              this.cupon = undefined;
             this.load_data = false;
            }else{
              this.cupon = response.data;
             this.load_data = false;
            }
            console.log(this.cupon);

          },
          error=>{
            //console.log(error);

          }
        );
      }
    )
  }
  actualizar(actualizarForm){
    if(actualizarForm.valid){

      this.load_btn = true;

     this._cuponService.actualizar_cupon_admin(this.id, this.cupon, this.token).subscribe(
      response =>{
        iziToast.show({
          title: 'CORRECTO',
          titleColor: '#fff',
          class:'text-success',
          backgroundColor: '#28a745',
          position: 'topRight',
          messageColor: '#fff',
          message: 'Cupón actualizado correctamente.'
          
        });
        this.load_btn = false;
        this._router.navigate(['/panel/cupones']);

      }
     )

    }else{
      iziToast.show({
        title: 'ERROR',
        titleColor: '#fff',
        class:'text-danger',
        backgroundColor: '#dc3545',
        position: 'topRight',
        messageColor: '#fff',
        message: 'Los datos del formulario no son validos o estan incompletos'
        
      });
    }
  }

}