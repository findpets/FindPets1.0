import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { canActivate,redirectLoggedInTo,redirectUnauthorizedTo } from '@angular/fire/compat/auth-guard';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['']);
const redirectLoggedInToHome = () => redirectLoggedInTo(['home']);

const routes: Routes = [
  {
    path: '',
    loadChildren: () => 
    import('./pages/login/login.module').then( m => m.LoginPageModule),
    ...canActivate(redirectLoggedInToHome)
  },
  
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule),
    ...canActivate(redirectUnauthorizedToLogin)
  
  },


  {
    path: 'perdidos',
    loadChildren: () => import('./pages/perdidos/perdidos.module').then( m => m.PerdidosPageModule)
  },
  
  {
    path: 'adoptame',
    loadChildren: () => import('./pages/adoptame/adoptame.module').then( m => m.AdoptamePageModule)
  },
  {
    path: 'perfil',
    loadChildren: () => import('./pages/perfil/perfil.module').then( m => m.PerfilPageModule)
  },
  {
    path: 'foto-perdidos',
    loadChildren: () => import('./pages/foto-perdidos/foto-perdidos.module').then( m => m.FotoPerdidosPageModule)
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  },


];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }