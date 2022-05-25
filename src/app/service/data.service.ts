import { Injectable } from '@angular/core';
import { collectionData, docData, Firestore } from '@angular/fire/firestore';
import { addDoc, collection, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Observable } from 'rxjs';

export interface Usuario
 {
   id?: string;
   nameC : string ;
   rut : string;
   estadoC : string;
   ocupacion : string;
   direccion: string;
   tipocasa: string;
   permiso: string;
   integrantesHogar : string;
   telefono: string;
   email: string;
   mascota : string;
 }

export interface Perdidos{
  id?: string;
  nameM : string;
  tipoM : string;
  color: string;
  tamano: string;
  direccion: string;
  fecha: string;
}

export interface Perfil{
  id?: string;
  namep: string;
  edad: string;
  telefono : string ;
  email: string;
}

@Injectable({
  providedIn: 'root'
})


export class DataService {

  constructor( private firestore : Firestore) { }

 //TODO ESTO PARA AGREGAR USUARIO DE FORMULARIO  
  getUser(): Observable<Usuario[]>{
    const usuaRef = collection(this.firestore,'users');
    return collectionData(usuaRef,{idField:'id'}) as Observable<Usuario[]> ;
  }
  
  getUserById(id): Observable<Usuario[]>{
    const usuaDocRef = doc(this.firestore, `users/${id}`);
    return docData (usuaDocRef , {idField:'id'}) as Observable<Usuario[]>;
  }

  addUser(user:Usuario){
    const usuaRef = collection(this.firestore,'users');
    return addDoc(usuaRef,user)
  }

  deleteUser(user:Usuario){
    const usuaDocRef = doc(this.firestore, `users/${user.id}`);
    return deleteDoc(usuaDocRef)
  }

  updateUser(user:Usuario){
    const usuaDocRef = doc(this.firestore,`users/${user.id}` );
    return updateDoc(usuaDocRef , 
      {name : user.nameC, rut : user.rut ,estadoC : user.estadoC, ocupacion : user.ocupacion ,direccion : user.direccion ,
        tipocasa : user.tipocasa ,permiso: user.permiso , integrantesHogar: user.integrantesHogar,
        telefono : user.telefono, email : user.email,mascota : user.mascota,})
  }
 

// Aqui TODO PARA AGREGAR PERDIDOS

getFind(): Observable<Perdidos[]>{
  const findRef = collection(this.firestore,'perdidos');
  return collectionData(findRef,{idField:'id'}) as Observable<Perdidos[]> ;
}

getFindById(id): Observable<Perdidos[]>{
  const findDocRef = doc(this.firestore, `perdidos/${id}`);
  return docData (findDocRef , {idField:'id'}) as Observable<Perdidos[]>;
}

addFind(find:Perdidos){
  const findRef = collection(this.firestore,'perdidos');
  return addDoc(findRef,find)
}

deleteFind(find:Perdidos){
  const findDocRef = doc(this.firestore, `perdidos/${find.id}`);
  return deleteDoc(findDocRef)
}

updateFind(find:Perdidos){
  const findDocRef = doc(this.firestore,`perdidos/${find.id}` );
  return updateDoc(findDocRef , 
    {nameM : find.nameM, tipoM : find.tipoM, color : find.color , tamano : find.tamano ,
      direccion : find.direccion , fecha : find.fecha })
}

// AQUI SE AGREGA TODO LO DE PERFIL
getProfile(): Observable<Perfil[]>{
  const proRef = collection(this.firestore,'perfil');
  return collectionData(proRef,{idField:'id'}) as Observable<Perfil[]> ;
}

getProfileById(id): Observable<Perfil[]>{
  const proDocRef = doc(this.firestore, `perfil/${id}`);
  return docData (proDocRef , {idField:'id'}) as Observable<Perfil[]>;
}

addProfile(profile:Perfil){
  const proRef = collection(this.firestore,'perfil');
  return addDoc(proRef,profile)
}

deleteProfile(profile:Perfil){
  const proDocRef = doc(this.firestore, `perfil/${profile.id}`);
  return deleteDoc(proDocRef)
}

updateProfile(profile:Perfil){
  const proDocRef = doc(this.firestore,`perfil/${profile.id}` );
  return updateDoc(proDocRef , 
    {namep : profile.namep, edad : profile.edad, telefono : profile.telefono , email: profile.email})
}

}
