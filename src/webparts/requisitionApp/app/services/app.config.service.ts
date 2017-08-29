import  pnp from "sp-pnp-js";
import { IWebPartContext } from "@microsoft/sp-webpart-base";
import { AppConfig, AppContextToken, Employee, UPProperties } from "./../models/requisition";
import { Injectable, Inject } from "@angular/core";
import { Http, Response } from "@angular/http";
import { Observable } from "rxjs/Observable";
import "rxjs/add/operator/map";
import "rxjs/add/operator/catch";


@Injectable()
export class AppConfigService {
    private _wpContext:IWebPartContext;
    constructor(private http: Http,
                 @Inject(AppContextToken) wpContext:IWebPartContext) {
                     this._wpContext = wpContext;
                  }
    getWebUrl():Observable<string> {
        return Observable.create(observer => {
            observer.next(this._wpContext.pageContext.web.serverRelativeUrl);
            observer.complete();
        });
    }
    getWebUrl_sync(): string {
        return  this._wpContext.pageContext.web.serverRelativeUrl;
    }
    getWPContext(): IWebPartContext {
        return this._wpContext;
    }

    getUserGroups(): Observable<string[]> {
        let webUrl: string = this._wpContext.pageContext.web.absoluteUrl;
        let url: string = webUrl + "/_api/web/CurrentUser/Groups?$select=Id,Title";
        console.log(url);
        return this.http.get(url).map((res:Response) => res.json().value.map(gr => gr.Title));
    }
    loadAppConfig():Observable<AppConfig> {
        return Observable.create(observer => {
            let fileUrl = this.getWebUrl_sync() + "/siteassets/appconfig.json";
            pnp.sp.web.getFileByServerRelativeUrl(fileUrl).getJSON()
                .then(data => {
                    console.log();
                    observer.next(data);
                    observer.complete();
                    console.log(data);
                }).catch(error => {
                    console.error("error:LoadAppConfig",error);
                });
        });
    }
    updateAppConfig(appConfig: AppConfig): Observable<AppConfig>  {
        return Observable.create( observer => {
            let jsonStr = JSON.stringify(appConfig);
            let fileUrl = this.getWebUrl_sync() + "/siteassets/appconfig.json";
            pnp.sp.web.getFileByServerRelativeUrl(fileUrl).setContent(jsonStr)
                .then(data => {
                    observer.next(appConfig);
                    observer.complete();
                });
        });
    }
    loadCurrentUser(): Observable<Employee> {
        return Observable.create( observer => {
            pnp.sp.profiles.myProperties.get()
                .then(data => {
                    let properties = data.UserProfileProperties;
                    let emp:Employee = new Employee();
                    properties.forEach(prop => {
                        if(UPProperties.indexOf(prop.Key) > -1) {
                            emp[prop.Key] = prop.Value;
                        }
                    });
                    observer.next(emp);
                    observer.complete();
                    console.log(data);
                });
        });
    }
}