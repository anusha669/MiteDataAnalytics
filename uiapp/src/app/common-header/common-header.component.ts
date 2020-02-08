import { Component, OnInit } from '@angular/core';
import { CommonHeaderService } from './common-header.service';
import { AppComponent } from '../app.component';
import { AuthService } from '../auth/auth.service';
declare var $:any;
@Component({
  selector: 'app-common-header',
  templateUrl: './common-header.component.html',
  styleUrls: ['./common-header.component.css']
})
export class CommonHeaderComponent implements OnInit {
  session: any;
  currentRole: string;
  roles: any[];
  tenantName: string;
  user;
  anotherRole = false;
  role;
  constructor(public commonHeaderService: CommonHeaderService, private appComponent: AppComponent,private authService:AuthService) { }

  ngOnInit() {
    this.authService.tanentDetails.subscribe(name => this.tenantName = name);

    
    this.user = this.authService.getUserInfo();
    console.log("User infor"+this.user['user']);
    if(this.user['roles'].length==1)
this.role=this.user['roles'];
else
this.role=this.user['roles'][2];

    
   
  }

  logOut(){
    this.authService.logout();
    this.tenantName = "";
  }

  changeRole(role: string) {

  }

  resize() {
    if($('.sidebar-mini').hasClass('sidebar-collapse')) {
      $('.sidebar-mini').removeClass('sidebar-collapse')
    } else {
      $('.sidebar-mini').addClass('sidebar-collapse')
    }
  }
}
