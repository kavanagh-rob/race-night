import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { PlayerHomeComponent } from './components/player-home/player-home.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { UserListComponent } from './components/user-list/user-list.component';
import { DataService } from './shared/services/data.service';
import { FormsModule } from '@angular/forms';
import { PlayerResolver } from './shared/resolvers/player-resolver';
import { RaceResolver } from './shared/resolvers/race-resolver';
import { LiveOddsComponent } from './components/live-odds/live-odds.component';
import { TwoDecimalDirective } from './shared/two-decimal.directive';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatTabsModule} from '@angular/material/tabs';

const appRoutes: Routes = [
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'player-home/:userId',
    component: PlayerHomeComponent,
    resolve: {
      resolvedPlayer: PlayerResolver,
      resloveLiveRace: RaceResolver
    },
  },
  { path: '',
    redirectTo: '/user',
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
    UserListComponent,
    PlayerHomeComponent,
    LiveOddsComponent,
    TwoDecimalDirective
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
    MatTabsModule
  ],
  providers: [DataService, PlayerResolver, RaceResolver],
  bootstrap: [AppComponent]
})
export class AppModule { }
