import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  doc, 
  collection, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  WhereFilterOp,
  DocumentReference,
  CollectionReference,
  DocumentSnapshot,
  QuerySnapshot,
  addDoc
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  // Injeção moderna baseada em tokens (Substitui o antigo AngularFirestore)
  private af = inject(Firestore);

  async createDocument(path: string, object: any, documentID: string): Promise<boolean> {
    try {
      const docRef = doc(this.af, `${path}/${documentID}`);      
      await setDoc(docRef, object);
      return true;
    } catch (err) {
      console.log(err)
      return false;
    }
  }
 
async createDocumentWithOutId(path: string, object: any): Promise<boolean> {
  try {
    // 1. Cria a referência para a coleção, não para o documento
    const collRef = collection(this.af, path);
    
    // 2. O addDoc gera o ID automaticamente e salva o documento
    const docRef = await addDoc(collRef, object);
    
    // Se precisar do ID gerado, ele está em docRef.id
    // console.log("ID gerado: ", docRef.id);
    
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}

  // Mantém o retorno de uma Promise com o DocumentSnapshot
  getDocument(documentPath: string): Promise<DocumentSnapshot<any>> {
    try {
      const docRef = doc(this.af, documentPath);
      return getDoc(docRef);
    } catch (err) {
      throw new Error();
    }
  }

  async getDocumentPath(collectionName: string, documentId: string): Promise<string> {
    const docRef = doc(this.af, `${collectionName}/${documentId}`);
    return docRef.path;
  }

  // Caso seu app precise interagir diretamente com a referência do documento
  public documentRef(path: string): DocumentReference<any> {
    return doc(this.af, path);
  }

  // Caso seu app precise interagir diretamente com a referência da coleção
  public collectionRef(path: string): CollectionReference<any> {
    return collection(this.af, path);
  }

  public getCollectionData(path: string): Promise<any[]> {
    const colRef = collection(this.af, path);
    return getDocs(colRef).then((querySnapshot) => {
      if (querySnapshot.empty) {
        return [];
      }
      const data: any[] = [];
      querySnapshot.docs.forEach((dados) => {
        data.push({ id: dados.id, ...dados.data() });
      });
      return data;
    });
  }

  singleQueryCollection(
    reference: string,
    parameter: string,
    queryType: WhereFilterOp,
    value: any
  ): Promise<QuerySnapshot<any>> {
    const colRef = collection(this.af, reference);
    const q = query(colRef, where(parameter, queryType, value));
    return getDocs(q);
  }

  doubleQueryCollection(
    reference: string[],
    parameter: string[],
    queryType: WhereFilterOp[],
    value: any[]
  ): Promise<QuerySnapshot<any>> {
    const colRef = collection(this.af, reference[0]);
    const q = query(
      colRef, 
      where(parameter[0], queryType[0], value[0]), 
      where(parameter[1], queryType[1], value[1])
    );
    return getDocs(q);
  }

  getDocumentsWithoutField(collectionName: string, campoIndesejado: string): Promise<any[]> {
    const colRef = collection(this.af, collectionName);
    return getDocs(colRef).then(querySnapshot => {
      return querySnapshot.docs.map(docSnap => {
        const data = docSnap.data();
        // Remove o campo indesejado localmente
        delete data[campoIndesejado];
        return data;
      });
    });
  }

  deleteDocument(path: string): Promise<boolean> {
    const docRef = doc(this.af, path);
    return deleteDoc(docRef)
      .then(() => true)
      .catch(() => false);
  }

  async deleteDocumentWhere(path: string, field: string, fieldvalue: string): Promise<number> {
    try {
      const colRef = collection(this.af, path);
      const q = query(colRef, where(field, '==', fieldvalue));
      const querySnapshot = await getDocs(q);
      const qtde = querySnapshot.size;

      // Executa as exclusões sequencialmente/paralelamente
      const deletePromises = querySnapshot.docs.map(docSnap => deleteDoc(docSnap.ref));
      await Promise.all(deletePromises);

      return qtde;
    } catch (error) {
      throw error;
    }
  }

  updateDocument(path: string, uid: string, data: any): Promise<boolean> {
    const docRef = doc(this.af, `${path}/${uid}`);
    return updateDoc(docRef, data)
      .then(() => true)
      .catch(() => false);
  }

  async getDocumentByPage(
    path: string, 
    lastEl: string, 
    limitNum: number, 
    field: any, 
    ordenacao: 'desc' | 'asc' = 'asc'
  ): Promise<any[]> {
    const colRef = collection(this.af, path);

    if (lastEl !== '') {
      console.log('foda');
      const lastItemRef = doc(this.af, `${path}/${lastEl}`);
      const lastItemSnap = await getDoc(lastItemRef);

      if (!lastItemSnap.exists()) {
        const q = query(colRef, orderBy(field, ordenacao), limit(limitNum));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(docSnap => docSnap.data());
      }

      // Usa o valor do campo retornado no snapshot anterior para paginar
      const lastItemData = lastItemSnap.data();
      const q = query(
        colRef, 
        orderBy(field, ordenacao), 
        startAfter('registro'), 
        limit(limitNum)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        console.log(data);
        return data;
      });
    }

    console.log('PINK');
    const q = query(colRef, orderBy(field, ordenacao), limit(limitNum));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => docSnap.data());
  }

  async getDocumentByPageWhere(
    path: string,
    lastEl: string,
    limitNum: number,
    field: any,
    queryType: WhereFilterOp,
    whereValue: any
  ): Promise<any[]> {
    const colRef = collection(this.af, path);

    if (lastEl !== '') {
      const lastItemRef = doc(this.af, `${path}/${lastEl}`);
      const lastItemSnap = await getDoc(lastItemRef);

      if (!lastItemSnap.exists()) {
        const q = query(
          colRef, 
          where(field, queryType, whereValue), 
          orderBy(field), 
          limit(limitNum)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(docSnap => docSnap.data());
      }

      // Passa o snapshot diretamente como cursor para o startAfter
      const q = query(
        colRef, 
        where(field, queryType, whereValue), 
        orderBy(field), 
        startAfter(lastItemSnap)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(docSnap => docSnap.data());
    }

    const q = query(
      colRef, 
      where(field, queryType, whereValue), 
      orderBy(field), 
      limit(limitNum)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => docSnap.data());
  }

  async getDocumentByPageDoubleWhere(
    path: string,
    lastEl: string,
    limitNum: number,
    fields: string[],
    queryTypes: WhereFilterOp[],
    whereValues: any[]
  ): Promise<any[]> {
    try {
      const colRef = collection(this.af, path);

      if (lastEl !== '') {
        const lastItemRef = doc(this.af, `${path}/${lastEl}`);
        const lastItemSnap = await getDoc(lastItemRef);

        if (!lastItemSnap.exists()) {
          console.warn('Documento lastItem não existe. Executando consulta inicial.');

          const q = query(
            colRef,
            where(fields[0], queryTypes[0], whereValues[0]),
            where(fields[1], queryTypes[1], whereValues[1]),
            orderBy('registro'),
            limit(limitNum)
          );
          const snapshot = await getDocs(q);
          return snapshot.docs.map(docSnap => docSnap.data());
        }

        const q = query(
          colRef,
          where(fields[0], queryTypes[0], whereValues[0]),
          where(fields[1], queryTypes[1], whereValues[1]),
          orderBy('registro'),
          startAfter(lastItemSnap),
          limit(limitNum)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(docSnap => docSnap.data());
      }

      const q = query(
        colRef,
        where(fields[0], queryTypes[0], whereValues[0]),
        where(fields[1], queryTypes[1], whereValues[1]),
        orderBy('registro'),
        limit(limitNum)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(docSnap => docSnap.data());

    } catch (error) {
      console.error('Erro ao executar getDocumentByPageDoubleWhere:', error);
      throw error;
    }
  }
}