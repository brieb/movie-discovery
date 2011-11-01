var moviesSearchUrl = genApiUrl('/movies');
var topRentalsUrl = genApiUrl(
  '/lists/dvds/top_rentals',
  {limit: 10, country: 'us'}
);

var vis;
var visSize = 320;
var visWidth = 960;
var moviePosterW = 60;
var moviePosterH = 90;

var barColor = "#cfcfcf";
var barThickness = 20;

var activeMovie = null;

var numMoviesSimilarTo = 5;

$(document).ready(function() {
  //$.ajax({
    //url: topRentalsUrl,
    //dataType: "jsonp",
    //success: function(data) {
      //console.log(data);
    //}
  //});


  vis = d3.select("#vis").
    append("svg:svg").
    attr("width", visWidth).
    attr("height", visSize);

  //vis.append("svg:rect").
    //attr("x", visWidth/2 - barThickness/2).
    //attr("y", 0).
    //attr("height", visSize).
    //attr("width", barThickness).
    //attr("fill", barColor);
  //vis.append("svg:rect").
    //attr("x", 0).
    //attr("y", visSize/2 - barThickness/2).
    //attr("height", barThickness).
    //attr("width", visWidth).
    //attr("fill", barColor);


  var movies = [
    { id: '770672122' },
    { id: '770671912' },
    { id: '9414' }
  ];
  var promises = getMoviesInfo(movies);
  $.when.apply(null, promises).
    then(function() {
    console.log(movies);
    setSeedMovie(movies[0]);
  });

});

function setSeedMovie(movie) {
  appendMovieToVis(
    movie,
    visWidth/2 - moviePosterW/2,
    visSize - (visSize/2 + moviePosterH/2)
  );

  var promise = getMoviesSimilarTo(movie);
  $.when(getMoviesSimilarTo(movie)).
    then(function(){
    
    plotMoviesSimilarTo(movie);
         displayMovieDetails(movie);
  })
}

function appendMovieToVis(movie, x, y) {
  vis.
    append("svg:image").
    attr("width", moviePosterW).
    attr("height", moviePosterH).
    attr("x", x).
    attr("y", y).
    attr("xlink:href", movie.posters.thumbnail).
    on("click",
       function(e) {
         displayMovieDetails(movie);
       });
}

function plotMoviesSimilarTo(movie) {
  calcQuadrantsForSimilarTo(movie);

  var x = function(v) {
    return visWidth/2 + v*moviePosterW - moviePosterW/2;
  };
  var y = function(v) {
    return visSize - (visSize/2 + v*moviePosterH + moviePosterH/2);
  };

  var q1X = 1;
  var q1Y = 1;
  var q2X = -1;
  var q2Y = 1;
  var q3X = -1;
  var q3Y = -1;
  var q4X = 1;
  var q4Y = -1;

  for (var i = 0; i < movie.similar.length; i += 1) {
    var curMovie = movie.similar[i];

    switch (curMovie.quad) {
      case 1:
        appendMovieToVis(curMovie, x(q1X), y(q1Y));
        q1X++;
        break;
      case 2:
        appendMovieToVis(curMovie, x(q2X), y(q2Y));
        q2X--;
        break;
      case 3:
        appendMovieToVis(curMovie, x(q3X), y(q3Y));
        q3X--;
        break;
      case 4:
        appendMovieToVis(curMovie, x(q4X), y(q4Y));
        q4X++;
        break;
    }

  };
}

function displayMovieDetails(movie) {
  var details = $("#details");
  details.empty();

  var genres = $('<ul/>').addClass('genres')
  if (typeof movie.genres !== "undefined") {
    genres.append($('<span/>').addClass('heading').text('Genres:'));
    movie.genres.map(function(genre) {
      genres.append($('<li/>').text(genre));
    });
  }

  details.append(
    $('<img/>').addClass('poster').attr('src', movie.posters.profile),
    
    $('<div/>').addClass('col1').append(
      $('<div/>').addClass('title').text(movie.title),
      $('<div/>').addClass('plot').text(movie.synopsis)
    ),

    $('<div/>').addClass('col2').append(
      
      $('<div/>').addClass('year').text('Year: ' + movie.year),

      $('<div/>').addClass('stats').append(
        $('<div/>').addClass('score').text('Audience Score: ' + movie.ratings.audience_score),
        $('<div/>').addClass('score').text('Critics Score: ' + movie.ratings.critics_score)
      ),
      
      genres,
      
      $('<div/>').addClass('external').append(
        $('<a/>').attr(
          {
            href: 'http://www.imdb.com/title/tt'+movie.alternate_ids.imdb,
            target: '_blank',
          }).append($('<img/>').attr('src', 'img/imdb.png')),
        $('<a/>').attr(
          {
            href: movie.links.alternate,
            target: '_blank',
          }).append($('<img/>').attr('src', 'img/rt.png'))
      )
    )
  );
}

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
  //var url = appendApiKey(baseUrl + method + '.json');
  var baseUrl = "http://localhost/cs448b/movie-discovery/rt_cache";
  var url = appendApiKey(baseUrl + method + '.php');

  url += '&callback=?';

  if (typeof params !== "undefined") {
    $.each(params, function(key, value) { 
      url += '&' + key + '=' + value;
    });
  }

  return url;
}

function getMoviesInfo(movies) {
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

function getMoviesSimilarTo(movie) {
  return $.getJSON(
    genApiUrl('/movies/' + movie.id + '/similar'),
    function(data) {
      movie.similar = data.movies;
    }
  );
}

function calcQuadrantsForSimilarTo(movie) {
  for (var i = 0; i < movie.similar.length; i += 1) {
    var curMovie = movie.similar[i];

    var lessX = curMovie.ratings.audience_score <
    movie.ratings.audience_score;
    var lessY = curMovie.ratings.critics_score <
    movie.ratings.critics_score;

    if (!lessX && !lessY) {
      curMovie.quad = 1;
    }
    if (lessX && !lessY) {
      curMovie.quad = 2;
    }
    if (lessX && lessY) {
      curMovie.quad = 3;
    }
    if (!lessX && lessY) {
      curMovie.quad = 4;
    }
  }
}
