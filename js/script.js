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

function setSeedMovie(movie, target) {
  var seedX = visWidth/2 - moviePosterW/2;
  var seedY = visSize - (visSize/2 + moviePosterH/2);

  movie.x = seedX;
  movie.y = seedY;
  if (typeof target === 'undefined') {
    appendMovieToVis(movie);
  } else {
    moveElem(movie);
  }

  displayMovieDetails(movie);

  $.when(getMoviesSimilarTo(movie)).
    then(function() {
      plotMoviesSimilarTo(movie);
      seedMovie = movie;
  });
}

function convertToSeed(movie, target) {

}

function clearElems(movies) {
  for (var i = 0; i < movies.length; i += 1) {
    var elem = movies[i].elem;
    elem.
      transition().
      style("opacity", 0).
      remove();
  };
}

function moveElem(movie) {
  return movie.elem.
    transition().
    attr("x", movie.x).
    attr("y", movie.y);
}

function appendMovieToVis(movie) {
  movie.elem = vis.append("svg:image").
    attr("width", moviePosterW).
    attr("height", moviePosterH).
    attr("x", movie.x).
    attr("y", movie.y).
    attr("xlink:href", movie.posters.thumbnail).
    on("mouseover", function(e) {
    displayMovieDetails(movie);
  }).
    on("mouseout",
       function(e) {
         displayMovieDetails(seedMovie);
       }).
         on("click",
            function(e) {
              setSeedMovie(movie, this);
            });
}

function plotMoviesSimilarTo(movie) {
  calcEucDistForSimilarTo(movie);
  calcQuadrantsForSimilarTo(movie);

  var commonSim = getCommonSimilarMovies(movie, seedMovie);
  clearElems(commonSim.toRemove);

  var x = function(v) {
    return visWidth/2 + v*moviePosterW - moviePosterW/2;
  };
  var y = function(v) {
    return visSize - (visSize/2 + v*moviePosterH + moviePosterH/2);
  };

  var quads = [];
  for (var i = 0; i < 4; i += 1) {
    quads.push([]);
  };

  for (var i = 0; i < movie.similar.length; i += 1) {
    var curMovie = movie.similar[i];
    quads[curMovie.quad].push(curMovie);
  }

  for (var i = 0; i < quads.length; i += 1) {
    quads[i].sort(function(a,b) {
      return (a.eucDist < b.eucDist) ? -1 :
        (a.eucDist > b.eucDist) ? 1 : 0;
    });
  }

  for (var i = 0; i < quads[0].length; i += 1) {
    quads[0][i].y = y(1);
    quads[0][i].x = x(i+1);
  }
  for (var i = 0; i < quads[1].length; i += 1) {
    quads[1][i].y = y(1);
    quads[1][i].x = x(-1 * (i+1));
  }
  for (var i = 0; i < quads[2].length; i += 1) {
    quads[2][i].y = y(-1);
    quads[2][i].x = x(-1 * (i+1));
  }
  for (var i = 0; i < quads[3].length; i += 1) {
    quads[3][i].y = y(-1);
    quads[3][i].x = x(i+1);
  }

  for (var i = 0; i < commonSim.toAdd.length; i += 1) {
    var curMovie = commonSim.toAdd[i];
    appendMovieToVis(curMovie);
  }

  for (var i = 0; i < commonSim.toKeep.length; i+= 1) {
    var curMovie = commonSim.toKeep[i];
    moveElem(curMovie);
  }
}

function getCommonSimilarMovies(newSeedMovie, oldSeedMovie) {
  if (oldSeedMovie === null) {
    return {
      toKeep: [],
      toRemove: [],
      toAdd: newSeedMovie.similar
    };   
  }

  var toKeep = [];
  var toAdd = [];
  var toRemove = [];

  var oldSeedPresent = false;
  for (var i = 0; i < newSeedMovie.similar.length; i += 1) {
    var isPresent = false;

    var curNew = newSeedMovie.similar[i];

    for (var j = 0; j < oldSeedMovie.similar.length; j += 1) {
      var curOld = oldSeedMovie.similar[j];

      if (curNew.id === curOld.id) {
        curNew.elem = curOld.elem;
        toKeep.push(curNew);
        isPresent = true;
      } else {
        if (curOld.id !== newSeedMovie.id) {
          var addToRemove = true;
          for (var k = 0; k < toRemove.length; k += 1) {
            var rem = toRemove[k];
            if (curOld.id === rem.id) {
              addToRemove = false;
            } 
          }
          if (addToRemove) {
            toRemove.push(curOld);
          }
        }
      }

    }

    if (curNew.id === oldSeedMovie.id) {
      oldSeedPresent = true;
      curNew.elem = oldSeedMovie.elem;
      toKeep.push(curNew);
    } else if (!isPresent) {
      toAdd.push(curNew);
    }
  }

  if (!oldSeedPresent) {
    toRemove.push(oldSeedMovie);
  }

  return {
    toKeep: toKeep,
    toRemove: toRemove,
    toAdd: toAdd
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
  if (typeof movie.alternate_ids !== "undefined" &&
      typeof movie.alternate_ids.imdb !== "undefined") {
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
      $('<div/>').addClass('critics_consensus').text(movie.critics_consensus),
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
    attr("height", height + 60);

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
    attr("x", function(datum, index) { return y(index) + height + 20; }).
    attr("y", function(datum, index) { return -x(index) - 5; }).
    attr("dx", -barWidth/2 - 5).
    attr("text-anchor", "left").
    attr("style", "font-size: 11;").
    text(function(datum) { return datum.type;}).
    attr("transform", "rotate(90)").
    attr("fill", "black").
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
  var baseUrl = "http://api.rottentomatoes.com/api/public/v1.0";
  var url = appendApiKey(baseUrl + method + '.json');
  //var baseUrl = "http://localhost/cs448b/movie-discovery/rt_cache";
  //var url = appendApiKey(baseUrl + method + '.php');

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

function getMoviePlotImdb(movie) {
  if (typeof movie.alternate_ids !== "undefined" &&
      typeof movie.alternate_ids.imdb !== "undefined") {
    return $.getJSON(
      'http://www.imdbapi.com/?i=tt'+movie.alternate_ids.imdb+'&callback=?',
    function(data) {
      movie.plot = data.Plot;
    });
  }
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

function calcEucDistForSimilarTo(movie) {
  for (var i = 0; i < movie.similar.length; i += 1) {
    var curMovie = movie.similar[i];
    curMovie.eucDist = calcEucDist(movie, curMovie);
  }
}

function calcQuadrantsForSimilarTo(movie) {
  for (var i = 0; i < movie.similar.length; i += 1) {
    var curMovie = movie.similar[i];

    var lessX = curMovie.ratings.audience_score <
    movie.ratings.audience_score;
    var lessY = curMovie.ratings.critics_score <
    movie.ratings.critics_score;

    if (!lessX && !lessY) {
      curMovie.quad = 0;
    }
    if (lessX && !lessY) {
      curMovie.quad = 1;
    }
    if (lessX && lessY) {
      curMovie.quad = 2;
    }
    if (!lessX && lessY) {
      curMovie.quad = 3;
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
