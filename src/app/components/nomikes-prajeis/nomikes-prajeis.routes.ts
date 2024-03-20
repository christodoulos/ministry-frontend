import { Route } from '@angular/router';
import { NomikesPrajeisComponent } from './nomikes-prajeis.component';
import { AuthGuard } from 'src/app/shared/services/auth.guard';

export const NomikesPrajeisRoutes: Route[] = [
    {
        path: '',
        component: NomikesPrajeisComponent,
        canActivate: [AuthGuard],
    },
];
