import { Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { doc, docData, Firestore, setDoc } from '@angular/fire/firestore';
import { getDownloadURL, ref, Storage, uploadString } from '@angular/fire/storage';
import { Photo } from '@capacitor/camera'; 

@Injectable({
  providedIn: 'root'
})
export class AvatarService {

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private storage: Storage,
    public database: AngularFirestore,
  ) { }


getUserProfile(){
  const user= this.auth.currentUser;
  const userDocRef = doc(this.firestore, `users/${user.uid}`);
  return docData(userDocRef);
}


async uploadImage(cameraFile: Photo, file: any, nombre: string){
  const user= this.auth.currentUser;
  const path= `uploads/${user.uid}/profile.png`; //nombre carpeta
  const storageRef = ref(this.storage, path);

  try {
    await uploadString (storageRef, cameraFile.base64String,'base64'); //convertir img en string
    const imageUrl = await getDownloadURL(storageRef); // almacenar en firebase

    const userDocRef = doc(this.firestore, `users/${user.uid}`);
    await setDoc(userDocRef, {
      imageUrl
    });
    return true;
  } catch (e) {
    return null;
  }
}

createDoc(data: any, path: string, id: string) {
  const collection = this.database.collection(path);
  return collection.doc(id).set(data);
}

getDoc<tipo>(path: string, id: string) {
const collection = this.database.collection<tipo>(path);
return collection.doc(id).valueChanges();
}

deleteDoc(path: string, id: string) {
const collection = this.database.collection(path);
return collection.doc(id).delete();
}

updateDoc(data: any, path: string, id: string) {
const collection = this.database.collection(path);
return collection.doc(id).update(data);
}

getId() {
return this.database.createId();
}

getCollection<tipo>(path: string) {
  const collection = this.database.collection<tipo>(path);
  return collection.valueChanges();
}

getCollectionQuery<tipo>(path: string, parametro: string, condicion: any, busqueda: string) {
  const collection = this.database.collection<tipo>(path, 
    ref => ref.where( parametro, condicion, busqueda));
  return collection.valueChanges();
}

getCollectionAll<tipo>(path, parametro: string, condicion: any, busqueda: string, startAt: any) {
  if (startAt == null) {
    startAt = new Date();
  }
  const collection = this.database.collectionGroup<tipo>(path, 
    ref => ref.where( parametro, condicion, busqueda)
              .orderBy('fecha', 'desc')
              .limit(1)
              .startAfter(startAt)
    );
  return collection.valueChanges();
}

getCollectionPaginada<tipo>(path: string, limit: number, startAt: any) {
  if (startAt == null) {
    startAt = new Date();
  }
  const collection = this.database.collection<tipo>(path, 
    ref => ref.orderBy('fecha', 'desc')
              .limit(limit)
              .startAfter(startAt)
    );
  return collection.valueChanges();
}


}