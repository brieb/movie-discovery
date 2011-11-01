<?php header('content-type: application/json; charset=utf-8');

  $json = '
{"cast":[{"id":"162655641","name":"Tom Hanks","characters":["Woody"]},{"id":"162655909","name":"Tim Allen","characters":["Buzz Lightyear"]},{"id":"162655020","name":"Joan Cusack","characters":["Jessie the Cowgirl"]},{"id":"162660300","name":"Kelsey Grammer","characters":["Stinky Pete the Prospector"]},{"id":"341817905","name":"Don Rickles","characters":["Mr. Potato Head"]},{"id":"162662792","name":"Jim Varney","characters":["Slinky Dog"]},{"id":"162671862","name":"Wallace Shawn","characters":["Rex"]},{"id":"381422124","name":"John Ratzenberger","characters":["Hamm"]},{"id":"162665748","name":"Annie Potts","characters":["Bo Peep"]},{"id":"162680389","name":"Wayne Knight","characters":["Al McWhiggin"]},{"id":"770691950","name":"John Morris","characters":["Andy Davis"]},{"id":"162679021","name":"Laurie Metcalf","characters":["Mrs. Davis"]},{"id":"746742134","name":"Estelle Harris","characters":["Mrs. Potato Head"]},{"id":"162662280","name":"R. Lee Ermey","characters":["Sergeant"]},{"id":"162655648","name":"Jodi Benson","characters":["Barbie"]},{"id":"770718389","name":"Jonathan Harris","characters":["The Cleaner"]},{"id":"770689725","name":"Joe Ranft","characters":["Wheezy"]},{"id":"162655684","name":"Andrew Stanton","characters":["Emperor Zurg"]},{"id":"771014702","name":"Jeff Pidgeon","characters":["Aliens"]}],"links":{"rel":"http://api.rottentomatoes.com/api/public/v1.0/movies/9414.json"}}
';


  if ($_GET['callback'] != '') {
    $json = $_GET['callback']."( $json )";
  }

  echo $json;
