import { Component, OnInit } from '@angular/core';
import { HomePage } from '../home/home.page';
import {
  ModalController,
  NavParams
} from '@ionic/angular';

@Component({
  selector: 'app-event-modal',
  templateUrl: './event-modal.page.html',
  styleUrls: ['./event-modal.page.scss'],
})
export class EventModalPage implements OnInit {
  //Everything is exactly the same since we pass the reminder details and allow user input to change it
  reminders: HomePage["reminders"];
  modalTitle: string;
  modalNotes: string;
  modalDate: string;
  modalPriority: number;
  modalID: number;

  constructor(
    private modalController: ModalController,
    private navParams: NavParams
  ) { }

  ngOnInit() {
    console.table(this.navParams);
  }

  async getUpdatedReminder() { //The formatting is the same as the create reminder modal page
    const onClosedData: string = this.modalTitle + "#@#" + this.modalNotes + "#@#" + this.modalDate + "#@#" + this.modalPriority + "#@#" + this.modalID;
    await this.modalController.dismiss(onClosedData);
  }

  //A cancel button to not make any changes
  async CancelReminder() {
    await this.modalController.dismiss();
  }
}
