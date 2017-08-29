declare interface IRequisitionAppStrings {
  PropertyPaneDescription: string;
  BasicGroupName: string;
  DescriptionFieldLabel: string;
  ListNameFieldLabel:string;
  AppConfigUrlFieldLabel: string;
}

declare module 'requisitionAppStrings' {
  const strings: IRequisitionAppStrings;
  export = strings;
}
