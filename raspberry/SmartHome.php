<?php
header('Access-Control-Allow-Origin: *');  
include('Utils.php');

class Command {
    public $triggers = array();


    function execute($arg, $type) {
        print($arg);
    }

    function __construct($triggers) {
        $this->triggers = $triggers;
    }

    function printSystem($str) {
        //print_r($str);
    }

    function system($command) {
        //echo $command."\n";
        exec($command, $ret, $status);
        $this->printSystem($ret);
        return $ret;
        //return print($command);
    }

    function getStructure($trigger) {
        if(strlen($this->triggers[$trigger]) > 0 ) {
            return array('trigger' => $this->triggers[$trigger]);
        } else {
            return false;
        }
    }
}

class AsyncCommand extends Command {

}

class WakeCommand extends Command {
    public $triggers = array(
            'line' => 'wakeUp'
        );

    private function r($color) {
        return round((100/255) * $color);
    }

    function execute() {
        (new RGBCommand(array(),1,100,5,0))->execute();
        sleep(60 * 7);
        (new RGBCommand(array(),1,100,20,0))->execute();
        sleep(60 * 7);
        (new RGBCommand(array(),1,100,100,100))->execute();
        sleep(60 * 7);
        (new RGBCommand(array(),1,$this->r(252),$this->r(255),$this->r(171)))->execute();
        (new MPCPlaylistCommand())->execute(array("WakeUp"));
        sleep(60 * 19);
        (new RGBCommand(array(),1,0,0,0))->execute();
        (new MPCCommand('stop'))->execute();

    }

    function __construct() {

    }
}


class MultipleCommand extends Command {
    public $commands = array();
    private $default = false;

    function __construct($triggers, $default = false) {
        $this->triggers = $triggers;
        $this->default = $default;
    }

    function findCommand($command, $type) {
        for ($i=0; $i < count($this->commands); $i++) { 
            if(isset($this->commands[$i]->triggers[$type]) && $this->commands[$i]->triggers[$type] == $command) {
                return $this->commands[$i];
            }
        }
    }


    function registerCommand($command) {
        $this->commands[] = $command;
    }

    function execute($arr, $type) {
        $args = array_slice($arr, 1);

        if(strlen($arr[0])>0 && count($this->commands) > 0){
            $comm = $this->findCommand($arr[0], $type);
            if($comm) {
                return $comm->execute($args, $type);
            }
        }

        if($this->default) {
            return $this->default->execute(array(), $type);
        } else {
            return array('error' => 1, 'msg' => 'Command not recognized');
        }

    }

    function getStructure($trigger) {
        if(isset($this->triggers[$trigger]) && strlen($this->triggers[$trigger]) > 0) {

            $comms = array();
            for ($i=0; $i < count($this->commands); $i++) { 
                $c = $this->commands[$i]->getStructure($trigger);
                if($c) {
                    $comms[] = $c;
                }
            }

            return array('trigger' => $this->triggers[$trigger], 'commands' => $comms);
        }
        else {
            return false;
        }
    }

}



class I2Command extends Command {

    public function send($target, $a=0, $b=0, $c=0) {
        $concat = $target.",".$a.",".$b.",".$c.".";
        $out="./i2control ".$concat." 2>/dev/null";
        return $this->system($out);
    }

    public function translateResponse($resp) {
        $array = explode($resp);
        return $array;
    }

}




class RGBCommand extends I2Command {
    private $unit = 2;
    private $r = 0;
    private $g = 0;
    private $b = 0;


    function execute($args = array()) {
        $c = $this->send($this->unit, $this->r, $this->g, $this->b); 
        return $this->translateResponse($c);
    }

    function __construct($triggers, $unit, $r, $g, $b) {
        $this->triggers = $triggers;
        $this->unit = $unit;
        $this->r = $r;
        $this->g = $g;
        $this->b = $b;
    }

    function translateResponse($resp) {
        $a = explode(",",$resp[0]);
        
        if($a[0] == "1") {
            return array("error" => 0, "msg" => "Changing color");
        } else {
            return array("error" => $a[0], "msg" => "Some kind of error");
        }
        
    }
}


class MPCCommand extends Command {
    private $comm;
    function execute($args = array()) {
        $this->system("mpc ".$this->comm);
        return $this->translateResponse($this->system("mpc status"));
    }

    function __construct($comm) {
        $this->triggers = array('line' => $comm, 'voice' => $comm, 'http' => $comm);
        $this->comm = $comm;
    }


    function translateResponse($res) {
        //Save position in DB in case we want to come back to that.
        if(count($res) == 3 && preg_match('&\[(paused|playing)\]\s*#([0-9]+)/[0-9]+\s*([0-9:]+)/&is', $res[1], $result)) {
            SmartHome::$db->exec("UPDATE `SmartHome_playlists` SET song = '".$res[0]."', playlistID = '".$result[2]."', pos = '".$result[3]."' WHERE current = 1;");
        }

        return array("error" => 0, "msg" => $res[0].$res[1].$res[2]);
    }
}


class MPCPlaylistCommand extends MPCCommand {
    private $playlist;
    public $triggers = array(
            'line' => 'playlist'
        );

    function execute($args) {
        if(isset($args[0])) {
            $this->playlist = $args[0];
        }

        $this->translateResponse($this->system("mpc status"));
        SmartHome::$db->exec("UPDATE `SmartHome_playlists` SET current=0");
        $this->system("mpc clear");
        $this->system("mpc load ".$this->playlist);
        $this->system("mpc random off");
        $this->system("mpc play");
        return $this->translateResponse($this->system("mpc status"));
    }

    function __construct($comm = false, $p = '') {
        if($comm) {
            $this->triggers = $comm;
        }
        $this->playlist = $p;
    }
}


class MPCSavedPlaylistCommand extends MPCPlaylistCommand {

    function execute($args) {
        if(isset($args[0])) {
            $this->playlist = $args[0];
        }

        $this->translateResponse($this->system("mpc status"));
        $this->system("mpc clear");
        $data = SmartHome::$db->query("SELECT * FROM `SmartHome_playlists` WHERE `key`='".$this->playlist."';")->fetch();
        SmartHome::$db->exec("UPDATE `SmartHome_playlists` SET current =1 WHERE `key`='".$this->playlist."';");

        $this->system($data['load']);
        $this->system("mpc random off");
        $this->system("mpc play ".$data['playlistID']);
        //todo: gdzies tu jest blad.
        sleep(4);
        $res = $this->system("mpc seek ".$data['pos']);

        return array("error" => 0, "msg" => $res[0].$res[1].$res[2]);
    }

    function __construct($comm = false, $p = '') {
        if($comm) {
            $this->triggers = $comm;
        }
        $this->playlist = $p;
    }
}


class SequenceCommand extends MultipleCommand {

    function execute($arg = array(), $type = 'line') {
        for ($i=0; $i < count($this->commands); $i++) { 
            $this->commands[$i]->execute($arg, $type);
        }
    }


    function getStructure($trigger) {
        if(strlen($this->triggers[$trigger]) > 0 ) {
            return array('trigger' => $this->triggers[$trigger]);
        } else {
            return false;
        }
    }

}


class SmartHome extends MultipleCommand{
    public static $db;
    private $states;

    function __construct() {
        self::$db = new PDO(DB, DB_USER, DB_PASS);
    }

    function getJSON() {
        $trigger = 'http';
        $comms = array();
        for ($i=0; $i < count($this->commands); $i++) { 
            $c = $this->commands[$i]->getStructure($trigger);
            if($c) {
                $comms[] = $c;
            }
        }
        return json_encode(array('commands' => $comms));
    }

    function executeJSON($json) {
        $command = json_decode($json, true);
        $resp =  $this->execute($command, 'http');
        print(json_encode($resp, true));
    }

    function registerTrigger($trigger) {
        $trigger->db = self::$db;
        $this->states[] = $trigger;
    }


    function checkTriggers() {
        for ($i=0; $i < count($this->states); $i++) { 
            $this->states[$i]->execute();
        }
    }

    function calendar() {
        $events = self::$db->query("SELECT * FROM `SmartHome_events` WHERE start<CURRENT_TIMESTAMP() AND exec IS NULL");
        while ($event = $events->fetch()) { 
            self::$db->query("UPDATE `SmartHome_events` SET exec=CURRENT_TIMESTAMP() WHERE id='".$event['id']."';");
            $arr = explode(" ", $event['name']);
            $this->execute($arr, 'line');
        }
    }
}


class Trigger {
    public $db;
}

class StateTrigger extends Trigger {
    protected $dbTable = 'SmartHome_states';
    protected $key = '';
    protected $state = '';


    function execute() {
        $this->load();
        $result = $this->check();
        $result = $this->changeState($this->state, $result);
        if($result != $this->state) {
            $this->state = $result;
            $this->save();
        }
    }

    //Load state from sql
    function load() {
        $data = SmartHome::$db->query("SELECT value FROM `".$this->dbTable."` WHERE `key`='".$this->key."';")->fetch();
        if(!isset($data['value'])) {
            SmartHome::$db->exec("INSERT INTO `".$this->dbTable."` SET `key`='".$this->key."', value='".$this->state."';");
        }
        $this->state = $data['value'];
    }

    function save() {
        SmartHome::$db->exec("UPDATE `".$this->dbTable."` SET value='".$this->state."', updated=CURRENT_TIMESTAMP() WHERE `key`='".$this->key."';");
    }

    function check() {
        return 0;
    }

    function changeState($oldState, $newState) {
        return $newState;
    }

}

class BluetoothProximity extends StateTrigger {
    private $address;
    public $enterCommand = null;
    public $leaveCommand = null;

    function check() {
        //hcitool name macaddress system command returns bd name of device if in proximity.
        $command = "hcitool name ".$this->address;
        exec($command, $ret, $status);
        if(isset($ret[0])) {
            return 1;
        } else {
            return 0;
        }

    }

    function changeState($oldState, $newState) {
        //entered in proximity
        //State is tries since last checking.
        if($oldState > 5 && $newState == 1 && $this->enterCommand) {
            $this->enterCommand->execute();
            return 0;
        } else if($oldState == 5 && $newState == 0 && $this->leaveCommand) {
            //left proximity
            $this->leaveCommand->execute();
            return 6;
        } else if($newState == 0) {
            return $oldState + 1;
        } else if($newState == 1) {
            return 0;
        }
    }

    function __construct($address, $key, $enter = null, $leave = null) {
        $this->key=$key;
        $this->address = $address;
        $this->enterCommand = $enter;
        $this->leaveCommand = $leave;
    }
}

/*
-------------------------------------------------------------
*/


$smart = new SmartHome();

$sleepingRoom = new MultipleCommand(array(
        'line' => 'sleeping',
        'voice' => 'sleeping',
        'http' => 'Sleeping Room Lamp'
    ));


$sleepingRoomOff = new RGBCommand(array('line' => 'off', 'voice' => 'of', 'http' => 'Off'), 2, 0, 0, 0);
$sleepingRoom -> registerCommand($sleepingRoomOff);
$sleepingRoom -> registerCommand(new RGBCommand(array('line' => 'on', 'voice' => 'on', 'http' => 'White'), 2, 255, 255, 255));
$sleepingRoom -> registerCommand(new RGBCommand(array('line' => 'green', 'voice' => 'green', 'http' => 'Green'), 2, 0, 100, 0));
$sleepingRoom -> registerCommand(new RGBCommand(array('line' => 'blue', 'voice' => 'blue', 'http' => 'Blue'), 2, 30, 120, 210));
$sleepingRoom -> registerCommand(new RGBCommand(array('line' => 'red', 'voice' => 'red', 'http' => 'Red'), 2, 252, 50, 30));
$smart->registerCommand($sleepingRoom);


$music = new MultipleCommand(array(
        'line'  => 'player',
        'voice' => 'player',
        'http'  => 'Big Player'
    ));
$smart->registerCommand($music);

$music->registerCommand(new MPCCommand('play'));
$musicPlayerOff = new MPCCommand('pause');
$music->registerCommand($musicPlayerOff);
$music->registerCommand(new MPCPlaylistCommand());

$music->registerCommand(new MPCPlaylistCommand(array(
        'http' => 'Play Workout',
        'voice' => 'workout'
    ), 'Workout'));

$music->registerCommand(new MPCSavedPlaylistCommand(array(
        'http' => 'Play TED',
        'line' => 'TED'
    ), 'TED'));


$smart->registerCommand(new WakeCommand());



$everythingOff = new SequenceCommand(array('line' => 'leave', 'voice' => 'leave', 'http' => 'Everything Off'));
$everythingOff->registerCommand($musicPlayerOff);
$everythingOff->registerCommand($sleepingRoomOff);


//Comment these 5 lines if it wakes you up.
$atHome = new SequenceCommand(array('line' => 'enter', 'voice' => 'enter', 'http' => 'Enter Home'));
$atHome->registerCommand(new MPCPlaylistCommand(array(), 'FinallyHome'));

$bluetoothProximity = new BluetoothProximity(BT_MAC, 'MotoGproximity', $atHome, $everythingOff);
$smart->registerTrigger($bluetoothProximity);
$smart->registerCommand($everythingOff);


if (isset($argv[1]) && $argv[1] == 'cron') {

    //Download jobs from Google calendar
    $g = new Calendar();
    $g->auth(SmartHome::$db, 'calendar');
    $events = $g->getEvents(CRON_CALENDAR, date("Y-m-d"), date("Y-m-d", time()+3*24*3600));
    for ($i=0; $i < count($events); $i++) { 
        if(!isset($events[$i]['description'])) {
            $events[$i]['description'] = '';
        }
        SmartHome::$db->query("INSERT INTO SmartHome_events(id, start, end, name, args) VALUES('".$events[$i]['id']."','".$events[$i]['start']['dateTime']."','".$events[$i]['start']['dateTime']."','".$events[$i]['summary']."','".$events[$i]['description']."');");
    }

    $smart->checkTriggers();
    $smart->calendar();


} else if(isset($argv[1])) {

    $arr = array_slice($argv, 1);
    $smart->execute($arr, 'line');

} else if(isset($_GET['voice'])) {
    
    $argv = explode(',', $_GET['voice']);
    $arr = array_slice($argv, 1);
    $res = $smart->execute($arr, 'voice');

    if($res['error'] > 0) {
        print("ERROR ".$res['error']);
    } else {
        print($res['msg']);
    }

} else if (isset($_GET['action']) ){

    if($_GET['action'] == 'getStructure') {
        echo $smart->getJSON();
    } else {
        echo $smart->executeJSON($_GET['action']);
    }
    

} else {

	print("-1");

}


?>
