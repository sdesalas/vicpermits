TRUNCATE TABLE permits_by_postcode;

INSERT INTO permits_by_postcode (postcode, suburb, no_permits, opacity, cost_of_works )
SELECT site_pcode, MIN(Site_suburb), COUNT(*) AS no_permits, COUNT(*) / 1100 AS opacity, SUM(Reported_Cost_of_works)
FROM permits
GROUP BY site_pcode




CREATE TABLE `vicbuild`.`VBA-DataVic-Building-Permits-2010_csv`( `permit_date` DATE NULL , `cost_of_works` INT NULL , `suburb` VARCHAR(255) NULL , `postcode` INT(10) NULL , `region_type` VARCHAR(255) NULL , `solar_hot_water` INT(10) NULL , `rainwater_tank` INT(10) NULL )ENGINE=INNODB DEFAULT CHARSET = utf8;
CREATE TABLE `vicbuild`.`VBA-DataVic-Building-Permits-2011_csv`( `permit_date` DATE NULL , `cost_of_works` INT NULL , `suburb` VARCHAR(255) NULL , `postcode` INT(10) NULL , `region_type` VARCHAR(255) NULL , `solar_hot_water` INT(10) NULL , `rainwater_tank` INT(10) NULL )ENGINE=INNODB DEFAULT CHARSET = utf8;
CREATE TABLE `vicbuild`.`VBA-DataVic-Building-Permits-2012_csv`( `permit_date` DATE NULL , `cost_of_works` INT NULL , `suburb` VARCHAR(255) NULL , `postcode` INT(10) NULL , `region_type` VARCHAR(255) NULL , `solar_hot_water` INT(10) NULL , `rainwater_tank` INT(10) NULL )ENGINE=INNODB DEFAULT CHARSET = utf8;
CREATE TABLE `vicbuild`.`VBA-DataVic-Building-Permits-2013_csv`( `permit_date` DATE NULL , `cost_of_works` INT NULL , `suburb` VARCHAR(255) NULL , `postcode` INT(10) NULL , `region_type` VARCHAR(255) NULL , `solar_hot_water` INT(10) NULL , `rainwater_tank` INT(10) NULL )ENGINE=INNODB DEFAULT CHARSET = utf8;









-- 2010

TRUNCATE TABLE permits_by_postcode_2010;

INSERT INTO permits_by_postcode_2010 (postcode, suburb, no_permits, opacity, `type`, cost_of_works )
SELECT postcode, MIN(suburb), COUNT(*) AS no_permits, COUNT(*) / 500 AS opacity, MIN(region_type), SUM(cost_of_works)
FROM `vba-datavic-building-permits-2010_csv`
GROUP BY postcode;

SELECT COUNT(*) FROM permits_by_postcode_2010;

-- 2011

TRUNCATE TABLE permits_by_postcode_2011;

INSERT INTO permits_by_postcode_2011 (postcode, suburb, no_permits, opacity, `type`, cost_of_works )
SELECT postcode, MIN(suburb), COUNT(*) AS no_permits, COUNT(*) / 500 AS opacity, MIN(region_type), SUM(cost_of_works)
FROM `vba-datavic-building-permits-2011_csv`
GROUP BY postcode;

SELECT COUNT(*) FROM permits_by_postcode_2011;

-- 2012

TRUNCATE TABLE permits_by_postcode_2012;

INSERT INTO permits_by_postcode_2012 (postcode, suburb, no_permits, opacity, `type`, cost_of_works )
SELECT postcode, MIN(suburb), COUNT(*) AS no_permits, COUNT(*) / 500 AS opacity, MIN(region_type), SUM(cost_of_works)
FROM `vba-datavic-building-permits-2012_csv`
GROUP BY postcode;

SELECT COUNT(*) FROM permits_by_postcode_2012;

-- 2013

TRUNCATE TABLE permits_by_postcode_2013;

INSERT INTO permits_by_postcode_2013 (postcode, suburb, no_permits, opacity, `type`, cost_of_works )
SELECT postcode, MIN(suburb), COUNT(*) AS no_permits, COUNT(*) / 500 AS opacity, MIN(region_type), SUM(cost_of_works)
FROM `vba-datavic-building-permits-2013_csv`
WHERE postcode IS NOT NULL
GROUP BY postcode
;

SELECT COUNT(*) FROM permits_by_postcode_2013;

