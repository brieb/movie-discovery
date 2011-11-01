









<?php header('content-type: application/json; charset=utf-8');

  $json = '


















{"cast":[{"id":"162659188","name":"Edward Asner","characters":["Carl Fredricksen"]},{"id":"162652929","name":"Christopher Plummer","characters":["Charles Muntz"]},{"id":"381422124","name":"John Ratzenberger","characters":["Construction Foreman Tom"]},{"id":"770803286","name":"Jordan Nagai","characters":["Russell"]},{"id":"162666406","name":"Delroy Lindo","characters":["Beta"]},{"id":"770843535","name":"Jerome Ranft","characters":["Gamma"]},{"id":"770689967","name":"Bob Peterson","characters":["Alpha","Dug"]}],"links":{"rel":"http://api.rottentomatoes.com/api/public/v1.0/movies/770671912.json"}}


  ';

  if ($_GET['callback'] != '') {
    $json = $_GET['callback']."( $json )";
  }

  echo $json;
