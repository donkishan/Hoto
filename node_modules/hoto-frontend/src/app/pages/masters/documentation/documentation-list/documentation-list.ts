import { Component, AfterViewInit, OnDestroy, NgZone, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import Swal from 'sweetalert2';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../../services/auth.service';

declare var $: any;

@Component({
  selector: 'app-documentation-list',
  standalone: true,
  templateUrl: './documentation-list.html',
  styleUrls: ['./documentation-list.css']
})
export class DocumentationList implements AfterViewInit, OnDestroy {
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
        url: `${this.baseUrl}/documentation/datatable`,
        type: 'GET',
        headers: this.authService.getRawAuthHeaders()
      },
      columnDefs: [
        {
          targets: [1, 2],
          className: 'text-center'
        }
      ],
      columns: [
        { data: 'projectName' },
        { data: 'documentsCount' },
        { data: 'action' }
      ],
      fnDrawCallback: () => {
        $('[data-bs-toggle="tooltip"]').tooltip({
          boundary: 'window',
          container: 'body'
        });

        $('.edit-documentation').off('click').on('click', (event: any) => {
          const id = $(event.currentTarget).data('id');
          this.zone.run(() => this.editDocumentation(id));
        });

        $('.delete-documentation').off('click').on('click', (event: any) => {
          const id = $(event.currentTarget).data('id');
          this.zone.run(() => this.confirmDelete(id));
        });
      }
    });
  }

  ngOnDestroy(): void {
    if (this.dataTable) {
      this.dataTable.destroy(true);
    }
  }

  

  editDocumentation(id: string): void {
    this.http.get<any>(`${this.baseUrl}/documentation/${id}`, { headers: this.headers }).subscribe({
      next: (res) => {
        this.router.navigate(['/app/documentation/create'], {
          state: { documentation: res }
        });
      },
      error: () => {
        Swal.fire('Error', 'Failed to load documentation.', 'error');
      }
    });
  }

  confirmDelete(id: string): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This documentation will be permanently deleted!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteDocumentation(id);
      }
    });
  }

  deleteDocumentation(id: string): void {
    this.http.delete(`${this.baseUrl}/documentation/${id}`, { headers: this.headers }).subscribe({
      next: () => {
        Swal.fire('Deleted!', 'Documentation deleted successfully.', 'success');
        this.dataTable.ajax.reload(null, false);
      },
      error: () => {
        Swal.fire('Error', 'Failed to delete the documentation.', 'error');
      }
    });
  }
  createNew(): void {
    this.router.navigate(['/app/documentation/create']);
  }
}
