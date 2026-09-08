import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';
import { FirestoreService } from '../../../../../core/services/firestore.service';
import { Ammunation } from '../../../../../core/models/stock/ammunation.interface';

export interface AmmoChart {
  title: string;
  type: ChartType;
  chartData: ChartConfiguration['data'];  
  chartOptions: ChartConfiguration['options'];
}

@Component({
  selector: 'app-liniear-graphic',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './liniear-graphic.html',
  styleUrls: ['./liniear-graphic.css'],
})
export class LiniearGraphic implements OnInit {
  
  public dadosCarregados: boolean = false;
  public ammoCharts: AmmoChart[] = [];
  public currentSlideIndex: number = 0;
  public selectedChart: AmmoChart | null = null;

  constructor(
    private firestoreService: FirestoreService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    await this.carregarDadosDoGrafico();
  }

  public nextSlide(): void {
    if (this.currentSlideIndex < this.ammoCharts.length - 1) {
      this.currentSlideIndex++;
    } else {
      this.currentSlideIndex = 0;
    }
  }

  public prevSlide(): void {
    if (this.currentSlideIndex > 0) {
      this.currentSlideIndex--;
    } else {
      this.currentSlideIndex = this.ammoCharts.length - 1;
    }
  }

  private async carregarDadosDoGrafico() {
    try {
      const path = `ammunition`;
      const collection = await this.firestoreService.getCollectionData(path) as unknown as Ammunation[];
        
      if (!collection || collection.length === 0) {
        return;
      }            
      
      const cores = [
        '#00f0ff',
        '#39ff14',
        '#ff007f',
        '#ffe600',
        '#bd00ff',
        '#ff5f1f',
        '#00ffea'
      ];

      this.ammoCharts = collection.map((ammo, index) => {
        const cor = cores[index % cores.length];        
        
        const labelsFormatados = ammo.priceHistory.map(historyItem => {
          const timestampData = (historyItem as any).timestamp || (historyItem as any).Timestamp;
          let dataJs: Date;
          
          if (timestampData && timestampData.seconds) {
            dataJs = new Date(timestampData.seconds * 1000);
          } else {
            dataJs = new Date(timestampData);
          }
          
          return dataJs.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true});
        });

        const precos = ammo.priceHistory.map(historyItem => historyItem.price);

        return {
          title: ammo.name,
          type: 'line',
          chartData: {
            labels: labelsFormatados,
            datasets: [
              {
                data: precos,
                borderColor: cor,
                backgroundColor: 'transparent',
                fill: false,
                tension: 0.3
              }
            ]
          },
          chartOptions: this.gerarOpcoesDoGrafico()
        };
      });    

      this.dadosCarregados = true;
      this.cdr.detectChanges();
      
    } catch (error) {
      console.error(error);
    }
  }

  private gerarOpcoesDoGrafico(): ChartOptions {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          title: {
            display: true,
            text: 'Unit price ($)',
            color: '#E8DCC4',
            font: {
              family: "'Special Elite', monospace",
              size: 14,
              weight: 'bold'
            }
          },
          ticks: {
            color: '#A89F92',
            font: {
              family: "Cormorant Garamond",
              size: 12
            }
          },
          grid: {
            color: '#2E2A36'
          }
        },
        x: {
          ticks: {
            color: '#A89F92',
            font: {
              family: "'Special Elite', monospace",
              size: 11
            }
          },
          grid: {
            color: '#2E2A36'
          }
        }
      },
      elements: {
        line: { tension: 0.3 }
      }
    };
  } 

  public openChart(chart: AmmoChart): void {
    this.selectedChart = chart;
  }

  public closeModal(): void {
    this.selectedChart = null;
  }
}