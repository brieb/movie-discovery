var moviesSearchUrl = genApiUrl('/movies');
var topRentalsUrl = genApiUrl(
  '/lists/dvds/top_rentals',
  {limit: 10, country: 'us'}
);

$(document).ready(function() {
  //$.ajax({
    //url: topRentalsUrl,
    //dataType: "jsonp",
    //success: function(data) {
      //console.log(data);
    //}
  //});


  var movies = [
    { id: '770672122' },
    { id: '770671912' },
    { id: '9414' }
  ];
  //var promises = [getMoviesInfo(movies), getMoviesCast(movies)];
  var promises = getMoviesInfo(movies);
  //promises = [$.getJSON(
      //"http://api.rottentomatoes.com/api/public/v1.0/movies/9414.json?apikey=taxxk3rybhhv83wt2aqdd6rc&callback=?",
      //function(data) {
        //console.log(data);
      //}
    //)];
  //$.when(getMovieInfo(movies), getMovieCast(movies)).
  $.when.apply(null, promises).
    then(function() {
    console.log(movies);
  });

});

function calcEucDist(movie1, movie2) {
  return Math.sqrt(
    Math.pow(movie1.ratings.audience_score - movie2.ratings.audience_score, 2) +
    Math.pow(movie1.ratings.critics_score - movie2.ratings.critics_score, 2)
  );
}

function appendApiKey(url) {
  var apikey = 'taxxk3rybhhv83wt2aqdd6rc';
  return url + '?apikey=' + apikey;
}

function genApiUrl(method, params) {
  //var baseUrl = "http://api.rottentomatoes.com/api/public/v1.0";
  var baseUrl = "http://localhost/cs448b/movie-discovery/rt_cache";

  //var url = appendApiKey(baseUrl + method + '.json');
  var url = appendApiKey(baseUrl + method + '.php');

  url += '&callback=?';

  if (typeof params !== "undefined") {
    $.each(params, function(key, value) { 
      url += '&' + key + '=' + value;
    });
  }

  return url;
}

getMoviesInfo = function(movies) {
  var getMovieInfo = function(movie) {
    return $.getJSON(
      genApiUrl('/movies/' + movie.id),
      function(data) {
        $.extend(movie, data);
      }
    );
  };
  return $.map(movies, getMovieInfo);
}

function getMoviesCast(movies) {
  var getMovieCast = function(movie) {
    $.getJSON(
      genApiUrl('/movies/' + movie.id + '/cast'),
      function(data) {
        movie.cast = data.cast;
      }
    );
  };
  return $.map(movies, getMovieCast);
}

