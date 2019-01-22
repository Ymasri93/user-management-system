import {Component, OnInit} from '@angular/core';
import {Group} from './models/group';
import {User} from '../users/models/user';
import {Observable} from 'rxjs';
import {UserGroupsService} from '../user-groups.service';
import {QueryDocumentSnapshot} from '@angular/fire/firestore';

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.sass']
})
export class GroupComponent {

  groupsCollection;
  users: Observable<User[]>;
  groups: Observable<Group[]>;
  selectedGroup: Group;
  deleteFailed = false;
  selectedGroupUsers: Observable<User[]>;
  addingGroup = false;

  constructor(public userGroupsService: UserGroupsService) {
    this.groupsCollection = userGroupsService.getGroupsCollection();
    this.groups = this.groupsCollection.valueChanges();
  }

  addGroup(): void {
    this.selectedGroupUsers = null;
    this.addingGroup = true;
    this.deleteFailed = false;
    this.selectedGroup = null;
  }

  onSelect(group: Group): void {
    this.deleteFailed = false;
    this.selectedGroup = group;
    this.addingGroup = false;
    this.getGroupUsers();
  }

  getGroupUsers() {
    this.selectedGroupUsers = this.userGroupsService.getGroupUsers(this.selectedGroup).valueChanges();
  }

  deleteGroup(group: Group, event) {
    event.stopPropagation();
    this.deleteFailed = false;
    this.selectedGroup = null;
    this.addingGroup = false;
    if (group.users.length === 0) {
      this.userGroupsService.deleteGroup(group);
    } else {
      this.deleteFailed = true;
    }
  }


  save(name: string): void {
    this.userGroupsService.addGroup(name);
  }

  removeFromGroup(groupID: string, user: User) {
    this.userGroupsService.removeFromGroup(groupID, user);
  }

}
