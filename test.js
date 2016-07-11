window.addEventListener("load", function load(event){
  window.removeEventListener("load", load, false); //remove listener, no longer needed

  var testform = document.getElementById('testform');
  if (testform) {
    testform.addEventListener("submit", function(e) {
      e.preventDefault();
      var testData = document.getElementById('testdata').value;
      processTestData(testData);
    });
  }
}, false);

var processTestData = function(testData) {
  var resultsDiv = document.getElementById('results');
  console.log(testData);
  var testUsers = testData.split("\n");
  console.log('Test Users', testUsers);
  var matches = 0;
  testUsers.forEach(function(testUser) {
    var testUserData = testUser.split(',');
    var email = testUserData[0];
    var hash = MD5(email);
    var firstName = testUserData[1];
    var lastName = testUserData[2];
    console.log("Processing " + email);
    var match = guessEmailAddress(hash, false, firstName, lastName);
    if (match) {
      var newElement = '<tr><td>' + !!match + '</td><td>' + firstName + ' ' + lastName + '</td><td>' + email + '</td></tr>';
      resultsDiv.insertAdjacentHTML('beforeend', newElement);
      matches++;
    }
  });
  alert("Total matches: " + matches + '/' + testUsers.length + ' = ' + 100 * matches / testUsers.length + '%');
};
