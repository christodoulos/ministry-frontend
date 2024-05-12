import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { ILegalProvision } from 'src/app/shared/interfaces/legal-provision/legal-provision.interface';
import { ILegalProvisionSpecs } from '../interfaces/legal-provision/legal-provision-specs.interface';
import { IReguLatedObject } from '../interfaces/legal-provision/regulated-object.interface';

const APIPREFIX = `${environment.apiUrl}/legal_provision`;

@Injectable({
    providedIn: 'root',
})
export class LegalProvisionService {
    http = inject(HttpClient);

    newLegalProvision(data: ILegalProvision): Observable<{ message: string; legalProvision: ILegalProvision }> {
        return this.http.post<{ message: string; legalProvision: ILegalProvision }>(APIPREFIX, data);
    }

    getAllLegalProvisions(): Observable<ILegalProvision[]> {
        return this.http.get<ILegalProvision[]>(APIPREFIX);
    }

    count(): Observable<{ count: number }> {
        const url = `${APIPREFIX}/count`;
        return this.http.get<{ count: number }>(url);
    }

    getLegalProvisionsByRegulatedObject(id: string): Observable<ILegalProvision[]> {
        const url = `${APIPREFIX}/by_regulated_object/${id}`;
        return this.http.get<ILegalProvision[]>(url);
    }

    // fromListOfIds(ids: string[]): Observable<ILegalProvision[]> {
    //     const url = `${APIPREFIX}/from_list_of_ids`;
    //     return this.http.post<ILegalProvision[]>(url, ids);
    // }

    // fromListOfKeysUpdateRegulatedObject(
    //     keys: { legalActKey: string; legalProvisionSpecs: ILegalProvisionSpecs }[],
    //     regulatedObject: IReguLatedObject,
    // ) {
    //     const url = `${APIPREFIX}/from_list_of_keys/update_regulated_object`;
    //     return this.http.post(url, { keys, regulatedObject });
    // }
}
