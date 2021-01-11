var handleGravatarResponse = function(profile) {
  var user = profile.entry[0];
  if (!user || !user.name) {
    alert('User info not found on Gravatar.');
    return;
  }
  document.getElementById('displayName').innerHTML = user.displayName;
  document.getElementById('preferredUsername').innerHTML = user.preferredUsername;
  document.getElementById('gravitarImage').src = user.thumbnailUrl;
  guessEmailAddress(user.hash, user.preferredUsername, user.name.givenName, user.name.familyName);
};

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

  mailboxes.concat(nameCombinations(firstname, lastname));

  mailboxes.concat(yearCombinations(mailboxes))

  // De-duplicate...
  mailboxes = uniq(mailboxes);

  return checkEmailAddresses(hash, mailboxes, primaryDomains);
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

var checkEmailAddresses = function(hash, mailboxes, domains) {
  toggleLoading(true, false);
  checksTableReset();
  // Try every combination of mailbox@domain
  var mailboxes_count = mailboxes.length;
  var domains_count = domains.length;
  for (var d = 0; d < domains_count; d++) {
    var domain = domains[d];
    checksTableNewDomainRow(domain);
    for (var m = 0; m < mailboxes_count; m++) {
      var mailbox = mailboxes[m];
      var test_email = mailbox + '@' + domain;
      var test_hash = MD5(test_email);
      if ((m * d) % 1000 === 0) {
        console.log("Testing email: " + test_email);
      }
      if (test_hash == hash) {
        foundMatch(test_email);
        toggleLoading(false, false);
        checksTableUpdateResult(domain, 'check1', true);
        checksTableUpdateResult(domain, 'check2', true);
        return test_email;
      }
    };
    checksTableUpdateResult(domain, 'check1', false);
    checksTableUpdateResult(domain, 'check2', false);
  };

  toggleLoading(false, true);

  return null; // no match :(
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
  document.head.appendChild(script);
};

var checksTableReset = function() {
  document.getElementById('userData').style.display = 'block';
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

  document.getElementById('userData').style.display = 'none';
  toggleLoading(false, false);
}, false);
