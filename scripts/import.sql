-- Run this from the root of the unzipped PTV data directory
-- because it expects paths to the data files to be relative to there
-- for the CSV import statements.

create table routes(
  route_id text primary key,
  agency_id text,
  route_short_name text,
  route_long_name text,
  route_type integer
);

create table trips(
  route_id text,
  service_id text,
  trip_id text primary key,
  shape_id text,
  trip_headsign text,
  direction_id integer
);

create index trip_route_id_idx on trips (route_id);
create index trip_shape_id_idx on trips (shape_id);

create table shapes(
  shape_id text,
  shape_pt_lat number,
  shape_pt_lon number,
  shape_pt_sequence integer,
  shape_dist_traveled number
);


create index shape_id_idx on shapes (shape_id);

.mode csv

-- -- Regional Train
-- .import 1/google_transit/routes.txt routes
-- .import 1/google_transit/trips.txt trips
-- .import 1/google_transit/shapes.txt shapes
--
-- -- Metro Train
-- .import 2/google_transit/routes.txt routes
-- .import 2/google_transit/trips.txt trips
-- .import 2/google_transit/shapes.txt shapes

-- Metro Tram
.import 3/google_transit/routes.txt routes
.import 3/google_transit/trips.txt trips
.import 3/google_transit/shapes.txt shapes

-- -- Metro Bus
-- .import 4/google_transit/routes.txt routes
-- .import 4/google_transit/trips.txt trips
-- .import 4/google_transit/shapes.txt shapes
--
-- -- Regional Coach
-- .import 5/google_transit/routes.txt routes
-- .import 5/google_transit/trips.txt trips
-- .import 5/google_transit/shapes.txt shapes
--
-- -- Regional Bus
-- .import 6/google_transit/routes.txt routes
-- .import 6/google_transit/trips.txt trips
-- .import 6/google_transit/shapes.txt shapes
--
-- -- TeleBus
-- .import 7/google_transit/routes.txt routes
-- .import 7/google_transit/trips.txt trips
-- .import 7/google_transit/shapes.txt shapes
--
-- -- NightRider
-- .import 8/google_transit/routes.txt routes
-- .import 8/google_transit/trips.txt trips
-- .import 8/google_transit/shapes.txt shapes
--
-- -- Interstate
-- .import 10/google_transit/routes.txt routes
-- .import 10/google_transit/trips.txt trips
-- .import 10/google_transit/shapes.txt shapes
--
-- -- SkyBus
-- .import 11/google_transit/routes.txt routes
-- .import 11/google_transit/trips.txt trips
-- .import 11/google_transit/shapes.txt shapes


-- Apparently you can't skip the header row when importing CSV?
-- So delete those rows manually here.
delete from routes where route_id = 'route_id';
delete from trips where route_id = 'route_id';
delete from shapes where shape_id = 'shape_id';

-- The raw data contains a lot of route shapes and services I don't understand.
-- Some are very short and don't fit the route overview I want.
-- So, this selects the longest shapes for each route and save them in
-- a summary table.
create table shape_lengths as select
  shape_id as shape_id,
  max(shape_dist_traveled) as shape_length
from shapes
group by shape_id;

create table route_best_shapes as select
  routes.route_short_name as short_name,
  routes.route_long_name as long_name,
  trips.shape_id as shape_id,
  routes.route_type as route_type,
  max(shape_lengths.shape_length) as shape_length
from routes
join trips on routes.route_id = trips.route_id
join shape_lengths on trips.shape_id = shape_lengths.shape_id
group by routes.route_long_name;
