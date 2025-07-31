import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute,  Router, RouterModule } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { CommonModule } from '@angular/common';
import Tooltip from 'bootstrap/js/dist/tooltip';
import { AuthService } from '../../../../services/auth.service';
import { IsDivisionPipe } from '../../../../shared/pipes/is-division-pipe';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-punch-point-block',
  imports: [CommonModule,RouterModule,IsDivisionPipe],
  templateUrl: './punch-point-block.html',
  styleUrl: './punch-point-block.css'
})
export class PunchPointBlock {
  constructor(  
    private route: ActivatedRoute,     
    private router: Router,
    private http: HttpClient,
    private authService: AuthService
  ) { 
    this.headers = this.authService.getAuthHeaders();
  }
  private baseUrl     = environment.apiUrl;
  private headers: HttpHeaders;

  hotoDetails         : any;
  blocks              : any[] = [];
  selectedProjectId   : string = '';
  hotoRequestId       : string = '';
  tooltipInstances    : { [key: string]: Tooltip } = {};

  //
  currentBasePath: string = '';


  async ngOnInit() {
    const segments = this.router.url.split('/');
    this.currentBasePath = segments.slice(0, 3).join('/');

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      let requestURL = `${this.baseUrl}/hoto-requests/${id}`;
      const pipe = new IsDivisionPipe();
      const isAllowed = pipe.transform(['Asset Management Team','Quality Team']);
      const divisionId = this.authService.getDivision();
      if(isAllowed){
        requestURL = `${this.baseUrl}/hoto-requests/division-wise/${id}/${divisionId}`;
      }

      this.http.get<any>(requestURL, { headers: this.headers })
      .subscribe({
        next: (data) => {
          this.hotoDetails = data;
          this.blocks = data.blocks;
          this.selectedProjectId = this.hotoDetails.projectId;
          this.hotoRequestId = this.hotoDetails._id;
        },
        error: (err) => {
          console.error('Error loading HOTO request', err);
        }
      });
    }else{
      this.router.navigate(['/app/site-readiness']);
    }
  }

  getStatusTooltip(status: string): string {
    switch (status) {
      case 'COMPLETED':
        return 'COMPLETED';
      case 'IN_PROGRESS':
        return 'In Progress';
      case '':
        return 'Not Started';
      default:
        return 'Unknown Status';
    }
  }

  showTooltip(blockIndex: number, activityIndex: number): void {
    const id = `tooltip-icon-${blockIndex}-${activityIndex}`;
    const icon = document.getElementById(id);
    if (icon) {
      if (!this.tooltipInstances[id]) {
        this.tooltipInstances[id] = new Tooltip(icon);
      }
      this.tooltipInstances[id].show();
    }
  }

  hideTooltip(blockIndex: number, activityIndex: number): void {
    const id = `tooltip-icon-${blockIndex}-${activityIndex}`;
    if (this.tooltipInstances[id]) {
      this.tooltipInstances[id].hide();
    }
  }

  getBlockDetailsLink(hotoId: string, blockId: string): string[] {
    return [`${this.currentBasePath}/block-details`, hotoId, blockId];
  }

  getMilestoneLink(): string[] {
    return [`${this.currentBasePath}`];
  }

  request_for_ack(hotoRequestId: string, blockId: string){
    Swal.fire({
      title: 'Are you sure?',
      text: 'You are about to request for acknowledgement from the project team.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Request',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      const divisionId = this.authService.getDivision();
      if (result.isConfirmed) {
        const payload = {
          hotoRequestId,
          blockId,
          divisionId
        };

        this.http.post(`${this.baseUrl}/block-information/punch-point-status`, payload, { headers: this.headers }).subscribe({
          next: (response: any) => {
            Swal.fire('Requested!', 'Acknowledgement request sent successfully.', 'success').then(() => {
              window.location.reload();
            });;
          },
          error: (error) => {
            Swal.fire('Error', 'Failed to send the acknowledgement request.', 'error');
            console.error('Error in request_for_ack:', error);
          }
        });
      }
    });
  }
}
 