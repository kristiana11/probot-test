import { MongoDB } from './src/database.js';
import { acceptQuest, removeQuest, completeQuest, completeTask, displayQuests } from './src/quest.js';



const db = new MongoDB();

await db.connect();
// await db.createUser("testUser");
await acceptQuest(db, "testUser", "Q1");

await db.closeConnection();