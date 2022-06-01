import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
/*This service is explicitly for storing, updating and deleting data in the localStorage*/
export class DataServiceService {

  constructor(private storage: Storage) {
  }
  /*Everytime the main page is loaded, we have to call the storage.create()
   * Here we called it from the AppComponent instead of home because AppComponent is always
   * called first before any other component which is easier since it will always happen no
   * matter if the localstorage and or temporal reminder array is filled or empty
  */
  init() {
    this.storage.create();
  }
  //Returns the reminders array using key reminders
  getData() {
    return this.storage.get('reminders');
  }
  //Updates the reminders array using JSON.stringify
  saveData(reminder) {
    this.storage.set('reminders', JSON.stringify(reminder));
  }
  /*Each time we want to update the reminders array after adding, we pass the new reminder
   * call the reminders from localstorage into a const variable, push new reminder in const
   * and then update the localstorage with the new const reminders array
   */
  async addData(reminder) {
    const storedData = await this.storage.get('reminders') || [];
    storedData.push(reminder);
    return this.storage.set('reminders', storedData);
  }
  /*Given an index of the reminder, call reminers from localstorage into const variable,
  *splice based on given index and send back the updated reminders array(storedData)
  */
  async rmData(index) {
    const storedData = await this.storage.get('reminders') || [];
    storedData.splice(index, 1);
    return this.storage.set('reminders', storedData);
  }
}
