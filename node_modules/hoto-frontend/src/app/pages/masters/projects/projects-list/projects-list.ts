
import { Component, AfterViewInit, OnDestroy, NgZone, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import Swal from 'sweetalert2';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../../services/auth.service';

declare var $: any;

@Component({
  selector: 'app-projects-list',
  standalone: true,
  templateUrl: './projects-list.html',
  styleUrls: ['./projects-list.css']
})

export class ProjectsList implements AfterViewInit, OnDestroy {
  dataTable: any;
  private baseUrl = environment.apiUrl;
  private headers: HttpHeaders;
  private zone = inject(NgZone);

  constructor(
    private router: Router, 
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.headers = this.authService.getAuthHeaders();
  }


  ngAfterViewInit(): void {
    this.dataTable = $('#dataTable').DataTable({
      ordering: false,
      serverSide: true,
      processing: true,
      pagingType: 'full_numbers',
      ajax: {
        url: `${this.baseUrl}/projects/projectDataTable`,
        type: 'GET',
        headers: this.authService.getRawAuthHeaders(),
      },
      columnDefs: [
        {
          targets: [3,7,8,9],
          className: 'text-center'
        }
      ],
      columns: [
        { data: 'projectId' },
        { data: 'projectName' },
        { data: 'spvName' },
        { data: 'plantPower' },
        { data: 'region' },        
        { data: 'location' },        
        { data: 'timezone' },        
        { data: 'commissioning' },        
        { data: 'status' },        
        { data: 'action' },        
      ],
      fnDrawCallback: () => {
        $('[data-bs-toggle="tooltip"]').tooltip({
          boundary: 'window',
          container: 'body'
        }); 
        $('.toggle-user').off('click').on('click', (event: any) => {
          var role_id = $(event.currentTarget).data('id');
          this.zone.run(() => this.onStatusChange(role_id)); // ✅ this.zone is accessible here
        });
       }
    });

    $('#dataTable tbody').on('click', '.edit-project', (event: any) => {
      const id = $(event.currentTarget).data('id');
      this.editProject(id);
    });

    $('#dataTable tbody').on('click', '.delete-project', (event: any) => {
      const id = $(event.currentTarget).data('id');
      this.confirmDelete(id);
    });

    $('#dataTable tbody').on('click', '.view-project', (event: any) => {
      const id = $(event.currentTarget).data('id');
      this.viewProject(id);
    }); 
  }

  ngOnDestroy(): void {
    if (this.dataTable) {
      this.dataTable.destroy(true);
    }
  }

  editProject(id: string): void {
    this.http.get<any>(`${this.baseUrl}/projects/${id}`, { headers: this.headers }).subscribe({
      next: (res) => {
        const { project, pvConfigurations } = res;
        this.router.navigate(['/app/projects/create'], {
          state: { project: { ...project, pvConfigurations } }
        });
      },
      error: () => {
        Swal.fire('Error', 'Failed to load project data.', 'error');
      }
    });
  }

   viewProject(id: string): void {
    this.http.get<any>(`${this.baseUrl}/projects/${id}`, { headers: this.headers }).subscribe({
      next: (res) => {
        const { project, pvConfigurations } = res;
        this.router.navigate(['/app/projects/view'], {
          state: { project: { ...project, pvConfigurations } }
        });
      },
      error: () => {
        Swal.fire('Error', 'Failed to load project data.', 'error');
      }
    });
  }


  confirmDelete(id: string): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This project will be permanently deleted!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteProject(id);
      }
    });
  }

  deleteProject(id: string): void {
    this.http.delete(`${this.baseUrl}/projects/${id}`, { headers: this.headers }).subscribe({
      next: () => {
        Swal.fire('Deleted!', 'Project deleted successfully.', 'success');
        this.dataTable.ajax.reload(null, false);
      },
      error: () => {
        Swal.fire('Error', 'Failed to delete the project.', 'error');
      }
    });
  }

  onStatusChange(roleId: string) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You want to change status!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, do it!',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.patch(`${this.baseUrl}/projects/${roleId}/toggle-status`, {}, { headers: this.headers })
        .subscribe({
          next: (res: any) => {
            Swal.fire('Success', 'Role status updated successfully', 'success');
            // Optionally refresh list here
              this.dataTable.ajax.reload(null, false);
          },
          error: (err) => {
            console.error(err);
            Swal.fire('Error', 'Failed to update role status', 'error');
          }
        });
        
      }
    });   
  }

  createNew(): void {
    this.router.navigate(['/app/projects/create']);
  }
}
