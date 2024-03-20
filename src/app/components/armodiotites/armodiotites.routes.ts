import { Route } from '@angular/router';
import { ArmodiotitesComponent } from './armodiotites.component';
import { AuthGuard } from 'src/app/shared/services/auth.guard';

export const ArmodiotitesRoutes: Route[] = [
    {
        path: '',
        component: ArmodiotitesComponent,
        canActivate: [AuthGuard],
    },
];
