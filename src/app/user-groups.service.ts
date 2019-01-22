import {Injectable} from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {User} from './users/models/user';
import {Group} from './group/models/group';

@Injectable({
  providedIn: 'root'
})
export class UserGroupsService {

  constructor(public db: AngularFirestore) {
  }

  private guid() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }

    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  }

  public addUser(name: string) {
    const newUser: User = {id: this.guid(), name: name, groups: []};
    this.getUsersCollection().add(newUser);
  }


  public deleteUser(user: User) {
    this.getUsersCollection().ref.get().then((next) => {
      const filteredUsers = next.docs.filter(doc => user.id === doc.get('id'));
      if (filteredUsers[0]) {
        filteredUsers[0].ref.delete();
      }
    });
    this.db.collection('Groups/', ref => ref.where('users', 'array-contains', user.id)).ref.get()
      .then(next => next.docs.forEach((doc) => {
        const group = doc.data();
        const users = group.users.filter(userID => userID !== user.id);
        doc.ref.update({users});
      }));
  }

  public deleteGroup(group: Group) {
    if (group.users.length === 0) {
      this.getGroupsCollection().ref.get().then((next) => {
        const filteredGroups = next.docs.filter(doc => group.id === doc.get('id'));
        if (filteredGroups[0]) {
          filteredGroups[0].ref.delete();
        }
      });
    }
  }

  public addGroup(name: string) {
    const newGroup: Group = {id: this.guid(), name: name, users: []};
    this.getGroupsCollection().add(newGroup);
  }

  public getUsersCollection() {
    return this.db.collection('Users/');
  }


  public getUserGroups(user: User) {
    return this.db.collection<Group>('Groups/', ref => ref.where('users', 'array-contains', user.id));
  }

  public getGroupUsers(group: Group) {
    return this.db.collection<User>('Users/', ref => ref.where('groups', 'array-contains', group.id));
  }

  public getGroupsCollection() {
    return this.db.collection('Groups/');
  }

  public assignUser(user, groupId) {
    this.db.collection('Users/').ref
      .get().then((next) => {
      const userDoc = next.docs.filter(doc => doc.get('id') === user.id)[0];
      const groups = user.groups;
      if (user.groups.indexOf(groupId) <= -1) {
        groups.push(groupId);
        this.db.collection('Users/').doc(userDoc.id).update({groups});
      }
    });

    this.db.collection('Groups/').ref
      .get().then((next) => {
      const groupDoc = next.docs.filter(doc => doc.get('id') === groupId)[0];
      const group = groupDoc.data();
      const users = group.users;
      if (group.users.indexOf(user.id) <= -1) {
        users.push(user.id);
        this.db.collection('Groups/').doc(groupDoc.id).update({users});
      }
    });
  }

  public removeFromGroup(groupID: string, user: User) {
    this.db.collection('Groups/').ref.get()
      .then((next) => {
        const groupDoc = next.docs.filter(doc => doc.get('id') === groupID)[0];
        const group = groupDoc.data();
        const users = group.users.filter(userID => userID !== user.id);
        this.db.collection('Groups/').doc(groupDoc.id).update({users});
      });

    this.db.collection('Users/').ref.get()
      .then((next) => {
        const userDoc = next.docs.filter(doc => doc.get('id') === user.id)[0];
        console.log(userDoc);
        const groups = user.groups.filter(groupid => groupid !== groupID);
        this.db.collection('Users/').doc(userDoc.id).update({groups});
      });
  }

}
