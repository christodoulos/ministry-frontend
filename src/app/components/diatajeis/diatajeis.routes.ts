import { Route } from '@angular/router';
import { DiatajeisComponent } from './diatajeis.component';
import { AuthGuard } from 'src/app/shared/services/auth.guard';

export const DiatajeisRoutes: Route[] = [
    {
        path: '',
        component: DiatajeisComponent,
        canActivate: [AuthGuard],
    },
];
