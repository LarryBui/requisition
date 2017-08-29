import { Requisition, Office } from "./models/requisition";
import { SPService } from "./services/sp.service";
import { SPComponentLoader } from "@microsoft/sp-loader";
import { Component, OnInit } from "@angular/core";


SPComponentLoader.loadScript("https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.6.0/Chart.bundle.js");

@Component({
    selector: "req-bi",
    template: `
        <div *ngIf="dataReady" class="chart-container" style="position:relative; height:400px; width:400px">
            <canvas id="chart" baseChart
                [data]="pieChartData"
                [labels]="pieChartLabels"
                [chartType]="pieChartType">
            </canvas>
        </div>
    `
})

export class BIComponent implements OnInit {
    // Pie
  public pieChartLabels:string[] = ["Irvine", "Dubai", "Lahore","Islamabad"];
  public pieChartData:number[] = [0,0,0,0];
  public pieChartType:string = "pie";

    public items: Requisition[];
    public dataReady: boolean;

    constructor(private spService: SPService) {
        this.dataReady = false;
    }

    ngOnInit(): void {
        this.spService.loadAllRequisitions()
            .subscribe(data => {
                this.items = data;
                this.items.forEach(ele => {
                    if(ele.Office.toLowerCase() === "irvine") {
                        this.pieChartData[0] += Number(ele.Amount);
                    }else if(ele.Office.toLowerCase() === "dubai") {
                        this.pieChartData[1] += Number(ele.Amount);
                    }else if (ele.Office.toLowerCase() === "lahore") {
                        this.pieChartData[2] += Number(ele.Amount);
                    }else if(ele.Office.toLowerCase() === "islamabad") {
                        this.pieChartData[3] += Number(ele.Amount);
                    }

                });
                this.dataReady = true;
            });
    }
}