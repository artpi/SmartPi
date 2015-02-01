
CREATE TABLE IF NOT EXISTS `states` (
  `key` varchar(128) NOT NULL,
  `state` varchar(128) NOT NULL,
  `updated` integer(13) NOT NULL,
  PRIMARY KEY (`key`)
) DEFAULT CHARSET=latin2;