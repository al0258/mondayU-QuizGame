import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { interval } from 'rxjs';
import { LeaderBoardComponent } from '../leader-board/leader-board.component';
import { QuestionService } from '../service/question.service';

@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.scss'],
})
export class QuestionComponent implements OnInit {
  public name: string = '';
  public questionList: any = [];
  public incorrectAnswers: any = [];
  public currentQuestion: number = 0;
  public points: number = 0;
  counter = 60;
  correctAnswers: number = 0;
  wrongAnswers: number = 0;
  interval$: any;
  data: any;
  progress: string = '0';
  isQuizCompleted: boolean = false;
  fiftyFiftyOption: boolean = false;
  fiftyFiftyUsed: boolean = false;
  theCategoryName = 'any';
  public static categoryID: number = 1;
  public static categoryName: string = 'Any';
  urlAPI: string = 'https://opentdb.com/api.php?amount=20';

  constructor(
    private questionService: QuestionService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.name = localStorage.getItem('name')!;
    this.theCategoryName = QuestionComponent.categoryName;
    this.generateURL();
    this.getAllQuestions();
    this.startCounter();
  }
  generateURL() {
    if (QuestionComponent.categoryID != 1) {
      this.urlAPI =
        this.urlAPI + '&category=' + QuestionComponent.categoryID.toString();
    }
    console.log(this.urlAPI);
  }
  getAllQuestions() {
    this.http.get(this.urlAPI).subscribe((res: Record<string, any>) => {
      //We take the data we need from the questions API
      this.data = res['results'].map((item: Record<string, any>) => {
        this.incorrectAnswers.push(item['incorrect_answers'][0]);
        let answers = item['incorrect_answers'];
        answers.push(item['correct_answer']);
        //This is where we shuffle all the answers
        answers = this.shuffle(answers);

        let correctAnswer = item['correct_answer'];
        let question = item['question'];

        //Dealing with special characters
        question = this.decodeHtml(question);
        correctAnswer = this.decodeHtml(correctAnswer);
        for (var i = 0; i < answers.length; i++) {
          answers[i] = this.decodeHtml(answers[i]);
        }
        
        return { question, correctAnswer, answers };
      });
      console.log(this.data);
      this.questionList = this.data;
    });
  }

  shuffle(array: []) {
    let currentIndex = array.length,
      randomIndex;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex],
      ];
    }

    return array;
  }

  nextQuestion() {
    this.fiftyFiftyOption = false;
    this.fiftyFiftyUsed = false;
    this.currentQuestion++;
    this.getProgressPercent();
  }

  previousQuestion() {
    this.fiftyFiftyOption = false;
    this.fiftyFiftyUsed = false;
    this.currentQuestion--;
    this.getProgressPercent();
  }

  fiftyFifty() {
    let newAnswers: any = [];
    newAnswers.push(
      this.incorrectAnswers[this.currentQuestion]
    );
    newAnswers.push(
      this.questionList[this.currentQuestion]['correctAnswer']
    );
    newAnswers = this.shuffle(newAnswers);
    this.fiftyFiftyOption=false;
    this.fiftyFiftyUsed=true;
    
    this.data[this.currentQuestion]['answers'] = newAnswers;
  }

  isAnswerTrue(currentQue: number, option: any) {
    if (option === this.questionList[this.currentQuestion]['correctAnswer']) {
      return true;
    } else {
      return false;
    }
  }
  isLastQuestion(currentQue: number) {
    if (currentQue === this.questionList.length) {
      return true;
    } else {
      return false;
    }
  }

  decodeHtml(html:string) {
    //This function handles special characters
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}
  answer(currentQue: number, option: any) {
    //This function goes to the next stage in the game (whether its the game ending
    //or moving to the next question)
    console.log(this.questionList[this.currentQuestion]);
    console.log(option);
    if (this.isAnswerTrue(currentQue, option)) {
      console.log('correct');
      if (this.fiftyFiftyUsed) {
        this.points += 5;
        this.fiftyFiftyUsed=false;
      } else {
        this.points += 10;
      }
      this.correctAnswers++;
      setTimeout(() => {
        this.currentQuestion++;
      }, 400);
    } else {
      console.log('incorrect');
      this.points -= 10;
      setTimeout(() => {
        this.wrongAnswers++;
        this.currentQuestion++;
      }, 400);
    }
    if (this.isLastQuestion(currentQue)) {
      this.stopCounter();
      //Add the player to the leaderboard
      LeaderBoardComponent.data.push({
        name: this.name,
        score: this.points.toString(),
      });
      this.isQuizCompleted = true;
    } else {
      this.resetCounter();
    }
    this.getProgressPercent();
  }
  startCounter() {
    //The function starts the timer at 60 seconds
    this.interval$ = interval(1000).subscribe((val) => {
      this.counter--;
      if (this.counter === 30) {
        this.fiftyFiftyOption = true;
      }
      if (this.counter === 0) {
        this.currentQuestion++;
        this.counter = 60;
        this.points -= 10;
        this.getProgressPercent();
      }
    });
    setTimeout(() => {
      //If the user hasn't responded for 10 minutes, the timer stops.
      this.interval$.unsubscribe();
    }, 6000000);
  }
  stopCounter() {
    //The function stops the counter
    this.interval$.unsubscribe();
    this.counter = 0;
  }
  resetCounter() {
    //The function resets the counter at 60 seconds
    this.stopCounter();
    this.counter = 60;
    this.startCounter();
  }
  resetQuiz() {
    //The function resets the quiz
    this.resetCounter();
    this.getAllQuestions();
    this.points = 0;
    this.counter = 60;
    this.currentQuestion = 0;
    this.fiftyFiftyOption=false;
    this.progress = '0';
  }
  getProgressPercent() {
    //The function gets the progress percentge for the progress bar on the page
    this.progress = (
      (this.currentQuestion / this.questionList.length) *
      100
    ).toString();
    return this.progress;
  }
}
