import  pnp from "sp-pnp-js";
import { AppContextToken } from "./app/models/requisition";
import { Version } from "@microsoft/sp-core-library";
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from "@microsoft/sp-webpart-base";

// import styles from "./requisition.scss";

import * as strings from "requisitionAppStrings";
import { IRequisitionAppWebPartProps } from "./IRequisitionAppWebPartProps";



import "reflect-metadata";
// sPComponentLoader must be loaded after reflect-metadata
import { SPComponentLoader } from "@microsoft/sp-loader";

declare var window: any;
declare var document: any;
var isIE11:boolean = !!window.MSInputMethodContext && !!document.documentMode;
require("zone.js");

if(!isIE11) {
}else {
  window.location.href = "../siteassets/noie11.aspx";
}
window.Tether = {};


import {AppModule} from "./app/app.module";
import {platformBrowserDynamic} from "@angular/platform-browser-dynamic";


SPComponentLoader.loadScript("https://code.jquery.com/jquery-3.1.0.min.js");

export default class RequisitionAppWebPart extends BaseClientSideWebPart<IRequisitionAppWebPartProps> {

  public render(): void {


SPComponentLoader.loadCss(this.context.pageContext.web.serverRelativeUrl + "/siteassets/bootstrap.min.css");

SPComponentLoader.loadCss(this.context.pageContext.web.serverRelativeUrl + "/siteassets/css/font-awesome.min.css");
SPComponentLoader.loadCss(this.context.pageContext.web.serverRelativeUrl + "/siteassets/primeng.min.css");

SPComponentLoader.loadCss(this.context.pageContext.web.serverRelativeUrl + "/siteassets/requisition.css");
SPComponentLoader.loadCss(this.context.pageContext.web.serverRelativeUrl + "/siteassets/theme.css");

//SPComponentLoader.loadCss("https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/css/bootstrap.min.css");
//ComponentLoader.loadCss("https://xelleration.sharepoint.com/sites/developers/requisition/siteassets/requisition.css");


    this.domElement.innerHTML = `<req-app>initial loading...</req-app>`;
    // let appContext:IRequisitionAppWebPartProps = this.properties;
    // appContext.wpContext = this.context;
    pnp.setup({
      spfxContext: this.context
    });
    let isIE11 = !!window.MSInputMethodContext && !!document.documentMode;
  if(!isIE11) {
    platformBrowserDynamic([
        {provide:AppContextToken, useValue: this.context }
    ]).bootstrapModule(AppModule);
  }else {
    this.domElement.innerHTML = "<h2>This feature is not supported in IE11 or less. Please use Microsoft Edge instead</h2>";
  }

        
  SPComponentLoader.loadScript("https://code.jquery.com/jquery-3.1.1.slim.min.js");
  SPComponentLoader.loadScript("https://cdnjs.cloudflare.com/ajax/libs/tether/1.4.0/js/tether.min.js");
  SPComponentLoader.loadScript("https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/js/bootstrap.min.js");
//SPComponentLoader.loadScript(this.context.pageContext.web.serverRelativeUrl + "/siteassets/bootstrap.min.js");
}


  protected get dataVersion(): Version {
    return Version.parse("1.0");
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField("description", {
                  label: strings.DescriptionFieldLabel
                }),
                PropertyPaneTextField("listName",{
                  label: strings.ListNameFieldLabel
                }),
                PropertyPaneTextField("appConfigUrl",{
                  label: strings.AppConfigUrlFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
