import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CuponService } from 'src/app/services/cupon.service';
declare var iziToast;

@Component({
  selector: 'app-create-cupon',
  templateUrl: './create-cupon.component.html',
  styleUrls: ['./create-cupon.component.css']
})
export class CreateCuponComponent implements OnInit {
  public token:any;
  public cupon : any = {
    tipo:''
  };

  public load_btn = false;

  constructor(
    private _cuponService : CuponService,
    private _router : Router
  ) {
    this.token = localStorage.getItem('token');
   }

  ngOnInit(): void {
  }
  registro(registroForm){
    if(registroForm.valid){
      this.load_btn = true;
      this._cuponService.registro_cupon_admin(this.cupon, this.token).subscribe(
        response=>{
          console.log(response);
          iziToast.show({
            title: 'CORRECTO',
            titleColor: '#03ad20',
            class:'text-success',
            position: 'topRight',
            messageColor: '#333232',
            message: 'Cupón registrado correctamente.'
            
          });
          this.load_btn = false;
          this._router.navigate(['/panel/cupones']);
         
        },error=>{
          console.log(error);
          this.load_btn = false;
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
        message: 'Los datos del formulario no son validos'
        
      });
    }
  }

}