import { Component, inject } from '@angular/core';
import { NavigationComponent } from './components/navigation/navigation.component';
import { FooterComponent } from './components/footer/footer.component';
import { ContentComponent } from './components/content/content.component';

import { AuthService } from './shared/services/auth.service';
import { ConstService } from './shared/services/const.service';
import { ToastContainerComponent } from './components/toast-container/toast-container.component';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
        NavigationComponent,
        ContentComponent,
        FooterComponent,
        ToastContainerComponent,
    ],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
})
export class AppComponent {
    authService = inject(AuthService);
    constService = inject(ConstService);
}
