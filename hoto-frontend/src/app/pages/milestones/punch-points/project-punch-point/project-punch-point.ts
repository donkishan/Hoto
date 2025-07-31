import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, inject, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { environment } from '../../../../environments/environment';
import Tooltip from 'bootstrap/js/dist/tooltip';
import Swal from 'sweetalert2';
import flatpickr from 'flatpickr';
declare var $: any;

@Component({
  selector: 'app-project-punch-point',
  imports: [CommonModule, FormsModule,ReactiveFormsModule,RouterModule],
  templateUrl: './project-punch-point.html',
  styleUrl: './project-punch-point.css'
})

export class ProjectPunchPoint {
    
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
          this.acknowledgeStatus = this.blocks[0].acknowledgeStatus || '';
          
          console.log('Acknowledge Status:', this.acknowledgeStatus);
                  
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
    const that = this;
    const token = localStorage.getItem('accessToken');
    const divisionId = localStorage.getItem('divisionId');
    this.dataTable = $('#dataTable').DataTable({
      serverSide: true,
      processing: true,
      ordering: false,
      pagingType: 'full_numbers',
      ajax: {
        url: `${this.baseUrl}/punch-points`,
        type: 'GET',
        data: (d:any) => {
          const filters = that.filterForm.value;
          d.divisionId      = divisionId;
          d.projectId       = this.projectId;
          d.hotoRequestId   = this.hotoRequestId;
          d.blockId         = this.blockId;            
          d.location        = filters.location;
          d.area            = filters.area;
          d.team            = filters.team;
          d.category        = filters.category;
        },
        headers: { Authorization: `Bearer ${token}` }
      },
      fnDrawCallback: () => {
        $('[data-bs-toggle="tooltip"]').tooltip({
          boundary: 'window',
          container: 'body'
        });

        flatpickr('.flatpickr-input', {
          altInput: true,
          altFormat: 'd-m-Y',            // ✅ what we extract for backend
          allowInput: true,
          onChange: function(selectedDates, dateStr, instance) {
      
          }
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

        $('.btn-success').off('click').on('click', (event: any) => {
          const $row = $(event.currentTarget).closest('tr');
          const rowId = $row.find('.category-select').data('id');
          const userId = localStorage.getItem("userId") || '';

          const payload = {
            id: rowId,
            divisionId : divisionId,
            projectId:this.projectId,
            hotoRequestId :this.hotoRequestId,
            userId: userId,            
            category: $row.find('select.category-select').val(),
            pr_impacted: $row.find('select.pr-impacted-select').val(),
            target_closure_date: $row.find('input.target-closure-input').val(),
            project_team_remarks: $row.find('input.project-remarks-input').val(),
            representative_name: $row.find('input.rep-name-input').val()
          };

          this.zone.run(() => {
            this.savePunchPointDetails(payload,rowId);
          });
        });

      },
      columns: [
        { data: 'location' },
        { data: 'description' },
        { data: 'area' },
        { data: 'categoryWork' },
        { data: 'team' },
        { data: 'remarks' },
        {
          data: 'category',
          render: (data: any, type: any, row: any) => {
            if (row.acknowledgeStatus === 'acknowledged') return data || '';
            return `
              <select name="category[]" class="form-select form-select-sm category-select" data-id="${row._id}">
                <option value="CRITICAL" ${data === 'CRITICAL' ? 'selected' : ''}>Critical</option>
                <option value="NON_CRITICAL" ${data === 'NON_CRITICAL' ? 'selected' : ''}>Non Critical</option>
              </select>`;
          }
        },
        {
          data: 'pr_impacted',
          render: (data: any, type: any, row: any) => {
            if (row.acknowledgeStatus === 'acknowledged') return data || '';
            return `
              <select name="pr_impacted[]" class="form-select form-select-sm pr-impacted-select">
                <option value="NO" ${data === 'NO' ? 'selected' : ''}>No</option>
                <option value="YES" ${data === 'YES' ? 'selected' : ''}>Yes</option>
              </select>`;
          }
        },
        {
          data: 'target_closure_date',
          render: (data: any, type: any, row: any) => {
            if (row.acknowledgeStatus === 'acknowledged') return data || '';
            return `<input type="text" name="target_closure_date[]" class="form-control form-control-sm flatpickr-input target-closure-input" value="${data || ''}" data-id="${row._id}">`;
          }
        },
        {
          data: 'project_team_remarks',
          render: (data: any, type: any, row: any) => {
            if (row.acknowledgeStatus === 'acknowledged') return data || '';
            return `<input name="project_team_remarks[]" type="text" class="form-control form-control-sm project-remarks-input" value="${data || ''}">`;
          }
        },
        {
          data: 'representative_name',
          render: (data: any, type: any, row: any) => {
            if (row.acknowledgeStatus === 'acknowledged') return data || '';
            return `<input name="representative_name[]" type="text" class="form-control form-control-sm rep-name-input" value="${data || ''}">`;
          }
        },
        {
          data: 'action',
          render: (data: any, type: any, row: any) => {
            if (row.acknowledgeStatus === 'acknowledged') return '<span class="badge badge-label text-bg-secondary">Acknowledged</span>';
            return `<button type="button" class="btn btn-sm btn-success">Save</button>`;
          },
        }
      ]
    });
  }

  savePunchPointDetails(payload: any,id : any): void {
    const token = localStorage.getItem('accessToken');

    this.http.patch(`${this.baseUrl}/punch-points/${id}/update-category`, payload, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).subscribe({
      next: (res) => {
        Swal.fire({
          icon: 'success',
          title: 'Saved!',
          text: 'Punch point details updated successfully.',
          timer: 2000,
          showConfirmButton: false
        });
        
        this.dataTable.ajax.reload(null, false);
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Failed to update punch point.',
          confirmButtonText: 'OK'
        });
      }
    });
  }

  search(): void { 
    this.dataTable.ajax.reload();
  }

  reset(): void {
    this.filterForm.reset();
    this.dataTable.ajax.reload();
  }

  downloadExcel() {
    const divisionId = localStorage.getItem('divisionId');
    const filters = this.filterForm.value;
    const params = new URLSearchParams();

    params.append('projectId', this.projectId);
    params.append('hotoRequestId', this.hotoRequestId);
    params.append('blockId', this.blockId);

    if (divisionId) params.append('divisionId', divisionId);
    if (filters.location) params.append('location', filters.location);
    if (filters.area) params.append('area', filters.area);
    if (filters.team) params.append('team', filters.team);
    if (filters.category) params.append('category', filters.category);

    this.http.get(`${this.baseUrl}/punch-points/downlaod_excel?${params.toString()}`, {
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
  
  getProjectLink(id: string): string[] {
    return [`${this.currentBasePath}/block-information/`,id];
  }

  getMilestoneLink(): string[] {
    return [`${this.currentBasePath}`];
  }

  getBlockDetailsLink(hotoId: string, blockId: string): string[] {
    return [`${this.currentBasePath}/block-details`, hotoId, blockId];
  }

  acknowledge() {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to acknowledge all punch points? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, acknowledge',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        const userId = localStorage.getItem("userId") || '';
        const payload = {
          hotoRequestId: this.hotoRequestId,
          projectId: this.projectId,
          blockId: this.blockId,
          userId: userId,
          divisionId: localStorage.getItem('divisionId') || ''
        };

        this.http.post(`${this.baseUrl}/punch-points/acknowledge`, payload, {
          headers: this.getAuthHeaders()
        }).subscribe({
          next: () => {

            this.acknowledgeStatus = 'acknowledged';
            Swal.fire('Acknowledged!', 'Punch points acknowledged successfully.', 'success');
            this.dataTable.ajax.reload(null, false);
          },
          error: () => {
            Swal.fire('Error!', 'Failed to acknowledge punch points.', 'error');
          }
        });
      }
    });
  }

}
