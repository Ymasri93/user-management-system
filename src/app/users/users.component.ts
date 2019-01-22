import {Component, OnInit} from '@angular/core';
import {User} from './models/user';
import {Observable} from 'rxjs';
import {UserGroupsService} from '../user-groups.service';
import {Group} from '../group/models/group';
import {QueryDocumentSnapshot} from '@angular/fire/firestore';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.sass']
})
export class UsersComponent {
  usersCollection;
  groupsCollection;
  users: Observable<User[]>;
  groups: Observable<Group[]>;
  selectedUser: User;
  selectedUserGroups: Observable<Group[]>;
  addingUser = false;

  constructor(public userGroupsService: UserGroupsService) {
    this.usersCollection = userGroupsService.getUsersCollection();
    this.users = this.usersCollection.valueChanges();
  }

  addUser(): void {
    this.selectedUserGroups = null;
    this.addingUser = true;
    this.selectedUser = null;
  }

  onSelect(user: User): void {
    this.selectedUser = user;
    this.addingUser = false;
    this.groupsCollection = this.userGroupsService.getGroupsCollection();
    this.groups = this.groupsCollection.valueChanges();
    this.getUserGroups();
  }

  getUserGroups() {
    this.selectedUserGroups = this.userGroupsService.getUserGroups(this.selectedUser).valueChanges();
  }

  deleteUser(user: User, event) {
    event.stopPropagation();
    this.selectedUser = null;
    this.addingUser = false;
    this.userGroupsService.deleteUser(user);
  }

  assignUser(user: User, groupId) {
    this.userGroupsService.assignUser(user, groupId);
    this.getUserGroups();
  }

  save(name: string): void {
    this.userGroupsService.addUser(name);
  }

  removeFromGroup(groupID: string, user: User) {
    this.userGroupsService.removeFromGroup(groupID, user);
  }
}
