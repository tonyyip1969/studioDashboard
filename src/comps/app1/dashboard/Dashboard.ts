import {Component, Injector} from 'angular2/core'
import {Infobox} from "../../infobox/Infobox";
import {List, Map} from 'immutable';
import {AppStore} from "angular2-redux-util/dist/index";
import {BusinessAction} from "../../../business/BusinessAction";
import {ServerStats} from "./ServerStats";
import {ServerAvg} from "./ServerAvg";
import {AppdbAction} from "../../../appdb/AppdbAction";
import {StationsMap} from "./StationsMap";
import {CanActivate, OnActivate, ComponentInstruction, Router} from "angular2/router";
import {appInjService} from "../../../services/AppInjService";
import {AuthService} from "../../../services/AuthService";
import {StationsAction} from "../../../stations/StationsAction";
import {BusinessSourcesModel} from "../../../business/BusinessSourcesModel";
const _ = require('underscore');

@Component({
    directives: [Infobox, ServerStats, ServerAvg, StationsMap],
    selector: 'Dashboard',
    styles: [`        
    `],
    providers: [BusinessAction],
    template: `
    <div class="row">
        <br/>
        <div class="col-sm-4 col-lg-2">
            <Infobox [value1]="businessStats.lites" [value3]="'lite account'" [icon]="'fa-circle-o'">
            </Infobox>
        </div>
        <div class="col-sm-4 col-lg-2">
            <Infobox [value1]="businessStats.pros" [value3]="'pro accounts'" [icon]="'fa-circle'">
            </Infobox>
        </div>
        <div class="col-sm-4 col-lg-2">
            <Infobox [value1]="businessStats.activeAccounts" [value3]="'active accounts'" [icon]="'fa-user-plus'">
            </Infobox>
        </div>
        <div class="col-sm-4 col-lg-2">
            <Infobox [value1]="businessStats.inactiveAccounts" [value3]="'inactive accounts'" [icon]="'fa-user-times'">
            </Infobox>
        </div>
        <div class="col-sm-4 col-lg-2">
            <Infobox [value1]="businessStats.lastLogin" [value3]="'last login'" [icon]="'fa-clock-o '">
            </Infobox>
        </div>
        <div class="col-sm-4 col-lg-2">
            <Infobox [value1]="businessStats.totalBusinesses" [value3]="'total businesses'" [icon]="'fa-users'">
            </Infobox>
        </div>
    </div>  
    <div class="row">
       <div class="col-sm-12 col-lg-4">
          <ServerStats [data]="serverStats" [categories]="serverStatsCategories"></ServerStats>           
       </div>
       <div class="col-sm-12 col-lg-4" style="min-height: 280px">
          <ServerAvg [data]="serverAvgResponse"></ServerAvg>           
       </div>
       <div class="col-sm-12 col-lg-4">
           <div class="row">
               <div class="col-xm-12">
                    <Infobox style="color: green" [value1]="'screens online: 25'" [value3]="'updated'" icon="fa-tv">
                    </Infobox>
               </div>
               <div class="col-xm-12">
                    <Infobox style="color: red" [value1]="'screens offline: 2115'" [value3]="'updated'" icon="fa-tv">
                    </Infobox>
               </div>
           </div>
       </div>       
    </div>
    <div class="row">
        <div style="height: 400px; overflow: hidden">
            <StationsMap data="[1,2,3]"></StationsMap>
        </div>
    </div>
    `
})

@CanActivate((to:ComponentInstruction, from:ComponentInstruction) => {
    let authService:AuthService = appInjService().get(AuthService);
    return authService.checkAccess(to, from);
})
export class Dashboard implements OnActivate {
    unsub1:()=>void;
    unsub2:()=>void;
    businessStats = {};
    serverStats;
    serverAvgResponse;
    serverStatsCategories;

    constructor(private appStore:AppStore, private appDbActions:AppdbAction, private stationsAction:StationsAction) {
        var self = this;
        this.loadData();
        this.serverStats = [];
        this.serverStatsCategories = [];
        this.serverAvgResponse = 0;

        this.appStore.dispatch(this.appDbActions.serverStatus());

        this.unsub2 = appStore.sub((serversStatus:Map<string,any>) => {
            let c = 0;
            let t = 0;
            this.serverStats = [];
            this.serverStatsCategories = [];
            serversStatus.forEach((value, key)=> {
                self.serverStatsCategories.push(key);
                c++;
                t = t + Number(value);
                self.serverStats.push(Number(value));
            })
            this.serverAvgResponse = t / c;
        }, 'appdb.serversStatus', false);
    }

    routerOnActivate(to:ComponentInstruction, from:ComponentInstruction) {
    }

    private loadStations() {
        // var businesses:List<BusinessModel> = this.appStore.getState().business.getIn(['businesses']);
        // var businessIds = [];
        // businesses.forEach((businessModel:BusinessModel)=>{
        //     businessIds.push(businessModel.getBusinessId());
        // });
        // //todo: categorize business ids by source server id and save in redux store
        // if (businessIds.length>0)
        var sources:Map<string,any> = this.appStore.getState().business.getIn(['businessSources']).getData();
        sources.forEach((i_businesses:List<string>,source)=> {
            let businesses = i_businesses.toArray();
            this.appStore.dispatch(this.stationsAction.getStationsInfo(source,businesses));
        })
        // businessSourcesModel.forEach((value)=> {
        //     console.log(value);
        // })
        // this.appStore.dispatch(this.stationsAction.getStationsInfo(sourceModels));


    }

    private loadData() {
        this.businessStats = this.appStore.getState().business.getIn(['businessStats']) || {};
        if (_.size(this.businessStats) > 0)
            this.loadStations();

        this.unsub1 = this.appStore.sub((i_businesses:Map<string,any>) => {
            this.businessStats = i_businesses;
            this.loadStations();
        }, 'business.businessStats');

    }

    private ngOnDestroy() {
        this.unsub1();
        this.unsub2();
    }
}

