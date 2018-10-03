import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { ApplicationService } from 'app/services/application.service';
import { Application } from 'app/models/application';

@Injectable()
export class ApplicationDetailResolver implements Resolve<Application> {

  constructor(
    private router: Router,
    private applicationService: ApplicationService
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Application> {
    const appId = route.paramMap.get('appId');

    if (appId === '0') {
      // create new application
      return Observable.of(new Application({ _id: appId }));
    }

    // view/edit existing application
    return this.applicationService.getById(appId);
  }
}
