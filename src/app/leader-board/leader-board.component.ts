import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-leader-board',
  templateUrl: './leader-board.component.html',
  styleUrls: ['./leader-board.component.scss']
})
export class LeaderBoardComponent implements OnInit {
  private default = [{name:'Amit',score:10}];
  public static data:{name:string,score:string}[] = [{name:'Amit',score:'10'},{name:'Amit',score:'85'},{name:'Amit',score:'22'}];
  constructor() { }

  ngOnInit(): void {
    LeaderBoardComponent.data.sort(function(a, b) {
      return parseFloat(b.score) - parseFloat(a.score);
  });
    //LeaderBoardComponent.data = LeaderBoardComponent.data.sort((item)=>item.score)
  }
  get staticArray() {
    return LeaderBoardComponent.data;
  }
}
