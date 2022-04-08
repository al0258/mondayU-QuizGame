import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { QuestionComponent } from '../question/question.component';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit {
  @ViewChild('name') nameKey!: ElementRef;
  constructor(private http: HttpClient) { }
  data: any;
  catNumber:number = 1;
  catName:string = 'any';
  ngOnInit(): void {
    this.getAllCategories()
  }
  startQuiz(){
    localStorage.setItem("name", this.nameKey.nativeElement.value);
    QuestionComponent.categoryID = this.catNumber;
    QuestionComponent.categoryName = this.catName;
  }
  getAllCategories() {
    this.http
      .get('https://opentdb.com/api_category.php')
      .subscribe((res: Record<string, any>) => {
        //We take the data we need from the questions API
        this.data = res['trivia_categories'].map((item: Record<string, any>) => {
          let categoryId = item['id'];
          let categoryName = item['name'];
          return { categoryId, categoryName };
        });
        console.log(this.data);
      });
  }
  categoryChoose(cat:number, name:string){
    this.catNumber = cat;
    this.catName = name;
    let element = document.querySelector("#dropdownMenuButton1");
    element!.textContent = name;
    console.log(element);
    
  }
  
}
