import fs from 'fs';
const questFilePath = './src/available-quests.json';



async function acceptQuest(db, user, quest) {

    try {
        const quests = JSON.parse(fs.readFileSync(questFilePath, 'utf8'));
        if (quest in quests) {
            const user_data = await db.downloadUserData(user);

            if (!user_data.user_data.accepted) {
                user_data.user_data.accepted = {};
            }

            if (!Object.keys(user_data.user_data.accepted).length) {
                user_data.user_data.accepted[quest] = {};
                for (const task in quests[quest]) {
                    if (task !== 'metadata') {
                        user_data.user_data.accepted[quest][task] = { completed: false };
                    }
                }
                await db.updateData(user_data);
                return true;
            } else {
                // may later need to implement reason for false, like already accepted 
                return false;
            }
        } else {
            return false;
        }
    } catch (error) {
        console.error('Error accepting quest:', error);
        return false;
    }
}

async function removeQuest(db, user) {
    try {
        const user_data = await db.downloadUserData(user);
        if (user_data.user_data.accepted) {
            delete user_data.user_data.accepted;
            await db.updateData(user_data);
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error('Error removing quest:', error);
        return false;
    }
}

async function completeQuest(db, user, quest) {
    try {
        const user_data = await db.downloadUserData(user);

        if (user_data.user_data.accepted && user_data.user_data.accepted[quest]) {
            const tasks_completed = Object.values(user_data.user_data.accepted[quest]).every(task => task.completed);

            if (tasks_completed) {
                delete user_data.user_data.accepted[quest];
                if (!user_data.user_data.completed) {
                    user_data.user_data.completed = [];
                }
                user_data.user_data.completed.push(quest);
                await db.updateData(user_data);
                return true; // Quest successfully completed
            }
        }
        return false; // Quest not completed
    } catch (error) {
        console.error('Error completing quest:', error);
        return false;
    }
}

async function completeTask(db, user, quest, task) {
    try {
        const quests = JSON.parse(fs.readFileSync(questFilePath, 'utf8'));
        const user_data = await db.downloadUserData(user);

        const points = quests[quest][task].points;
        console.log(`User got ${points} points`);

        if (user_data.user_data.accepted && user_data.user_data.accepted[quest] && user_data.user_data.accepted[quest][task]) {
            user_data.user_data.accepted[quest][task].completed = true;
            user_data.user_data.points += points; // Assuming there is a 'points' field
            await db.updateData(user_data);
            return true; // Task completed
        }
        return false; // Task not completed
    } catch (error) {
        console.error('Error completing task:', error);
        return false;
    }
}

async function displayQuests(db, user) {
    try {
        const quests = JSON.parse(fs.readFileSync(questFilePath, 'utf8'));
        const user_data = await db.downloadUserData(user);

        if (!user_data) {
            return 'Please comment /new to create user';
        } else {
            const completed_quests = user_data.user_data.completed || [];
            let response = 'Available quests:\n';
            for (const [questId, questData] of Object.entries(quests)) {
                if (!completed_quests.includes(questId)) {
                    response += `${questId}: ${questData.metadata.title}\n`;
                }
            }
            
            return response + 'Please respond with /accept <Q# --> corresponding quest number>';
        }
    } catch (error) {
        console.error('Error displaying quests:', error);
        return;
    }
}

export const questFunctions = {
    acceptQuest,
    removeQuest,
    completeQuest,
    completeTask,
    displayQuests
  };