<?php header('content-type: application/json; charset=utf-8');

  $json = '
{"id":770672122,"title":"Toy Story 3","year":2010,"genres":["Animation","Kids & Family","Science Fiction & Fantasy","Comedy"],"mpaa_rating":"G","runtime":103,"critics_consensus":"Deftly blending comedy, adventure, and honest emotion, Toy Story 3 is a rare second sequel that really works.","release_dates":{"theater":"2010-06-18","dvd":"2010-11-02"},"ratings":{"critics_rating":"Certified Fresh","critics_score":99,"audience_rating":"Upright","audience_score":91},"synopsis":"Pixar returns to their first success with Toy Story 3. The movie begins with Andy leaving for college and donating his beloved toys -- including Woody (Tom Hanks) and Buzz (Tim Allen) -- to a daycare. While the crew meets new friends, including Ken (Michael Keaton), they soon grow to hate their new surroundings and plan an escape. The film was directed by Lee Unkrich from a script co-authored by Little Miss Sunshine scribe Michael Arndt. ~ Perry Seibert, Rovi","posters":{"thumbnail":"http://content6.flixster.com/movie/11/13/43/11134356_mob.jpg","profile":"http://content6.flixster.com/movie/11/13/43/11134356_pro.jpg","detailed":"http://content6.flixster.com/movie/11/13/43/11134356_det.jpg","original":"http://content6.flixster.com/movie/11/13/43/11134356_ori.jpg"},"abridged_cast":[{"name":"Tom Hanks","characters":["Woody"]},{"name":"Tim Allen","characters":["Buzz Lightyear"]},{"name":"Joan Cusack","characters":["Jessie the Cowgirl"]},{"name":"Don Rickles","characters":["Mr. Potato Head"]},{"name":"Wallace Shawn","characters":["Rex"]}],"abridged_directors":[{"name":"Lee Unkrich"}],"studio":"Walt Disney Pictures","alternate_ids":{"imdb":"0435761"},"links":{"self":"http://api.rottentomatoes.com/api/public/v1.0/movies/770672122.json","alternate":"http://www.rottentomatoes.com/m/toy_story_3/","cast":"http://api.rottentomatoes.com/api/public/v1.0/movies/770672122/cast.json","clips":"http://api.rottentomatoes.com/api/public/v1.0/movies/770672122/clips.json","reviews":"http://api.rottentomatoes.com/api/public/v1.0/movies/770672122/reviews.json","similar":"http://api.rottentomatoes.com/api/public/v1.0/movies/770672122/similar.json"}}
';


  if ($_GET['callback'] != '') {
    $json = $_GET['callback']."( $json )";
  }

  echo $json;
