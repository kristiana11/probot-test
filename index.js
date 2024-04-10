/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Probot} app
 */
import {questFunctions} from './src/quest.js';
import {MongoDB} from './src/database.js';

const db = new MongoDB();
await db.connect();

export default (app) => {
  // Your code here
  app.log.info("Yay, the app was loaded!");

  

  // webhooks: https://github.com/octokit/webhooks.js/#webhook-events

  // issue command
  app.on("issues.opened", async (context) => {
    const issueComment = context.issue({
      body: 'You have opened an issue, avaialble commands are: \nnew_user, creates new user\naccept <Q#>, accepts quests\n' +
            'drop, drops current quest\ndisplay, displays available quests\n',
    });
    return context.octokit.issues.createComment(issueComment);
  });
  
  app.on("issue_comment.created", async (context) => {
    // check if / command
    const comment = context.payload.comment.body;
    if(comment.startsWith('/')){
      const command = parseCommand(comment);
      const user = context.payload.comment.user.login;
      var response = '';
      var status = false;

      if (context.payload.comment.user.type === 'Bot') {
        return;
      }

      
      // detect command
      if(command) {
        switch (command.action){
          case 'accept':
            // accept
            status = await questFunctions.acceptQuest(db, user, command.argument);
            if(status){ 
              response = 'Quest ' + command.argument + ' successfully accepted!'
              await createQuestEnvironment(command.argument);
            }
            else{ response = 'Quest failed to accept, please ensure you are not already on a quest.' }
            break;
          case 'drop':
            // drop
            status = await questFunctions.removeQuest(db, user);
            if(status){ response = 'Quest successfully dropped!' }
            else{ response = 'Failed to drop quest.' }
            break;
          case 'new_user':
            // create user
            status = await db.createUser(user)
            if(status){ response = 'New user created!' }
            else{ response = 'Failed to create new user, user already exists' }
            break;
          case 'display':
            response = await questFunctions.displayQuests(db, user);
            break;
          default:
            // respond unknown command and avaialble commands
            response = 'Invalid command! Available commands: \n/new_user, creates new user\n/accept <Q#>, accepts quests\n' +
                      '/drop, drops current quest\n/display, displays available quests\n';
            break;
        }
        const issueComment = context.issue({body:response});
        await context.octokit.issues.createComment(issueComment);
      }
    }
  }


);


  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/

};

// match and break down / command 
function parseCommand(comment) {
  const  regex = /^(\/(new_user|accept|drop|display))(\s.*)?$/;
  const match = comment.match(regex);
  if (match) {
    const action = match[2];
    var argument = match[3];
    if(argument){
      argument = argument.trim()
    }
    return {action, argument};
  }
  const action = '';
  var argument = '';
  return {action, argument};
}

async function createQuestEnvironment(quest, task, context){
  // most will be creating an issue with multiple choice
  // quest 1
  if(quest === 'Q1'){ 
    // Find issue tracker
    if(task === 'T1'){
      const issueComment = context.issue({
        body: 'Where is the issue tracker tab? (Hint: you are already in it):\n'+
              '(a) The second tab on the top left when on a repo\n'+
              '(b) In the settings\n'+
              '(c) In the repo home page\n'
      });
      await context.octokit.issues.createComment(issueComment);
    }
    // find pull request menu
    else if(task === 'T2'){
      const issueComment = context.issue({
        body: 'Where is the issue pull request tab?:\n'+
              '(a) Inside an issue on the right menu\n'+
              '(b) In the insights tab\n'+
              '(c) In the repo home page\n'+
              '(d) Next to the issues tab'
      });
      await context.octokit.issues.createComment(issueComment);
    }
    // find the fork button
    else if(task === 'T3'){
      
    }
    // find the readme file

    // find the contributors
  }
    

  // quest 2
    // choose issue that you would like to work with
      // generate issues, with tags
    // assign user to work on issue
      
    // post a commnet in the issue introducing yourself

    // mention a contributor 

  // quest 3
    // solve issue (upload a file)

    // submit pull request

    // post in the issue askingfor someone to review

    // close issue
}

async function validateTask(quest, task, db, context, issue_num){
  // quest 1
    // Find issue tracker
      // check issue tracker title
    // find pull request menue
      // check pull request title
    // find the fork button
      // on fork or multiple choice
    // find the readme file
      // check issue num
    // find the contributors
      // check for valid contributor name

  // quest 2
    // choose issue that you would like to work with
      // check for reply
    // assign user to work on issue
      // check for user assign
    // post a commnet in the issue introducing yourself
      // check for comment contains hello or hi or name
    // mention a contributor 
      // check issue for mention of a contributor
  // quest 3
    // solve issue (upload a file)
      // check for a push, commit of a file
    // submit pull request
      // check for PR
    // post in the issue asking for someone to review
      // check for issue comment 
    // close issue
      // check for issue delete
}