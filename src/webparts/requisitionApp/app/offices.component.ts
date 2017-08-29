import { AppConfig, Office } from "./models/requisition";
import { Component, OnInit, Input } from "@angular/core";

@Component({
    selector: "offices-view",
    template:`
        <div class="offices-view">
            <div>Offices view</div>
            <div id="accordion" role="tablist" aria-multiselectable="true">
                <div class="card" *ngFor="let office of appConfig.offices; let pos = index">
                    <div class="card-header" role="tab" id="office{{pos}}">
                        <h5 class="mb-0">
                            <a class="collapsed" data-toggle="collapse" data-parent="#accordion" href="#collapse{{pos}}"
                                aria-expanded="false" [attr.aria-controls]="'collapse'+pos">{{office.displayName}}</a>
                        </h5>
                    </div>
                    <div id="collapse{{pos}}" class="collapse" role="tabpanel" [attr.aria-labelledby]="'office'+pos" >
                        <div class="card-block">

                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})

export class OfficesComponent implements OnInit {

    @Input() appConfig: AppConfig;
    
    public isEditOfficeMode: boolean;
    public newOffice: Office;
    public editOffice: Office;
    public editOfficeIndex: number;


    constructor() {}

    ngOnInit() {}
    ngOnChanges(): void {
    }
}