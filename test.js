import { parse } from "dotenv";

/*import { MongoDB } from './src/database.js';
import { acceptQuest, removeQuest, completeQuest, completeTask, displayQuests } from './src/quest.js';



const db = new MongoDB();

await db.connect();
// await db.createUser("testUser");
await acceptQuest(db, "testUser", "Q1");

await db.closeConnection();
*/
/*
const comment = '/accept'

const command = parseCommand(comment);
console.log(command);
if(command){
    console.log(command.action);
    console.log(command.argument);
}

function parseCommand(comment) {
    console.log(comment);
    const  regex = /^(\/(new_user|accept|drop|display|check))(\s.*)?$/;
    const match = comment.match(regex);
    if (match) {
      const action = match[2];
      const argument = match[3];
      return {action, argument};
    }
    // no match
    return null;
  }
*/