import { Component, AfterViewInit, OnDestroy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import Swal from 'sweetalert2';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../../services/auth.service';

declare var $: any;

@Component({
  selector: 'app-hoto-requests-list',
  standalone: true,
  templateUrl: './hoto-requests-list.html',
  styleUrls: ['./hoto-requests-list.css']
})
export class HotoRequestsList implements AfterViewInit, OnDestroy {
  private baseUrl = environment.apiUrl;
  private headers: HttpHeaders;
  private http = inject(HttpClient);

  dataTable: any;

  constructor(
    private router: Router,
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
        url: `${this.baseUrl}/hoto-requests/requestDataTable`,
        type: 'GET',
        headers: this.authService.getRawAuthHeaders(),
      },
      columnDefs: [
        {
          targets: [2,4,6,7,8],
          className: 'text-center'
        }
      ],
      columns: [
        { data: 'projectCode' },
        { data: 'projectName' },
        { data: 'capacity' },
        { data: 'completionType' },
        { data: 'initiatedDate' },
        { data: 'name' },
        { data: 'codDate' },              
        { data: 'status' },              
        { data: 'action' },              
      ],
      fnDrawCallback: () => {
        $('[data-bs-toggle="tooltip"]').tooltip({
          boundary: 'window',
          container: 'body'
        });                        
      },
    });

    $('#dataTable tbody').on('click', '.edit-user', (event: any) => {
      const id = $(event.currentTarget).data('id');
      this.editRequest(id);
    });

    $('#dataTable tbody').on('click', '.delete-user', (event: any) => {
      const id = $(event.currentTarget).data('id');
      this.confirmDelete(id);
    });

    $('#dataTable tbody').on('click', '.view-user', (event: any) => {
      const id = $(event.currentTarget).data('id');
      // alert(id);
      this.router.navigate(['/app/hoto-requests/view', id]);
    });
  }

  ngOnDestroy(): void {
    if (this.dataTable) {
      this.dataTable.destroy(true);
    }
  }

  editRequest(id: string): void {
    this.http.get<any>(`${this.baseUrl}/hoto-requests/${id}`, {
      headers: this.headers
    }).subscribe({
      next: (hotoRequest) => {
        this.router.navigate(['/app/hoto-requests/create'], {
          state: { hotoRequest }
        });
      },
      error: () => {
        Swal.fire('Error', 'Failed to load HOTO request data.', 'error');
      }
    });
  }

  confirmDelete(id: string): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This HOTO request will be permanently deleted!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.delete(`${this.baseUrl}/hoto-requests/${id}`, {
          headers: this.headers
        }).subscribe({
          next: () => {
            Swal.fire('Deleted!', 'HOTO request deleted successfully.', 'success');
            this.dataTable.ajax.reload(null, false);
          },
          error: () => {
            Swal.fire('Error', 'Failed to delete the HOTO request.', 'error');
          }
        });
      }
    });
  }
}
