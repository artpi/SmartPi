
CREATE TABLE IF NOT EXISTS `states` (
  `key` varchar(128) NOT NULL,
  `state` varchar(128) NOT NULL,
  `updated` integer(13) NOT NULL,
  PRIMARY KEY (`key`)
) DEFAULT CHARSET=latin2;

CREATE TABLE IF NOT EXISTS `SmartHome_events` (
  `id` varchar(128) NOT NULL,
  `start` timestamp NULL DEFAULT NULL,
  `end` timestamp NULL DEFAULT NULL,
  `name` varchar(256) NOT NULL,
  `args` text NOT NULL,
  `exec` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin2;