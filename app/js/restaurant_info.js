let restaurant;
var map;

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) {
      // Got an error!
      console.error(error);
    } else {
      /*
      self.map = new google.maps.Map(document.getElementById("map"), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
      */
      fillBreadcrumb();
    }
  });
  DBHelper.nextPending();
};

/**
 * Get current restaurant from page URL.
 */
const fetchRestaurantFromURL = callback => {
  if (self.restaurant) {
    // restaurant already fetched!
    callback(null, self.restaurant);
    return;
  }
  const id = getParameterByName("id");
  if (!id) {
    // no id found in URL
    const error = "No restaurant id in URL";
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant);
    });
  }
};

/**
 * Create restaurant HTML and add it to the webpage
 */
const fillRestaurantHTML = (restaurant = self.restaurant) => {
  const div = document.getElementById("maincontent");
  const isFavorite = (restaurant["is_favorite"] && restaurant["is_favorite"].toString() === "true") ? true : false;
  const favoriteDiv = document.createElement("div");
  favoriteDiv.className = "favorite-icon";
  const favorite = document.createElement("button");
  favorite.style.background = isFavorite
    ? `url("/icons/002-like.svg") no-repeat`
    : `url("icons/001-like-1.svg") no-repeat`;
  favorite.innerHTML = isFavorite
    ? restaurant.name + " is a favorite"
    : restaurant.name + " is not a favorite";
  favorite.id = "favorite-icon-" + restaurant.id;
  favorite.onclick = event => handleFavoriteClick(restaurant.id, !isFavorite);
  favoriteDiv.append(favorite);
  div.append(favoriteDiv);

  const name = document.getElementById("restaurant-name");
  name.innerHTML = restaurant.name;

  const address = document.getElementById("restaurant-address");
  address.innerHTML = restaurant.address;

  const image = document.getElementById("restaurant-img");
  image.className = "restaurant-img";
  const imgurlbase = DBHelper.imageUrlForRestaurant(restaurant, "banners");
  const imgurl1x = imgurlbase + "_1x.jpg";
  const imgurl2x = imgurlbase + "_2x.jpg";
  image.src = imgurl1x;
  image.srcset = `${imgurl1x} 500w, ${imgurl2x} 800w`;
  image.alt = restaurant.name + " restaurant promotional image";

  const cuisine = document.getElementById("restaurant-cuisine");
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  DBHelper.fetchRestaurantReviewsById(restaurant.id, fillReviewsHTML)
};

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
const fillRestaurantHoursHTML = (
  operatingHours = self.restaurant.operating_hours
) => {
  const hours = document.getElementById("restaurant-hours");
  for (let key in operatingHours) {
    const row = document.createElement("tr");

    const day = document.createElement("td");
    day.innerHTML = key.trim();
    row.appendChild(day);

    const time = document.createElement("td");
    time.innerHTML = operatingHours[key].trim();
    row.appendChild(time);

    hours.appendChild(row);
  }
};

/**
 * Create all reviews HTML and add them to the webpage.
 */
const fillReviewsHTML = (error, reviews) => {
  self.restaurant.reviews = reviews;

  if (error) {
    console.log("Error retrieving restaurant review: ", error);
  }

  const container = document.getElementById("reviews-container");
  const flex = document.createElement("div");
  flex.id = "reviews-heading";
  container.appendChild(flex);

  const title = document.createElement("h3");
  title.innerHTML = "Reviews";
  flex.appendChild(title);

  const addReviewLink = document.createElement("a");
  addReviewLink.href = `/review.html?id=${self.restaurant.id}`;
  addReviewLink.innerHTML = "Add Review";
  flex.appendChild(addReviewLink);

  if (!reviews) {
    const noReviews = document.createElement("p");
    noReviews.innerHTML = "No reviews yet!";
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById("reviews-list");
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
};

/**
 * Create review HTML and add it to the webpage.
 */
const createReviewHTML = review => {
  const li = document.createElement("li");
  const name = document.createElement("p");
  name.innerHTML = review.name;
  name.className = "restaurant-review-user";
  li.appendChild(name);

  const date = document.createElement("p");
  const created = review.createdAt;
  date.innerHTML = new Date(created).toLocaleString();
  li.appendChild(date);

  const rating = document.createElement("p");
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement("p");
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
};

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
const fillBreadcrumb = (restaurant = self.restaurant) => {
  const breadcrumb = document.getElementById("breadcrumb");
  const li = document.createElement("li");
  const a = document.createElement("a");
  a.href = window.location;
  a.innerHTML = restaurant.name;
  a.setAttribute("aria-current", "page");
  li.appendChild(a);
  breadcrumb.appendChild(li);
};

/**
 * Get a parameter by name from page URL.
 */
const getParameterByName = (name, url) => {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
};

const handleFavoriteClick = (id, newState) => {
  // Update properties of the restaurant data object
  const favorite = document.getElementById("favorite-icon-" + id);
  self.restaurant["is_favorite"] = newState;
  favorite.onclick = event => handleFavoriteClick(restaurant.id, !self.restaurant["is_favorite"]);
  DBHelper.handleFavoriteClick(id, newState);
};

