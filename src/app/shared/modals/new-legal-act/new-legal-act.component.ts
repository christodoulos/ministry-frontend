import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbAlertModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { Subscription, take } from 'rxjs';
import { IFek } from 'src/app/shared/interfaces/legal-act/fek.interface';
import { ConstService } from 'src/app/shared/services/const.service';
import { FileUploadService } from 'src/app/shared/services/file-upload.service';
import { OrganizationalUnitService } from 'src/app/shared/services/organizational-unit.service';
import { ILegalAct } from 'src/app/shared/interfaces/legal-act/legal-act.interface';
import { LegalActService } from 'src/app/shared/services/legal-act.service';

function dateDifference(date1: Date, date2: Date): number {
    const diffTime = Math.abs(date1.getTime() - date2.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
@Component({
    selector: 'app-new-legal-act',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, NgbAlertModule, NgbTooltipModule],
    templateUrl: './new-legal-act.component.html',
    styleUrl: './new-legal-act.component.css',
})
export class NewLegalActComponent implements OnInit {
    // Some useful services
    constService = inject(ConstService);
    uploadService = inject(FileUploadService);
    organizationUnitService = inject(OrganizationalUnitService);
    legalActService = inject(LegalActService);

    // @ViewChild('successTpl') successTpl: TemplateRef<any>;
    nomikiPraxiString = '';

    modalRef: any;

    years: number[] = [];
    currentYear: number = new Date().getFullYear();

    progress = 0;
    currentFile: File;
    uploadObjectID: string | null = null;

    fek: IFek;

    moreThan30 = false;

    actTypes = this.constService.ACT_TYPES;

    form = new FormGroup({
        legalActType: new FormControl(null, Validators.required),
        legalActTypeOther: new FormControl(null),
        legalActNumber: new FormControl(null, Validators.required),
        legalActDateOrYear: new FormControl(null, Validators.required),
        fek: new FormGroup({
            number: new FormControl(null),
            issue: new FormControl(null),
            date: new FormControl(null),
        }),
        ada: new FormControl(null, Validators.pattern(/^[Α-Ω,0-9]{10}-[Α-Ω,0-9]{3}$/)),
        legalActFile: new FormControl(null, Validators.required),
    });

    formSubscriptions: Subscription[] = [];
    showOtherLegalActType = false;

    ngOnInit(): void {
        for (let i = this.currentYear; i >= 1846; i--) {
            this.years.push(i);
        }

        this.formSubscriptions.push(
            this.form.controls.legalActType.valueChanges.subscribe((value) => {
                this.form.controls.legalActDateOrYear.setValue('');
                this.form.controls.legalActDateOrYear.updateValueAndValidity();
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

        this.formSubscriptions.push(
            this.form.controls.legalActDateOrYear.valueChanges.subscribe((value) => {
                if (value) {
                    if (!this.emptyFEK()) {
                        this.moreThan30 = this.formDatesDifference();
                    } else {
                        this.moreThan30 = false;
                    }
                }
            }),
        );

        this.formSubscriptions.push(
            this.form.controls.fek.valueChanges.subscribe((value) => {
                if (value) {
                    if (!this.emptyFEK()) {
                        this.moreThan30 = this.formDatesDifference();
                    } else {
                        this.moreThan30 = false;
                    }
                }
            }),
        );
    }

    formDatesDifference() {
        const legalType = this.form.controls.legalActType.value;
        if (!['ΝΟΜΟΣ', 'ΠΡΟΕΔΡΙΚΟ ΔΙΑΤΑΓΜΑ'].includes(legalType)) {
            const dateFek = new Date(this.form.get('fek.date').value);
            const dateAct = new Date(this.form.get('legalActDateOrYear').value);
            const diffDays = dateDifference(dateFek, dateAct);
            console.log(diffDays);
            return diffDays > 30;
        }
        return false;
    }

    ngOnDestroy(): void {
        this.formSubscriptions.forEach((sub) => sub.unsubscribe());
    }

    onSubmit() {
        const data = {
            ...this.form.value,
        } as ILegalAct;

        this.nomikiPraxiString = `${this.form.get('legalActType').value === 'ΑΛΛΟ' ? this.form.get('legalActTypeOther').value : this.form.get('legalActType').value}`;

        this.legalActService.newLegalAct(data).subscribe((data) => {
            console.log('Data', data);
            this.modalRef.dismiss(true);
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

    emptyADA() {
        return this.form.get('ada').value === null;
    }

    emptyFEK() {
        return (
            this.form.get('fek.number').value === null ||
            this.form.get('fek.issue').value === null ||
            this.form.get('fek.date').value === null
        );
    }

    getOrganizationPrefferedLabelByCode(code: string): string | undefined {
        return this.constService.ORGANIZATION_CODES.find((x) => x.code === code)?.preferredLabel;
    }

    hideLegalActDateOrYear(): boolean {
        return this.form.controls.legalActType.value === null;
    }

    actNeedsOnlyYear(): boolean {
        const legalType = this.form.controls.legalActType.value;
        return ['ΝΟΜΟΣ', 'ΠΡΟΕΔΡΙΚΟ ΔΙΑΤΑΓΜΑ'].includes(legalType);
    }
}
