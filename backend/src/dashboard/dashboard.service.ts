import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DashboardService {
  generateHTML(data: any[], trends: any[]): string {
    const labels = data.map((_, i) => i + 1);

    const datasets = trends.map(trend => {
      const values = data.map(row => parseFloat(row[trend.field]) || 0);
      return {
        label: `${trend.field} (${trend.trend})`,
        data: values,
        borderColor: this.getRandomColor(),
        fill: false,
      };
    });

    return `
<!DOCTYPE html>
<html>
<head>
  <title>Trend Dashboard</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
  <h2>Trend Analysis Dashboard</h2>
  <canvas id="trendChart" width="800" height="400"></canvas>
  <script>
    const ctx = document.getElementById('trendChart').getContext('2d');
    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ${JSON.stringify(labels)},
        datasets: ${JSON.stringify(datasets)},
      },
      options: {
        responsive: true,
        scales: { y: { beginAtZero: true } }
      }
    });
  </script>
</body>
</html>`;
  }

  getRandomColor() {
    const r = () => Math.floor(Math.random() * 255);
    return `rgb(${r()}, ${r()}, ${r()})`;
  }

  saveDashboard(html: string, filename: string): string {
    const outputPath = path.join(__dirname, '../../outputs', `${filename}.html`);
    fs.writeFileSync(outputPath, html);
    return outputPath;
  }
}
