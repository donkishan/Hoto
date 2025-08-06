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

  uploadedLinks: { link: string; status: 'approved' | 'rejected' | 'pending'; editable: boolean }[] = [];

  tempStatuses: ('approved' | 'rejected' | 'pending' | '')[] = [];

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
          doc.uploadedLinks = match.uploadedLinks || [];
          doc.uploadedDocuments = match.uploadedCount;
          doc.acceptedByOM = match.acceptedByOM || 0;
          doc.rejectedByOM = match.rejectedByOM || 0;
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
    return this.uploadedLinks.filter(link => link.link.trim() !== '').length;
  }

  getApprovedCount(): number {
  return (this.divisionName === 'Asset Management Team'
    ? this.tempStatuses
    : this.uploadedLinks.map(u => u.status)).filter(status => status === 'approved').length;
}

getRejectedCount(): number {
  return (this.divisionName === 'Asset Management Team'
    ? this.tempStatuses
    : this.uploadedLinks.map(u => u.status)).filter(status => status === 'rejected').length;
}

getPendingCount(): number {
  return this.getUploadedCount() - this.getApprovedCount() - this.getRejectedCount();
}


  onLinkChange(index: number): void {
    if (this.divisionName !== 'Asset Management Team') {
      const trimmed = this.uploadedLinks[index].link.trim();
      this.uploadedLinks[index].status = trimmed ? 'pending' : 'pending';
    }
  }
  canEditAssetLink(index: number): boolean {
  // Disable editing if originally approved
  const originalStatus = this.selectedDoc?.uploadedLinks?.[index]?.status;
  return originalStatus !== 'approved';
}


 viewDocument(doc: any): void {
  this.selectedDoc = doc;

  const hasAssetReviewed = Array.isArray(doc.uploadedLinks) &&
    doc.uploadedLinks.some((u: any) => ['approved', 'rejected'].includes(u.status));

  this.uploadedLinks = doc.uploadedLinks?.length
    ? doc.uploadedLinks.map((obj: any) => {
        const status = obj.status || 'pending';
        const editable = this.divisionName !== 'Asset Management Team'
          ? status !== 'approved' // Project Team: only approved is locked
          : true; // Asset Team can change everything until saved

        return {
          link: obj.link || '',
          status,
          editable
        };
      })
    : Array.from({ length: doc.noOfDocuments }, () => ({
        link: '',
        status: 'pending',
        editable: true
      }));

  this.tempStatuses = this.uploadedLinks.map(obj => obj.status || 'pending');

  if (this.divisionName === 'Asset Management Team') {
    this.showAssetMgmtModal = true;
  } else {
    this.showProjectTeamModal = true;
  }
}

submitDocumentUpload(): void {
  if (!this.selectedDoc) return;

  const doc = this.selectedDoc;

  // Apply tempStatuses on Save
  if (this.divisionName === 'Asset Management Team') {
    this.uploadedLinks = this.uploadedLinks.map((item, i) => ({
      ...item,
      status: this.tempStatuses[i] || 'pending'
    }));
  } else {
    this.uploadedLinks = this.uploadedLinks.map((linkObj: any) => {
  const trimmedLink = (linkObj.link || '').trim();
  return {
    link: trimmedLink,
    status: linkObj.editable ? 'pending' : linkObj.status,  // preserve status if not editable
    editable: linkObj.editable
  };
});

  }

  const uploadedCount = this.getUploadedCount();
  const approvedCount = this.getApprovedCount();
  const rejectedCount = this.getRejectedCount();
  const pendingCount = this.getPendingCount();

  if (this.divisionName !== 'Asset Management Team') {
  const hasApproved = Array.isArray(doc.uploadedLinks) &&
    doc.uploadedLinks.some((u: any) => u.status === 'approved');

  if (hasApproved) {
    const attemptedEditOfApproved = this.uploadedLinks.some(
      (link, idx) => doc.uploadedLinks[idx]?.status === 'approved' && link.link !== doc.uploadedLinks[idx]?.link
    );

    if (attemptedEditOfApproved) {
      Swal.fire('Info', 'One or more approved documents cannot be edited.', 'info');
      return;
    }
  }
}


  const payload = {
    documentId: doc._id,
    projectId: this.documentation.projectId,
    uploadedLinks: this.uploadedLinks,
    uploadedCount,
    acceptedByOM: approvedCount,
    rejectedByOM: rejectedCount
  };

  this.http.post(`${this.baseUrl}/documents-upload`, payload, {
    headers: this.getAuthHeaders()
  }).subscribe({
    next: () => {
      const index = this.documentation.documents.findIndex((d: any) => d._id === doc._id);
      if (index !== -1) {
        this.documentation.documents[index].uploadedLinks = [...this.uploadedLinks];
        this.documentation.documents[index].uploadedDocuments = uploadedCount;
        this.documentation.documents[index].acceptedByOM = approvedCount;
        this.documentation.documents[index].rejectedByOM = rejectedCount;
      }

      Swal.fire({
        icon: 'success',
        title: this.divisionName === 'Asset Management Team' ? 'Review Saved' : 'Upload Complete',
        html: this.divisionName === 'Asset Management Team'
          ? `<p><strong>Approved:</strong> ${approvedCount}</p>
             <p><strong>Rejected:</strong> ${rejectedCount}</p>
             <p><strong>Pending:</strong> ${pendingCount}</p>`
          : `<p>You have uploaded <strong>${uploadedCount}</strong> out of <strong>${doc.noOfDocuments}</strong> documents.</p>`
      });

      this.closeModal();
    },
    error: () => {
      Swal.fire('Error', 'Failed to upload documents', 'error');
    }
  });
}



  closeModal(): void {
    this.showProjectTeamModal = false;
    this.showAssetMgmtModal = false;
    this.selectedDoc = null;
    this.uploadedLinks = [];
  }

  
}
