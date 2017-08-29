import { InjectionToken } from "@angular/core";
import { IWebPartContext } from "@microsoft/sp-webpart-base";


export interface IRequisitionAppWebPartProps {
  description: string;
  listName: string;
  appConfigUrl: string;
  wpContext: IWebPartContext;
}

export let AppContext:InjectionToken<IRequisitionAppWebPartProps> = new InjectionToken<IRequisitionAppWebPartProps>("AppContext");
