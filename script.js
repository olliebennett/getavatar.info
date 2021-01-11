var handleGravatarResponse = function(profile) {
  var user = profile.entry[0];
  if (!user || !user.name) {
    alert('User info not found on Gravatar.');
    return;
  }
  document.getElementById('displayName').innerHTML = user.displayName;

  var displayname_fragments = user.displayName.split(" ");

  var firstname = user.name.givenName;
  if (firstname) {
    document.getElementById('firstName').innerHTML = firstname;
  } else if (displayname_fragments.length === 2) {
    firstname = displayname_fragments[0];
    document.getElementById('firstName').innerHTML = firstname + " (not found; assumed from display name)";
  } else {
    document.getElementById('firstName').innerHTML = "not found";
  }

  var lastname = user.name.familyName;
  if (lastname) {
    document.getElementById('lastName').innerHTML = lastname;
  } else if (displayname_fragments.length === 2) {
    lastname = displayname_fragments[1];
    document.getElementById('lastName').innerHTML = lastname + " (not found; assumed from display name)";
  } else {
    document.getElementById('lastName').innerHTML = "not found";
  }

  document.getElementById('preferredUsername').innerHTML = user.preferredUsername;
  document.getElementById('gravatarImage').src = user.thumbnailUrl;
  // console.log(user);
  guessEmailAddress(user.hash, user.preferredUsername, firstname, lastname);
};

if (!window.Worker) {
  alert('Your browser doesn\'t support web workers.')
}

const myWorker = new Worker("worker.js");

myWorker.onmessage = function(e) {
  console.log('Message ' + e.data[0] + ' received from worker...');
  if (e.data[0] == 'TOGGLE_LOADING') {
    var bool_result = e.data[1];
    var delay = e.data[2];
    toggleLoading(bool_result, delay);
  } else if (e.data[0] == 'DOMAIN_BEGIN_PROCESSING') {
    var domain = e.data[1];
    checksTableNewDomainRow(domain);
  } else if (e.data[0] == 'DOMAIN_CHECK_RESULT') {
    var domain = e.data[1];
    var check_slug = e.data[2];
    var success_bool = e.data[3];
    checksTableUpdateResult(domain, check_slug, success_bool);
  } else if (e.data[0] == 'MATCH_FOUND') {
    var test_email = e.data[1];
    foundMatch(test_email);
  }
}

var guessEmailAddress = function(hash, username, firstname, lastname) {
  var mailboxes = [];
  if (username) {
    username = username.toLowerCase();
    mailboxes.push(username);
  }
  if (firstname) {
    firstname = firstname.toLowerCase();
    mailboxes.push(firstname);
  }
  if (lastname) {
    lastname = lastname.toLowerCase();
    mailboxes.push(lastname);
  }

  mailboxes = mailboxes.concat(nameCombinations(firstname, lastname));

  mailboxes = mailboxes.concat(yearCombinations(mailboxes))

  // De-duplicate...
  mailboxes = uniq(mailboxes);

  // checkEmailAddresses(hash, mailboxes, primaryDomains);

  checksTableReset();

  myWorker.postMessage([hash, mailboxes, primaryDomains]);
  console.log('Worker instructed to process...');
};

var nameCombinations = function(firstname, lastname) {
  if (!firstname || !lastname) { return []; };

  var result = [];
  ['', '.', '-', '_'].forEach(function(sep) {
    result.push(firstname + sep + lastname)
    result.push(lastname + sep + firstname)
    result.push(firstname.substring(0, 1) + sep + lastname)
    result.push(firstname + sep + lastname.substring(0, 1))
  });

  return result;
};

var years = function() {
  // It's common to use birth-year, or year of email registration (i.e. up to current year)
  // ... and either in full or the last 2 digits
  var yearList = range(1980, (new Date).getFullYear()).map(function(y) { return y.toString() });
  var yearSuffixList = yearList.map(function(y) { return y.substring(2,4) });
  return yearList.concat(yearSuffixList);
}

var yearCombinations = function(nameList) {
  var result = [];
  years().forEach(function(year) {
    nameList.forEach(function(name) {
      result.push(name + year);
    });
  });

  return result;
}

// var containsYear = function(str) {
//   /[0-9]{2,4}/g.test(str);
// }

var range = function(min, max) {
  var x = [];
  for (var i=min;i<=max;i++) {
    x.push(i);
  }
  return x;
}

var uniq = function(array) {
  return array.filter(function(item, pos, self) { return self.indexOf(item) == pos; });
}

var toggleLoading = function(bool, delay) {
  var spinner = document.getElementById('loading-spinner');
  // Optionally delay stopping loader to ensure it's noticed.
  setTimeout(function() {
    spinner.style.display = (bool ? 'block' : 'none');
  }, delay ? 1000 : 0);
}

var foundMatch = function(email) {
  toggleLoading(false, true);
  var no_match = document.getElementById('no-match');
  var match = document.getElementById('match');
  var match_email = document.getElementById('match-email');
  match_email.innerHTML = email;
  no_match.style.display = 'none';
  match.style.display = 'block';
}

var getBasicInfo = function(hash) {
  if (!hash || hash === '') {
    alert('Please enter a hash first!');
    return;
  }
  var script = document.createElement('script');
  script.src = 'https://www.gravatar.com/' + hash + '.json?callback=handleGravatarResponse'
  script.onerror = function() {
    document.getElementById('gravatarImage').src = "https://secure.gravatar.com/avatar/" + hash;
    toggleUserData(true);
    alert("Failed to load details; it's likely no matching Gravatar account exists");
  }
  document.head.appendChild(script);
};

var toggleUserData = function(bool) {
  document.getElementById('userData').style.display = bool ? 'block' : 'none';
};

var checksTableReset = function() {
  toggleUserData(true);
  var checksTableBody = document.getElementById('checksTable').getElementsByTagName('tbody')[0];
  checksTableBody.innerHTML = '';
};

var checksTableNewDomainRow = function(domain) {
  var checksTableBody = document.getElementById('checksTable').getElementsByTagName('tbody')[0];

  var td0 = document.createElement("td");
  td0.innerHTML = domain;
  var td1 = document.createElement("td");
  td1.innerHTML = '...';
  td1.id = domain.replace('.', '_') + '_check1';
  var td2 = document.createElement("td");
  td2.innerHTML = '...';
  td2.id = domain.replace('.', '_') + '_check2';
  var tr = document.createElement("tr");
  tr.appendChild(td0);
  tr.appendChild(td1);
  tr.appendChild(td2);
  checksTableBody.appendChild(tr);
};

var checksTableUpdateResult = function(domain, check_slug, success_bool) {
  var el = document.getElementById(domain.replace('.', '_') + '_' + check_slug);
  el.innerHTML = success_bool ? 'FOUND' : 'no match';
};

window.addEventListener("load", function load(event){
  window.removeEventListener("load", load, false); //remove listener, no longer needed

  var form = document.getElementById('form');
  if (form) {
    form.addEventListener("submit", function(e) {
      e.preventDefault();
      var hash = document.getElementById('hash').value;
      getBasicInfo(hash);
    });
  }

  var load_sample = document.getElementById('sample-md5');
  if (load_sample) {
    var sample_md5 = 'a49dac25dce3eea611ce4475cc5e8744';
    load_sample.addEventListener('click', function(e) {
      e.preventDefault();
      document.getElementById('hash').value = sample_md5;
    });
  }

  toggleUserData(false);
  toggleLoading(false, false);
}, false);
