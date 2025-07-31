import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import Tooltip from 'bootstrap/js/dist/tooltip';
import { openSecureFile } from '../../../../shared/utils/file-utils';

@Component({
  selector: 'app-block-details',
  imports: [CommonModule, FormsModule],
  templateUrl: './block-details.html',
  styleUrl: './block-details.css'
})
export class BlockDetails {
  readinessPoints: any[] = [];
  statusMap: { [activityId: string]: any } = {};
  imageMap: { [activityId: string]: string[] } = {};
  certificateMap: { [activityId: string]: string } = {};

  private baseUrl     = environment.apiUrl;
  hotoDetails         : any;
  blocks              : any[] = [];
  projectId           : string = '';
  hotoRequestId       : string = '';
  blockId             : string = '';
  

  constructor(
    private route: ActivatedRoute, 
    private http: HttpClient,
    private router: Router,
  ) { }

  async ngOnInit() {
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

          this.loadBlockDetails();          
        },
        error: (err) => {
          console.error('Error loading HOTO request', err);
        }
      });

     
    }else{
      this.router.navigate(['/app/site-readiness']);
    }
  }

  onFileChange(event: any, point: any, type: 'certificate' | 'image') {
    const files = event.target.files;
    if (type === 'image') {
      point.images = Array.from(files); // Store multiple images
    } else if (type === 'certificate' && files.length > 0) {
      point.certificate = files[0]; // Only one certificate
    }
  }

  loadBlockDetails() {
    const token = localStorage.getItem('accessToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get(`${this.baseUrl}/block-details/readiness-data/${this.projectId}/${this.blockId}`, { headers })
      .subscribe((data: any) => {
        this.statusMap = {};
        this.certificateMap = {};
        this.imageMap = {};

        data.statuses.forEach((status: any) => {
          const activityId = status.site_readiness_activity_id;
          this.statusMap[activityId] = status;
          this.certificateMap[activityId] = status.certificate;

          const point = this.readinessPoints.find(p => p._id === activityId);
          if (point) {
            point.status = status.status;
          }
        });


        data.images.forEach((img: any) => {
          const activityId = img.site_readiness_activity_id;
          this.imageMap[activityId] = Array.isArray(img.image_name)
            ? img.image_name
            : (typeof img.image_name === 'string' ? img.image_name.split(',') : []);
        });
      });
  }

  onSubmit(event: Event, point: any) {
    event.preventDefault();

    const formData = new FormData();
    formData.append('project_id', this.projectId);
    formData.append('block_id', this.blockId);
    formData.append('site_readiness_activity_id', point._id);
    formData.append('status', point.status || '');

    if (point.certificate) {
      formData.append('certificate', point.certificate);
    }

    if (point.images && point.images.length) {
      point.images.forEach((img: File) => {
        formData.append('image', img); // multiple "image" keys allowed
      });
    }

    const token = localStorage.getItem('accessToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.post(`${this.baseUrl}/block-details/submit`, formData, { headers }).subscribe({
      next: () => {
        alert('Submitted successfully!');
        this.loadBlockDetails();
        point.status = '';
        point.certificate = null;
        point.images = null;

        const certInput = document.getElementById(`certificate-${point._id}`) as HTMLInputElement;
        const imageInput = document.getElementById(`image-${point._id}`) as HTMLInputElement;
        if (certInput) certInput.value = '';
        if (imageInput) imageInput.value = '';
      },
      error: (err) => {
        console.error('Submission failed', err);
      }
    });
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
    return `site-readiness/${this.certificateMap[pointId]}`;
  }

  getImageUrl(filename: string): string {
    return `site-readiness/${filename}`;
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

  viewFile(filePath: string) {
    // console.log("filePATh:"+filePath);
    openSecureFile(filePath, 'view'); 
  }
} 
