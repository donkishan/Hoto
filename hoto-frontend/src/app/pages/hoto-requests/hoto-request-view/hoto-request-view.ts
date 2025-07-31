import { Component } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { openSecureFile } from '../../../shared/utils/file-utils';

@Component({
  selector: 'app-hoto-request-view',
  imports: [CommonModule,RouterLink],
  templateUrl: './hoto-request-view.html',
  styleUrl: './hoto-request-view.css'
})
export class HotoRequestView {
  private baseUrl = environment.apiUrl;
  private headers: HttpHeaders;
  
  hotoDetails: any;
  blocks: any[] = [];
  selectedProjectId: string | null = null;
  hotoRequestId: string | null = null;
  certificateFileName: string | null = null;
  certificateUrl: string | null = null; 
  
  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
  ) {
    this.headers = this.authService.getAuthHeaders();
  }

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.http.get<any>(`${this.baseUrl}/hoto-requests/${id}`, { headers:this.headers })
      .subscribe({
        next: (data) => {
          this.hotoDetails = data;
          this.blocks = data.blocks;
          this.selectedProjectId = this.hotoDetails.projectId;
          this.hotoRequestId = this.hotoDetails._id;
          this.certificateFileName = this.hotoDetails.certificatePath?.split('\\').pop() || '';
          this.certificateUrl = this.hotoDetails.certificatePath.replace(/^uploads[\\/]/, '');
        },
        error: (err) => {
          console.error('Error loading HOTO request', err);
        }
      });
    } else {
      this.router.navigate(['/app/hoto-requests']);
    }
  }

  ngAfterViewInit(): void {

  }


  viewFile(filePath: any) {
    openSecureFile(filePath, 'view'); 
  }

}
