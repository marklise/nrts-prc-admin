import { Component, OnInit } from '@angular/core';
import { ApiService } from 'app/services/api';

@Component({
  selector: 'app-administration',
  templateUrl: './administration.component.html',
  styleUrls: ['./administration.component.scss']
})
export class AdministrationComponent implements OnInit {

  constructor(private api: ApiService) { }

  ngOnInit() {
  }

}
