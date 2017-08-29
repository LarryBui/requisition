import { AppConfig } from "./models/requisition";
import { AppConfigService } from "./services/app.config.service";
import { Component, OnInit, Input } from "@angular/core";


@Component({
    selector: "req-admin",
    template: `
        <div class="container-fluid admin-view">
            <div class="row">
                <div class="col-sm-2">
                    <ul class="nav flex-column">
                        <li class="nav-item">
                            <a class="nav-link active" href="#" (click)="renderTypes()">Categories</a>
                        </li>
                        <li class="nav-item" style="display:none">
                            <a class="nav-link" href="#" (click)="renderOffices()">Offices</a>
                        </li>
                    </ul>
                </div>
                <div class="col-sm-10">
                    <div [ngSwitch]="action">
                        <types-view *ngSwitchCase="'types'"
                            [appConfig]="appConfig"
                            ></types-view>
                        <offices-view *ngSwitchCase="'offices'"
                            [appConfig]="appConfig"
                            ></offices-view>
                    </div>
                </div>
            </div>
        </div>
        
    `
})

export class AdminComponent implements OnInit {

    public action: string;
    @Input() appConfig: AppConfig;
    
    constructor(private appService:AppConfigService) {
     }

    ngOnInit():void {}
    
    ngOnChanges(): void {
        this.action = "types";
    }
    
    renderTypes(): void {
        this.action = "types";
    }
    renderOffices(): void {
        this.action = "offices";
    }
}