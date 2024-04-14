import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { Subscription, take } from 'rxjs';
import { IFek } from 'src/app/shared/interfaces/nomiki-praji/fek.interface';
import { ConstService } from 'src/app/shared/services/const.service';
import { FileUploadService } from 'src/app/shared/services/file-upload.service';
import { IOrganizationUnit } from 'src/app/shared/interfaces/organization-unit';
import { OrganizationUnitService } from 'src/app/shared/services/organization-unit.service';
import { ILegalAct } from 'src/app/shared/interfaces/nomiki-praji/legal-act.interface';
import { LegalActService } from 'src/app/shared/services/legal-act.service';

function dateDifference(date1: Date, date2: Date): number {
    const diffTime = Math.abs(date1.getTime() - date2.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
@Component({
    selector: 'app-new-legal-act',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, NgbAlertModule],
    templateUrl: './new-legal-act.component.html',
    styleUrl: './new-legal-act.component.css',
})
export class NewLegalActComponent implements OnInit {
    // The following three are injected by the modal service
    organization: { preferredLabel: string; code: string };
    organizationUnit: { preferredLabel: string; code: string };
    remit: { remitType: string; cofog1: string; cofog2: string; cofog3: string };
    // Some useful services
    constService = inject(ConstService);
    uploadService = inject(FileUploadService);
    organizationUnitService = inject(OrganizationUnitService);
    legalActService = inject(LegalActService);

    modalRef: any;

    years: number[] = [];
    currentYear: number = new Date().getFullYear();

    progress = 0;
    currentFile: File;
    uploadObjectID: string | null = null;

    fek: IFek;

    // moreThan30 = false;

    actTypes = this.constService.ACT_TYPES;

    form = new FormGroup({
        legalActType: new FormControl('', Validators.required),
        legalActTypeOther: new FormControl(''),
        legalActNumber: new FormControl('', Validators.required),
        legalActYear: new FormControl('', Validators.required),
        fek: new FormGroup({
            number: new FormControl(''),
            issue: new FormControl(''),
            date: new FormControl(''),
        }),
        ada: new FormControl('', Validators.pattern(/^[Α-Ω]{10}-[Α-Ω]{3}$/)),
        legalActFile: new FormControl('', Validators.required),
    });

    formSubscriptions: Subscription[] = [];
    showOtherLegalActType = false;

    ngOnInit(): void {
        for (let i = this.currentYear; i >= 1846; i--) {
            this.years.push(i);
        }

        this.formSubscriptions.push(
            this.form.controls.legalActType.valueChanges.subscribe((value) => {
                if (value === 'ΑΛΛΟ') {
                    this.showOtherLegalActType = true;
                    this.form.controls.legalActTypeOther.setValidators(Validators.required);
                    this.form.controls.legalActTypeOther.updateValueAndValidity();
                } else {
                    this.form.controls.legalActTypeOther.setValue('');
                    this.form.controls.legalActTypeOther.clearValidators();
                    this.form.controls.legalActTypeOther.updateValueAndValidity();
                    this.showOtherLegalActType = false;
                }
            }),
        );

        // this.formSubscriptions.push(
        //     this.form.controls.legalActDate.valueChanges.subscribe((value) => {
        //         if (value) {
        //             if (!this.checkFEK()) {
        //                 this.moreThan30 = this.formDatesDifference();
        //             } else {
        //                 this.moreThan30 = false;
        //             }
        //         }
        //     }),
        // );

        // this.formSubscriptions.push(
        //     this.form.controls.fek.valueChanges.subscribe((value) => {
        //         if (value) {
        //             if (!this.checkFEK()) {
        //                 this.moreThan30 = this.formDatesDifference();
        //             } else {
        //                 this.moreThan30 = false;
        //             }
        //         }
        //     }),
        // );
    }

    formDatesDifference() {
        const dateFek = new Date(this.form.get('fek.date').value);
        const dateAct = new Date(this.form.get('legalActDate').value);
        const diffDays = dateDifference(dateFek, dateAct);
        return diffDays > 30;
    }

    ngOnDestroy(): void {
        this.formSubscriptions.forEach((sub) => sub.unsubscribe());
    }

    onSubmit() {
        const ada = this.form.get('ada').value ? this.form.get('ada').value : 'ΜΗ ΑΝΑΡΤΗΤΕΑ ΠΡΑΞΗ';
        console.log('ADA', ada);
        const fek =
            this.form.get('fek.number').value === '' ||
            this.form.get('fek.issue').value === '' ||
            this.form.get('fek.date').value === ''
                ? { number: 'ΜΗ ΔΗΜΟΣΙΕΥΤΕΑ ΠΡΑΞΗ', issue: '', date: '' }
                : this.form.get('fek').value;
        console.log('FEK', fek);
        const data = {
            ...this.form.value,
            ada,
            fek,
        } as ILegalAct;
        console.log('DATA', data);
        this.legalActService.newLegalAct(data).subscribe((data) => {
            console.log('Data', data);
        });
    }

    selectFile(event: any): void {
        if (event.target.files.length === 0) {
            console.log('No file selected!');
            return;
        }
        this.currentFile = event.target.files[0];
        this.uploadService.upload(this.currentFile).subscribe({
            next: (event: any) => {
                if (event.type === HttpEventType.UploadProgress) {
                    this.progress = Math.round((100 * event.loaded) / event.total);
                } else if (event instanceof HttpResponse) {
                    this.uploadObjectID = event.body.id;
                    this.form.controls.legalActFile.setValue(this.uploadObjectID);
                }
            },
            error: (err: any) => {
                console.log(err);
            },
            complete: () => {
                console.log(this.form.errors);
                console.log(this.form.valid);
                console.log(this.form.value);
            },
        });
    }

    checkADA() {
        return this.form.get('ada').value === '';
    }

    checkFEK() {
        return (
            this.form.get('fek.number').value === '' ||
            this.form.get('fek.issue').value === '' ||
            this.form.get('fek.date').value === ''
        );
    }

    getOrganizationPrefferedLabelByCode(code: string): string | undefined {
        return this.constService.ORGANIZATION_CODES.find((x) => x.code === code)?.preferredLabel;
    }
}