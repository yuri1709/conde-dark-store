import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';
import { FirestoreService } from '../../../../../core/services/firestore.service';
import { Ammunation } from '../../../../../core/models/stock/ammunation.interface';

@Component({
  selector: 'app-liniear-graphic',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './liniear-graphic.html',
  styleUrls: ['./liniear-graphic.css'], // Corrigido de styleUrl para styleUrls
})
export class LiniearGraphic implements OnInit {
  
  // Controle de exibição do HTML
  public dadosCarregados: boolean = false;

  // Configurações do gráfico
  public lineChartType: ChartType = 'line';
  public lineChartData!: ChartConfiguration['data']; // Só será instanciado após os dados chegarem

  public lineChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false, 
    scales: {
      y: {
        title: { display: true, text: 'Unit price ($)' }
      },
      x: {
        title: { display: true, text: 'Time' }
      }
    },
    elements: {
      line: { tension: 0.3 }
    }
  };

  constructor(private firestoreService: FirestoreService) {}

  async ngOnInit(): Promise<void> {
    await this.carregarDadosDoGrafico();
  }

  private async carregarDadosDoGrafico() {
    try {
      const path = `ammunition`;
      const collection = await this.firestoreService.getCollectionData(path) as unknown as Ammunation[];
        
      if (!collection || collection.length === 0) {
        console.warn('Nenhum dado encontrado no Firestore.');
        return;
      }
      if (!collection || collection.length === 0) {
        console.warn('Nenhum dado encontrado no Firestore.');
        return;
      }

      // 1. Extrair labels (horários) do primeiro item
      const primeiroItem = collection[0];
      const labelsFormatados = primeiroItem.priceHistory.map(historyItem => {
        // Trata o timestamp do Firestore ou outro formato
        const timestampData = (historyItem as any).timestamp || (historyItem as any).Timestamp;
        
        let dataJs: Date;
        if (timestampData && timestampData.seconds) {
          dataJs = new Date(timestampData.seconds * 1000);
        } else {
          // Caso seja string ou já Date
          dataJs = new Date(timestampData);
        }
        
        return dataJs.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true});
      });

      // 2. Extrair datasets (preços)
      const datasetsFormatados = collection.map((ammo, index) => {
        const cores = [
 '#00f0ff', // Ciano neon elétrico (destaque máximo e futurista)
  '#39ff14', // Verde neon ácido (perfeito para destacar alta visibilidade)
  '#ff007f', // Rosa neon choque (impactante e super moderno)
  '#ffe600', // Amarelo limão neon (brilha intensamente no preto absoluto)
  '#bd00ff', // Roxo neon vibrante (ótimo contraste sem perder elegância)
  '#ff5f1f', // Laranja neon/abrasivo (energia pura para o gráfico)
  '#00ffea'  // Turquesa neon (alternativa brilhante para múltiplas linhas)
];
        const cor = cores[index % cores.length];        
        return {
          label: ammo.name,
          data: ammo.priceHistory.map(historyItem => historyItem.price),
          borderColor: cor,
          backgroundColor: 'transparent', // Para não preencher o fundo da linha
          fill: false
        };
      });

      // 3. Atribuir os dados e liberar a renderização do HTML
      this.lineChartData = {
        labels: labelsFormatados,
        datasets: datasetsFormatados
      };

      this.dadosCarregados = true; // Exibe o canvas no HTML
      
    } catch (error) {
      console.error('Erro ao buscar dados para o gráfico:', error);
    }
  }
}