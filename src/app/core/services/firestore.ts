import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { WhereFilterOp } from '@angular/fire/firestore';


@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  constructor(private af: AngularFirestore) {}

  async isDocumentExist(path: string): Promise<boolean> {
    const doc = await this.getDocument(path)
    if (!doc.exists) { return false}
    return true;
  }

  async createDocument(path:string, object: any, documentID: string): Promise<boolean> {
    try {
      this.af.collection(path).doc(documentID).set(object);
      return true
    } catch(err) {
      return false;
    }
  }

  getDocument(documentPath: string) {
    try {
      return this.af.firestore.doc(documentPath).get();
    } catch(err) {
      throw new Error;

    }
  }

  async getDocumentPath(collectionName: string, documentId: string): Promise<string> {
    const docRef = this.af.firestore.doc(`${collectionName}/${documentId}`);
    return docRef.path;
  }

  public documentRef(path: string) {
    return this.af.firestore.doc(path);
  }

  public collectionRef(path: string) {
    return this.af.firestore.collection(path)
  }

  public getCollectionData(path: string): Promise<any[]> {
    return this.af.firestore
      .collection(path)
      .get()
      .then((collection) => {
        if (collection.empty) {
          return [];
        }
        const data: any = [];
        collection.docs.map((dados) => {
          data.push({ id: dados.id, ...dados.data() });
        });
        return data;
      })
  }


  singleQueryCollection(
    reference: string,
    parameter: string,
    queryType: WhereFilterOp,
    value: any
  ) {
    return this.af.firestore.collection(reference).where(parameter, queryType, value).get();
  }

  doubleQueryCollection(
    reference: string[],
    parameter: string[],
    queryType: WhereFilterOp[],
    value: any[]
  ) {
   return this.af.firestore.collection(reference[0]).where(parameter[0], queryType[0], value[0]).where(parameter[1], queryType[1], value[1]).get();
  }

  getDocumentsWithoutField(collectionName: string, campoIndesejado: string) {
    return this.af.firestore.collection(collectionName).get().then(querySnapshot => {
      return querySnapshot.docs.map(doc => {
        const data = doc.data();

        // Remova o campo indesejado
        delete data[campoIndesejado];

        return data;
      });
    });
  }

  deleteDocument(path: string): Promise<boolean> {
    return this.af.firestore.doc(path).delete().then(() => {
      return true;
    }).catch(() => {
      return false;
    });
  }

  async deleteDocumentWhere(path: string, field: string, fieldvalue: string): Promise<any> {
    try {
      const collection = await this.af.firestore.collection(path).where(field, '==', fieldvalue).get();
      const qtde = collection.size;
      collection.forEach(doc => {
        doc.ref.delete();
      });
      return qtde;
    } catch (error) {
      throw error;
    }
  }


  updateDocument(path: string, uid: string, data: any, ) {
    return this.af.collection(path).doc(uid).update(data)
      .then(() => {
        return true
      })
      .catch((error) => {
        return false
      });
  }


  async getDocumentByPage(path: string, lastEl: string, limit: number, field: any, ordenacao?:'desc' | 'asc' ) {
    if (lastEl !== '') {
      console.log('foda')
      return this.af.firestore.doc(path + '/' + lastEl).get().then(async (lastItem: any) => {
        if (!lastItem.exists) {
          return this.af.firestore.collection(path).orderBy(field, ordenacao).limit(limit).get();
        }
        const snapshot = await this.af.firestore.collection(path).orderBy(field, ordenacao).startAfter(lastItem.data().registro).limit(limit).get();
        return snapshot.docs.map((doc) => {
          const data = doc.data();
          console.log(data)
          return data;
        });
      });
    }
    console.log('PINK')
    return this.af.firestore.collection(path).orderBy(field, ordenacao).limit(limit).get().then(snapshot => {
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return data;
      });
    });
  }

  async getDocumentByPageWhere(
    path: string,
    lastEl: string,
    limit: number,
    field: any,
    //whereField: string,
    queryType: WhereFilterOp,
    whereValue: any
  ) {
    if (lastEl !== '') {

      let lastItem = await this.af.firestore.doc(path + '/' + lastEl).get()
      if (!lastItem.exists) {

        return this.af.firestore.collection(path).where(field, queryType, whereValue).orderBy(field).limit(limit).get();
      }

      return  this.af.firestore.collection(path).where(field, queryType, whereValue).orderBy(field).startAfter(lastItem).get().then(snapshot => {
        return snapshot.docs.map(doc => {
          const data = doc.data();
          return data;
        })
      })
    }
    return this.af.firestore.collection(path).where(field, queryType, whereValue).orderBy(field).limit(limit).get().then(snapshot => {
      return snapshot.docs.map(doc => {
        const data = doc.data();

        return data;
      });
    });
  }

  async getDocumentByPageDoubleWhere(
    path: string,
    lastEl: string,
    limit: number,
    fields: string[],
    queryTypes: WhereFilterOp[],
    whereValues: any[]
  ) {
    try {
      // Verificação inicial do `lastEl`
      if (lastEl !== '') {
        // Obtendo o último documento da página anterior para definir o cursor
        const lastItem = await this.af.firestore.doc(`${path}/${lastEl}`).get();

        if (!lastItem.exists) {
          console.warn('Documento lastItem não existe. Executando consulta inicial.');

          // Consulta inicial sem `startAfter`
          return await this.af.firestore.collection(path)
            .where(fields[0], queryTypes[0], whereValues[0])
            .where(fields[1], queryTypes[1], whereValues[1])
            .orderBy('registro')
            .limit(limit)
            .get()
            .then(snapshot => snapshot.docs.map(doc => doc.data()));
        }



        // Consulta com `startAfter` para paginação
        return await this.af.firestore.collection(path)
          .where(fields[0], queryTypes[0], whereValues[0])
          .where(fields[1], queryTypes[1], whereValues[1])
          .orderBy('registro')
          .startAfter(lastItem)
          .limit(limit)
          .get()
          .then(snapshot => snapshot.docs.map(doc => doc.data()));
      }


      return await this.af.firestore.collection(path)
        .where(fields[0], queryTypes[0], whereValues[0])
        .where(fields[1], queryTypes[1], whereValues[1])
        .orderBy('registro')
        .limit(limit)
        .get()
        .then(snapshot => snapshot.docs.map(doc => doc.data()));

    } catch (error) {
      console.error('Erro ao executar getDocumentByPageDoubleWhere:', error);
      throw error;
    }
  }




}
