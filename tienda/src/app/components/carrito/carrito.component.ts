import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ClienteService } from 'src/app/services/cliente.service';
import { GuestService } from 'src/app/services/guest.service';
import { GLOBAL } from 'src/app/services/GLOBAL';
import { Router } from '@angular/router';
import { io } from "socket.io-client";
declare var iziToast;
declare var Cleave;
declare var StickySidebar;
declare var paypal;

interface HtmlInputEvent extends Event{
  target : HTMLInputElement & EventTarget;
} 

@Component({
  selector: 'app-carrito',
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.css']
})
export class CarritoComponent implements OnInit {

  @ViewChild('paypalButton', { static: true })
  paypalElement!: ElementRef;

  public idcliente;
  public token;

  public carrito_arr : Array<any> = [];
  public url;
  public subtotal = 0;
  public total_pagar: any = 0;
  public socket = io('http://localhost:4201');
  
  public direccion_principal: any = {};
  public envios: Array<any> = [];

  public precio_envio = "0";

  public venta: any = {};
  public dventa: Array<any> = [];

  public btn_load = false;
  public carrito_load = true;

  public error_cupon = '';
  public descuento = 0;
  public cuponAplicado = false;

  public descuento_activo : any = undefined;


  constructor(
    private _clienteService : ClienteService,
    private _guestService : GuestService,
    private _router : Router,
  ) {
    this.idcliente = localStorage.getItem('_id');
    this.venta.cliente = this.idcliente;
    this.token = localStorage.getItem('token');
    this.url = GLOBAL.url;
    
    this._clienteService.obtener_carrito_cliente(this.idcliente, this.token).subscribe({
      next: response =>{
        this.carrito_arr = response.data;
        this.calcular_carrito();
      }
  });

    this._guestService.get_envios().subscribe({
      next: response =>{
        this.envios = response;
      }
    });
    
   }

ngOnInit(): void {

  this._guestService.obtener_descuento_activo().subscribe(
    response=>{
      if(response.data != undefined){
        this.descuento_activo = response.data[0];
      }else{
        this.descuento_activo = undefined;
      }

    }
  );

  this.init_Data();
  setTimeout(() => {
          new Cleave('#cc-number', {
            creditCard: true,
            onCreditCardTypeChanged: function (type) {
                // update UI ...
            }
          });
          new Cleave('#cc-exp-date', {
            date: true,
            datePattern: ['m', 'y']
         });

         new StickySidebar('.sidebar-sticky', {topSpacing: 20});
        });

      this.get_direccion_principal();

      paypal.Buttons({
          style: {
              layout: 'horizontal'
          },
          createOrder: (data,actions)=>{
      
              return actions.order.create({
                purchase_units : [{
                  description : 'Pago en MI TIENDA',
                  amount : {
                    currency_code : 'USD',
                    value: this.total_pagar
                  },
                }]
              });
            
          },
          onApprove : async (data,actions)=>{
            const order = await actions.order.capture();
            console.log(order);

            this.venta.transaccion = order.purchase_units[0].payments.captures[0].id;

            this.venta.detalles = this.dventa;
            this._clienteService.registro_compra_cliente(this.venta,this.token).subscribe({
              next: response=>{
                console.log(response);
                iziToast.show({
                  title: 'CORRECTO',
                  titleColor: '#33FFB2',
                  class: 'text-sucess',
                  position: 'topRight',
                  message: 'Ha realizado su compra correctamente'
                });
                this._clienteService.enviar_correo_compra_cliente(response.venta._id,this.token).subscribe({
                  next: response =>{
                    this._router.navigate(['/']);
                  }
                });
              },
              error: error=>{
                console.log(error);
                iziToast.show({
                  title: 'ERROR',
                  titleColor: '#FF0000',
                  class: 'text-danger',
                  position: 'topRight',
                  message: 'Error en el servidor'
                  
                });
              }              
            });

          },
          onError : err =>{
           
          },
          onCancel: function (data, actions) {
            
          }
        }).render(this.paypalElement.nativeElement);
                
}

init_Data(){
  this._clienteService.obtener_carrito_cliente(this.idcliente, this.token).subscribe({
    next: response =>{
      this.carrito_arr = response.data;

      this.carrito_arr.forEach(element =>{
        this.dventa.push({
          producto: element.producto._id,
          subtotal: element.producto.precio,
          variedad: element.variedad,
          cantidad: element.cantidad,
          cliente: localStorage.getItem('_id')
        });
      });
      this.carrito_load = false;

      this.calcular_carrito();
      this.calcular_total('Envio Gratis');
    }  
  });
}


get_direccion_principal(){
  this._clienteService.obtener_direccion_principal_cliente(localStorage.getItem('_id'),this.token).subscribe({
    next: response=>{
      if(response.data == undefined){
        this.direccion_principal = undefined;
      }else{
        this.direccion_principal = response.data;
        this.venta.direccion = this.direccion_principal._id;
      }
      
      
    }
  });
}

calcular_carrito(){
  this.subtotal = 0;
  if(this.descuento_activo == undefined){
    this.carrito_arr.forEach(element => {
        this.subtotal = this.subtotal + parseInt(element.producto.precio);
    });
  }else if(this.descuento_activo != undefined){
    this.carrito_arr.forEach(element => {
      let new_precio = Math.round(parseInt(element.producto.precio) - (parseInt(element.producto.precio)*this.descuento_activo.descuento)/100);
      this.subtotal = this.subtotal + new_precio;
  });
  }
} 

  eliminar_item(id){
    this._clienteService.eliminar_carrito_cliente(id,this.token).subscribe(
      response =>{
        iziToast.show({
          title: 'CORRECTO',
          titleColor: '#33FFB2',
          class: 'text-sucess',
          position: 'topRight',
          message: 'Se elimino el producto del carrito.'
        });
        this.socket.emit('delete-carrito',{data:response.data});
        this.init_Data();        
      }
    );
  }

  validar_cupon(){
    if(this.venta.cupon && !this.cuponAplicado){
      if(this.venta.cupon.toString().length <= 25){
        
        this._clienteService.validar_cupon_admin(this.venta.cupon,this.token).subscribe(
          response=>{
            if(response.data != undefined){
              this.error_cupon = '';
              //VALIDACION TIPO O FIJO
              if(response.data.tipo == 'Valor fijo' ){
                this.descuento = response.data.valor;
                this.total_pagar = this.total_pagar - this.descuento;
              }else if(response.data.tipo == 'Porcentaje' ){
                this.descuento = (this.total_pagar * response.data.valor)/100;
                this.total_pagar = this.total_pagar - this.descuento;
              }
              this.cuponAplicado = true
            }else{
              this.error_cupon = 'El cupón no se pudo canjear o es invalido'
            }
            console.log(response);
            
          }
        );
      }else{
        this.error_cupon = 'El cupón debe ser menos de 25 caracteres'
      }
    }else{
      this.error_cupon = 'El cupón no es valido o ya se aplico un cupon'
    }
  }

  calcular_total(envio_titulo){
    this.total_pagar = (parseInt(this.subtotal.toString()) + parseInt(this.precio_envio));
    this.venta.subtotal = this.total_pagar;
    this.venta.envio_precio = parseInt(this.precio_envio);
    this.venta.envio_titulo = envio_titulo;
    console.log(this.venta);
    
  }
  
}
