import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, inject, NgZone } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { environment } from '../../../../environments/environment';
import Tooltip from 'bootstrap/js/dist/tooltip';
import Swal from 'sweetalert2';
import { IsDivisionPipe } from '../../../../shared/pipes/is-division-pipe';
declare var $: any;

@Component({
  selector: 'app-punch-point-management',
  imports: [CommonModule, FormsModule,RouterModule,IsDivisionPipe],
  templateUrl: './punch-point-management.html',
  styleUrl: './punch-point-management.css'
})
export class PunchPointManagement {
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
  acknowledgeStatus   : string = '';

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

  pipe = new IsDivisionPipe();

  constructor(
    private route: ActivatedRoute, 
    private http: HttpClient,
    private router: Router,
  ) { }

  async ngOnInit() {
    const hotoId = this.route.snapshot.paramMap.get('hotoId');
    const block_id = this.route.snapshot.paramMap.get('blockId');
    
    const segments = this.router.url.split('/');
    this.currentBasePath = segments.slice(0, 3).join('/');
     
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
          
          if(this.pipe.transform(['Quality Team'])){
            this.acknowledgeStatus = this.blocks[0].qualityTeamPunchPointStatus;
          }
          if(this.pipe.transform(['Asset Management Team'])){
             console.log("ASD");
            this.acknowledgeStatus = this.blocks[0].assetTeamPunchPointStatus;
          }
                  
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
    const acknowledgeStatus = this.acknowledgeStatus;
    this.dataTable = $('#dataTable').DataTable({
      serverSide: true,
      processing: true,
      ordering: false,
      pagingType: 'full_numbers',
      ajax: {
        url: `${this.baseUrl}/punch-points`,
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

        $('.edit-btn').off('click').on('click', (event: any) => {
          const taskId = $(event.currentTarget).data('id');
          $('a[href="#home-b2"]').tab('show');
          this.zone.run(() => this.onEditTask(taskId));
        });

        $('.delete-btn').off('click').on('click', (event: any) => {
          const taskId = $(event.currentTarget).data('id');
          this.zone.run(() => this.onDeleteTask(taskId));
        });

      },
      columns: [
        { 
          data: 'actions',
          render: function (data: any, type: any, row: any) {
            if(acknowledgeStatus==="PENDING"){
              return data;
            }else if(acknowledgeStatus==="requested"){
              return '<span class="badge badge-label text-bg-secondary">Ack Requested</span>';
            }else if(acknowledgeStatus==="acknowledged"){
              return '<span class="badge badge-label text-bg-success">Acknowledged</span>';
            }else{
              return acknowledgeStatus;
            }            
          }
         },
        { data: 'location' },
        { data: 'description' },
        { data: 'area' },
        { data: 'categoryWork' },
        { data: 'team' },
        { data: 'category' },
        { data: 'remarks' },
      ]
    });
  }

  onEditTask(taskId: string) {
    this.http.get(`${this.baseUrl}/punch-points/${taskId}`, {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: (data: any) => {
        this.task = {
          location: data.location,
          description: data.description,
          area: data.area,
          categoryWork: data.categoryWork,
          team: data.team,
          category: data.category,
          remarks: data.remarks
        };
        this.taskId = taskId;
        this.isEditMode = true;
        console.log('Editing task ID:', this.taskId);
      },
      error: () => Swal.fire('Error!', 'Failed to load task.', 'error')
    });
  }

  onDeleteTask(taskId: string) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This will permanently delete the task.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.delete(`${this.baseUrl}/punch-points/${taskId}`, {
          headers: this.getAuthHeaders()
        }).subscribe({
          next: () => {
            Swal.fire('Deleted!', 'Task has been deleted.', 'success');
            this.dataTable.ajax.reload(null, false);
          },
          error: () => Swal.fire('Error!', 'Failed to delete task.', 'error')
        });
      }
    });
  }

  onFileSelect(event: any) {
    this.selectedFile = event.target.files[0] || null;
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

  getCertificateUrl(pointId: string): string {
    return `${this.baseUrl}/uploads/site-readiness/${this.certificateMap[pointId]}`;
  }

  getImageUrl(filename: string): string {
    return `${this.baseUrl}/uploads/site-readiness/${filename}`;
  }

  initTooltips(): void {
    const tooltipTriggerList = Array.from(
      document.querySelectorAll('[data-bs-toggle="tooltip"]')
    );
    tooltipTriggerList.forEach((tooltipTriggerEl) => {
      new Tooltip(tooltipTriggerEl);
    });
  }

  ngAfterViewInit(): void {
    this.initTooltips();
  }

  downloadSample() {
    this.http.get(`${this.baseUrl}/punch-points/sample`, {
      headers: this.getAuthHeaders(),
      responseType: 'blob'
    }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = 'punch_point_sample.xlsx';
        anchor.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => Swal.fire('Error!', 'Failed to download sample.', 'error')
    });
  }

  getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken') || '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  submitUpload() {
    if (!this.selectedFile || !this.blockId) return;

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('blockId', this.blockId);
    formData.append('hotoRequestId', this.hotoRequestId);
    formData.append('projectId', this.projectId);
    const userId = localStorage.getItem("userId") || '';
    formData.append('userId', userId);
    const divisionId = localStorage.getItem("divisionId") || '';
    formData.append('divisionId', divisionId);


    this.http.post(`${this.baseUrl}/punch-points/upload`, formData, {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: () => {
        Swal.fire('Success!', 'File uploaded successfully.', 'success');
        this.selectedFile = null;
        this.dataTable.ajax.reload(null, false);
      },
      error: () => Swal.fire('Error!', 'Failed to upload file.', 'error')
    });
  }

  saveTask(form: any) {
    if (!form.valid) return;
    const userId = localStorage.getItem("userId") || '';
    
    const taskData = {
      ...this.task,
      blockId: this.blockId,
      projectId: this.projectId,
      hotoRequestId: this.hotoRequestId,  
      userId: userId,        
      divisionId: localStorage.getItem('divisionId') || ''
    };

    const headers = this.getAuthHeaders();

    if (this.isEditMode && this.taskId) {
      this.http.patch(`${this.baseUrl}/punch-points/${this.taskId}`, taskData, { headers }).subscribe({
        next: () => {
          Swal.fire('Updated!', 'Task updated successfully.', 'success');
          form.resetForm();
          this.isEditMode = false;
          this.taskId = '';
          this.dataTable.ajax.reload(null, false);
        },
        error: () => Swal.fire('Error!', 'Failed to update task.', 'error')
      });
    } else {
      this.http.post(`${this.baseUrl}/punch-points`, taskData, { headers }).subscribe({
        next: () => {
          Swal.fire('Saved!', 'Task created successfully.', 'success');
          form.resetForm();
          this.dataTable.ajax.reload(null, false);
        },
        
        error: () => Swal.fire('Error!', 'Failed to save task.', 'error')
      });
      console.log('Saving task with ID:', this.taskId);

    }
  }

  getMilestoneLink(): string[] {
    return [`${this.currentBasePath}`];
  }

  getProjectLink(id: string): string[] {
    return [`${this.currentBasePath}/block-information/`,id];
  }
}
