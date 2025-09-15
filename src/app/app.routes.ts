import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./sections/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'projects/join',
    loadComponent: () =>
      import('./sections/project-join/project-join.component').then(
        (m) => m.ProjectJoinComponent
      ),
  },
  {
    path: 'projects/el-pollo-loco',
    loadComponent: () =>
      import('./sections/project-pollo/project-pollo.component').then(
        (m) => m.ProjectPolloComponent
      ),
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
