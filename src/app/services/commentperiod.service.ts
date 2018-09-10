import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/of';
import * as _ from 'lodash';
import { of, forkJoin } from 'rxjs';

import { ApiService } from './api';
import { CommentPeriod } from 'app/models/commentperiod';

@Injectable()
export class CommentPeriodService {
  // statuses (also used as short strings)
  readonly NOT_STARTED = 'Not Started';
  readonly NOT_OPEN = 'Not Open';
  readonly CLOSED = 'Closed';
  readonly OPEN = 'Open';

  private commentPeriod: CommentPeriod = null;
  public commentStatuses = [];

  constructor(private api: ApiService) {
    // user-friendly strings
    this.commentStatuses[this.NOT_STARTED] = 'Commenting Not Started';
    this.commentStatuses[this.NOT_OPEN] = 'Not Open For Commenting';
    this.commentStatuses[this.CLOSED] = 'Commenting Closed';
    this.commentStatuses[this.OPEN] = 'Commenting Open';
  }

  // get all comment periods for the specified application id
  getAllByApplicationId(appId: string): Observable<CommentPeriod[]> {
    return this.api.getPeriodsByAppId(appId)
    .catch(this.api.handleError);
  }

  // get a specific comment period by its id
  getById(periodId: string): Observable<CommentPeriod> {
    return this.api.getPeriod(periodId)
      .map(res => {
        // return the first (only) comment period
        if (res[0] && res[0].length > 0) {
          this.commentPeriod = new CommentPeriod(res[0]);
          return this.commentPeriod;
        }
      });
  }

  add(orig: CommentPeriod): Observable<CommentPeriod> {
    // make a (deep) copy of the passed-in comment period so we don't change it
    const period = _.cloneDeep(orig);

    // ID must not exist on POST
    delete period._id;

    // replace newlines with \\n (JSON format)
    if (period.description) {
      period.description = period.description.replace(/\n/g, '\\n');
    }

    return this.api.addCommentPeriod(period);
  }

  save(orig: CommentPeriod): Observable<CommentPeriod> {
    // make a (deep) copy of the passed-in comment period so we don't change it
    const period = _.cloneDeep(orig);

    // replace newlines with \\n (JSON format)
    if (period.description) {
      period.description = period.description.replace(/\n/g, '\\n');
    }

    return this.api.saveCommentPeriod(period);
  }

  delete(period: CommentPeriod): Observable<CommentPeriod> {
    return this.api.deleteCommentPeriod(period);
  }

  publish(period: CommentPeriod): Observable<CommentPeriod> {
    return this.api.publishCommentPeriod(period);
  }

  unPublish(period: CommentPeriod): Observable<CommentPeriod> {
    return this.api.unPublishCommentPeriod(period);
  }

  // returns first published period - multiple comment periods are currently not suported
  getCurrent(periods: CommentPeriod[]): CommentPeriod {
    const published = periods.filter(period => period.isPublished);
    return (published.length > 0) ? published[0] : null;
  }

  // NB: see also ManageCommentPeriodsComponent.getStatus()
  getStatus(period: CommentPeriod): string {
    if (!period || !period.startDate || !period.endDate) {
      return this.commentStatuses[this.NOT_OPEN];
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startDate = new Date(period.startDate);
    const endDate = new Date(period.endDate);

    if (endDate < today) {
      return this.commentStatuses[this.CLOSED];
    } else if (startDate > today) {
      return this.commentStatuses[this.NOT_STARTED];
    } else {
      return this.commentStatuses[this.OPEN];
    }
  }

  isNotOpen(period: CommentPeriod): boolean {
    return (this.getStatus(period) === this.commentStatuses[this.NOT_OPEN]);
  }

  isClosed(period: CommentPeriod): boolean {
    return (this.getStatus(period) === this.commentStatuses[this.CLOSED]);
  }

  isNotStarted(period: CommentPeriod): boolean {
    return (this.getStatus(period) === this.commentStatuses[this.NOT_STARTED]);
  }

  isOpen(period: CommentPeriod): boolean {
    return (this.getStatus(period) === this.commentStatuses[this.OPEN]);
  }
}
