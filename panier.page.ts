import { Component, OnInit } from '@angular/core';
import { CartService } from '../cart.service';
import { HttpClient } from "@angular/common/http";
import { Router } from '@angular/router';
import { isGeneratedFile } from '@angular/compiler/src/aot/util';
import { AngularFireDatabase } from '@angular/fire/database'
import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase';
import { $ } from 'protractor';
import {AngularFireList} from '@angular/fire/database'
import { appendFile } from 'fs';
import { Observable } from 'rxjs';






@Component({
  selector: 'app-panier',
  templateUrl: './panier.page.html',
  styleUrls: ['./panier.page.scss'],
  
})
export class PanierPage implements OnInit {
  selectedItems = [];
  total = 0;
  orders : Observable<any>
  itemsList: Observable<any>;
  today = Date.now();
  a = new Date();
  

  constructor(private cartService: CartService, private http: HttpClient, private router: Router, private afAuth: AngularFireAuth, private afDatabase: AngularFireDatabase,
   ) { 
      
    }

    

  ngOnInit() {
    let items = this.cartService.getCart(); // récup les items du panier
    let selected = {}; // créer un objet 
    

        for(let obj of items){ 
          if(selected[obj.id]){ // si l'objet exsite deja on ajoute 1
            selected[obj.id].count++;
          }else { // sinon on créer un nouvvelle objet 
            selected[obj.id] = {...obj, count: 1};
          }
        }

        this.selectedItems = Object.keys(selected).map(key => selected[key]);
        console.log('item: ', this.selectedItems);
        this.total = this.selectedItems.reduce((a, b) => a + (b.count * b.price), 0);
    }

    ionViewWillEnter(){
      let items = this.cartService.getCart(); // récup les items du panier
      let selected = {}; // créer un objet 
  
          for(let obj of items){ 
            if(selected[obj.id]){ // si l'objet exsite deja on ajoute 1
              selected[obj.id].count++;
            }else { // sinon on créer un nouvvelle objet 
              selected[obj.id] = {...obj, count: 1};
            }
          }
  
          this.selectedItems = Object.keys(selected).map(key => selected[key]);
          console.log('item: ', this.selectedItems);
          this.total = this.selectedItems.reduce((a, b) => a + (b.count * b.price), 0);


          this.afAuth.authState.subscribe(data => {
            this.itemsList = this.afDatabase.list(`oders/${data.uid}`).valueChanges();
            console.log(this.itemsList)
          
          })

    }

    pay(){
      this.http.post<any>('http://157.230.27.240:3000/', {total: this.total*100})
      .subscribe(data => {
        console.log(data);
      });
      

      let items = this.cartService.getCart();
      for(let obj of items){
        
        obj.hour = this.today
        console.log(obj.hour)
        this.afAuth.authState.subscribe(auth =>{
          this.afDatabase.list(`oders/${auth.uid}`).push(obj); // sauvegarde les data dans la database
        })
      }

      this.router.navigate(['payment'])

    }

    deleteItem(Itemid){
      let items = this.cartService.getCart();
      let selected = {}
      let index = this.selectedItems.indexOf(Itemid)

      items.splice(index, 1);

}

}
