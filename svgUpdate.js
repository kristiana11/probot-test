function updateBars(progress, streak, questsCompleted) {
    
   // Load the SVG file using AJAX
   const xhr = new XMLHttpRequest();
   xhr.open('GET', 'userStats.svg', true);
   
   xhr.onreadystatechange = function () {
       if (xhr.readyState === 4 && xhr.status === 200) {
           const svgDoc = xhr.responseXML;

           // Get the progress bar element
           const progressBar = svgDoc.querySelector('.currentProgressBar');

           // Get the streak bar element
           const streakBar = svgDoc.querySelector('.streakBar');
           
           // Get the quests completed bar element
           const questsCompletedBar = svgDoc.querySelector('.questsCompletedBar');

           // Update the width of the current progress bar if progress is not null
           if (progress !== null) {
               progressBar.setAttribute('width', progress + '%');
           }

           // Update the width of the streak bar if streak is not null
           if (streak !== null) {
               streakBar.setAttribute('width', streak + '%');
           }

           // Update the width of the quests completed bar if questsCompleted is not null
           if (questsCompleted !== null) {
               questsCompletedBar.setAttribute('width', questsCompleted + '%');
           }
       }
   };
   xhr.send();
}