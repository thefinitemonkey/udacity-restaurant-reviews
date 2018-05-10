let restaurant;
var map;

/**
 * Initialize Google map, called from HTML.
 */
const documentReady = () => {
  console.log("hit onload");
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) {
      // Got an error!
      console.error(error);
    } else {
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
  const isFavorite = (restaurant["is_favorite"] && restaurant["is_favorite"].toString() === "true")
    ? true
    : false;
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
};

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
const fillBreadcrumb = (restaurant = self.restaurant) => {
  const breadcrumb = document.getElementById("breadcrumb");
  const li1 = document.createElement("li");
  const a1 = document.createElement("a");
  a1.href = "/restaurant.html?id=" + restaurant.id;
  a1.innerHTML = restaurant.name;
  li1.appendChild(a1);
  breadcrumb.appendChild(li1);

  const li2 = document.createElement("li");
  const a2 = document.createElement("a");
  a2.href = window.location;
  a2.innerHTML = "Write Review";
  li2.appendChild(a2);
  breadcrumb.appendChild(li2);
};

/**
 * Get a parameter by name from page URL.
 */
const getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
};

const handleFavoriteClick = (id, newState) => {
  // Update properties of the restaurant data object
  const favorite = document.getElementById("favorite-icon-" + id);
  self.restaurant["is_favorite"] = newState;
  favorite.onclick = event => handleFavoriteClick(restaurant.id, !self.restaurant["is_favorite"]);
  DBHelper.handleFavoriteClick(id, newState);
};

const saveReview = () => {
  // Get the data points for the review
  const name = document
    .getElementById("reviewName")
    .value;
  const rating = document
    .getElementById("reviewRating")
    .value - 0;
  const comment = document
    .getElementById("reviewComment")
    .value;

  console.log("reviewName: ", name);

  DBHelper.saveReview(self.restaurant.id, name, rating, comment, (error, review) => {
    console.log("got saveReview callback");
    if (error) {
      console.log("Error saving review")
    }
    // Update the button onclick event
    const btn = document.getElementById("btnSaveReview");
    btn.onclick = event => saveReview();

    window.location.href = "/restaurant.html?id=" + self.restaurant.id;
  });
}
