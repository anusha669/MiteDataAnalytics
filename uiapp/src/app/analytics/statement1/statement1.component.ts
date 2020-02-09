import { Component, OnInit } from '@angular/core';
import { AnalyticsService } from '../analytics.service';
import { AuthService } from 'src/app/auth/auth.service';
import { GoogleChartInterface } from 'ng2-google-charts/google-charts-interfaces';
import { ChartSelectEvent } from 'ng2-google-charts';


@Component({
  selector: 'app-statement1',
  templateUrl: './statement1.component.html',
  styleUrls: ['./statement1.component.css']
})
export class Statement1Component implements OnInit {
  academicYears: string[] = [];
  termnumbers: [] = [];
  attendance_details = [];
  public firstLevelChart: GoogleChartInterface;
  title: string;
  error_message: string
  error_flag = false
  chart_visibility = false;
  terms;
  selectedyear;
  user_info;
  selectedDept;
  showSpinner = false;
  display=false;
  testtt=false;
  subname='';
  dummy=[];
  barData=[];
  notPlaced=false;
  set_role: any = "STUDENT";
  roles = [];
  departments=[];
  faculties;
  displayFaculty=false;
  constructor(private analyticsService: AnalyticsService, private authService: AuthService) { }

  ngOnInit() {
    this.user_info = this.authService.getUserInfo()
    this.roles = this.user_info["roles"]
    this.getAptRole()
    this.get_academic_years()
    this.get_term_numbers()
    this.get_departments()
  }
  GetSortOrder(prop) {  
    return function(a, b) {  
        if (a[prop] > b[prop]) {  
            return 1;  
        } else if (a[prop] < b[prop]) {  
            return -1;  
        }  
        return 0;  
    }  
}
  getAptRole(){
    for(let r of this.roles)
    {
      if(r == "PRINCIPAL"){
        this.set_role = r;
        break;
      }
      else if(r == "HOD")
      {
        this.set_role = r;
      }
      else if(r=="FACULTY"){
        this.set_role = r;
      }
    }
    console.log(this.set_role);
  }

  get_academic_years() {
    this.analyticsService.get_academic_years().subscribe(res => {
      this.academicYears = res['acdemicYear']
    })
  }

  get_term_numbers() {
    this.analyticsService.get_term_details().subscribe(res => {
      this.termnumbers = res['term_numbers']
    }
    )
  }

  get_departments(){
    this.analyticsService.get_departments().subscribe(res=>{
      this.departments=res['departments']
    })
  }
  searchbutton() {
    this.showSpinner = true;
    this.placement();

    this.analyticsService.get_attendance_details(this.user_info['usn'], this.selectedyear, this.terms).subscribe(res => {
      this.attendance_details = res['attendance_percent']
      this.attendace_data(this.attendance_details)
    })
  }

  searchbuttonFaculty(){
    alert("Yet to be implemented")
  }

  searchbuttonHOD(){
    this.displayFaculty=true;
    let dept=this.user_info['employeeGivenId'][0]+this.user_info['employeeGivenId'][1]+this.user_info['employeeGivenId'][2]
    this.analyticsService.get_faculties(this.selectedyear, this.terms, dept).subscribe(res => {
      this.faculties = res['faculties']
      this.faculties.sort(this.GetSortOrder("name")) 
    })
  }

  searchbuttonPrincipal(){
    this.displayFaculty=true;
    this.analyticsService.get_faculties(this.selectedyear, this.terms, this.selectedDept).subscribe(res => {
      this.faculties = res['faculties']
      this.faculties.sort(this.GetSortOrder("name")) 
    })

  }

  data;
  placement()
  {
      this.analyticsService.placement(this.user_info["user"]).subscribe(res => { console.log(res)
      this.data = res;
      if(this.data.length>0)
      this.display=true;
      else
      this.notPlaced=true;
      });
  }

  attendace_data(data) {
    this.dummy=data;
    let dataTable = []
    dataTable.push([
      "CourseName",
      "IA %", { type: 'string', role: 'tooltip' } 
    ]);

    for (let i = 0; i < data.length; i += 1) {
      console.log(data[i]);
      let obt_marks:any = 0;
      // let mark_ia = [], ia_num=[],max_mark_ia=[],course_Name = [];

      for(let j = 0;j < data[i]['ia_attendance_%'].length; j += 1){
      
        obt_marks +=  data[i]['ia_attendance_%'][j]['obtainedMarks'];
      }

                    // console.log(obt_marks);
                    // dataTable.push([data[i]['courseName'],
                    // data[i]['avg_ia_score']]);
      dataTable.push([data[i]['courseName'],
      data[i]['avg_ia_score'], 
      "IA % : " + data[i]['avg_ia_score'] + "\n" +"IA marks : " + obt_marks
        ])
    }
    if (dataTable.length > 1) {
      this.chart_visibility = true
      this.error_flag = false
      this.graph_data(dataTable)
    }
    else {
      this.error_flag = true
      this.showSpinner=false
      this.error_message = "Data does not exist for the entered criteria"
    }
  }

  back_() {
    this.chart_visibility = false
  }


  graph_data(data) {
    this.showSpinner = false,
    this.testtt=true;
    this.title = 'Course-wise IA Marks',
      this.firstLevelChart = {
        chartType: "ColumnChart",
        dataTable: data,
        options: {
          bar: { groupWidth: "20%" },
          vAxis: {
            title: "Performance %",
          },

          height: 800,
          hAxis: {
            title: "Courses",
            titleTextStyle: {
            }
          },
          chartArea: {
            left: 80,
            right: 100,
            top: 100,
          },
          legend: {
            position: "top",
            alignment: "end"
          },
          seriesType: "bars",
          colors: ["789d96", "#789d96"],
          fontName: "Source Sans Pro, Helvetica Neue, Helvetica, Arial, sans-serif",
          fontSize: 13,

        }

      }
  }
  onChartSelect(event:ChartSelectEvent){
    this.barData=[];
    let arr=event.selectedRowFormattedValues;
    this.subname=arr[0];
    for(let i = 0; i < this.dummy.length; i += 1){
      if(this.subname==this.dummy[i]["courseName"]){
        for(let j=0;j<this.dummy[i]["ia_attendance_%"].length;j=j+1){
          this.barData.push(this.dummy[i]["ia_attendance_%"][j]);
        }
      }
    this.barData.sort(this.GetSortOrder("iaNumber"))  
    }
    }
}