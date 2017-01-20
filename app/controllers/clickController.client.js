(function () {
   var pollList = document.getElementById("pollList");
   var apiUrl = 'https://lewisfroom-lewisfroom.c9users.io/api/';
   
   function ajaxGet (url, callback) {
      var xmlhttp = new XMLHttpRequest();
      xmlhttp.open("GET", url, true);
      xmlhttp.onreadystatechange = function () {
         if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            callback(xmlhttp.responseText);
         }
      };
      xmlhttp.send();   
   }

   function ajaxPost (data, url, callback) {
      var xmlhttp = new XMLHttpRequest();
      xmlhttp.open("POST", url, true);
      xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      xmlhttp.onreadystatechange = function () {
         if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            callback(xmlhttp.responseText);
         }
      };
      xmlhttp.send(data);
            
   }


   var windLoc = window.location.pathname.split("/");
   var addSection = document.getElementById("addSection");
   var pollSection = document.getElementById("pollSection");
   var listSection = document.getElementById("listSection");
   //style.visibility = "visible"
   
   var loadListSection = function(){
      listSection.style.display = "inline";
      pollSection.style.display = "none";
      addSection.style.display = "none";
       ajaxGet(apiUrl + "getLength", function(resText){
         var parsedResText = JSON.parse(resText)
         for(var i = 1; i < parsedResText.dbLength + 1; i++){
            ajaxGet(apiUrl + "get/" + i, function(getResText){
            pollList.innerHTML += "<a href=\"../poll/" + JSON.parse(getResText)._id + "\"><li>" + JSON.parse(getResText).question + "</li></a>";
         });
        }
     });
   }
   
   var loadPollSection = function(){
      pollSection.style.display = "inline";
      listSection.style.display = "none";
      addSection.style.display = "none";
      var questTitle = document.getElementById("questionTitle");
      var optionsList = document.getElementById("pollOptions");
      var optionDropValue = document.getElementById("pollOptions");
      var optionSubmit = document.getElementById("pollSubmit");
      var ctx = document.getElementById("myChart").getContext("2d");
      
      // Declaring doughnut chart with blank data object
      var pollChart = new Chart(ctx, {
          type: 'doughnut',
          data: {
              labels: [],
              datasets: [{
                  label: '# of Votes',
                  data: [],
                  backgroundColor:[],
                  borderWidth: 1
              }]
          }
      });
      
      // Pushes 20 random colours to the dataset which keeps colours the same regardless of amount of updates
      for(var i = 0; i < 20; i++){
         pollChart.data.datasets[0].backgroundColor.push("rgba(" + Math.floor(Math.random() * 256) + ", " + Math.floor(Math.random() * 256) + ", " + Math.floor(Math.random() * 256) + ", 0.4)");
      }
      
      //Function to update the current poll page by GET requestion
      var updateResults = function(){
         ajaxGet(apiUrl + "get/" + windLoc[2], function(doc){
            var parsed = JSON.parse(doc);
            questTitle.innerHTML = parsed.question;
            var optionsArr = parsed.options;
            optionsList.innerHTML = "";
            pollChart.data.labels.length = 0;
            pollChart.data.datasets[0].data.length = 0;
            for(var i = 0; i < optionsArr.length; i++){
               pollChart.data.labels.push(optionsArr[i].option);
               pollChart.data.datasets[0].data.push(optionsArr[i].score);
               optionsList.innerHTML += "<option value=\"" + optionsArr[i].option + "\">" + optionsArr[i].option + "</option>";
            }
            pollChart.update();
         });
      };
      updateResults();
      // pollid, option
      optionSubmit.addEventListener("click", function(){
         ajaxPost("pollid=" + windLoc[2] + "&option=" + optionDropValue.value, apiUrl + "update", function(res){
            updateResults();
         });
      });
   };
   
   var loadAddSection = function(){
      addSection.style.display = "inline";
      pollSection.style.display = "none";
      listSection.style.display = "none";
      var subButton = document.getElementById("addSubmit");
      subButton.addEventListener('click', function () {
         var formQuestion = document.getElementsByName('question')[0].value;
         var formOptions = document.getElementsByName('options')[0].value;
         ajaxPost("question=" + formQuestion + "&options=" + formOptions, apiUrl + "add/", function(resText){
            window.location.href = "../poll/" + resText;
         });

      }, false);
   };
   
   if(window.location.pathname == "/"){
      loadListSection();
   }

   if(windLoc[1] == "poll"){
      loadPollSection();
   }
   
   
   if(windLoc[1] == "add"){
      loadAddSection();
   }
   
   
   ///LOADING POLL END

   
   
   
   
   
   
   
})();