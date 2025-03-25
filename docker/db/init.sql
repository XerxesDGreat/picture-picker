CREATE DATABASE IF NOT EXISTS picturepicker;
USE picturepicker;

CREATE USER IF NOT EXISTS 'picturepicker'@'%' IDENTIFIED BY 'picturepicker';
GRANT ALL PRIVILEGES ON picturepicker.* TO 'picturepicker'@'%';
GRANT ALL PRIVILEGES ON *.* TO 'picturepicker'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES; 