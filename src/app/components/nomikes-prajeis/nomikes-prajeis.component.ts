import { Component } from '@angular/core';
import {  FormGroup, FormControl, ReactiveFormsModule  } from '@angular/forms';

@Component({
  selector: 'app-nomikes-prajeis',
  standalone: true,
  imports: [ReactiveFormsModule ],
  templateUrl: './nomikes-prajeis.component.html',
  styleUrl: './nomikes-prajeis.component.css'
})
export class NomikesPrajeisComponent {
  
  actTypes: any = ['Νόμος', 'Προεδρικό Διάταγμα', 'Κανονιστική Διοικητική Πράξη', 'Απόφαση του οργάνου διοίκησης', 'Άλλο'];

  nomikesDiatajeisForm = new FormGroup({
    legalActType : new FormControl(''),
    legalActNumber: new FormControl(''),
    legalActDate: new FormControl(''),
    FEKref: new FormGroup({
      FEKnumber: new FormControl(''),
      FEKissue: new FormControl(''),
      FEKdate: new FormControl(''),
    }),
    DiavgeiaNumber: new FormControl('') 
  });

  onSubmit() {
    // TODO: Use EventEmitter with form value
    console.warn(this.nomikesDiatajeisForm.value);
  }
}
