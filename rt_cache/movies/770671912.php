
<?php header('content-type: application/json; charset=utf-8');

  $json = '


























{"id":770671912,"title":"Up","year":2009,"genres":["Action & Adventure","Animation","Kids & Family","Comedy"],"mpaa_rating":"PG","runtime":89,"critics_consensus":"Another masterful work of art from Pixar, Up is an exciting, hilarious, and heartfelt adventure impeccably crafted and told with wit and depth.","release_dates":{"theater":"2009-05-29","dvd":"2009-11-10"},"ratings":{"critics_rating":"Certified Fresh","critics_score":98,"audience_rating":"Upright","audience_score":86},"synopsis":"","posters":{"thumbnail":"http://content7.flixster.com/movie/10/89/43/10894361_mob.jpg","profile":"http://content7.flixster.com/movie/10/89/43/10894361_pro.jpg","detailed":"http://content7.flixster.com/movie/10/89/43/10894361_det.jpg","original":"http://content7.flixster.com/movie/10/89/43/10894361_ori.jpg"},"abridged_cast":[{"name":"Edward Asner","characters":["Carl Fredricksen"]},{"name":"Christopher Plummer","characters":["Charles Muntz"]},{"name":"John Ratzenberger","characters":["Construction Foreman Tom"]},{"name":"Jordan Nagai","characters":["Russell"]},{"name":"Delroy Lindo","characters":["Beta"]}],"abridged_directors":[{"name":"Pete Docter"},{"name":"Bob Peterson"}],"studio":"Walt Disney Pictures","alternate_ids":{"imdb":"1049413"},"links":{"self":"http://api.rottentomatoes.com/api/public/v1.0/movies/770671912.json","alternate":"http://www.rottentomatoes.com/m/up/","cast":"http://api.rottentomatoes.com/api/public/v1.0/movies/770671912/cast.json","clips":"http://api.rottentomatoes.com/api/public/v1.0/movies/770671912/clips.json","reviews":"http://api.rottentomatoes.com/api/public/v1.0/movies/770671912/reviews.json","similar":"http://api.rottentomatoes.com/api/public/v1.0/movies/770671912/similar.json"}}


  ';

  if ($_GET['callback'] != '') {
    $json = $_GET['callback']."( $json )";
  }

  echo $json;
