import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { Roles } from './pages/masters/roles/roles';
import { Divisions } from './pages/masters/divisions/divisions';
import { Users } from './pages/masters/users/users';
import { authGuard } from './guards/auth-guard';
import { Projects } from './pages/masters/projects/projects';
import { CreateProjectsdashboard } from './pages/masters/projects/create-projectsdashboard/create-projectsdashboard';

import { HotoRequests } from './pages/hoto-requests/hoto-requests';

import { ProjectsList } from './pages/masters/projects/projects-list/projects-list';
import { TeamMobilisation } from './pages/milestones/team-mobilisation/team-mobilisation';
import { SiteReadiness } from './pages/milestones/site-readiness/site-readiness';
import { BlockDetails } from './pages/milestones/site-readiness/block-details/block-details';
import { PunchPoints } from './pages/milestones/punch-points/punch-points';
import { PunchPointManagement } from './pages/milestones/punch-points/punch-point-management/punch-point-management';
import { BlockInformation } from './pages/milestones/team-mobilisation/block-information/block-information';
import { UserList } from './pages/masters/users/users-list/users-list';
import { HotoRequestsList } from './pages/hoto-requests/hoto-requests-list/hoto-requests-list';
import { BlockInfo } from './pages/milestones/site-readiness/block-info/block-info';
import { PunchPointBlock } from './pages/milestones/punch-points/punch-point-block/punch-point-block';
import { ProjectPunchPoint } from './pages/milestones/punch-points/project-punch-point/project-punch-point';
import { ProjectBulkUpload } from './pages/milestones/punch-points/project-punch-point/project-bulk-upload/project-bulk-upload';
import { UpdateStatus } from './pages/milestones/punch-points/project-punch-point/update-status/update-status';
import { ProjectTeam } from './pages/milestones/team-mobilisation/project-team/project-team';
import { HotoRequestView } from './pages/hoto-requests/hoto-request-view/hoto-request-view';
import { BulkUploadStatus } from './pages/milestones/punch-points/project-punch-point/update-status/bulk-upload-status/bulk-upload-status';
import { ViewProject } from './pages/masters/projects/view-project/view-project';
import { DocumentationList } from './pages/masters/documentation/documentation-list/documentation-list';
import { Documentation } from './pages/masters/documentation/documentation';
import { Documentations } from './pages/milestones/documentation/documentation';
import { DocumentationBlock } from './pages/milestones/documentation/documentation-block/documentation-block';

export const routes: Routes = [
  { path: '', component: Login, data: { title: 'Login' } },

  {
    path: 'app',
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: Dashboard, data: { title: 'Dashboard' } },
      { path: 'users', component: UserList, data: { title: 'Users' } },
      {
        path: 'users/create',
        component: Users,
        data: { title: 'Create User' },
      },
      { path: 'roles', component: Roles, data: { title: 'Roles' } },
      { path: 'divisions', component: Divisions, data: { title: 'Divisions' } },
      {
        path: 'documentation',
        component: DocumentationList,
        data: { title: 'Documentation List' },
      },
      {
        path: 'documentation/create',
        component: Documentation,
        data: { title: 'Create Documentation' },
      },

      // projects
      {
        path: 'projects',
        component: ProjectsList,
        data: { title: 'Projects' },
      },
      {
        path: 'projects/create',
        component: Projects,
        data: { title: 'Create Project' },
      },
      {
        path: 'projects/view',
        component: ViewProject,
        data: { title: 'View Project' },
      },
      {
  path: 'projects/dashboard',
  component: CreateProjectsdashboard,
  data: { title: 'Project Dashboard' }
},

      
      {
        path: 'hoto-requests',
        component: HotoRequestsList,
        data: { title: 'Hoto Request' },
      },
      {
        path: 'hoto-requests/create',
        component: HotoRequests,
        data: { title: 'Create Hoto Request' },
      },
      {
        path: 'hoto-requests/view/:id',
        component: HotoRequestView,
        data: { title: 'View Hoto Request' },
      },

      //Milestone
      {
        path: 'team-mobilisation',
        component: TeamMobilisation,
        data: { title: 'Team Mobilisation' },
      },
      {
        path: 'team-mobilisation/block-information/:id',
        component: BlockInformation,
        data: { title: 'Block Information' },
      },
      {
        path: 'team-mobilisation/project-team/:id',
        component: ProjectTeam,
        data: { title: 'Block Information' },
      },
      //site readiness
      {
        path: 'site-readiness',
        component: SiteReadiness,
        data: { title: 'Site Readiness' },
      },
      {
        path: 'site-readiness/block-information/:id',
        component: BlockInfo,
        data: { title: 'Block Information' },
      },
      {
        path: 'site-readiness/block-details/:hotoId/:blockId',
        component: BlockDetails,
        data: { title: 'Block Details' },
      },
      //punchpoints
      {
        path: 'punch-points',
        component: PunchPoints,
        data: { title: 'Punch Points' },
      },
      {
        path: 'punch-points/block-information/:id',
        component: PunchPointBlock,
        data: { title: 'Block Information' },
      },
      {
        path: 'punch-points/block-details/:hotoId/:blockId',
        component: PunchPointManagement,
        data: { title: 'Block Details' },
      },
      //project team
      {
        path: 'punch-points-project-team',
        component: PunchPoints,
        data: { title: 'Punch Points' },
      },
      {
        path: 'punch-points-project-team/block-information/:id',
        component: PunchPointBlock,
        data: { title: 'Block Information' },
      },
      {
        path: 'punch-points-project-team/block-details/:hotoId/:blockId',
        component: ProjectPunchPoint,
        data: { title: 'Block Details' },
      },
      {
        path: 'punch-points-project-team/bulk-upload/:hotoId/:blockId',
        component: ProjectBulkUpload,
        data: { title: 'Bulk Upload' },
      },

      // Punch Point Management
      {
        path: 'punch-points-status',
        component: PunchPoints,
        data: { title: 'Punch Points' },
      },
      {
        path: 'punch-points-status/block-information/:id',
        component: PunchPointBlock,
        data: { title: 'Block Information' },
      },
      {
        path: 'punch-points-status/block-details/:hotoId/:blockId',
        component: UpdateStatus,
        data: { title: 'Block Details' },
      },
      {
        path: 'punch-points-status/block-details/bulk-upload/:hotoId/:blockId',
        component: BulkUploadStatus,
        data: { title: 'Block Details' },
      },
      // punch-points-project-team/block-details/bulk-upload/

      {
        path: 'block-information/add-member',
        component: BlockInformation,
        data: { title: 'Block Information' },
      },
      {
        path: 'block-information/:blockId/add-member',
        component: BlockInformation,
        data: { title: 'Block Information' },
      },

      //documentation
      {
        path: 'documentations',
        component: Documentations,
        data: { title: 'Documentation' },
        canActivate: [authGuard],
      },
      {
        path: 'documentation-block',
        component: DocumentationBlock,
        data: { title: 'Documentation Block' },
        canActivate: [authGuard],
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
