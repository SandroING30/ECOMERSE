import {  Routes, RouterModule } from "@angular/router";
import {  ModuleWithProviders } from "@angular/core";
import { InicioComponent } from './components/inicio/inicio.component';

const AppRoute : Routes = [
    {path: '', component: InicioComponent}
]

export const AppRoutingModule : any[]=[];
export const routing: ModuleWithProviders<any> = RouterModule.forRoot(AppRoute);