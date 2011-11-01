<?php header('content-type: application/json; charset=utf-8');

  $json = '
  {"id":9414,"title":"Toy Story 2","year":1999,"genres":["Animation","Kids & Family","Science Fiction & Fantasy","Comedy"],"mpaa_rating":"G","runtime":92,"critics_consensus":"Entertaining characters and eye-popping animation make this sequel an instant classic.","release_dates":{"theater":"1999-11-24","dvd":"2000-10-17"},"ratings":{"critics_rating":"Certified Fresh","critics_score":100,"audience_rating":"Upright","audience_score":72},"synopsis":"","posters":{"thumbnail":"http://content6.flixster.com/movie/10/93/63/10936392_mob.jpg","profile":"http://content6.flixster.com/movie/10/93/63/10936392_pro.jpg","detailed":"http://content6.flixster.com/movie/10/93/63/10936392_det.jpg","original":"http://content6.flixster.com/movie/10/93/63/10936392_ori.jpg"},"abridged_cast":[{"name":"Tom Hanks","characters":["Woody"]},{"name":"Tim Allen","characters":["Buzz Lightyear"]},{"name":"Joan Cusack","characters":["Jessie the Cowgirl"]},{"name":"Kelsey Grammer","characters":["Stinky Pete the Prospector"]},{"name":"Don Rickles","characters":["Mr. Potato Head"]}],"abridged_directors":[{"name":"John Lasseter"}],"studio":"Buena Vista Pictures","alternate_ids":{"imdb":"0120363"},"links":{"self":"http://api.rottentomatoes.com/api/public/v1.0/movies/9414.json","alternate":"http://www.rottentomatoes.com/m/toy_story_2/","cast":"http://api.rottentomatoes.com/api/public/v1.0/movies/9414/cast.json","clips":"http://api.rottentomatoes.com/api/public/v1.0/movies/9414/clips.json","reviews":"http://api.rottentomatoes.com/api/public/v1.0/movies/9414/reviews.json","similar":"http://api.rottentomatoes.com/api/public/v1.0/movies/9414/similar.json"}}
  ';

  if ($_GET['callback'] != '') {
    $json = $_GET['callback']."( $json )";
  }

  echo $json;
