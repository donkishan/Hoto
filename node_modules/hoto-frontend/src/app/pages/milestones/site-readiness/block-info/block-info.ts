import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute,  Router, RouterModule } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { CommonModule } from '@angular/common';
import Tooltip from 'bootstrap/js/dist/tooltip';

@Component({
  selector: 'app-block-info',
  imports: [CommonModule,RouterModule],
  templateUrl: './block-info.html',
  styleUrl: './block-info.css'
})
export class BlockInfo {
  constructor(  
    private route: ActivatedRoute,     
    private router: Router,
    private http: HttpClient,
  ) { }

  private baseUrl     = environment.apiUrl;
  hotoDetails         : any;
  blocks              : any[] = [];
  selectedProjectId   : string = '';
  hotoRequestId       : string = '';
  tooltipInstances    : { [key: string]: Tooltip } = {};




  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const token = localStorage.getItem('accessToken');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      this.http.get<any>(`${this.baseUrl}/hoto-requests/${id}`, { headers })
        .subscribe({
          next: (data) => {
            this.hotoDetails = data;
            this.blocks = data.blocks;
            this.selectedProjectId = this.hotoDetails.projectId;
            this.hotoRequestId = this.hotoDetails._id;

            setTimeout(() => {
              const tooltipTriggerList = Array.from(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
              tooltipTriggerList.forEach((tooltipTriggerEl) => {
                new Tooltip(tooltipTriggerEl);
              });
            }, 0);
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

}
