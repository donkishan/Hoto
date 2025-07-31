import { HttpClient, HttpEventType, HttpHeaders } from '@angular/common/http';
import { Component, inject, NgZone } from '@angular/core';
import { FormBuilder, FormGroup} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { environment } from '../../../../../environments/environment';
import { AuthService } from '../../../../../services/auth.service';
import Swal from 'sweetalert2';
declare var $: any;

@Component({
  selector: 'app-project-bulk-upload',
  imports: [RouterModule],
  templateUrl: './project-bulk-upload.html',
  styleUrl: './project-bulk-upload.css'
})
export class ProjectBulkUpload {
 constructor(
    private route: ActivatedRoute, 
    private http: HttpClient,
    private router: Router,
    private fb: FormBuilder
  ) { }

  
  readinessPoints: any[] = [];
  statusMap: { [activityId: string]: any } = {};
  imageMap: { [activityId: string]: string[] } = {};
  certificateMap: { [activityId: string]: string } = {};
  currentBasePath: string = '';

  private baseUrl     = environment.apiUrl;
  hotoDetails         : any;
  blocks              : any[] = [];
  projectId           : string = ''; 
  hotoRequestId       : string = '';
  blockId             : string = '';

  private authService = inject(AuthService);
  private accessToken = this.authService.getAccessToken();

  //
  selectedFile: File | null = null;
  dataTable: any;
  private zone = inject(NgZone);
  taskId: string = '';
  isEditMode = false;
  task = {
    location: '',
    description: '',
    area: '',
    categoryWork: '',
    team: '',
    category: '',
    remarks: ''
  };
  filterForm!: FormGroup;

  async ngOnInit() {
    this.filterForm = this.fb.group({
      location: [''],
      area: [''],
      team: [''],
      category: [''],
    });

    const segments = this.router.url.split('/');
    this.currentBasePath = segments.slice(0, 3).join('/');

    const hotoId = this.route.snapshot.paramMap.get('hotoId');
    const block_id = this.route.snapshot.paramMap.get('blockId');
     
    if (hotoId && block_id) { 
     const token = localStorage.getItem('accessToken');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      this.http.get<any>(`${this.baseUrl}/hoto-requests/${hotoId}/${block_id}`, { headers })
      .subscribe({
        next: (data) => {
          this.hotoDetails = data;
          this.blocks = data.blocks;
          this.projectId = this.hotoDetails.projectId;
          this.hotoRequestId = this.hotoDetails._id;
          this.blockId = block_id;
          this.readinessPoints = this.blocks[0].site_readiness_activities;              
          
          this.loadDataTable();
        },
        error: (err) => {
          console.error('Error loading HOTO request', err);
        }
      });

      
    

    }else{
      this.router.navigate(['/app/site-readiness']);
    }
  }

  loadDataTable(): void {
    const token = localStorage.getItem('accessToken');
    const divisionId = localStorage.getItem('divisionId');
  
    this.dataTable = $('#dataTable').DataTable({
      serverSide: true,
      processing: true,
      ordering: false,
      pagingType: 'full_numbers',
      ajax: {
        url: `${this.baseUrl}/punch-points/upload-logs`,
        type: 'GET',
        data: (d:any) => {
          d.divisionId    = divisionId;
          d.projectId     = this.projectId;
          d.hotoRequestId = this.hotoRequestId;
          d.blockId       = this.blockId;            
        },
        headers: { Authorization: `Bearer ${token}` }
      },
      fnDrawCallback: () => {
        $('[data-bs-toggle="tooltip"]').tooltip({
          boundary: 'window',
          container: 'body'
        });    
      },
      columnDefs: [
        {
          targets: [2,3],
          className: 'text-center'
        }
      ],
      columns: [
        { data: 'uploadedOn' },
        { data: 'userName' },
        { data: 'successCount' },
        { data: 'failureCount' },
        { data: 'fileName' },        
      ]
    });
  }

  submitUpload(event: Event) {
    event.preventDefault();
    const formData = new FormData();
    if (!this.selectedFile) { 
      return;
    }
    formData.append('file', this.selectedFile);
    formData.append('userId', this.authService.getUser()); 
    formData.append('divisionId', this.authService.getDivision()); 

    formData.append('hotoRequestId', this.hotoRequestId); 
    formData.append('projectId', this.projectId); 
    formData.append('blockId', this.blockId); 

    const token = this.authService.getAccessToken();
    
    const headers = new HttpHeaders({
      Authorization: `${token}`,
    }); 

    this.http.post<any>(`${this.baseUrl}/punch-points/upload-project-team-excel`, formData, {
      headers,
      reportProgress: true,
      observe: 'events',
    }).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
         
        } else if (event.type === HttpEventType.Response) {
          Swal.fire({
            icon: 'success',
            title: 'Upload Complete',
            html: `✅ Upload done.`,
            confirmButtonText: 'OK'
          });

          this.dataTable.ajax.reload(null, false);
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  onFileSelect(event: any) {
    this.selectedFile = event.target.files[0] || null;
  }


  getProjectLink(id: string): string[] {
    return [`${this.currentBasePath}/block-information/`,id];
  }

  getMilestoneLink(): string[] {
    return [`${this.currentBasePath}`];
  }

  getBlockDetailsLink(hotoId: string, blockId: string): string[] {
    return [`${this.currentBasePath}/block-details`, hotoId, blockId];
  }
}
