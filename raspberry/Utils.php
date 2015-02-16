<?php
//I like to hold several helper classes in this file.



class gOauth {
    //class to handle Oauth for Google services. 
    private $auth_db_key;
    public $auth_callback = OAUTH_CALLBACK_URL;
    private $db;
    private $auth;

    function authFetchData() {
        $this->auth = $this->db->query("SELECT * FROM `googleOauth2` WHERE name='".$this->auth_db_key."';")->fetch();
    }

    function post($url, $data) {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_POST ,1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1); /* obey redirects */
        curl_setopt($ch, CURLOPT_HEADER, 0);  /* No HTTP headers */
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);  /* return the data */
        $result = curl_exec($ch);
        curl_close($ch);
        return $result;
    }



    function refreshAccessToken() {
        $time = time();
        $url = "https://accounts.google.com/o/oauth2/token";
        $data = "client_id=".$this->auth['client_id']."&client_secret=".$this->auth['client_secret']."&refresh_token=".$this->auth['refresh_token']."&grant_type=refresh_token";
        $result = $this->post($url, $data);


        $res = json_decode($result, true);

        if(isset($res['error'])) {

        } else {
            $expires = $time + $res['expires_in'];
            echo $this->db->exec("UPDATE `googleOauth2` SET expires='".$expires."', access_token='".$res['access_token']."' WHERE name='".$this->auth_db_key."';");
            $this->authFetchData();
        }

    }

    function auth($db, $key){
        $this->db=$db;
        $this->auth_db_key = $key;
        $this->authFetchData();
    }

    function getAccessToken() {
        if($this->auth['expires'] < time() && strlen($this->auth['refresh_token']) > 5) {
            $this->refreshAccessToken();           
        }

        return $this->auth['access_token'];
    }

    function authorizeUrl() {
        return "https://accounts.google.com/o/oauth2/auth?response_type=code&client_id=".$this->auth['client_id']."&redirect_uri=".$this->auth_callback."&scope=".$this->auth['scope']."&access_type=offline";
    }

    function authorizeCallbackHandle($code) {
        $time = time();
        $url = "https://accounts.google.com/o/oauth2/token";
        $data = "code=".$code."&client_id=".$this->auth['client_id']."&client_secret=".$this->auth['client_secret']."&redirect_uri=".urlencode($this->auth_callback)."&grant_type=authorization_code";
        $result = $this->post($url, $data);
        $res = json_decode($result, true);


        if(isset($res['error'])) {
            print("<h1>Errror:</h1>");
            print($result);
        } else {
            $expires = $time + $res['expires_in'];
            echo $this->db->exec("UPDATE `googleOauth2` SET expires='".$expires."', access_token='".$res['access_token']."', refresh_token='".$res['refresh_token']."' WHERE name='".$this->auth_db_key."';");
            $this->authFetchData();
            print("<h1>Auth OK:</h1>");
            print_r($res);
        }
    }

}


class Picasa extends gOauth {
    //Class to handle Google+ Photos API. It uses old picasa API, because to this date there is no new API

    function __construct() {
        date_default_timezone_set('Europe/Warsaw');
    }
    
    function getNewPhotos($count) {
        $pattern = "#<entry><id>[^<]+user\/([0-9]+)\/albumid\/([0-9]+)\/photoid\/([0-9]+)<\/id><published>([^<]+)<\/published>.*?<media:thumbnail url='([^']+)'[^/]+\/><media:title.*?<\/entry>#is";
        $txt = file_get_contents("https://picasaweb.google.com/data/feed/api/user/default?kind=photo&max-results=".$count."&access_token=".$this->getAccessToken());
        if($txt && preg_match_all($pattern, $txt, $matches)) {
            $photos = array();
            for ($i=0; $i < count($matches[5]); $i++) { 
                $photos[] = array(
                    'url' => "http://plus.google.com/photos/yourphotos/?pid=".$matches[3][$i]."&amp;oid=".$matches[1][$i],
                    'src' => $matches[5][$i],
                    'id' => $matches[3][$i],
                    'time' => strtotime($matches[4][$i])
                );
            }
            return $photos;
        } else {
            return false;
        }

    }
}


class Calendar extends gOauth {
    //Class to handle google calendar

    function __construct() {
        date_default_timezone_set('Europe/Warsaw');
    }

    function getEvents($calId, $start, $end) {
        $url="https://www.googleapis.com/calendar/v3/calendars/".$calId."/events?singleEvents=true&timeMin=".$start."T01%3A00%3A00%2B01%3A00&fields=items(id%2Cdescription%2ChtmlLink%2Csummary%2Clocation%2Cstart%2Cend)&timeMax=".$end."T23%3A59%3A00%2B01%3A00&access_token=".$this->getAccessToken();
        $json = file_get_contents($url);
        $data = json_decode($json, true);
        return $data['items'];
    }

    function sort($a, $b) {
        if($a['start']['dateTime'] < $b['start']['dateTime']) {
            return -1;
        } else if($a['start']['dateTime'] > $b['start']['dateTime']) {
            return 1;
        } else {
            return 0;
        }
    }

    function getMultipleCalendars($calendars, $start, $end) {
        $events = array();
        foreach ($calendars as $key => $value) {
            $ev = $this->getEvents($value, $start, $end);
            $events = array_merge($events, $ev);
        }

        usort($events, array($this, 'sort'));
        return $events;
    }

	function dateOutput($time) {
		if(date("d.m.Y") == date("d.m.Y", $time)) {
			return date("H:i", $time);
		} else {
			return date("d.m.Y H:i", $time);
		}
	}
}





?>
