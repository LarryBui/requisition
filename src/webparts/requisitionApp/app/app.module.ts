import { TitleCasePipe } from './models/util';
import { OfficesComponent } from "./offices.component";
import { TypesComponent } from "./types.component";
import { ViewAllComponent } from "./view-all.component";
import { SPService } from "./services/sp.service";
import { HttpModule } from "@angular/http";
import { AppConfigService } from "./services/app.config.service";
import { BIComponent } from "./bi.component";
import { AdminComponent } from "./admin.component";
import { DispFormComponent } from "./disp-form.component";
import { EditFormComponent } from "./edit-form.component";
import { NewFormComponent } from "./new-form.component";
import { ViewComponent } from "./view.component";

import { NgModule } from "@angular/core";
import { BrowserModule  } from "@angular/platform-browser";
import { BrowserAnimationsModule} from "@angular/platform-browser/animations";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import {ChartsModule} from "ng2-charts";
import { DataTableModule,SharedModule} from "primeng/primeng";

import { AppComponent } from "./app.component";


@NgModule({
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        HttpModule,
        ChartsModule,
        DataTableModule,
        SharedModule,

    ],
    exports:[
    ],
    declarations: [
        AppComponent,
        ViewComponent,
        NewFormComponent,
        EditFormComponent,
        DispFormComponent,
        ViewAllComponent,
        AdminComponent,
        TypesComponent,
        OfficesComponent,
        BIComponent,
        TitleCasePipe,
        
],
    providers: [AppConfigService,SPService],
    bootstrap: [AppComponent]
})
export class AppModule { }
