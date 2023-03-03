// import * as React from 'react';
// import * as ReactDom from 'react-dom';
// import { Version } from '@microsoft/sp-core-library';
// import {
//   IPropertyPaneConfiguration,
//   PropertyPaneTextField
// } from '@microsoft/sp-property-pane';
// import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
// import { IReadonlyTheme } from '@microsoft/sp-component-base';

// import * as strings from 'News1WebPartStrings';
// import News1 from './components/News1';
// import { INews1Props } from './components/INews1Props';

// export interface INews1WebPartProps {
//   description: string;
// }

// export default class News1WebPart extends BaseClientSideWebPart<INews1WebPartProps> {

//   private _isDarkTheme: boolean = false;
//   private _environmentMessage: string = '';

//   public render(): void {
//     const element: React.ReactElement<INews1Props> = React.createElement(
//       News1,
//       {
//         description: this.properties.description,
//         isDarkTheme: this._isDarkTheme,
//         environmentMessage: this._environmentMessage,
//         hasTeamsContext: !!this.context.sdks.microsoftTeams,
//         userDisplayName: this.context.pageContext.user.displayName
//       }
//     );

//     ReactDom.render(element, this.domElement);
//   }

//   protected onInit(): Promise<void> {
//     return this._getEnvironmentMessage().then(message => {
//       this._environmentMessage = message;
//     });
//   }



//   private _getEnvironmentMessage(): Promise<string> {
//     if (!!this.context.sdks.microsoftTeams) { // running in Teams, office.com or Outlook
//       return this.context.sdks.microsoftTeams.teamsJs.app.getContext()
//         .then(context => {
//           let environmentMessage: string = '';
//           switch (context.app.host.name) {
//             case 'Office': // running in Office
//               environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOffice : strings.AppOfficeEnvironment;
//               break;
//             case 'Outlook': // running in Outlook
//               environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOutlook : strings.AppOutlookEnvironment;
//               break;
//             case 'Teams': // running in Teams
//               environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentTeams : strings.AppTeamsTabEnvironment;
//               break;
//             default:
//               throw new Error('Unknown host');
//           }

//           return environmentMessage;
//         });
//     }

//     return Promise.resolve(this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentSharePoint : strings.AppSharePointEnvironment);
//   }

//   protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
//     if (!currentTheme) {
//       return;
//     }

//     this._isDarkTheme = !!currentTheme.isInverted;
//     const {
//       semanticColors
//     } = currentTheme;

//     if (semanticColors) {
//       this.domElement.style.setProperty('--bodyText', semanticColors.bodyText || null);
//       this.domElement.style.setProperty('--link', semanticColors.link || null);
//       this.domElement.style.setProperty('--linkHovered', semanticColors.linkHovered || null);
//     }

//   }

//   protected onDispose(): void {
//     ReactDom.unmountComponentAtNode(this.domElement);
//   }

//   protected get dataVersion(): Version {
//     return Version.parse('1.0');
//   }

//   protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
//     return {
//       pages: [
//         {
//           header: {
//             description: strings.PropertyPaneDescription
//           },
//           groups: [
//             {
//               groupName: strings.BasicGroupName,
//               groupFields: [
//                 PropertyPaneTextField('description', {
//                   label: strings.DescriptionFieldLabel
//                 })
//               ]
//             }
//           ]
//         }
//       ]
//     };
//   }
// }



import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import * as strings from 'News1WebPartStrings';
import styles from './components/News1.module.scss';
import {
  SPHttpClient,
  SPHttpClientResponse
} from '@microsoft/sp-http';
import {
  Environment,
  EnvironmentType
} from '@microsoft/sp-core-library';
export interface IGetListItemFromSharePointListWebPartProps {
  description: string;
}
export interface ISPLists
{
  value: ISPList[];
}
export interface ISPList
{
  Title: string;
}
export default class GetListItemFromSharePointListWebPart extends BaseClientSideWebPart <IGetListItemFromSharePointListWebPartProps> {
  private _getListData(): Promise<ISPLists>
  {
   return this.context.spHttpClient.get(this.context.pageContext.web.absoluteUrl + "/_api/web/lists/GetByTitle('News1')/Items?$select=Title",
       SPHttpClient.configurations.v1
   )
   .then((response: SPHttpClientResponse) =>
       {
       return response.json();
        console.log(response.json())
       });
   }
   private _renderListAsync(): void
   {
    if (Environment.type === EnvironmentType.SharePoint ||
             Environment.type === EnvironmentType.ClassicSharePoint) {
     this._getListData()
       .then((response) => {
         this._renderList(response.value);
         console.log(response.value);
       }).catch((err)=>{console.log(err)})
}
 }
 private _renderList(items: ISPList[]): void
 {
let  html: string = '<p border=2 width=100% style="font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;">';
  html += '<b><th style="background-color: #AF534C;" >LATEST NEWS</th></b><marquee    direction="up"  scrollamount="1">';
   console.log(items)
  items.forEach((item: ISPList) => {

    // const imgurl = item.Images.Url
    
    html += `

        ${item.Title}<br><br>
        
        
        `;
  });
  html += "</marquee></p>";                                                                                                   
  const listContainer: Element = this.domElement.querySelector('#BindspListItems');
  listContainer.innerHTML = html;
}
  public render(): void {
    this.domElement.innerHTML = `
      <div class={styles.sharepointframe}>
    <div class={ styles.container }>
      <div class={ styles.row }>
        <div class={ column }>
        <span class="${styles.title}"></span>
          
          </div>
          <br/>
          <br/>
          <br/>
          <div id="BindspListItems" />
          </div>
          </div>
          </div>`;
          this._renderListAsync();
  }
  protected get dataVersion(): Version {
  return Version.parse('1.0');
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
              PropertyPaneTextField('description', {
                label: strings.DescriptionFieldLabel
              })
            ]
          }
        ]
      }
    ]
  };
}
}