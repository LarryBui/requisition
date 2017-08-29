import { AppConfigService } from "./services/app.config.service";
import { RequisitionType, AppConfig, ReqSubType } from "./models/requisition";
import { Component, OnInit, Input } from "@angular/core";

@Component({
    selector: "types-view",
    template:`
       <div class="types-view">
        <div id="accordion" role="tablist" aria-multiselectable="true">
            <div class="card" *ngFor="let name of types; let pos = index">
                <div class="card-header" role="tab" id="type{{pos}}">
                    <h5 class="mb-0">
                        <a class="collapsed" data-toggle="collapse" data-parent="#accordion" href="#collapse{{pos}}"
                            aria-expanded="false" [attr.aria-controls]="'collapse'+pos" 
                            (click)="selectType($event)" [attr.data-pos]="pos">{{name.displayName}}</a>
                    </h5>
                </div>
                <div id="collapse{{pos}}" class="collapse" role="tabpanel" [attr.aria-labelledby]="'type'+pos" >
                    <div class="card-block">
                        <div *ngFor="let stype of appConfig.types[pos].subTypes; let sPos = index">
                            <div>{{stype.displayName}}</div>
                        </div>
                        <div class="new-subtype">
                            <input class="form-control" [(ngModel)]="newSubType" type="text" placeholder="new sub type">
                            <button type="button" class="btn-sm btn btn-primary" (click)="addSubType($event,pos)">Add</button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="new-type" *ngIf="isTypeEditMode == false">
                <input class="form-control" [(ngModel)]="newType" type="text" placeholder="New Category">
                <button type="button" class="btn-sm btn btn-primary" (click)="addType($event)">Add</button>
            </div>
        </div>
       </div>
    `
})

export class TypesComponent implements OnInit {

    public newType: string;
    public types: RequisitionType[];
    public subTypes: string[];
    public isTypeEditMode: boolean;

    public newSubType: string;
    public curType: RequisitionType;
    public curTypeIndex: number;

    @Input() appConfig: AppConfig;

    constructor(private appConfigService: AppConfigService) {
        this.isTypeEditMode = false;
        this.types = new Array();
     }

    ngOnInit() { }

    ngOnChanges(): void {
        this.types = this.appConfig.types;
        console.log(this.appConfig);
    }

    addType(event: any): void {
        if(this.newType) {
            let nType = new RequisitionType();
            nType.name = this.newType.replace(/ /g,"").toLowerCase();
            nType.displayName = this.newType;
            nType.subTypes = [];
            this.types.push(nType);
            this.newType = "";
            this.appConfigService.updateAppConfig(this.appConfig)
                .subscribe( data => {
                    console.log(data);
                });
        }
    }

    addSubType(event: any, pos: number): void {
        if(this.newSubType) {
            let subType:ReqSubType = new ReqSubType();
            subType.name = this.newSubType.replace(/ /g,"").toLowerCase();
            subType.displayName = this.newSubType;
            this.curType.subTypes.push(subType);
            this.newSubType = "";
            this.appConfigService.updateAppConfig(this.appConfig)
                .subscribe( config => {
                    console.log(config);
                });
        }
    }

    selectType(event: any): void {
        let pos: string = event.target.attributes["data-pos"].value;
        let className: string = event.target.className;
        console.log(pos);
        // onclick => className="collapsed", when shown, className=""
        if(pos && className && (className.trim().length > 0)) {
            this.curTypeIndex = Number(pos);
            this.curType = this.appConfig.types[this.curTypeIndex];
            this.subTypes = Object.keys(this.curType.subTypes);
            this.isTypeEditMode = true;
        }else if(className.trim().length === 0) {
            this.clearTypeSelection();
            this.isTypeEditMode = false;
        }
        console.log(this.isTypeEditMode);
    }

    clearTypeSelection(): void {
        this.curType = this.curTypeIndex = this.newSubType = undefined;
    }
}