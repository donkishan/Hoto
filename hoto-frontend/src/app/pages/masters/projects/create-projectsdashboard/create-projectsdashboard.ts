import { Component, AfterViewInit,  ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
  BarController,
  BarElement,
  DoughnutController,
  ArcElement
} from 'chart.js';
import { CommonModule } from '@angular/common';

// ✅ Register only once globally
Chart.register(
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
  BarController,
  BarElement,
  DoughnutController,
  ArcElement
);

@Component({
  selector: 'app-create-projectsdashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './create-projectsdashboard.html',
  styleUrls: ['./create-projectsdashboard.css'],
  encapsulation: ViewEncapsulation.None
})
export class CreateProjectsdashboard implements AfterViewInit {
  project: any;
  charts: any = {};

  constructor(private router: Router) {
    const nav = this.router.getCurrentNavigation();
    this.project = nav?.extras?.state?.['project'];
    console.log('Loaded project into dashboard:', this.project);
  }

  ngAfterViewInit(): void {
    this.loadDashboard();
    const selector = document.getElementById('projectSelector') as HTMLSelectElement;
    if (selector) {
      selector.addEventListener('change', () => this.loadProject(selector.value));
    }
  }
  getStatusClass(status: string): string {
  switch (status) {
    case 'completed':
      return 'completed';
    case 'in-progress':
      return 'in-progress'; // keep this as-is; your CSS defines it
    case 'pending':
      return 'pending';
    default:
      return '';
  }
}


  loadDashboard(): void {
    const defaultProject = 'alpha';
    this.loadProject(defaultProject);
  }

  loadProject(projectId: string): void {
    const data = this.getProjectData(projectId);
    if (!data) return;

    // Update static text content
    const updateText = (id: string, value: string) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    };
    
    updateText('projectTitle', data.title);
    updateText('projectCapacity', data.capacity);
    updateText('projectLocation', data.location);
    updateText('projectStart', data.start);
    updateText('projectCOD', data.cod);
    updateText('projectEPC', data.epc);
    updateText('projectPhase', data.phase);
    updateText('overallProgress', `${data.progress}%`);
    updateText('daysRemaining', String(data.days));
    updateText('completedMilestones', String(data.completed));
    updateText('activeMilestones', String(data.active));
    updateText('qualityScore', data.quality);
    updateText('openIssues', String(data.issues));
    updateText('actualCapacity', data.installedCapacity);
    updateText('efficiency', data.efficiency);

    const circle = document.querySelector('.progress-circle') as HTMLElement;
    if (circle) {
      const deg = (data.progress / 100) * 360;
      circle.style.background = `conic-gradient(#2e7d32 0deg ${deg}deg, #e0e0e0 ${deg}deg 360deg)`;
    }

    const milestoneContainer = document.getElementById('milestoneContainer');
    if (milestoneContainer) {
      milestoneContainer.innerHTML = '';
      data.milestones.forEach((m: any) => {
        const div = document.createElement('div');
        div.className = `milestone-item ${this.getStatusClass(m.status)}`;
        div.innerHTML = `
          <div class="milestone-number">${m.id}</div>
          <div class="milestone-content">
            <div class="milestone-title">${m.title}</div>
            <div class="milestone-description">${m.description}</div>
          </div>`;
        milestoneContainer.appendChild(div);
      });
    }

    this.updateCharts(data);
  }

  updateCharts(data: any): void {
    // Destroy existing charts
    Object.values(this.charts).forEach((chart: any) => chart?.destroy());

    const completed = data.milestones.filter((m: any) => m.status === 'completed').length;
    const inProgress = data.milestones.filter((m: any) => m.status === 'in-progress').length;
    const pending = data.milestones.filter((m: any) => m.status === 'pending').length;

    this.charts['milestone'] = new Chart('milestoneChart', {
      type: 'doughnut',
      data: {
        labels: ['Completed', 'In Progress', 'Pending'],
        datasets: [{
          data: [completed, inProgress, pending],
          backgroundColor: ['#2e7d32', '#7cb342', '#dc3545'],
          borderWidth: 0
        }]
      },
      options: {
        plugins: { legend: { position: 'bottom' } },
        responsive: true,
        maintainAspectRatio: false
      }
    });

    const issues = data.issues;
    this.charts['issue'] = new Chart('issueChart', {
      type: 'bar',
      data: {
        labels: ['Critical', 'High', 'Medium', 'Low'],
        datasets: [{
          label: 'Issues',
          data: [
            Math.floor(issues * 0.15),
            Math.floor(issues * 0.25),
            Math.floor(issues * 0.35),
            Math.floor(issues * 0.25)
          ],
          backgroundColor: ['#dc3545', '#ff9800', '#7cb342', '#2e7d32'],
          borderRadius: 8
        }]
      },
      options: {
        plugins: { legend: { display: false } },
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true } }
      }
    });

    const total = parseInt(data.capacity);
    const actual = parseInt(data.installedCapacity);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
    const steps = months.map((_, i) => Math.floor((actual / months.length) * (i + 1)));

    this.charts['capacity'] = new Chart('capacityChart', {
      type: 'line',
      data: {
        labels: months,
        datasets: [
          {
            label: 'Installed',
            data: steps,
            borderColor: '#2e7d32',
            backgroundColor: 'rgba(46, 125, 50, 0.1)',
            fill: true,
            tension: 0.4
          },
          {
            label: 'Target',
            data: Array(months.length).fill(total),
            borderColor: '#ff9800',
            borderDash: [5, 5],
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true } }
      }
    });

    const labels = data.milestones.map((m: any) => m.id);
    const values = data.milestones.map((m: any) =>
      m.status === 'completed' ? 100 : m.status === 'in-progress' ? 50 : 0
    );

    this.charts['timeline'] = new Chart('timelineChart', {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Milestone Progress',
          data: values,
          backgroundColor: values.map((v: number) =>
            v === 100 ? '#2e7d32' : v === 50 ? '#7cb342' : '#dc3545'
          ),
          borderRadius: 4
        }]
      },
      options: {
        plugins: { legend: { display: false } },
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 100
          }
        }
      }
    });
  }

  getProjectData(projectId: string) {
    const projectData: any = {
      alpha: {
        title: "Project Alpha - Solar Power Plant",
        capacity: "500",
        location: "Rajasthan, India",
        start: "Jan 2024",
        cod: "Dec 2024",
        epc: "ABC Engineering",
        phase: "H4 - Project Declaration",
        progress: 82,
        days: 45,
        completed: 5,
        active: 2,
        quality: "94.2%",
        issues: 8,
        installedCapacity: "410",
        efficiency: "98.5%",
        milestones: [
                              {id: 'H0', title: 'COD Intimation', status: 'completed', description: 'Intimation to Asset Management on COD of the project'},
                    {id: 'H1', title: 'Asset Team Mobilisation', status: 'completed', description: 'Mobilisation of Asset team'},
                    {id: 'H2', title: 'Cleaning & Maintenance', status: 'completed', description: 'Module Cleaning & Grass cutting activity'},
                    {id: 'H3', title: 'Infrastructure Readiness', status: 'completed', description: 'Readiness of Robotics or MCS Infra'},
                    {id: 'H4', title: 'Project Declaration', status: 'completed', description: 'Project has to declare the Transmission Line, Switchyard & Blockwise completion'},
                    {id: 'H5', title: 'Punch Points Sharing', status: 'in-progress', description: 'Asset Management will share punch points basis on offerings by EPC'},
                    {id: 'H6', title: 'Critical Issues Closure', status: 'in-progress', description: 'Closure of all Category A (Critical) punch points'},
                    {id: 'H7', title: 'PAT Documentation', status: 'pending', description: 'Handover of all PAT Related Documents'},
                    {id: 'H8', title: 'Performance Testing', status: 'pending', description: 'PAT (Subject to conditions as set out in HOTO process)'},
                    {id: 'H9', title: 'PAT Approval', status: 'pending', description: 'PAT Sign Off'},
                    {id: 'H10', title: 'Project Stabilization', status: 'pending', description: '100% capacity installed, Critical punch points closure, PAT passed'},
                    {id: 'H11', title: 'Documentation Handover', status: 'pending', description: 'Handover of 100% Documents in DMS and inventory sign-off'},
                    {id: 'H12', title: 'Non-Critical Issues', status: 'pending', description: 'Completion of all punch points (All Non-Critical)'},
                    {id: 'H13', title: 'HOTO Completion', status: 'pending', description: 'HOTO Sign-off'}
        ]
      }
    };
    return projectData[projectId];
  }
}
