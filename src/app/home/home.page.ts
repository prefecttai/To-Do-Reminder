import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { MyModalPage } from '../modals/my-modal/my-modal.page';
import { EventModalPage } from '../event-modal/event-modal.page';
import { AlertController } from '@ionic/angular';
import { async, timer } from 'rxjs';
import { DataServiceService } from '../data-service.service';
import { Animation, AnimationController } from '@ionic/angular';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit{

  dataReturned: any;
  reminders = [];         //<-- Main array that stores all Reminders
  reminder_details = [];  //<-- temporary array used for parsing reminder details when clicking on an existing event
  dateTime: Date;         //<-- variable to retrieve and store current date and time
  reminder_dateTime = []; //<-- Stores only date and time used for the alarm timer
  reminder_scheduled = [];//<-- Stores only reminders that have a dateTime input
  reminder_id = 0;        //<-- Unique value to identify the Reminders (reminders can have same name/notes/date and priority)
  reminder_Today = [];    //<-- Stores only reminders that are due today (date is checked using dateTime variable above)
  alertPresented: any;    //<-- Alert pop-up notification when the reminder is due

  constructor(
    public modalController: ModalController,
    private dataService: DataServiceService,
    public alertController: AlertController,
  ) {
    this.alertPresented = false;
  }   

  async ngOnInit() {
    this.dataService.getData().then(
      (reminders) => {
        if (reminders) {
          this.reminders = JSON.parse(reminders);
          for (let x = 0; x < this.reminders.length; x++) {
            if (this.reminders[x].split("#@#")[2] === "undefined") {
              continue;
            }
            else {
              this.reminder_dateTime.push(this.reminders[x].split("#@#")[2]);
              this.reminder_scheduled.push(this.reminders[x]);
              let temp = this.reminders[x].split("#@#")[2];
              let temp2 = temp.split("T");
              let month = (new Date().getMonth() + 1).toString();
              if (month.length == 1) {
                month = "0" + month;
              }
              let day = (new Date().getDate()).toString();
              if (day.length == 1) {
                day = "0" + day;
              }
              let currDate = new Date().getFullYear().toString() + "-" + month + "-" + day;
              if (temp2[0] == currDate) {
                this.reminder_Today.push(this.reminders[x]);
              }
            }
          }

          this.dataService.saveData(this.reminders);
        }
        if (this.reminders == undefined) {
          this.reminders = [];
          this.dataService.saveData(reminders);
        }
      });
    //ALARM
    timer(0, 1000).subscribe(() => {
      this.dateTime = new Date();
      for (let x = 0; x < this.reminder_scheduled.length; x++) {
        let tempDate = new Date(this.reminder_scheduled[x].split("#@#")[2]);
        let date1 = this.dateTime.toString();
        let date2 = tempDate.toString();
        if (date1 === date2) { //If the date and time match, an alert popup will appear using AlertController
          this.alertReminder(this.reminder_scheduled[x]);
        }
        else {
          continue;
        }
      }
    })
  }

  /*Alarm Function */
  async Alarm() {
      let audio = new Audio();
      audio.src = "http://soundbible.com/grab.php?id=1252&type=mp3";
      audio.load();
      audio.play();
  }

  /**
   * Alert pop-up when a reminder time has reached
   * @param reminder: Reminder time reached
   */
  async alertReminder(reminder: string) {
    let vm = this;
    //vm.alertPresented is crucial for the for deciding when the alarm needs to stop
    if (!vm.alertPresented) {
    //The initial value is false, but since we called the function, we can set it to true
      vm.alertPresented = true;
      //Header and message
      const alert = await this.alertController.create({
        header: "Alert",
        message: "Hey, you have something to do!!!",
        buttons: [
          {
            text: "Dismiss",
            handler: () => { //<-- Here the handler automatically deletes the event, so when we click the button, it will update itself
              for (let a = 0; a < this.reminders.length; a++) {
                if (this.reminders[a].split("#@#")[4] == reminder.split("#@#")[4]) {
                  this.removeEvent(reminder);
                  vm.alertPresented = false; //<-- At this point, we have already updated the list, so we can set the alert to be done (set back to false)
                  break;
                }
              }
            },
          },
        ],
      });
      await alert.present();
      //Every second (1000 ms) play the alarm, but each time check if the alertPresented is false, indicating the user has press the dismiss button
      var dadada = timer(0, 1000).subscribe(() => {
        this.Alarm();
        if (vm.alertPresented == false) {
          console.log("Entered");
          dadada.unsubscribe(); //<-- Unsubscribe stops the timer() which stops the alarm
        }
      })
    }
  }
  /*Opens a pop-up to let users create a reminder event*/
  async openModal() {
    let modal = await this.modalController.create({
      component: MyModalPage,
      //backdropDismiss: false
    });
    modal.onDidDismiss().then((dataReturned) => {
      if (dataReturned !== null && dataReturned.data.split("#@#")[0] !== "undefined") {
        console.log(dataReturned.data);
        dataReturned.data = dataReturned.data + "#@#" + this.reminder_id;
        this.reminder_id++;
        let data_details = dataReturned.data.split("#@#");
        if (data_details[2] === "undefined") {
          //Ignore: It exists to allow the else function to work
        }
        else {
          this.reminder_dateTime.push(dataReturned.data.split("#@#")[2]);
          this.reminder_scheduled.push(dataReturned.data);
          let temp = dataReturned.data.split("#@#")[2];
          let temp2 = temp.split("T");
          let month = (new Date().getMonth() + 1).toString();
          if (month.length == 1) {
            month = "0" + month;
          }
          let day = (new Date().getDate()).toString();
          if (day.length == 1) {
            day = "0" + day;
          }
          let currDate = new Date().getFullYear().toString() + "-" + month + "-" + day;
          console.log(temp2[0] + "               " + currDate);
          if (temp2[0] == currDate) {
            console.log(temp2[0] + "           " + currDate);
            this.reminder_Today.push(dataReturned.data);
          }
        }
        this.reminders.push(dataReturned.data);
        this.dataService.saveData(this.reminders);
      }
    });
    return await modal.present();
  }

  /*Remove a Reminder (local array and localstorage)*/
  async removeEvent(reminder: string) {
    const id = reminder.split("#@#")[4]; //Split the string to get the id number of the reminder to delete
    for (let x = 0; x < this.reminder_scheduled.length; x++) { //<-- loop the reminder array that has date time
      if (this.reminder_scheduled[x].split("#@#")[4] == id) {
        this.reminder_dateTime.splice(x, 1); //Remove the dateTime only array to prevent false alarms
        let temp = this.reminder_scheduled[x].split("#@#")[2];
        let temp2 = temp.split("T");
        let month = (new Date().getMonth() + 1).toString();
        if (month.length == 1) {
          month = "0" + month;
        }
        let day = (new Date().getDate()).toString();
        if (day.length == 1) {
          day = "0" + day;
        }
        let currDate = new Date().getFullYear().toString() + "-" + month + "-" + day;
        console.log(temp2[0] + "               " + currDate);
        //The above code is simply pre-processing the date time format from new Date() to match the date time format of reminders array
        if (temp2[0] == currDate) {
          console.log(temp2[0] + "           " + currDate);
          //Once they match, we search the reminders for Today and if it is there, remove it
          for (let q = 0; q < this.reminder_Today.length; q++) {
            if (this.reminder_Today[q].split("#@#")[4] == id) {
              this.reminder_Today.splice(q, 1);
            }
          }
        }
        //Remove from the scheduled array
        this.reminder_scheduled.splice(x, 1);
        break;
      }
    }
    //Finally remove from the main reminders array last or else there could be complications with the reminders when refreshing page
    for (let x = 0; x < this.reminders.length; x++) {
      if (this.reminders[x].split("#@#")[4] == id) {
        this.reminders.splice(x, 1);
        break;
      }
    }
    //Here we use a service to handle all the localstorage updating (removed element)
    this.dataService.saveData(this.reminders);
  }

  /*Opens a pop-up to display reminder event details and edit them*/
  async openModalEvent(reminder: string, indexR: number) {

    this.reminder_details = reminder.split("#@#");
    const modal = await this.modalController.create({
      component: EventModalPage,
      componentProps: {
        "modalTitle": this.reminder_details[0],
        "modalNotes": this.reminder_details[1],
        "modalDate": this.reminder_details[2],
        "modalPriority": this.reminder_details[3],
        "modalID": this.reminder_details[4]
      },
      backdropDismiss: false
    });

    modal.onDidDismiss().then((dataReturned) => {
      if (dataReturned !== null) {
        console.log(dataReturned.data);
        let id = dataReturned.data.split("#@#")[4];
        let data_details = dataReturned.data.split("#@#");
        if (data_details[2] === "undefined") {
          //Ignore: It exists to allow the else function to work
        }
        else {
          for (let qwert = 0; qwert < this.reminder_scheduled.length; qwert++) {
            if (this.reminder_scheduled[qwert].split("#@#")[4] == id) {
              this.reminder_dateTime[qwert] = dataReturned.data.split("#@#")[2];
              this.reminder_scheduled[qwert] = dataReturned.data;
              break;
            }
          }
          let temp = dataReturned.data.split("#@#")[2];
          let temp2 = temp.split("T");
          let month = (new Date().getMonth() + 1).toString();
          if (month.length == 1) {
            month = "0" + month;
          }
          let day = (new Date().getDate()).toString();
          if (day.length == 1) {
            day = "0" + day;
          }
          let currDate = new Date().getFullYear().toString() + "-" + month + "-" + day;
          console.log(temp2[0] + "               " + currDate);
          if (temp2[0] == currDate) {
            console.log(temp2[0] + "           " + currDate);
            for (let qwert = 0; qwert < this.reminder_Today.length; qwert++) {
              if (this.reminder_Today[qwert].split("#@#")[4] == id) {
                this.reminder_Today[qwert] = dataReturned.data;
                break;
              }
            }
          }
        }
        for (let ass = 0; ass < this.reminders.length; ass++) {
          if (this.reminders[ass].split("#@#")[4] == id) {
            this.reminders[ass] = dataReturned.data;
            break;
          }
        }
        this.dataService.saveData(this.reminders);
      }
    });

    return await modal.present();
  }
}
