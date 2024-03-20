import { Route } from '@angular/router';
import { SearchComponent } from './search.component';
import { AuthGuard } from 'src/app/shared/services/auth.guard';

export const SearchRoutes: Route[] = [
    {
        path: '',
        component: SearchComponent,
        canActivate: [AuthGuard],
    },
];
