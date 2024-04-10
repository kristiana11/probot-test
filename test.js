const tasks = {
  "Q1": {
    "metadata": {
      "title": "Exploring the GitHub World",
      "prerequisite": null
    },
    "T1": {
      "desc": "Find the issue tracker",
      "points": 20
    },
    "T2": {
      "desc": "Find the pull-request menu",
      "points": 20
    },
    "T3": {
      "desc": "Find the fork button",
      "points": 20
    },
    "T4": {
      "desc": "Find the readme file",
      "points": 20
    },
    "T5": {
      "desc": "Find the contributors",
      "points": 20
    }
  },
  "Q2": {
    "metadata": {
      "title": "Introducing yourself to the community",
      "prerequisite": "Q1"
    },
    "T1": {
      "desc": "Choose an issue that you would like to work with",
      "points": 20
    },
    "T2": {
      "desc": "Post a comment in the issue introducing yourself",
      "points": 20
    },
    "T3": {
      "desc": "Mention a contributor",
      "points": 20
    }
  },
  "Q3": {
    "metadata": {
      "title": "Making your first contribution",
      "prerequisite": "Q2"
    },
    "T1": {
      "desc": "Solve the issue (upload a file/make commit)",
      "points": 20
    },
    "T2": {
      "desc": "Submit a pull request",
      "points": 20
    },
    "T3": {
      "desc": "Post in issue asking for a review",
      "points": 20
    },
    "T4": {
      "desc": "Close the issue",
      "points": 20
    }
  }
};

function findTaskIndex(questNumber, taskNumber) {
  const quest = tasks[`Q${questNumber}`];
  if (!quest) {
    return "Quest not found";
  }
  const taskKey = `T${taskNumber}`;
  if (!quest[taskKey]) {
    return "Task not found";
  }
  return Object.keys(quest).indexOf(taskKey);
}

// Example usage:
console.log(findTaskIndex(2, 2)); // Output: 1 (Index of T2 in Q2)
console.log(findTaskIndex(1, 4)); // Output: 3 (Index of T4 in Q1)
console.log(findTaskIndex(3, 3)); // Output: 2 (Index of T3 in Q3)

console.log(Object.keys(quest).indexOf(taskKey));