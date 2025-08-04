import { Component, AfterViewInit, OnDestroy, NgZone, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import Swal from 'sweetalert2';
import { environment } from '../../../environments/environment';

declare var $: any;

@Component({
  selector: 'app-documentations',
  standalone: true,
  imports: [],
  templateUrl: './documentation.html',
})
export class Documentations implements AfterViewInit, OnDestroy {
  private baseUrl = environment.apiUrl;
  private http = inject(HttpClient);
  private zone = inject(NgZone);
  dataTable: any;

  constructor(private router: Router) {}

  getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken') || '';
    const email = localStorage.getItem('email') || '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'x-user-email': email
    });
  }

  ngAfterViewInit(): void {
    const headers = this.getAuthHeaders();
    const token = headers.get('Authorization');
    const email = headers.get('x-user-email');

    this.dataTable = $('#dataTable').DataTable({
  ordering: false,
  serverSide: true,
  processing: true,
  pagingType: 'full_numbers',
  ajax: {
    url: `${this.baseUrl}/documentation/datatable`,
    type: 'GET',
    headers: {
      Authorization: token || '',
      'x-user-email': email || ''
    }
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
    {
      data: null,
      orderable: false,
      render: function (_: any, __: any, row: any) {
        // ✅ THIS is where the render function goes
        return `
          <button class="btn btn-sm btn-info view-documentation" data-id="${row._id}">
            View
          </button>
        `;
      }
    }
  ],
  fnDrawCallback: () => {
    $('.view-documentation').off('click').on('click', (event: any) => {
      const id = $(event.currentTarget).data('id');
      if (id) {
        this.zone.run(() => this.viewDocumentation(id));
      } else {
        Swal.fire('Error', 'No valid document ID found.', 'error');
      }
    });
  }
});
  }

  ngOnDestroy(): void {
    if (this.dataTable) {
      this.dataTable.destroy(true);
    }
  }

  viewDocumentation(id: string): void {
    this.http.get<any>(`${this.baseUrl}/documentation/${id}`, { headers: this.getAuthHeaders() }).subscribe({
      next: (res) => {
        this.router.navigate(['/app/documentation-block'], {
          state: { documentation: res }
        });
      },
      error: () => {
        Swal.fire('Error', 'Failed to load documentation.', 'error');
      }
    });
  }

}
