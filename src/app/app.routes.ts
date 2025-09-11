import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./sections/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'legal-notice',
    loadComponent: () =>
      import('./sections/legal-notice/legal-notice.component').then(
        (m) => m.LegalNoticeComponent
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
