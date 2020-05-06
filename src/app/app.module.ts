import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { PlayerHomeComponent } from './components/player-home/player-home.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { DataService } from './shared/services/data.service';
import { FormsModule } from '@angular/forms';
import { PlayerResolver } from './shared/resolvers/player-resolver';
import { EventsResolver } from './shared/resolvers/events-resolver';
import { UserEventResolver } from './shared/resolvers/user-event-resolver';
import { LiveOddsComponent } from './components/live-odds/live-odds.component';
import { TwoDecimalDirective } from './shared/two-decimal.directive';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatTabsModule} from '@angular/material/tabs';
import {MatCardModule} from '@angular/material/card';
import { AdminRaceResultComponent } from './components/admin-race-result/admin-race-result.component';
import { ResultsVideoComponent } from './components/results-video/results-video.component';
import { AdminPayoutComponent } from './components/admin-payout/admin-payout.component';
import { SafePipe } from './shared/pipes/safe-url';
import { EventControlComponent } from './components/event-control/event-control.component';
import { AdminHomeComponent } from './components/admin-home/admin-home.component';
import { CreateEventComponent } from './components/create-event/create-event.component';
import { AddRaceComponent } from './components/add-race/add-race.component';
import { AdminRaceControlComponent } from './components/admin-race-control/admin-race-control.component';
import { UserControlComponent } from './components/user-control/user-control.component';
import { LiveRaceCardComponent } from './components/live-race-card/live-race-card.component';

const appRoutes: Routes = [
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'admin-home',
    component: AdminHomeComponent,
    resolve: {
      resolvedEvents: EventsResolver
    },
  },
  {
    path: 'event-home/:eventInfoId',
    resolve: {
      resolvedEvent: EventsResolver
    },
    children: [
      { path: '', redirectTo: 'users', pathMatch: 'full' },
      { path: 'users', component: UserControlComponent },
      { path: 'event', component: EventControlComponent},
      { path: 'live-race',
        children: [
          { path: '', redirectTo: 'result', pathMatch: 'full' },
          { path: 'manage', component: AdminRaceControlComponent},
          { path: 'result', component: AdminRaceResultComponent},
          { path: 'payout', component: AdminPayoutComponent}]},
    ]
  },
  {
    path: 'player-home/:userId',
    component: PlayerHomeComponent,
    resolve: {
      resolvedPlayer: PlayerResolver,
      resolvedUserEvent: UserEventResolver
    },
  },
  {
    path: 'admin-submit-results',
    component: AdminRaceResultComponent,
  },
  {
    path: 'admin-payout',
    component: AdminPayoutComponent,
  },
  { path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  { path: 'pageNotFound', component: PageNotFoundComponent },
  { path: '**', redirectTo: '/pageNotFound'},

];


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    PageNotFoundComponent,
    PlayerHomeComponent,
    LiveOddsComponent,
    TwoDecimalDirective,
    AdminRaceResultComponent,
    ResultsVideoComponent,
    AdminPayoutComponent,
    SafePipe,
    EventControlComponent,
    AdminHomeComponent,
    CreateEventComponent,
    AddRaceComponent,
    AdminRaceControlComponent,
    UserControlComponent,
    LiveRaceCardComponent
  ],
  imports: [
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: false }
       // <-- debugging purposes only
    ),
    RouterModule.forChild( appRoutes),
    BrowserModule,
    HttpClientModule,
    FormsModule,
    BrowserAnimationsModule,
    MatTabsModule,
    MatCardModule
  ],
  providers: [DataService, PlayerResolver, UserEventResolver, EventsResolver],
  bootstrap: [AppComponent]
})
export class AppModule { }
