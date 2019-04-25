/*
Author: Nikita Lisnyak
mackuta@gmail.com
https://linkedin.com/in/uber1337

Copy and paste it in dev tools console input.
*/


// set cookies
function setCookie({ name, value, days }) {
  const d = new Date();
  d.setTime(d.getTime() + 24 * 60 * 60 * 1000 * days);
  document.cookie = `${name}=${value};path=/;expires=${d.toGMTString()}`;
}

// get cookie and if needed - parse it
function getCookie({ name, json }) {
  const v = document.cookie.match(`(^|;) ?${name}=([^;]*)(;|$)`);
  if (json) {
    return v ? JSON.parse(v[2]) : null;
  }
  return v ? v[2] : null;
}
// Add flight search to cookies
function addFlightSearch({ value, searches, max }) {
  if (searches) {
    // not allow to add same searches
    const ifPresent = searches.some(e => ((e.to === value.to && e.from === value.from)));
    if (ifPresent) {
      return searches;
    }
    const [...data] = searches;
    data.unshift(value);
    return data.slice(0, max);
  }
  return [value];
}

function addEventHandler({
  event, eventType, language, searches, departure, arrival,
}) {
  if (eventType === 'keydown' && event.which !== 13) {
    return;
  }
  const value = {
    from: departure.value,
    to: arrival.value,
  };
  // add only full data
  if (value.from && value.to) {
    const data = addFlightSearch({ searches, value, max: 3 });
    setCookie({ name: `searches${language}`, value: JSON.stringify(data), days: 1 });
  }
}


const language = getCookie({ name: 'sitelang' });
const allowedLanguages = ['/nl-NL/', '/en-NL/'];
// Injection allowed only on 2 language settings. They have separate cookies because of different namings of flights
if (allowedLanguages.includes(language)) {
  // get search history
  const searches = getCookie({ name: `searches${language}`, json: true });
  // arrival and departure inputs elements and search button element
  const arrival = $('#routeSelection_ArrivalStation-input')[0];
  const departure = $('#routeSelection_DepartureStation-input')[0];
  const searchButton = $('#desktop > section > div.panel_section.panel_section--button > div > button')[0];
  const nodeSibling = $('#desktop > section > div.panel_section.panel_section--secondary.panel_section--photography.panel_section--content-button.padding-top-1rem > div:nth-child(3)')[0];
  const mainDivClass = 'HV-gs--bp0';
  const labelClass = 'h6';
  const textFieldClass = 'textfield';


  // add to search list after "search" button is pressed or "enter" key is pressed on one of the inputs

  arrival.addEventListener('keydown', (event) => {
    addEventHandler({
      language, searches, departure, arrival, event, eventType: 'keydown',
    });
  });
  departure.addEventListener('keydown', (event) => {
    addEventHandler({
      language, searches, departure, arrival, event, eventType: 'keydown',
    });
  });
  searchButton.addEventListener('click', (event) => {
    addEventHandler({
      language, searches, departure, arrival, event, eventType: 'click',
    });
  });

  if (searches) {
    // trying to mimic nearby components
    const mainDiv = document.createElement('div');
    mainDiv.classList.add(mainDivClass);
    const label = document.createElement('label');
    label.classList.add(labelClass);
    label.innerHTML = 'Recent searches';
    mainDiv.appendChild(label);
    const textField = document.createElement('div');
    textField.classList.add(textFieldClass);
    searches.forEach((item) => {
      const input = document.createElement('input');
      input.style.cursor = 'pointer';
      input.type = 'button';
      input.style.background = 'white';
      input.style.marginBottom = '5px';
      input.addEventListener('click', () => {
        const xpathTo = `//li[contains(text(),'${item.to}')]`;
        const xpathFrom = `//li[contains(text(),'${item.from}')]`;
        // because just regular value change and 'change' event triggering not changed much - I've decided to use more clunky solution
        arrival.click();
        document.evaluate(xpathTo, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.click();
        departure.click();
        document.evaluate(xpathFrom, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.click();
      });
      // populate 'Recent searches' block
      textField.appendChild(input);
      input.value = `${item.from} to ${item.to}`;
      mainDiv.appendChild(textField);
    });
    // add 'Recent searches' block next to sibling
    nodeSibling.parentNode.insertBefore(mainDiv, nodeSibling.nextSibling);
  }
}

