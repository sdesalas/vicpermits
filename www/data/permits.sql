TRUNCATE TABLE permits_by_postcode;

INSERT INTO permits_by_postcode (postcode, suburb, no_permits, opacity, cost_of_works )
SELECT site_pcode, MIN(Site_suburb), COUNT(*) AS no_permits, COUNT(*) / 1100 AS opacity, SUM(Reported_Cost_of_works)
FROM permits
GROUP BY site_pcode