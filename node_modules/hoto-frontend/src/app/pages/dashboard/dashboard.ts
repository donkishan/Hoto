import { Component, AfterViewInit } from '@angular/core';

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
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements AfterViewInit {

  ngAfterViewInit(): void {
    this.loadCharts();
  }

  loadCharts(): void {
    // Timeline Chart
    new Chart('timelineChart', {
      type: 'line',
      data: {
        labels: ['H0', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'H7', 'H8', 'H9', 'H10', 'H11', 'H12', 'H13'],
        datasets: [
          {
            label: 'Project A',
            data: [100, 100, 100, 75, 50, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            borderColor: '#4CAF50',
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Project B',
            data: [100, 100, 100, 100, 100, 80, 60, 40, 0, 0, 0, 0, 0, 0],
            borderColor: '#81C784',
            backgroundColor: 'rgba(129, 199, 132, 0.1)',
            tension: 0.4,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            max: 100
          }
        }
      }
    });

    // Status Chart
    new Chart('statusChart', {
      type: 'doughnut',
      data: {
        labels: ['Completed', 'In Progress', 'Pending'],
        datasets: [{
          data: [3, 2, 8],
          backgroundColor: ['#4CAF50', '#FF9800', '#757575']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });

    // Punch Points Chart
    new Chart('punchPointsChart', {
      type: 'bar',
      data: {
        labels: ['Critical', 'Non-Critical', 'Resolved'],
        datasets: [{
          data: [24, 45, 78],
          backgroundColor: ['#F44336', '#FF9800', '#4CAF50']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });

    // PAT Success
    new Chart('patChart', {
      type: 'doughnut',
      data: {
        labels: ['Passed', 'Failed', 'Pending'],
        datasets: [{
          data: [85, 10, 5],
          backgroundColor: ['#4CAF50', '#F44336', '#FF9800']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });

    // Monthly HOTO Completions Chart
    new Chart('monthlyChart', {
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'HOTO Completions',
          data: [2, 4, 3, 5, 4, 6],
          backgroundColor: '#4CAF50',
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  }
}
