import { Component, AfterViewInit, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../../services/auth.service';

interface Project {
  id: string;
  name: string;
}

interface DocumentRow {
  documentName: string;
  noOfDocuments: string;
  division: string;
}

@Component({
  selector: 'app-documentation',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule],
  templateUrl: './documentation.html',
  styleUrls: ['./documentation.css']
})
export class Documentation implements OnInit, AfterViewInit {
  private baseUrl = environment.apiUrl;
  private headers: HttpHeaders;
  isEditMode = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {
    this.headers = this.authService.getAuthHeaders();
  }

  projectList: Project[] = [];
  divisionList: any[] = [];
  
  formData = {
    projectId: '',
    documents: [
      { documentName: '', noOfDocuments: '', division: '' }
    ] as DocumentRow[]
  };

  docId: string | null = null; // ➤ To determine update
  
    ngOnInit(): void {
    const state = window.history.state;
    const documentation = state['documentation'];
    
    if (documentation) {
      this.isEditMode = true;
      this.docId = documentation._id;
      this.formData.projectId = documentation.projectId;
      this.formData.documents = documentation.documents.map((doc: any) => ({
        documentName: doc.documentName,
        noOfDocuments: doc.noOfDocuments.toString(),
        division: doc.division
      }));
    }
  }


  ngAfterViewInit(): void {
    this.fetchProjects();
    this.fetchDivisions();
  }

  fetchProjects(): void {
    this.http.get<any>(`${this.baseUrl}/projects`, { headers: this.headers }).subscribe({
      next: (data) => {
        const array = Array.isArray(data) ? data : (data.data || []);
        this.projectList = array.map((proj: any) => ({
          id: proj._id,
          name: proj.projectName
        }));
      },
      error: (err) => {
        console.error('Failed to fetch projects:', err);
        Swal.fire('Error', 'Could not fetch project list.', 'error');
      }
    });
  }

  fetchDivisions(): void {
    this.http.get<any>(`${this.baseUrl}/divisions`, { headers: this.headers }).subscribe({
      next: (data) => {
        this.divisionList = data;
      },
      error: (err) => {
        console.error('Failed to load divisions', err);
      }
    });
  }

  addDocument(): void {
    this.formData.documents.push({ documentName: '', noOfDocuments: '', division: '' });
  }

  removeDocument(index: number): void {
    if (this.formData.documents.length > 1) {
      this.formData.documents.splice(index, 1);
    }
  }

  submitForm(): void {
  if (!this.formData.projectId) {
    Swal.fire('Validation Error', 'Please select a project.', 'warning');
    return;
  }

  const hasInvalid = this.formData.documents.some(doc =>
    !doc.documentName || !doc.noOfDocuments || !doc.division
  );

  if (hasInvalid) {
    Swal.fire('Validation Error', 'Please complete all document fields.', 'warning');
    return;
  }

  const selectedProject = this.projectList.find(p => p.id === this.formData.projectId);
  const projectName = selectedProject ? selectedProject.name : '';

  // 🔁 Transform documents to include both divisionId and divisionName
  const documentsWithDivisionData = this.formData.documents.map(doc => {
  const division = this.divisionList.find(d => d._id === doc.division);
  return {
    documentName: doc.documentName,
    noOfDocuments: +doc.noOfDocuments,
    division: doc.division,  // ✅ Send as 'division'
    divisionName: division?.divisionName || '' // ✅ Make sure key matches schema
  };
});


  const payload = {
    projectId: this.formData.projectId,
    projectName: projectName,
    documents: documentsWithDivisionData
  };
  console.log('Payload:', payload);


  const request = this.docId
    ? this.http.put(`${this.baseUrl}/documentation/${this.docId}`, payload, { headers: this.headers })
    : this.http.post(`${this.baseUrl}/documentation`, payload, { headers: this.headers });

  request.subscribe({
    next: () => {
      Swal.fire('Success', this.docId ? 'Documentation updated successfully.' : 'Documentation submitted successfully.', 'success');
      this.router.navigate(['/app/documentation']);
    },
    error: (err) => {
      console.error('Save failed:', err);
      Swal.fire('Error', 'Failed to save documentation.', 'error');
    }
  });
}

}
