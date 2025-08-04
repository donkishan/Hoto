// documentation-block.ts
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-documentation-block',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './documentation-block.html',
})
export class DocumentationBlock implements OnInit {
  private router = inject(Router);
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  documentation: any = null;
  projectName = '';
  projectCode = '';
  plantPower = '';
  selectedDoc: any = null;
  uploadedLinks: string[] = [];
  approvalStatus: ('approved' | 'rejected' | '')[] = [];
  showProjectTeamModal = false;
  showAssetMgmtModal = false;
  divisionName = '';

  ngOnInit(): void {
    this.divisionName = localStorage.getItem('divisionName') || '';
    const state = history.state.documentation;

    if (state && state.projectDetails) {
      this.documentation = state;
      this.projectName = state.projectDetails.projectName || '';
      this.projectCode = state.projectDetails.projectCode || '';
      this.plantPower = state.projectDetails.plantPower || '';

      this.loadUploadedDocuments(this.documentation.projectId);
    } else {
      Swal.fire('Warning', 'Project details not available.', 'warning');
    }
  }

  getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken') || '';
    const email = localStorage.getItem('email') || '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'x-user-email': email
    });
  }

  loadUploadedDocuments(projectId: string): void {
    this.http.get<any[]>(`${this.baseUrl}/documents-upload?projectId=${projectId}`, {
      headers: this.getAuthHeaders()
    }).subscribe((uploads) => {
      for (const doc of this.documentation.documents) {
        const match = uploads.find(u => u.documentId === doc._id);
        if (match) {
          doc.uploadedLinks = match.uploadedLinks;
          doc.uploadedDocuments = match.uploadedCount;
          doc.acceptedByOM = match.acceptedByOM || 0;
        }
      }
    });
  }
  trackByIndex(index: number, obj: any): any {
  return index;
}

  getUploadPercentage(doc: any, fromModal = false): string {
    const uploaded = fromModal ? this.getUploadedCount() : doc.uploadedDocuments || 0;
    const total = doc.noOfDocuments || 1;
    return `${Math.round((uploaded / total) * 100)}%`;
  }

  getAcceptancePercentage(doc: any): string {
    const accepted = doc.acceptedByOM || 0;
    const uploaded = doc.uploadedDocuments || 0;
    if (uploaded === 0) return '0%';
    return `${Math.round((accepted / uploaded) * 100)}%`;
  }

  getUploadedCount(): number {
    return this.uploadedLinks.filter(link => link.trim() !== '').length;
  }

  getApprovedCount(): number {
    return this.approvalStatus.filter(status => status === 'approved').length;
  }

  getApprovedPercentage(): string {
    const totalUploaded = this.getUploadedCount();
    const approved = this.getApprovedCount();
    if (totalUploaded === 0) return '0%';
    return `${Math.round((approved / totalUploaded) * 100)}%`;
  }

  viewDocument(doc: any): void {
    this.selectedDoc = doc;
    this.uploadedLinks = doc.uploadedLinks?.length
  ? doc.uploadedLinks.map((link: string) => link || '')
  : Array.from({ length: doc.noOfDocuments }, () => '');



    if (this.divisionName === 'Asset Management Team') {
      const count = doc.acceptedByOM || 0;
      this.approvalStatus = this.uploadedLinks.map((link, index) =>
        link?.trim() !== '' && index < count ? 'approved' : ''
      );
      this.showAssetMgmtModal = true;
    } else {
      this.approvalStatus = [];
      this.showProjectTeamModal = true;
    }
  }

  closeModal(): void {
    this.showProjectTeamModal = false;
    this.showAssetMgmtModal = false;
    this.selectedDoc = null;
    this.uploadedLinks = [];
  }

  submitDocumentUpload(): void {
  if (!this.selectedDoc) return;

  const totalDocs = this.selectedDoc.noOfDocuments || 0;
  const uploadedCount = this.getUploadedCount();
  const approvedCount = this.getApprovedCount();
  const rejectedCount = this.approvalStatus.filter(status => status === 'rejected').length;
  const pendingCount = uploadedCount - approvedCount - rejectedCount;

  const payload = {
    documentId: this.selectedDoc._id,
    projectId: this.documentation.projectId,
    uploadedLinks: this.uploadedLinks,
    uploadedCount,
    acceptedByOM: approvedCount
  };

  this.http.post(`${this.baseUrl}/documents-upload`, payload, {
    headers: this.getAuthHeaders()
  }).subscribe({
    next: () => {
      const index = this.documentation.documents.findIndex(
        (doc: any) => doc._id === this.selectedDoc._id
      );
      if (index !== -1) {
        this.documentation.documents[index].uploadedLinks = [...this.uploadedLinks];
        this.documentation.documents[index].uploadedDocuments = uploadedCount;
        this.documentation.documents[index].acceptedByOM = approvedCount;
      }

      // ✅ Dynamic Swal based on division
      if (this.divisionName === 'Asset Management Team') {
        Swal.fire({
          icon: 'success',
          title: 'Review Saved',
          html: `
            <p><strong>Approved:</strong> ${approvedCount}</p>
            <p><strong>Rejected:</strong> ${rejectedCount}</p>
            <p><strong>Pending:</strong> ${pendingCount}</p>
          `,
        });
      } else {
        Swal.fire({
          icon: 'success',
          title: 'Upload Complete',
          html: `
            <p>You have uploaded <strong>${uploadedCount}</strong> out of <strong>${totalDocs}</strong> documents.</p>
          `,
        });
      }

      this.closeModal();
    },
    error: () => {
      Swal.fire('Error', 'Failed to upload documents', 'error');
    }
  });
}

}
