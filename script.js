// =======================
//      Html elements
// ======================

// Fontawesome icons
const fontawesomeIcons = {
  state: '<i title="State" class="fas fa-map-marker-alt"></i>',
  city: '<i title="City" class="fas fa-city"></i>',
  phone: '<i title="Phone" class="fas fa-phone-alt"></i>',
  breweryType: '<i title="Brewery type" class="fas fa-beer"></i>',
  street: '<i title="Street" class="fas fa-road"></i>',
  heart: '<i title="Heart" class="fas fa-heart"></i>',
  website: '<i title="Website" class="fas fa-globe"></i>',
  spinner: '<i class="fas fa-spinner fa-spin"></i>'
};

// Breweries list elements
const resultsUlElement = document.getElementById('results-list');
const favouriteUlElement = document.getElementById('favourite-list');
const selectStateElement = document.getElementById('select-state');
const selectCityElement = document.getElementById('select-city');
const favouriteCountElement = document.getElementById('favourite-count');

// Form elements
const contactForm = document.getElementById('contact-form');
const nameInputElement = document.getElementById('name-input');
const emailInputElement = document.getElementById('email-input');
const stateInputElement = document.getElementById('state-input');
const cityInputElement = document.getElementById('city-input');
const phoneInputElement = document.getElementById('phone-input');
const messageInputElement = document.getElementById('message-input');
const fieldsetElement = document.getElementById('contact-fieldset');
const successSubmitMessageElement = document.getElementById('success-submit-msg');

// =======================
//      App state
// ======================

const GetMeeBeerApp = {};

GetMeeBeerApp.breweriesResults = [];

GetMeeBeerApp.likedBreweries = [];

GetMeeBeerApp.selectedCity = null;

GetMeeBeerApp.selectedState = null;

GetMeeBeerApp.formData = {
  name: '',
  email: '',
  state: '',
  city: '',
  message: '',
};

// ==================
//       Methods
// ==================

GetMeeBeerApp.init = () => {
  GetMeeBeerApp.validateFormOnSubmit();

  GetMeeBeerApp.showHelperMessage('Please select a state to see your list of Breweries');

  // State Dropdown
  selectStateElement.addEventListener('change', (event) => {
    const selectedStateValue = event.target.value;

    GetMeeBeerApp.fetchBreweriesByState(selectedStateValue);
  });

  // City Dropdown
  selectCityElement.addEventListener('change', (event) => {
    const selectedCityValue = event.target.value;

    GetMeeBeerApp.filterBreweriesByCity(selectedCityValue);
  });

  // ------- This events listeners are waiting for a  click in the "Add" button -------

  // Results list
  resultsUlElement.addEventListener('click', (event) => {
    const target = event.target;

    if (target.tagName === 'BUTTON' || target.parentNode.tagName === 'BUTTON') {
      const breweryCardId = target.dataset.breweryid || target.parentNode.dataset.breweryid;

      GetMeeBeerApp.addBreweryTofavouriteList(Number(breweryCardId));
    }
  });

  // favourite list
  favouriteUlElement.addEventListener('click', (event) => {
    const target = event.target;

    if (target.tagName === 'BUTTON' || target.parentNode.tagName === 'BUTTON') {
      const breweryCardId = target.dataset.breweryid || target.parentNode.dataset.breweryid;

      GetMeeBeerApp.removeBreweryFromfavouriteList(Number(breweryCardId));
    }
  });
};

GetMeeBeerApp.createBreweryCard = (breweryData) => {
  return `
  <article id="${breweryData.id}" class="brewery-card">
    <ul class="brewery-card__content">
      <li class="brewery-card__content__item brewery-card__content__name">
        ${breweryData.name}
      </li>

      ${breweryData.state ?
        `<li class="brewery-card__content__item">
          ${fontawesomeIcons.state}
          <span>${breweryData.state}</span>
         </li>` : ''
        }

      ${breweryData.city ?
        `<li class="brewery-card__content__item">
          ${fontawesomeIcons.city}
          <span>${breweryData.city}</span>
         </li>` : ''
        }

      ${breweryData.street ?
        `<li class="brewery-card__content__item">
          ${fontawesomeIcons.street}
          <span>${breweryData.street}</span>
         </li>` : ''
        }

      ${breweryData.phone ?
        `<li class="brewery-card__content__item">
          ${fontawesomeIcons.phone}
          <span>${breweryData.phone}</span>
         </li>` : ''
        }

      ${breweryData.brewery_type ?
        `<li class="brewery-card__content__item">
          ${fontawesomeIcons.breweryType}
          <span>${breweryData.brewery_type}</span>
         </li>` : ''
        }
    </ul>

    <div class="brewery-card__actions">
      <button data-breweryid="${breweryData.id}" class="brewery-card__actions__like-btn ${breweryData.liked ? 'active' :''}">
        ${fontawesomeIcons.heart}
        <span>${breweryData.liked ? 'Remove' :'Add'}</span>
      </button>

      ${breweryData.website_url ?
        `<a href="${breweryData.website_url}" target="_blank" rel="noopener noreferrer" class="website">
          ${fontawesomeIcons.website}
          <span>Website</span>
         </a>` : ''
        }
    </div>
  </article>
`
};

GetMeeBeerApp.addBreweryTofavouriteList = (id) => {
  const isPresent = GetMeeBeerApp.likedBreweries.some(brewery => brewery.id === id);

  const favouriteBreweriesCount = GetMeeBeerApp.likedBreweries.length;

  if (!isPresent && favouriteBreweriesCount < 5) {
    const likedBrewery = GetMeeBeerApp.breweriesResults.filter(brewery => brewery.id === id)[0];

    const likedBreweryCardData = {
      ...likedBrewery,
      liked: true
    };

    GetMeeBeerApp.likedBreweries.unshift(likedBreweryCardData);

    favouriteCountElement.textContent = `${GetMeeBeerApp.likedBreweries.length}/5`;

    GetMeeBeerApp.updatefavouriteList(GetMeeBeerApp.likedBreweries);
  }
};

GetMeeBeerApp.removeBreweryFromfavouriteList = (id) => {
  const updatedfavouriteList = GetMeeBeerApp.likedBreweries.filter(item => item.id !== id);
  GetMeeBeerApp.likedBreweries = updatedfavouriteList;
  favouriteCountElement.textContent = `${GetMeeBeerApp.likedBreweries.length}/5`;
  GetMeeBeerApp.updatefavouriteList(GetMeeBeerApp.likedBreweries);
};

GetMeeBeerApp.fetchBreweriesByState = (stateValue) => {
  GetMeeBeerApp.clearDataBeforeFetch();

  GetMeeBeerApp.showHelperMessage(fontawesomeIcons.spinner);

  GetMeeBeerApp.selectedState = stateValue;

  fetch(`https://api.openbrewerydb.org/breweries?by_state=${encodeURI(stateValue)}`)
    .then((response) => response.json())
    .then((breweriesList) => {

      // Show a message if the fetched data is a empty array and disable the city filter
      if (breweriesList.length === 0) {

        selectCityElement.setAttribute('disabled', true);

        return GetMeeBeerApp.showHelperMessage(`Oops! looks like there are no breweries in: "${GetMeeBeerApp.selectedState}"`);
      }

      // Add the liked prop to the brewery data item
      const breweriesData = breweriesList.map(item => ({
        ...item,
        liked: false
      }));

      // Get all cities from the selected state and remove the repeated values by using Set behaviour
      const allBreweriesCitiesNames = [...new Set(breweriesList.map(item => item.city))];

      // Enable the select city dropdown
      if (selectCityElement.getAttribute('disabled') === 'true') {
        selectCityElement.removeAttribute('disabled');
      }

      // Save the data in the app store
      GetMeeBeerApp.breweriesResults = breweriesData;

      // Update and render the new data in the view
      GetMeeBeerApp.updateResultsList(GetMeeBeerApp.breweriesResults);

      GetMeeBeerApp.updateCityOptions(allBreweriesCitiesNames);

      // Add the default "Filter by city" first option
      selectCityElement.innerHTML = '<option selected disabled value="none">Filter by city</option>' + selectCityElement.innerHTML;
    })
    .catch(() => {
      GetMeeBeerApp.showHelperMessage('An error has ocurred, please try again');
    });
};

GetMeeBeerApp.filterBreweriesByCity = (city) => {
  const filteredList = GetMeeBeerApp.breweriesResults.filter(brewery => brewery.city === city);
  GetMeeBeerApp.updateResultsList(filteredList);
};

GetMeeBeerApp.showHelperMessage = (message) => {
  const helperMessage = document.createElement('div');
  helperMessage.classList.add('helper-message');
  helperMessage.innerHTML = message;
  resultsUlElement.innerHTML = ''; // Remove the last message before inserting the new
  resultsUlElement.appendChild(helperMessage);
};

GetMeeBeerApp.updateCityOptions = (options) => {
  selectCityElement.innerHTML = options.map(optionName => `<option value="${optionName}">${optionName}</option>`).join("");
};

GetMeeBeerApp.updateResultsList = (items) => {
  resultsUlElement.innerHTML = items.map(cardData => GetMeeBeerApp.createBreweryCard(cardData)).join("");
};

GetMeeBeerApp.updatefavouriteList = (items) => {
  favouriteUlElement.innerHTML = items.map(cardData => GetMeeBeerApp.createBreweryCard(cardData)).join("");
};

GetMeeBeerApp.clearDataBeforeFetch = () => {
  GetMeeBeerApp.breweriesResults = [];

  selectCityElement.innerHTML = '<option selected disabled value="none">Filter by city</option>';

  GetMeeBeerApp.selectedCity = null;

  resultsUlElement.innerHTML = '';
};

GetMeeBeerApp.validateFormOnSubmit = () => {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const nameValue = nameInputElement.value;
    const emailValue = emailInputElement.value;
    const stateValue = stateInputElement.value;
    const cityValue = cityInputElement.value;
    const phoneValue = phoneInputElement.value;
    const messageValue = messageInputElement.value;

    if (nameValue && emailValue && cityValue && stateValue && phoneValue && messageValue) {
      successSubmitMessageElement.textContent = `Thank you for your submission ${GetMeeBeerApp.formData.name}!`;
      fieldsetElement.style.display = 'none';
      successSubmitMessageElement.style.display = 'flex';
    }

  });

  contactForm.addEventListener('keyup', (event) => {
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
      const targetInput = event.target;

      GetMeeBeerApp.formData[targetInput.name] = targetInput.value;
    }
  });
};

GetMeeBeerApp.init();