import { Component } from '@angular/core';
import { DataServiceService } from './data-service.service';
import { PlatformLocation } from '@angular/common';
import { Platform, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(private dataService: DataServiceService, private location: PlatformLocation, private modalController: ModalController) {
    this.dataService.init();
    this.location.onPopState(async () => {
      const modal = await modalController.getTop();
      if (modal) {
        modal.dismiss();
      }

      if (!window.history.state.modal) {
        const modalState = { modal: true };
        history.pushState(modalState, null);
      }
    });
  }
}
