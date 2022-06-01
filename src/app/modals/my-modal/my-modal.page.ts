import { Component, OnInit } from '@angular/core';
import {
  ModalController,
  NavParams
} from '@ionic/angular';

@Component({
  selector: 'app-my-modal',
  templateUrl: './my-modal.page.html',
  styleUrls: ['./my-modal.page.scss'],
})
export class MyModalPage implements OnInit {
  /*All variables that were passed from the homepage from remidner_details are sent here and users can modify and these variables will be sent back*/
  modalTitle: string;
  modalNotes: string;
  modalDate: string;
  modalPriority: number;

  constructor(
    private modalController: ModalController,
    private navParams: NavParams
  ) {
    
  }

  ngOnInit() {
    console.table(this.navParams);
  }

  async closeModal() { //Notice below after each attribute is concatenated, #@# is added to differentiate each event detail (No attribute is allowed to have #@#)
    const onClosedData: string = this.modalTitle + "#@#" + this.modalNotes + "#@#" + this.modalDate + "#@#" + this.modalPriority;
    await this.modalController.dismiss(onClosedData);
  }

}
