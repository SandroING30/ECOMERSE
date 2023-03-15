import { Router } from '@angular/router';
import { AdminService } from './../../../services/admin.service';
import { ClienteService } from './../../../services/cliente.service';
import { Component, OnInit } from '@angular/core';
declare var iziToast;

@Component({
  selector: 'app-create-cliente',
  templateUrl: './create-cliente.component.html',
  styleUrls: ['./create-cliente.component.css']
})
export class CreateClienteComponent implements OnInit {

  public cliente : any = {
    genero: ''
  };

  public token;
  public load_btn = false;
  public load_data = true;

  constructor(
    private _clienteService:ClienteService,
    private _adminService:AdminService,
    private _router: Router
  ) {
    this.token = this._adminService.getToken();
  }

  ngOnInit(): void {
    
  }

  registro(registroform){
    if(registroform.valid){
      console.log(this.cliente);
      this.load_btn = true;
      this._clienteService.registro_cliente_admin(this.cliente,this.token).subscribe({
        next: response=>{
          console.log(response);
          iziToast.show({
            title: 'CORRECTO',
            titleColor: '#1DC740',
            class: 'text-success',
            position: 'topRight',
            message: 'Se registro correctamente el nuevo cliente'
          });


          this.cliente = {
            genero: '',
            nombres: '',
            apellidos: '',
            f_nacimiento: '',
            telfono: '',
            dni: ''
          }

          this.load_btn = false;

          this._router.navigate(['/panel/clientes']);
       },
        error: error=>{
          console.log(error);
        }
      })
    }else{
      iziToast.show({
        title: 'ERROR',
        titleColor: '#458CFF',
        class: 'text-danger',
        position: 'topRight',
        message: 'Los datos del formulario no son validos o estan incompletos!!!'
    });
    }
}

}