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
var barThickness = 1;

var seedMovie = null;

var numMoviesSimilarTo = 5;

$(document).ready(function() {
  initAutoComplete();

  vis = d3.select("#vis").
    append("svg:svg").
    attr("width", visWidth).
    attr("height", visSize);

  labelQuadrants();

  var movie = { id: '770672122' };
  $.when(getMovieInfo(movie)).
    then(function() {
    setSeedMovie(movie);
  });


});

function initAutoComplete() {
  var search = $('#search');
  var searchResults = $('#search_results');
  
  searchResults.hide();

  search.keyup(function(event) {
    searchResults.show();
    var value = search.val();
    if (value.length < 3) {
      return;
    }

    $.getJSON(
      moviesSearchUrl,
      {
        q: value,
        page_limit: 10
      },
      function(data) {
        var movies = filterToDVDs(data.movies);
        renderSearchResults(movies);
      }
    )
  });

  $('body').bind('click', function(e) {
    if($(e.target).closest('#search_results').length == 0) {
      searchResults.hide();
    }
  });

}

function renderSearchResults(movies) {
  var search = $('#search');
  var searchResults = $('#search_results');

  searchResults.empty();

  for (var i = 0; i < movies.length; i += 1) {
    var movie = movies[i];

    var result = $('<div/>').addClass('result').append(
      $('<img/>').addClass('poster').attr('src', movie.posters.thumbnail),
      $('<span/>').addClass('title').text(movie.title)
    );

    result.click((function(movie) {
      return function() {
        setSeedMovie(movie);
        searchResults.hide();
        search.val('');
      };
    })(movie));
    
    searchResults.append(result);
  };
}

function filterToDVDs(movies) {
  return movies.filter(function(movie) {
    return typeof movie.release_dates.dvd !== "undefined" &&
      typeof movie.title !== "undefined";
  });
}

function setSeedMovie(movie) {
  clearMoviesFromVis();

  appendMovieToVis(
    movie,
    visWidth/2 - moviePosterW/2,
    visSize - (visSize/2 + moviePosterH/2)
  );

  var promise = getMoviesSimilarTo(movie);
  $.when(getMoviesSimilarTo(movie)).
    then(function(){
    displayMovieDetails(movie);
    plotMoviesSimilarTo(movie);
  });

  seedMovie = movie;
}

function clearMoviesFromVis() {
  vis.selectAll('image').remove();
}

function appendMovieToVis(movie, x, y) {
  vis.
    append("svg:image").
    attr("width", moviePosterW).
    attr("height", moviePosterH).
    attr("x", x).
    attr("y", y).
    attr("xlink:href", movie.posters.thumbnail).
    on("mouseover",
       function(e) {
         displayMovieDetails(movie);
       }).
         on("mouseout",
            function(e) {
              displayMovieDetails(seedMovie);
            }).
              on("click",
                 function(e) {
                   setSeedMovie(movie);
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

  var links = $('<div/>').addClass('external');
  if (typeof movie.alternate !== "undefined" &&
     typeof movie.alternate.imdb !== "undefined") {
    links.append(
      $('<a/>').attr(
        {
      href: 'http://www.imdb.com/title/tt'+movie.alternate_ids.imdb,
      target: '_blank',
    }).append($('<img/>').attr('src', 'img/imdb.png'))
    );
  }
  links.append(
    $('<a/>').attr(
      {
    href: movie.links.alternate,
    target: '_blank',
  }).append($('<img/>').attr('src', 'img/rt.png'))
  );

  details.append(
    $('<img/>').addClass('poster').attr('src', movie.posters.profile),

    $('<div/>').addClass('col1').append(
      $('<div/>').addClass('title').text(movie.title),
      $('<div/>').addClass('plot').text(movie.synopsis)
    ),

    $('<div/>').addClass('col2').append(

      $('<div/>').addClass('year').text('Year: ' + movie.year),

      //$('<div/>').addClass('stats').append(
        //$('<div/>').addClass('score').text('Audience Score: ' + movie.ratings.audience_score),
        //$('<div/>').addClass('score').text('Critics Score: ' + movie.ratings.critics_score)
      //),
      genres,
      links
    ),

    $('<div/>').attr('id', 'ratings_vis')
  );

  renderRatingsVis(movie.ratings);
}

function renderRatingsVis(ratings) {
  console.log(ratings);
  var data = [
    { type: 'Audience', rating: ratings.audience_score },
    { type: 'Critics', rating: ratings.critics_score }
  ];

  var barWidth = 22;
  var width = (barWidth + 5) * data.length;
  var height = 200;

  var x = d3.scale.linear().
    domain([0, data.length]).
    range([0, width]);
  var y = d3.scale.linear().
    domain([0, 100]).
    rangeRound([0, height]);

  var ratingsVis = d3.select("#ratings_vis").
    append("svg:svg").
    attr("width", width).
    attr("height", height);

  ratingsVis.selectAll("rect").
    data(data).
    enter().
    append("svg:rect").
    attr("x", function(datum, index) { return x(index); }).
    attr("y", function(datum) { return height - y(datum.rating); }).
    attr("height", function(datum) { return y(datum.rating); }).
    attr("width", barWidth).
    attr("fill", "#2d578b");

ratingsVis.selectAll("text").
  data(data).
  enter().
  append("svg:text").
  attr("x", function(datum, index) { return x(index) + barWidth; }).
  attr("y", function(datum) { return height - y(datum.rating); }).
  attr("dx", -barWidth/2).
  attr("dy", "1.2em").
  attr("text-anchor", "middle").
  attr("style", "font-size: 11;").
  text(function(datum) { return datum.rating;}).
  attr("fill", "white");

ratingsVis.selectAll("text.yAxis").
  data(data).
  enter().append("svg:text").
  attr("x", function(datum, index) { return y(index) + height - 20; }).
  attr("y", function(datum, index) { return -x(index) - 5; }).
  attr("dx", -barWidth/2 - 5).
  attr("text-anchor", "middle").
  attr("style", "font-size: 11;").
  text(function(datum) { return datum.type;}).
  attr("transform", "rotate(90)").
  attr("fill", "white").
  attr("class", "yAxis");


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

function getMovieInfo(movie) {
  return $.getJSON(
    genApiUrl('/movies/' + movie.id),
    function(data) {
      $.extend(movie, data);
    }
  );
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

function labelQuadrants() {
  vis.append("svg:rect").
    attr("x", visWidth/2 - barThickness/2).
    attr("y", 0).
    attr("height", visSize).
    attr("width", barThickness).
    attr("fill", barColor);
  vis.append("svg:rect").
    attr("x", 0).
    attr("y", visSize/2 - barThickness/2).
    attr("height", barThickness).
    attr("width", visWidth).
    attr("fill", barColor);

  vis.append('svg:text').
    attr('x', visWidth - 90).
    attr('y', 10).
    attr("dy", "1.2em").
    attr("text-anchor", "left").
    text("+ Critics");
  vis.append('svg:text').
    attr('x', visWidth - 90).
    attr('y', 40).
    attr("text-anchor", "left").
    text("+ Audience");
  vis.append('svg:text').
    attr('x', 10).
    attr('y', 10).
    attr("dy", "1.2em").
    attr("text-anchor", "left").
    text("+ Critics");
  vis.append('svg:text').
    attr('x', 10).
    attr('y', 40).
    attr("text-anchor", "left").
    text("- Audience");
  vis.append('svg:text').
    attr('x', 10).
    attr('y', visSize - 50).
    attr("dy", "1.2em").
    attr("text-anchor", "left").
    text("- Critics");
  vis.append('svg:text').
    attr('x', 10).
    attr('y', visSize - 20).
    attr("text-anchor", "left").
    text("- Audience");
  vis.append('svg:text').
    attr('x', visWidth - 90).
    attr('y', visSize - 50).
    attr("dy", "1.2em").
    attr("text-anchor", "left").
    text("- Critics");
  vis.append('svg:text').
    attr('x', visWidth - 90).
    attr('y', visSize - 20).
    attr("text-anchor", "left").
    text("+ Audience");
}
