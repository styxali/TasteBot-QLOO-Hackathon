API Overview
Insights API
The Insights API is the core of Qloo’s platform, designed to deliver taste-driven recommendations, insights, and analysis across all supported data categories. By supplying the right combination of entities, tags, demographics, audiences, and location, you can tailor the results to your use case.

At its core, the API is parameter-driven. Your results depend entirely on the parameters you include. To help you design and test requests effectively, Qloo provides several resources:

Insights API Deep Dive: Test your requests live and explore how parameter combinations shape results. The Deep Dive page is especially useful when you want to experiment with parameter behavior before implementation and see example requests and responses in real-time.
Parameter Overview: Understand how to choose and format parameters for your request use case.
Parameter Reference: Full definitions of all available parameters, including descriptions, types, and details.
Entity Type Parameter Guide: See which parameters are supported for each filter.type, including whether they are required or optional.
Key Use Cases
Recommendation Insights

Get top recommendations for any entity type

Demographic Insights

See how different audiences align with an entity or tag

Heatmaps

Visualize geographic affinity data

Location-Based Insights

Tailor results by geography

Taste Analysis

Retrieve metadata and taste-related tags

Supporting APIs
Qloo provides additional APIs to complement Insights by helping you discover valid input values, analyze trends, and compare entities or audiences. These APIs are organized into two functional groups:

Lookup APIs
Use these APIs to search for and validate IDs you can pass as parameters to Insights.

Entity Search: Search for entity IDs by name
Entity Search by ID: Search for entities by ID
Find Audiences: Search for audiences
Get Audience Types: List available audience types
Tags Search: Search for tags
Tag Types: Retrieve available tag types by entity category
Analysis & Trends APIs
Use these APIs to analyze, compare, and monitor entity or audience performance over time.

Analysis: Analyze a group of entities
Analysis Compare: Analyze and compare two groups of entities.
Trending Entities: Get the currently trending entities for a category
Week-Over-Week Trending Data: Get week-over-week trending data for an individual entity

Welcome to the Insights API! With our powerful API, you can take advantage of advanced AI-driven recommendations and insights. This guide will help you get up and running quickly by walking you through authentication, making your first API call, and exploring key features.

Accessing the API
Get an API Key
To get started, you'll need an API key. Simply contact us, and we'll generate one for you.

Authentication
Once you have your API key, authenticate your requests by including it in the request headers.

cURL
JavaScript
Python

curl --location --request GET 'https://staging.api.qloo.com/v2/insights?query=audi' \
--header 'Content-Type: application/json' \
--header 'X-Api-Key: <your-api-key>'
Making Your First API Call
Now that you're set up, you can make your first request. Here’s a request example that returns a list of movies tagged as comedies. It includes:

The API request URL
An entity type filter indicating the results should only include movies
A filter narrowing results to entities tagged with "comedy"
Your API key for authentication
Basic Insights Request Example

curl --location 'https://staging.api.qloo.com/v2/insights/?filter.type=urn:entity:movie&filter.tags=urn:tag:genre:media:comedy' \
--header 'x-api-key: x-api-key'
To dig deeper into a basic Insights request, explore our basic request use case.

Handling Responses
After making a request, you’ll receive a response like this:

Basic Insights Response Example

{
    "success": true,
    "results": {
        "entities": [
            {
                "name": "Django Unchained",
                "entity_id": "369D1544-628B-4C21-95A0-1488117A308A",
                "type": "urn:entity",
                "subtype": "urn:entity:movie",
                "properties": {
                    "release_year": 2012,
                    "release_date": "2012-12-25",
                    "description": "With the help of a German bounty-hunter, a freed slave sets out to rescue his wife from a brutal plantation owner in Mississippi.",
                    "content_rating": "R",
                    "duration": 165,
                    "image": {
                        "url": "https://staging.images.qloo.com/i/369D1544-628B-4C21-95A0-1488117A308A-420x-outside.jpg"
                    },
                    "akas": [
                        {
                            "value": "Django Unchained",
                            "languages": [
                                "fy"
                            ]
                        },
                        {
                            "value": "被解放的姜戈",
                            "languages": [
                                "zh"
                            ]
                        },
                        {
                            "value": "Джанго освобождённый",
                            "languages": [
                                "ru"
                            ]
                        },
. . .
 ],
                    "filming_location": "Evergreen Plantation - 4677 Highway 18, Edgard, Louisiana, USA",
                    "production_companies": [
                        "The Weinstein Company",
                        "Columbia Pictures"
                    ],
                    "release_country": [
                        "United States"
                    ],
                    "short_descriptions": [
                        {
                            "value": "filme de 2012 realizado por Quentin Tarantino",
                            "languages": [
                                "pt"
                            ]
                        },
                        {
                            "value": "அமெரிக்க மேற்கத்திய திரைப்படம்",
                            "languages": [
                                "ta"
                            ]
                        },
. . .
                    "popularity": 0.9998529346882951,
                    "tags": [
                    {
                        "id": "urn:tag:keyword:media:ex_slave",
                        "name": "Ex Slave",
                        "type": "urn:tag:keyword:media"
                    },
                    {
                        "id": "urn:tag:streaming_service:media:universcine",
                        "name": "Universcine",
                        "type": "urn:tag:streaming_service:media"
                    },
                    {
                        "id": "urn:tag:keyword:media:historical_fiction",
                        "name": "Historical Fiction",
                        "type": "urn:tag:keyword:media"
                    },
                    {
                        "id": "urn:tag:streaming_service:media:paramount_roku_premium_channel",
                        "name": "Paramount+ Roku Premium Channel",
                        "type": "urn:tag:streaming_service:media"
                    },
                    {
                        "id": "urn:tag:streaming_service:media:apple_tv",
                        "name": "Apple Tv",
                        "type": "urn:tag:streaming_service:media"
                    },
                    {
                        "id": "urn:tag:streaming_service:media:magentatv",
                        "name": "Magentatv",
                        "type": "urn:tag:streaming_service:media"
                    },
                    {
                        "id": "urn:tag:keyword:media:pre_civil_war",
                        "name": "Pre Civil War",
                        "type": "urn:tag:keyword:media"
                    },
                    {
                        "id": "urn:tag:streaming_service:media:movistar_plus",
                        "name": "Movistar Plus",
                        "type": "urn:tag:streaming_service:media"
                    },
                    {
. . .
               {
                "name": "Guardians of the Galaxy",
                "entity_id": "02F3FF8C-74F3-4188-A39D-24B34BEF3401",
                "type": "urn:entity",
                "subtype": "urn:entity:movie",
                "properties": {
                    "release_year": 2014,
                    "release_date": "2014-08-01",
                    "description": "A group of intergalactic criminals must pull together to stop a fanatical warrior with plans to purge the universe.",
                    "content_rating": "PG-13",
                    "duration": 121,
                    "image": {
                        "url": "https://staging.images.qloo.com/i/02F3FF8C-74F3-4188-A39D-24B34BEF3401-420x-outside.jpg"
                    },
                    "akas": [
                        {
                            "value": "Пазители на Галактиката",
                            "languages": [
                                "bg"
                            ]
                        },
                        {
                            "value": "Галактика сақшылары",
                            "languages": [
                                "kk"
                            ]
                        },
                        {
                            "value": "Galaktikas sargi",
                            "languages": [
                                "lv"
                            ]
                        },
. . .
                    ],
                    "filming_location": "Longcross Studios, Chobham Lane, Longcross, Chertsey, Surrey, England, UK",
                    "production_companies": [
                        "Moving Pictures Company",
                        "Walt Disney Pictures",
                        "Marvel Studios"
                    ],
                    "release_country": [
                        "United States",
                        "United Kingdom"
                    ],
                    "short_descriptions": [
                        {
                            "value": "2014 елның фильмы",
                            "languages": [
                                "tt"
                            ]
                        },
                        {
                            "value": "סרט מדע בדיוני מבית מארוול",
                            "languages": [
                                "he"
                            ]
                        },
                     ],
                    "websites": [
                        "http://www.facebook.com/guardiansmovie",
                        "https://www.instagram.com/guardiansofthegalaxy/"
                    ]
                },
                "popularity": 0.9996176301895672,
                "tags": [
                    {
                        "id": "urn:tag:streaming_service:media:directv",
                        "name": "Directv",
                        "type": "urn:tag:streaming_service:media"
                    },
                    {
                        "id": "urn:tag:keyword:media:raccoon",
                        "name": "Raccoon",
                        "type": "urn:tag:keyword:media"
                    },
                    {
                        "id": "urn:tag:keyword:media:ronan_accuser_character",
                        "name": "Ronan The Accuser Character",
                        "type": "urn:tag:keyword:media"
                    },
                    {
                        "id": "urn:tag:streaming_service:media:mediaset_infinity",
                        "name": "Mediaset Infinity",
                        "type": "urn:tag:streaming_service:media"
                    },
. . .
        ]
    },
    "duration": 22
}
The response contains details about the entities that match your request.

Key Features of the API
Flexible Input and Output: Seamlessly processes a wide range of data types—entities, tags, demographics, audiences, and location—allowing you to input and receive highly relevant results across the same categories.
Extensive Filtering and Customization: With a broad range of filters and signal parameters, you can fine-tune your queries to ensure the results are precisely tailored to your needs. Whether you're focusing on specific genres, demographics, or locations, the Insights API offers the flexibility you need.
Versatile Applications: Suitable for live personalization, CRM optimization, product development, media buying, and more.
Common Use Cases
The Insights API is versatile and can be applied across a wide range of use cases. It gives you the tools to unlock powerful insights into user preferences and behaviors.

Insights API Deep Dive
get
https://staging.api.qloo.com/v2/insights
Returns taste-based insights based on the input parameters you provide.

Qloo’s Insights API helps uncover the underlying factors that shape human preferences, offering cultural intelligence about how people relate to different entities like brands, artists, destinations, and more. It draws from billions of signals to deliver nuanced, taste-based insights that reflect real-world behavior and affinities.

This Deep Dive is designed to help users explore the full capabilities of the Insights API, emphasizing how different parameters shape results. It allows you to view and test the complete set of supported parameters directly on this page, making it easier to explore functionality in context and understand how different inputs impact responses.

Helpful Resources
Need to understand how current parameters map to legacy fields? Visit the Parameter Reference.
Want to know which parameters are valid for each entity type (like Actor, Destination, or Brand)? See the Entity Type Parameter Guide.
🚧
Participating in the Qloo LLM Hackathon?
Use the dedicated hackathon API URL for all requests:
https://hackathon.api.qloo.com

Hackathon API keys won’t work on staging or production URLs.

Not signed up yet? Join the hackathon here.

Query Params
filter.type
string
required
Filter by the category of entity to return (urn:entity:place).


urn:entity:artist
bias.trends
string
The level of impact a trending entity has on the results. Supported by select categories only.


low
diversify.by
string
Limits results to a set number of high-affinity entities per city. Set this to "properties.geocode.city" to enable city-based diversification. Cities are ranked based on the highest-affinity entity within them, and entities within each city are ordered by their individual affinities.

diversify.take
integer
≥ 1
Sets the maximum number of results to return per city when using "diversify.by": "properties.geocode.city". For example, if set to 5, the response will include up to 5 entities with the highest affinities in each city.

feature.explainability
boolean
When set to true, the response includes explainability metadata for each recommendation and for the overall result set. Default is set to false.

Per-recommendation: Each result includes a query.explainability section showing which input entities (e.g. signal.interests.entities) contributed to the recommendation and by how much. Scores are normalized between 0–1. Entities with scores ≥ 0.1 are always included; those below may be omitted to reduce response size.

Aggregate impact: The top-level query.explainability object shows average influence of each input entity across top-N result subsets (e.g. top 3, 5, 10, all).

Note: If explainability cannot be computed for the request, a warning is included under query.explainability.warning, but results still return normally.


true
filter.address
string
Filter by address using a partial string query.

filter.content_rating
string
Filter by a comma-separated list of content ratings based on the MPAA film rating system, which determines suitability for various audiences.


PG
filter.date_of_birth.max
date
Filter by the most recent date of birth desired for the queried person.

filter.date_of_birth.min
date
Filter by the earliest date of birth desired for the queried person.

filter.date_of_death.max
date
Filter by the most recent date of death desired for the queried person.

filter.date_of_death.min
date
Filter by the earliest date of death desired for the queried person.

filter.exclude.tags
string
Exclude entities associated with a comma-separated list of tags.

operator.exclude.tags
string
Specifies how multiple filter.exclude.tags values are combined in the query. Use "union" (equivalent to a logical "or") to exclude results that contain at least one of the specified tags, or "intersection" (equivalent to a logical "and") to exclude only results that contain all specified tags. The default is "union".


union
filter.exists
string
Filter results to include only entities that have one or more specified properties. Use properties.image to return only entities that include an image URL.

filter.external.exists
string
Filter by a comma-separated list of external keys. (resy|michelin|tablet).

operator.filter.external.exists
string
Specifies how multiple filter.external.exists values are combined in the query. Use "union" (equivalent to a logical "or") to return results that match at least one of the specified external keys (e.g., resy, michelin, or tablet), or "intersection" (equivalent to a logical "and") to return only results that match all specified external keys. The default is "union".


union
filter.external.resy.count.max
integer
≥ 0
Filter places to include only those with a Resy rating count less than or equal to the specified maximum. Applies only to entities with filter.type of urn:entity:place.

filter.external.resy.count.min
integer
≥ 0
Filter places to include only those with a Resy rating count greater than or equal to the specified minimum. Applies only to entities with filter.type of urn:entity:place.

filter.external.resy.party_size.max
integer
≥ 1
Filter by the maximum supported party size required for a Point of Interest.

filter.external.resy.party_size.min
integer
≥ 1
Filter by the minimum supported party size required for a Point of Interest.

filter.external.resy.rating.max
number
0 to 5
Filter places to include only those with a Resy rating less than or equal to the specified maximum (1–5 scale). Applies only to entities with filter.type of urn:entity:place.

filter.external.resy.rating.min
number
0 to 5
Filter places to include only those with a Resy rating greater than or equal to the specified minimum (1–5 scale). Applies only to entities with filter.type of urn:entity:place.

filter.external.tripadvisor.rating.count.min
integer
≥ 0
Filter places to include only those with a Tripadvisor review count greater than or equal to the specified minimum. This filter only applies to entities with filter.type of urn:entity:place.

filter.external.tripadvisor.rating.count.max
integer
≥ 0
Filter places to include only those with a Tripadvisor review count less than or equal to the specified maximum. This filter only applies to entities with filter.type of urn:entity:place.

filter.external.tripadvisor.rating.max
number
0 to 5
Filter places to include only those with a Tripadvisor rating less than or equal to the specified maximum. This filter only applies to entities with filter.type of urn:entity:place.

filter.external.tripadvisor.rating.min
number
0 to 5
Filter places to include only those with a Tripadvisor rating greater than or equal to the specified minimum. This filter only applies to entities with filter.type of urn:entity:place.

filter.finale_year.max
integer
Filter by the latest desired year for the final season of a TV show.

filter.finale_year.min
integer
Filter by the earliest desired year for the final season of a TV show.

filter.gender
string
Filter results to align with a specific gender identity. Used to personalize output based on known or inferred gender preferences.

filter.geocode.admin1_region
string
Filter by properties.geocode.admin1_region. Exact match (usually state).

filter.geocode.admin2_region
string
Filter by properties.geocode.admin2_region. Exact match (often county or borough).

filter.geocode.country_code
string
Filter by properties.geocode.country_code. Exact match (two-letter country code).

filter.geocode.name
string
Filter by properties.geocode.name. Exact match (usually city or town name).

filter.hotel_class.max
integer
1 to 5
Filter by the maximum desired hotel class (1-5, inclusive).

filter.hotel_class.min
integer
1 to 5
Filter by the minimum desired hotel class (1-5, inclusive).

filter.hours
string
Filter by the day of the week the Point of Interest must be open (Monday, Tuesday, etc.).


monday
filter.latest_known_year.max
integer
Filter by a certain maximum year that shows were released or updated.

filter.latest_known_year.min
integer
Filter by a certain minimum year that shows were released or updated.

filter.location
string
Used to filter by a WKT POINT, POLYGON, MULTIPOLYGON or a single Qloo ID for a named urn:entity:locality. WKT is formatted as X then Y, therefore longitude is first (POINT(-73.99823 40.722668)). If a Qloo ID or WKT POLYGON is passed, filter.location.radius will create a fuzzy boundary when set to a value > 0.

filter.exclude.location
string
Exclude results that fall within a specific location, defined by either a WKT POINT, POLYGON, MULTIPOLYGON, or a Qloo ID for a named urn:entity:locality. WKT is formatted with longitude first (e.g., POINT(-73.99823 40.722668)). When using a locality ID or a WKT POLYGON, setting filter.location.radius to a value > 0 creates a fuzzy exclusion boundary.

filter.location.query
A query used to search for one or more named urn:entity:locality Qloo IDs for filtering requests, equivalent to passing the same Locality Qloo ID(s) into filter.location.

For GET requests: Provide a single locality query as a string.
For POST requests:
You can still send a single locality as a string.
Or you can send an array of locality names to query multiple localities at once. When multiple localities are provided, their geographic shapes are merged, and the system returns results with the highest affinities across the combined area.
Locality queries are fuzzy-matched and case-insensitive. Examples include New York City, Garden City, New York, Los Angeles, Lower East Side, and AKAs like The Big Apple. When a single locality is supplied, the response JSON includes query.locality.signal with the matched Qloo entity. If multiple are supplied, this field is omitted. By default, the API includes a tuning that also captures nearby entities just outside the official boundaries of the locality. To turn this off and limit results strictly to within the locality, set filter.location.radius=0. If no localities are found, the API returns a 400 error.


string

array
filter.exclude.location.query
A query used to exclude results based on one or more named urn:entity:locality Qloo IDs, resolved from fuzzy-matched locality names. This is equivalent to passing the resolved Locality Qloo ID(s) into filter.exclude.location.

For GET requests: Provide a single locality query as a string. - For POST requests:
You can still send a single locality as a string.
Or send an array of locality names to exclude multiple areas at once. When multiple localities are provided, their geographic shapes are merged, and the system excludes results from across the combined area.
Locality queries are case-insensitive and support common AKAs (e.g., The Big Apple for New York). When a single locality is supplied, the response includes query.locality.exclude.signal with the matched Qloo entity. If multiple are supplied, this field is omitted. If no localities are matched, the API returns a 400 error.


string

array
filter.location.geohash
string
Filter by a geohash. Geohashes are generated using the Python package pygeohash with a precision of 12 characters. This parameter returns all POIs that start with the specified geohash. For example, supplying dr5rs would allow returning the geohash dr5rsjk4sr2w.

filter.exclude.location.geohash
string
Exclude all entities whose geohash starts with the specified prefix. Geohashes are generated using the Python package pygeohash with a precision of 12 characters. For example, supplying dr5rs would exclude any result whose geohash begins with dr5rs, such as dr5rsjk4sr2w.

filter.location.radius
integer
Filter by the radius (in meters) when also supplying filter.location or filter.location.query. When this parameter is not provided, the API applies a default tuning that slightly expands the locality boundary to include nearby entities outside its official shape. To disable this behavior and strictly limit results to entities inside the defined locality boundary, set filter.location.radius=0.

filter.parents.types
string
Filter by a comma-separated list of parental entity types.


urn:audience:communities
filter.popularity.max
number
0 to 1
Filter by the maximum popularity percentile a Point of Interest must have (float, between 0 and 1; closer to 1 indicates higher popularity, e.g., 0.98 for the 98th percentile).

filter.popularity.min
number
0 to 1
Filter by the minimum popularity percentile required for a Point of Interest (float, between 0 and 1; closer to 1 indicates higher popularity, e.g., 0.98 for the 98th percentile).

filter.price_level.max
integer
1 to 4
Filter by the maximum price level a Point of Interest can have (1|2|3|4, similar to dollar signs).

filter.price_level.min
integer
1 to 4
Filter by the minimum price level a Point of Interest can have (1|2|3|4, similar to dollar signs).

filter.price_range.from
integer
0 to 1000000
Filter places by a minimum price level, representing the lowest price in the desired range. Accepts an integer value between 0 and 1,000,000.

filter.price_range.to
integer
0 to 1000000
Filter places by a maximum price level, representing the highest price in the desired range. Accepts an integer value between 0 and 1,000,000. Only applies to places.

filter.price.max
float
maximum price

filter.price.min
float
minimum price

filter.properties.business_rating.max
float
Filter by the highest desired business rating.


3
filter.properties.business_rating.min
float
Filter by the lowest desired business rating.


3
filter.publication_year.max
number
Filter by the latest desired year of initial publication for the work.

filter.publication_year.min
number
Filter by the earliest desired year of initial publication for the work.

filter.rating.max
number
0 to 5
Filter by the maximum Qloo rating a Point of Interest must have (float, between 0 and 5).

filter.rating.min
number
0 to 5
Filter by the minimum Qloo rating a Point of Interest must have (float, between 0 and 5).

filter.references_brand
array of strings
Filter by a comma-separated list of brand entity IDs. Use this to narrow down place recommendations to specific brands. For example, to include only Walmart stores, pass the Walmart brand ID. Each ID must match exactly.


ADD string
filter.release_country
array of strings
Filter by a list of countries where a movie or TV show was originally released.


ADD string
operator.filter.release_country
string
Specifies how multiple `filter.release_country`` values are combined in the query. Use "union" (equivalent to a logical "or") to return results that match at least one of the specified countries, or "intersection" (equivalent to a logical "and") to return only results that match all specified countries. The default is "union".


union
filter.release_date.max
date
Filter by the latest desired release date.

filter.release_date.min
date
Filter by the earliest desired release date.

filter.release_year.max
integer
Filter by the latest desired release year.

filter.release_year.min
integer
Filter by the earliest desired release year.

filter.results.entities
string
Filter by a comma-separated list of entity IDs. Often used to assess the affinity of an entity towards input.

filter.results.entities.query
Search for one or more entities by name to use as filters. - For GET requests: Provide a single entity name as a string. - For POST requests: You can provide a single name or an array of names.


string

array
filter.exclude.entities
string
A comma-separated list of entity IDs to remove from the results.

filter.exclude.entities.query
array
This parameter can only be supplied when using POST HTTP method, since it requires JSON encoded body. The value for filter.exclude.entities.query is a JSON array with objects containing the name and address properties. For a fuzzier search, just include an array of strings. When supplied, it overwrites the filter.exclude.entities object with resolved entity IDs. The response will contain a path query.entities.exclude, with partial Qloo entities that were matched by the query. If no entities are found, the API will throw a 400 error.


ADD
filter.results.tags
array of strings
Filter by a comma-separated list of tag IDs. Often used to assess the affinity of a tag towards input.


ADD string
filter.tags
string
Filter by a comma-separated list of tag IDs (urn:tag:genre:restaurant:Italian).

operator.filter.tags
string
Specifies how multiple filter.tags values are combined in the query. Use "union" (equivalent to a logical "or") to return results that match at least one of the specified tags, or "intersection" (equivalent to a logical "and") to return only results that match all specified tags. The default is "union".


union
offset
integer
The number of results to skip, starting from 0. Allows arbitrary offsets but is less commonly used than page.

output.heatmap.boundary
string
Indicates the type of heatmap output desired: The default is geohashes. The other options are a city or a neighborhood.

page
integer
≥ 1
The page number of results to return. This is equivalent to take + offset and is the recommended approach for most use cases.

signal.demographics.age
string
A comma-separated list of age ranges that influence the affinity score.(35_and_younger|36_to_55|55_and_older).


36_to_55
signal.demographics.age.weight
Specifies the extent to which results should be influenced by age-based demographic signals. Higher values increase the influence of age data; lower values reduce its impact.


number

string
signal.demographics.audiences.weight
Specifies the extent to which results should be influenced by the preferences of the selected audience. Higher values increase the influence of audience preferences; lower values reduce their impact.


number

string
signal.demographics.audiences
array of strings
A comma-separated list of audiences that influence the affinity score. Audience IDs can be retrieved via the v2/audiences search route.


ADD string
signal.demographics.gender
string
Influence the affinity score based on gender (male|female).


male
signal.demographics.gender.weight
Specifies the extent to which results should be influenced by gender-based demographic signals. Higher values increase the influence of gender data; lower values reduce its impact.


number

string
signal.interests.entities
array of strings
Allows you to supply a list of entities to influence affinity scores.For GET requests, provide a comma-separated list of entity IDs.


ADD string
signal.interests.entities.query
array
This parameter can only be supplied when using POST HTTP method, which requires a JSON-encoded body. The value should be a JSON array of objects with 'name' and 'address' properties; supports 'resolve_to' for specifying resolution to place, brand, or both.


ADD
signal.interests.entities.weight
Specifies the extent to which results should be influenced by the relevance of entities (in-domain or cross-domain). Higher values increase the influence of entities; lower values reduce their impact.


number

string
signal.interests.tags
Allows you to supply a list of tags to influence affinity scores. You can also include a weight property that will indicate the strength of influence for each tag in your list.

For GET requests: Provide a comma-separated list of tag IDs.
For POST requests, you can either:
Send the same string of comma-separated values.
Send an array of objects with "tag" and "weight" properties, such as: [ { "tag": "urn:tag:genre:media:horror", "weight": 7 }, { "tag": "urn:tag:genre:media:thriller", "weight": 20 } ] Weights must be greater than 0 and are relative. So, a weight of 20 means that tag will more heavily influence affinity scores than a weight of 7.

array

array
signal.interests.tags.weight
Specifies the extent to which results should be influenced by the presence of tags (taste analysis). Higher values increase the influence of tags; lower values reduce their impact.


number

string
signal.location
string
The geolocation to use for geospatial results. The value will be a WKT POINT, POLYGON or a single Qloo ID for a named urn:entity:locality to filter by. WKT is formatted as X then Y, therefore longitude is first (POINT(-73.99823 40.722668)). Unlike filter.location.radius, signal.location.radius is ignored if a Qloo ID or WKT POLYGON is passed.

signal.location.radius
integer
The optional radius (in meters), used when providing a WKT POINT. We generally recommend avoiding this parameter, as it overrides dynamic density discovery.

signal.location.query
string
A string query used to search for a named urn:entity:locality Qloo ID for geospatial results, effectively equivalent to passing the same Locality Qloo ID into signal.location. Examples of locality queries include New York City, Garden City, New York, Los Angeles, Lower East Side, and AKAs like The Big Apple. These queries are fuzzy-matched and case-insensitive. When filter.location.query is supplied, the response JSON will include query.locality.signal, which contains the partially matched Qloo entity. If no locality is found, the API will return a 400 error.

signal.location.weight
Specifies the extent to which results should be influenced by location-based signals (geospatial). Higher values increase the influence of location; lower values reduce its impact.


number

string
sort_by
string
This parameter modifies the results sorting algorithm (affinity|distance). The distance option can only be used when `filter.location`` is supplied.


affinity
take
integer
≥ 1
The number of results to return.

Responses

200
Successful Operation

400
Bad Request

500
Internal Server Error

Parameter Overview
The Parameter Reference and the Entity Type Parameter Guide are two companion documents designed to help you craft valid, effective API requests to the Qloo Insights API.

Parameter Reference: A comprehensive dictionary of all supported parameters, with descriptions, formats, and legacy mappings.
Entity Type Parameter Guide: A lookup matrix that tells you which parameters are valid for which filter.type values (e.g., place, movie, brand).
Together, these guides answer two essential questions:

What does this parameter do, and how do I format it?
Is this parameter allowed for my chosen entity type?
How to Use These Together
1. Start With Your Use Case
Identify the entity type you want to recommend or analyze (e.g., filter.type=urn:entity:place for a place recommendation).
Refer to the Entity Type Parameter Guide and find the table for your target entity type.
2. Review Allowed Parameters
Under that entity type, review which parameters are required and which are optional.
Make sure your request includes all required parameters (filter.type is always required for the Insights API).
3. Learn What Each Parameter Does
For each allowed parameter in the entity type guide, look it up in the Parameter Reference to understand:
What the parameter filters or signals
Expected data type (string, integer, etc.).
Valid values or formats.
Whether it supports advanced modes (e.g., POST body with JSON arrays).
4. Craft Your Request
Build your API request by combining the parameters that are valid for your entity type and whose purpose aligns with your goal.

For example:

For Italian restaurant recommendations, include these parameters:
filter.type=urn:entity:place
filter.tags=urn:tag:genre:place:restaurant:italian
For movie recommendations from a particular decade and genre, include these parameters:
filter.type=urn:entity:movie
filter.release_year.min=1990
filter.release_year.max=1999
filter.tags=urn:tag:keyword:qloo:romantic_comedy

Parameter Reference
This is a comprehensive list of parameters for the Insights API:

Filters: Specify what kind of results you want. These parameters narrow the results to a specific entity type (like movies, places, or artists), tags, or location.
Signals: Specify what to base the recommendations on. These parameters influence the ranking by providing context, such as audience demographics, user interests, or related entities.
Output: Specify how the results are presented. These parameters control aspects like the number of results displayed (take) and which page of results to show (page).
📘
Related Resources
Parameter Overview: Understand how to choose and format parameters for your request use case.
Entity Type Parameter Guide: See which parameters are supported for each filter.type, including whether they are required or optional.
FiltersSignalsOutput
Parameter Name	Type	Description	Compatible Entity Types
filter.address

string

Filter by address using a partial string query.

Place
filter.audience.types

array of strings

Filter by a list of audience types.

filter.content_rating

string

Filter by a comma-separated list of content ratings based on the MPAA film rating system, which determines suitability for various audiences.

Movie, TV Show
filter.date_of_birth.max

string, YYYY-MM-DD

Filter by the most recent date of birth desired for the queried person.

Person
filter.date_of_birth.min

string, YYYY-MM-DD

Filter by the earliest date of birth desired for the queried person.

Person
filter.date_of_death.max

string, YYYY-MM-DD

Filter by the most recent date of death desired for the queried person.

Person
filter.date_of_death.min

string, YYYY-MM-DD

Filter by the earliest date of death desired for the queried person.

Person
filter.entities

string

Filter by a comma-separated list of entity IDs. Often used to assess the affinity of an entity towards input.

filter.entity_ids

filter.exclude.entities

string

A comma-separated list of entity IDs to remove from the results.

Artist, Book, Brand, Destination, Movie, Person, Place, Podcast, TV Show, Video Game

filter.exclude.entities.query

This parameter can only be supplied when using POST HTTP method, since it requires JSON encoded body. The value for filter.exclude.entities.query is a JSON array with objects containing the name and address properties. For a fuzzier search, just include an array of strings. When supplied, it overwrites the filter.exclude.entities object with resolved entity IDs. The response will contain a path query.entities.exclude, with partial Qloo entities that were matched by the query. If no entities are found, the API will throw a 400 error.

Artist, Book, Brand, Destination, Movie, Person, Place, Podcast, TV Show, Video Game

filter.exclude.tags

string

Exclude entities associated with a comma-separated list of tags.

Artist, Book, Brand, Destination, Movie, Person, Place, Podcast, TV Show, Video Game

operator.exclude.tags

string

Specifies how multiple filter.exclude.tags values are combined in the query. Use "union" (equivalent to a logical "or") to exclude results that contain at least one of the specified tags, or "intersection" (equivalent to a logical "and") to exclude only results that contain all specified tags. The default is "union".

Artist, Book, Brand, Destination, Movie, Person, Place, Podcast, TV Show, Video Game

filter.external.exists

string

Filter by a comma-separated list of external keys.
(resy|michelin|tablet).

Artist, Book, Brand, Destination, Movie, Person, Place, Podcast, TV Show, Video Game

operator.filter.external.exists

string

Specifies how multiple filter.external.exists values are combined in the query. Use "union" (equivalent to a logical "or") to return results that match at least one of the specified external keys (e.g., resy, michelin, or tablet), or "intersection" (equivalent to a logical "and") to return only results that match all specified external keys. The default is "union".

Artist, Book, Brand, Destination, Movie, Person, Place, Podcast, TV Show, Video Game

filter.external.resy.count.max

integer

Filter places to include only those with a Resy rating count less than or equal to the specified maximum. Applies only to entities with filter.type of urn:entity:place.

filter.external.resy.count.min

integer

Filter places to include only those with a Resy rating count greater than or equal to the specified minimum. Applies only to entities with filter.type of urn:entity:place.

filter.external.resy.party_size.max

integer

Filter by the maximum supported party size required for a Point of Interest.

filter.external.resy.party_size.min

integer

Filter by the minimum supported party size required for a Point of Interest.

filter.external.resy.rating.max

float

Filter places to include only those with a Resy rating less than or equal to the specified maximum (1–5 scale). Applies only to entities with filter.type of urn:entity:place.

filter.external.resy.rating.min

float

Filter places to include only those with a Resy rating greater than or equal to the specified minimum (1–5 scale). Applies only to entities with filter.type of urn:entity:place.

filter.external.tripadvisor.rating.count.max

integer

Filter places to include only those with a Tripadvisor review count less than or equal to the specified maximum.
This filter only applies to entities with filter.type of urn:entity:place.

Place

filter.external.tripadvisor.rating.count.min

integer

Filter places to include only those with a Tripadvisor review count greater than or equal to the specified minimum.
This filter only applies to entities with filter.type of urn:entity:place.

Place

filter.external.tripadvisor.rating.max

float

Filter places to include only those with a Tripadvisor rating less than or equal to the specified maximum. This filter only applies to entities with filter.type of urn:entity:place.

Place

filter.external.tripadvisor.rating.min

float

Filter places to include only those with a Tripadvisor rating greater than or equal to the specified minimum. This filter only applies to entities with filter.type of urn:entity:place.

Place

filter.finale_year.max

integer

Filter by the latest desired year for the final season of a TV show.

TV Show

filter.finale_year.min

integer

Filter by the earliest desired year for the final season of a TV show.

TV Show

filter.gender

string

Filter results to align with a specific gender identity. Used to personalize output based on known or inferred gender preferences.

Person

filter.geocode.admin1_region

string

Filter by properties.geocode.admin1_region. Exact match (usually state).

Destination, Place

filter.geocode.admin2_region

string

Filter by properties.geocode.admin2_region. Exact match (often county or borough).

Destination, Place

filter.geocode.country_code

string

Filter by properties.geocode.country_code. Exact match (two-letter country code).

Destination, Place

filter.geocode.name

string

Filter by properties.geocode.name. Exact match (usually city or town name).

Destination, Place

filter.hotel_class.max

integer

Filter by the maximum desired hotel class (1-5, inclusive).

Place

filter.hotel_class.min

integer

Filter by the minimum desired hotel class (1-5, inclusive).

Place

filter.hours

string

Filter by the day of the week the Point of Interest must be open (Monday, Tuesday, etc.).

Place

filter.ids

string

Filter by a comma-separated list of audience IDs.

filter.latest_known_year.max

integer

Filter by a certain maximum year that shows were released or updated.

TV Show

filter.latest_known_year.min

integer

Filter by a certain minimum year that shows were released or updated.

TV Show

filter.location

string

Filter by a WKT POINT, POLYGON, MULTIPOLYGON or a single Qloo ID for a named urn:entity:locality.

WKT is formatted as X then Y, therefore longitude is first (POINT(-73.99823 40.722668)).

If a Qloo ID or WKT POLYGON is passed, filter.location.radius will create a <glossary:fuzzy> boundary when set to a value > 0.

Destination, Place

filter.exclude.location

string

Exclude results that fall within a specific location, defined by either a WKT POINT, POLYGON, MULTIPOLYGON, or a Qloo ID for a named urn:entity:locality.
WKT is formatted with longitude first (e.g., POINT(-73.99823 40.722668)).
When using a locality ID or a WKT POLYGON, setting filter.location.radius to a value > 0 creates a fuzzy exclusion boundary.

Destination, Place

filter.location.query

string

A query used to search for one or more named urn:entity:locality Qloo IDs for filtering requests, equivalent to passing the same Locality Qloo ID(s) into filter.location.

For GET requests: Provide a single locality query as a string.
For POST requests:
You can still send a single locality as a string.
Or you can send an array of locality names to query multiple localities at once. When multiple localities are provided, their geographic shapes are merged, and the system returns results with the highest affinities across the combined area.Locality queries are fuzzy-matched and case-insensitive. Examples include New York City, Garden City, New York, Los Angeles, Lower East Side, and AKAs like The Big Apple. When a single locality is supplied, the response JSON includes query.locality.signal with the matched Qloo entity. If multiple are supplied, this field is omitted. By default, the API includes a tuning that also captures nearby entities just outside the official boundaries of the locality. To turn this off and limit results strictly to within the locality, set filter.location.radius=0. If no localities are found, the API returns a 400 error.
Destination, Place

filter.exclude.location.query

string

Exclude results that fall within a specific location, defined by either a WKT POINT, POLYGON, MULTIPOLYGON, or a Qloo ID for a named urn:entity:locality.
WKT is formatted with longitude first (e.g., POINT(-73.99823 40.722668)).
When using a locality ID or a WKT POLYGON, setting filter.location.radius to a value > 0 creates a fuzzy exclusion boundary.

Destination, Place

filter.location.geohash

string

Filter by a geohash. Geohashes are generated using the Python package pygeohash with a precision of 12 characters. This parameter returns all POIs that start with the specified geohash. For example, supplying dr5rs would allow returning the geohash dr5rsjk4sr2w.

Destination, Place

filter.exclude.location.geohash

string

Exclude all entities whose geohash starts with the specified prefix.
Geohashes are generated using the Python package pygeohash with a precision of 12 characters.
For example, supplying dr5rs would exclude any result whose geohash begins with dr5rs, such as dr5rsjk4sr2w.

Destination, Place

filter.location.radius

integer

Filter by the radius (in meters) when also supplying filter.location or filter.location.query.
When this parameter is not provided, the API applies a default tuning that slightly expands the locality boundary to include nearby entities outside its official shape.
To disable this behavior and strictly limit results to entities inside the defined locality boundary, set filter.location.radius=0.

Destination, Place

filter.parents.types

array of strings

Filter by a comma-separated list of parental entity types (urn:entity:place). Each type must match exactly.

Artist, Book, Brand, Destination, Movie, Person, Place, Podcast, TV Show, Video Game

filter.popularity.max

number

Filter by the maximum popularity percentile a Point of Interest must have (float, between 0 and 1; closer to 1 indicates higher popularity, e.g., 0.98 for the 98th percentile).

Artist, Book, Brand, Destination, Movie, Person, Place, Podcast, TV Show, Video Game

filter.popularity.min

number

Filter by the minimum popularity percentile required for a Point of Interest (float, between 0 and 1; closer to 1 indicates higher popularity, e.g., 0.98 for the 98th percentile).

Artist, Book, Brand, Destination, Movie, Person, Place, Podcast, TV Show, Video Game

filter.price_level.max

integer

Filter by the maximum price level a Point of Interest can have (1|2|3|4, similar to dollar signs).

Place

filter.price_level.min

integer

Filter by the minimum price level a Point of Interest can have (1|2|3|4, similar to dollar signs).

Place

filter.price_range.from

integer

Filter places by a minimum price level, representing the lowest price in the desired range. Accepts an integer value between 0 and 1,000,000.

Place

filter.price_range.to

integer

Filter places by a maximum price level, representing the highest price in the desired range. Accepts an integer value between 0 and 1,000,000.

Place

filter.properties.business_rating.max

float

Filter by the highest desired business rating.

Place

filter.properties.business_rating.min

float

Filter by the lowest desired business rating.

Place

filter.publication_year.max

number

Filter by the latest desired year of initial publication for the work.

Book

filter.publication_year.min

number

Filter by the earliest desired year of initial publication for the work.

Book

filter.rating.max

number

Filter by the maximum Qloo rating a Point of Interest must have (float, between 0 and 5).

Movie, TV Show

filter.rating.min

number

Filter by the minimum Qloo rating a Point of Interest must have (float, between 0 and 5).

Movie, TV Show

filter.references_brand

array of strings

Filter by a comma-separated list of brand entity IDs. Use this to narrow down place recommendations to specific brands. For example, to include only Walmart stores, pass the Walmart brand ID. Each ID must match exactly.

Place

filter.release_country

array of strings

Filter by a list of countries where a movie or TV show was originally released.

Movie, TV Show

filter.results.entities

Filter by a comma-separated list of entity IDs. Often used to assess the affinity of an entity towards input.

Artist, Book, Brand, Destination, Movie, Person, Place, Podcast, TV Show, Video Game

filter.results.entities.query

Search for one or more entities by name to use as filters.

For GET requests: Provide a single entity name as a string.
For POST requests: You can provide a single name or an array of names.
Artist, Book, Brand, Destination, Movie, Person, Place, Podcast, TV Show, Video Game

operator.filter.release_country

string

Specifies how multiple filter.release_country values are combined in the query. Use "union" (equivalent to a logical "or") to return results that match at least one of the specified countries, or "intersection" (equivalent to a logical "and") to return only results that match all specified countries. The default is "union".

Movie, TV Show

filter.release_date.max

string, YYYY-MM-DD

Filter by the latest desired release date.

filter.release_date.min

string, YYYY-MM-DD

Filter by the earliest desired release date.

filter.release_year.max

integer

Filter by the latest desired release year.

Movie, TV Show

filter.release_year.min

integer

Filter by the earliest desired release year.

Movie, TV Show

filter.tag.types

array of strings

Filter by a comma-separated list of audience types. Each audience type requires an exact match. You can retrieve a complete list of audience types via the v2/audiences/types route.

filter.tags

string

Filter by a comma-separated list of tag IDs (urn:tag:genre:restaurant:Italian).

Artist, Book, Brand, Destination, Movie, Person, Place, Podcast, TV Show, Video Game

operator.filter.tags

string

Specifies how multiple filter.tags values are combined in the query. Use "union" (equivalent to a logical "or") to return results that match at least one of the specified tags, or "intersection" (equivalent to a logical "and") to return only results that match all specified tags. The default is "union".

Artist, Book, Brand, Destination, Movie, Person, Place, Podcast, TV Show, Video Game

filter.type

string

Filter by the <<glossary:entity type>> to return (urn:entity:place).

Artist, Book, Brand, Destination, Movie, Person, Place, Podcast, TV Show, Video Game


Entity Type Parameter Guide
Select parameters supported by your chosen entity type (filter.type).

Use this guide to identify which parameters are supported for your chosen filter.type (entity type).

An entity type (filter.type) defines the category of entities you want insights and recommendations for, such as a brand, place, movie, or person. Each entity type supports a specific set of filters and signals, tailored to its characteristics.

📘
Related Resources
Parameter Overview: Understand how to choose and format parameters for your request use case.
Parameter Reference: Full definitions of all available parameters, including descriptions, types, and details.
Conditional Parameters
The parameters you can include in a request depend on the selected filter.type value: Artist, Book, Brand, Destination, Movie, Person, Place, Podcast, TV Show, Video Game.

For each entity type section below, you’ll see:

A short description of the entity type.
A table of supported parameters for that type, indicating whether each is required or optional.
Artist
Represents individuals or groups who create or perform works of art, including musicians, visual artists, and performers. Supported parameters for artists:

Parameter Name	Required/Optional
filter.type	Required
bias.trends	Optional
filter.exclude.entities	Optional
filter.parents.types	Optional
filter.popularity.min	Optional
filter.popularity.max	Optional
filter.exclude.tags	Optional
operator.exclude.tags	Optional
filter.external.exists	Optional
operator.filter.external.exists	Optional
filter.results.entities	Optional
filter.results.entities.query	Optional
filter.tags	Optional
operator.filter.tags	Optional
offset	Optional
signal.demographics.age	Optional
signal.demographics.audiences	Optional
signal.demographics.audiences.weight	Optional
signal.demographics.gender	Optional
signal.interests.entities	Optional
signal.interests.tags	Optional
take	Optional
Book
Represents written works such as novels, non-fiction books, and other published literary content. Supported parameters for books:

Parameter Name	Required/Optional
filter.type	Required
bias.trends	Optional
filter.exclude.entities	Optional
filter.exclude.tags	Optional
operator.exclude.tags	Optional
filter.external.exists	Optional
operator.filter.external.exists	Optional
filter.parents.types	Optional
filter.popularity.min	Optional
filter.popularity.max	Optional
filter.publication_year.min	Optional
filter.publication_year.max	Optional
filter.results.entities	Optional
filter.results.entities.query	Optional
filter.tags	Optional
operator.filter.tags	Optional
offset	Optional
signal.demographics.audiences	Optional
signal.demographics.age	Optional
signal.demographics.audiences.weight	Optional
signal.demographics.gender	Optional
signal.interests.entities	Optional
signal.interests.tags	Optional
take	Optional
Brand
Represents commercial brands, including retail chains, consumer products, and service companies. Supported parameters for brands:

Parameter Name	Required/Optional
filter.type	Required
bias.trends	Optional
filter.exclude.entities	Optional
operator.exclude.tags	Optional
filter.exclude.tags	Optional
filter.external.exists	Optional
operator.filter.external.exists	Optional
filter.parents.types	Optional
filter.popularity.min	Optional
filter.popularity.max	Optional
filter.results.entities	Optional
filter.results.entities.query	Optional
filter.tags	Optional
operator.filter.tags	Optional
signal.demographics.age	Optional
signal.demographics.audiences	Optional
signal.demographics.audiences.weight	Optional
signal.interests.entities	Optional
signal.demographics.gender	Optional
signal.interests.tags	Optional
offset	Optional
take	Optional
Destination
Represents geographic destinations, including cities, neighborhoods, or notable areas people visit. Supported parameters for destinations:

Parameter Name	Required/Optional
filter.type	Required
bias.trends	Optional
filter.exclude.entities	Optional
filter.external.exists	Optional
operator.filter.external.exists	Optional
filter.exclude.tags	Optional
operator.exclude.tags	Optional
filter.geocode.name	Optional
filter.geocode.admin1_region	Optional
filter.geocode.admin2_region	Optional
filter.geocode.country_code	Optional
filter.location	Optional
filter.location.radius	Optional
filter.location.geohash	Optional
filter.exclude.location.geohash	Optional
filter.parents.types	Optional
filter.popularity.min	Optional
filter.popularity.max	Optional
filter.results.entities	Optional
filter.results.entities.query	Optional
filter.tags	Optional
operator.filter.tags	Optional
offset	Optional
signal.demographics.age	Optional
signal.demographics.audiences	Optional
signal.demographics.audiences.weight	Optional
signal.demographics.gender	Optional
signal.interests.entities	Required
signal.interests.tags	Optional
take	Optional
Movie
Represents feature-length films and cinematic works. Supported parameters for movies:

Parameter Name	Required/Optional
filter.type	Required
bias.trends	Optional
filter.content_rating	Optional
filter.exclude.entities	Optional
filter.external.exists	Optional
operator.filter.external.exists	Optional
filter.exclude.tags	Optional
operator.exclude.tags	Optional
filter.parents.types	Optional
filter.popularity.min	Optional
filter.popularity.max	Optional
filter.release_year.min	Optional
filter.release_year.max	Optional
filter.release_country	Optional
operator.filter.release_country	Optional
filter.rating.min	Optional
filter.rating.max	Optional
filter.results.entities	Optional
filter.results.entities.query	Optional
filter.tags	Optional
operator.filter.tags	Optional
offset	Optional
signal.demographics.audiences	Optional
signal.demographics.age	Optional
signal.demographics.audiences.weight	Optional
signal.demographics.gender	Optional
signal.interests.entities	Optional
signal.interests.tags	Optional
take	Optional
Person
Represents individual people, encompassing all roles such as actors, authors, directors, politicians, and public figures. Supported parameters for people:

Parameter Name	Required/Optional
filter.type	Required
bias.trends	Optional
filter.date_of_birth.min	Optional
filter.date_of_birth.max	Optional
filter.date_of_death.min	Optional
filter.date_of_death.max	Optional
filter.exclude.entities	Optional
filter.external.exists	Optional
operator.filter.external.exists	Optional
filter.exclude.tags	Optional
operator.exclude.tags	Optional
filter.gender	Optional
filter.parents.types	Optional
filter.popularity.max	Optional
filter.popularity.min	Optional
filter.results.entities	Optional
filter.results.entities.query	Optional
filter.tags	Optional
operator.filter.tags	Optional
offset	Optional
signal.demographics.age	Optional
signal.demographics.audiences	Optional
signal.demographics.audiences.weight	Optional
signal.demographics.gender	Optional
signal.interests.entities	Optional
signal.interests.tags	Optional
take	Optional
Place
Represents points of interest, such as restaurants, hotels, venues, landmarks, and businesses, tied to a specific physical location. Supported parameters for places:

Parameter Name	Required/Optional
filter.type	Required
bias.trends	Optional
filter.address	Optional
filter.exclude.entities	Optional
filter.exclude.tags	Optional
operator.exclude.tags	Optional
filter.external.exists	Optional
operator.filter.external.exists	Optional
filter.external.tripadvisor.rating.count.max	Optional
filter.external.tripadvisor.rating.count.min	Optional
filter.external.tripadvisor.rating.max	Optional
filter.external.tripadvisor.rating.min	Optional
filter.geocode.name	Optional
filter.geocode.admin1_region	Optional
filter.geocode.admin2_region	Optional
filter.geocode.country_code	Optional
filter.hotel_class.max	Optional
filter.hotel_class.min	Optional
filter.hours	Optional
filter.location	Optional
filter.location.geohash	Optional
filter.exclude.location.geohash	Optional
filter.location.radius	Optional
filter.parents.types	Optional
filter.popularity.min	Optional
filter.popularity.max	Optional
filter.price_level.min	Optional
filter.price_level.max	Optional
filter.price_range.from	Optional
filter.price_range.to	Optional
filter.properties.business_rating.min	Optional
filter.properties.business_rating.max	Optional
filter.properties.resy.rating.min	Optional
filter.properties.resy.rating.max	Optional
filter.references_brand	Optional
filter.results.entities	Optional
filter.results.entities.query	Optional
filter.resy.rating_count.min	Optional
filter.resy.rating_count.max	Optional
filter.resy.rating.party.min	Optional
filter.resy.rating.party.max	Optional
filter.tags	Optional
operator.filter.tags	Optional
offset	Optional
signal.demographics.age	Optional
signal.demographics.audiences	Optional
signal.demographics.audiences.weight	Optional
signal.demographics.gender	Optional
signal.interests.entities	Optional
signal.interests.tags	Optional
take	Optional
Podcast
Represents episodic audio series and shows distributed through podcast platforms. Supported parameters for podcasts:

Parameter Name	Required/Optional
filter.type	Required
bias.trends	Optional
filter.exclude.entities	Optional
filter.exclude.tags	Optional
operator.exclude.tags	Optional
filter.external.exists	Optional
operator.filter.external.exists	Optional
filter.parents.types	Optional
filter.popularity.max	Optional
filter.popularity.min	Optional
filter.results.entities	Optional
filter.results.entities.query	Optional
filter.tags	Optional
operator.filter.tags	Optional
offset	Optional
signal.demographics.gender	Optional
signal.demographics.age	Optional
signal.demographics.audiences	Optional
signal.demographics.audiences.weight	Optional
signal.interests.entities	Optional
signal.interests.tags	Optional
take	Optional
TV Show
Represents television content, including scripted series, reality shows, and specials. Supported parameters for TV shows:

Parameter Name	Required/Optional
filter.type	Required
bias.trends	Optional
filter.content_rating	Optional
filter.exclude.entities	Optional
filter.external.exists	Optional
operator.filter.external.exists	Optional
filter.exclude.tags	Optional
operator.exclude.tags	Optional
filter.finale_year.max	Optional
filter.finale_year.min	Optional
filter.latest_known_year.max	Optional
filter.latest_known_year.min	Optional
filter.parents.types	Optional
filter.popularity.max	Optional
filter.popularity.min	Optional
filter.release_year.max	Optional
filter.release_year.min	Optional
filter.release_country	Optional
operator.filter.release_country	Optional
filter.rating.max	Optional
filter.rating.min	Optional
filter.results.entities	Optional
filter.results.entities.query	Optional
filter.tags	Optional
operator.filter.tags	Optional
offset	Optional
signal.demographics.age	Optional
signal.demographics.audiences	Optional
signal.demographics.audiences.weight	Optional
signal.demographics.gender	Optional
signal.interests.entities	Optional
signal.interests.tags	Optional
take	Optional
Video Game
Represents interactive digital games available on various gaming platforms. Supported parameters for video games:

Parameter Name	Required/Optional
filter.type	Required
bias.trends	Optional
filter.exclude.entities	Optional
filter.exclude.tags	Optional
operator.exclude.tags	Optional
filter.external.exists	Optional
operator.filter.external.exists	Optional
filter.parents.types	Optional
filter.popularity.min	Optional
filter.popularity.max	Optional
filter.results.entities	Optional
filter.results.entities.query	Optional
filter.tags	Optional
operator.filter.tags	Optional
offset	Optional
signal.demographics.age	Optional
signal.demographics.audiences	Optional
signal.demographics.audiences.weight	Optional
signal.demographics.gender	Optional
signal.interests.entities	Optional
signal.interests.tags	Optional
take	Optional
Deprecated Entity Types
🚧
The following entity types are deprecated. We recommend using the Person entity type instead.

Actor
Deprecated: Use the Person entity type instead.

If your request is for actors, these are the parameters you can use:

Parameter Name	Required/Optional
filter.type	Required
signal.interests.entities	Optional
signal.interests.tags	Optional
signal.demographics.gender	Optional
signal.demographics.age	Optional
bias.trends	Optional
signal.demographics.audiences	Optional
signal.demographics.audiences.weight	Optional
filter.exclude.entities	Optional
filter.popularity.min	Optional
filter.popularity.max	Optional
filter.results.entities	Optional
filter.results.entities.query	Optional
filter.tags	Optional
operator.filter.tags	Optional
filter.exclude.tags	Optional
operator.exclude.tags	Optional
filter.external.exists	Optional
operator.filter.external.exists	Optional
offset	Optional
take	Optional
Author
Deprecated: Use the Person entity type instead.

If your request is for authors, these are the parameters you can use:

Parameter Name	Required/Optional
filter.type	Required
signal.interests.entities	Optional
signal.interests.tags	Optional
signal.demographics.gender	Optional
signal.demographics.age	Optional
bias.trends	Optional
signal.demographics.audiences	Optional
signal.demographics.audiences.weight	Optional
filter.exclude.entities	Optional
filter.popularity.min	Optional
filter.popularity.max	Optional
filter.publication_year.min	Optional
filter.publication_year.max	Optional
filter.results.entities	Optional
filter.results.entities.query	Optional
filter.tags	Optional
operator.filter.tags	Optional
filter.exclude.tags	Optional
operator.exclude.tags	Optional
filter.external.exists	Optional
operator.filter.external.exists	Optional
offset	Optional
take	Optional
Director
Deprecated: Use the Person entity type instead.

If your request is for directors, these are the parameters you can use:

Parameter Name	Required/Optional
filter.type	Required
signal.interests.entities	Optional
signal.interests.tags	Optional
signal.demographics.gender	Optional
signal.demographics.age	Optional
bias.trends	Optional
signal.demographics.audiences	Optional
signal.demographics.audiences.weight	Optional
filter.exclude.entities	Optional
filter.popularity.min	Optional
filter.popularity.max	Optional
filter.results.entities	Optional
filter.results.entities.query	Optional
filter.tags	Optional
operator.filter.tags	Optional
filter.exclude.tags	Optional
operator.exclude.tags	Optional
filter.external.exists	Optional
operator.filter.external.exists	Optional
operator.filter.external.exists	Optional
take	Optional

Key Use Cases
Explore the various ways you can use the Insights API based on your desired input and output. Below you'll find detailed guides for a few of the most common use cases:

Recommendation Insights: Retrieve recommendations based on the entity type.
Demographic Insights: Retrieve the demographic affinity scores for an entity or tag.
Heatmaps: Generate heatmap data.
Location-Based Insights: Retrieve recommendations based on location.
Taste Analysis: Retrieve tag metadata.
📘
Insights Deep Dive
If you want to understand the Insights endpoint as a whole, check out our Insights Deep Dive for an overview of how the Insights API is set up and all availble parameters.


Recommendation Insights
This guide shows you how to set up an Insights request to retrieve recommendations based on a particular filter.type. A filter.type is usually an entity type, such as a brand or destination.

📘
This page covers the technical details you need to send a basic Insights request. For a detailed explanation of the benefits and functionality of the Insights API, please refer to the Insights API Deep Dive.

Parameters
Required
filter.type
At least one valid filter or signal parameter in your request
Optional
The available optional parameters depend on the selected filter.type value. Explore the required and optional parameters for each filter.type value here.

For comprehensive parameter descriptions and types, visit the Parameters reference page.

Request
Below is a sample request using the Insights route. Take a look at the sample parameters included and their values:

filter.type is set to urn:entity:movie
filter.tags is set to urn:tag:genre:comedy
filter.release_year.min is set to 2022
This request returns a list of movies tagged as a comedy and released after 2022.

Basic Insights Request Example

curl --location 'https://staging.api.qloo.com/v2/insights/?filter.type=urn:entity:movie&filter.tags=urn:tag:genre:media:comedy&filter.release_year.min=2022' \
--header 'x-api-key: x-api-key'
Response
Below is a truncated sample response showing the first result of the query:

Basic Insights Response Example

{
    "success": true,
    "results": {
        "entities": [
            {
                "name": "Everything Everywhere All at Once",
                "entity_id": "F0D354AA-BA7E-49D2-8ABA-9A8250F5C852",
                "type": "urn:entity",
                "subtype": "urn:entity:movie",
                "properties": {
                    "release_year": 2022,
                    "release_date": "2022-04-08",
                    "description": "A middle-aged Chinese immigrant is swept up into an insane adventure in which she alone can save existence by exploring other universes and connecting with the lives she could have led.",
                    "content_rating": "R",
                    "duration": 139,
                    "image": {
                        "url": "https://staging.images.qloo.com/i/F0D354AA-BA7E-49D2-8ABA-9A8250F5C852-420x-outside.jpg"
                    },
                    "akas": [
                        {
                            "value": "Minden, mindenhol, mindenkor",
                            "languages": [
                                "hu"
                            ]
                        },
                        {
                            "value": "Все завжди і водночас",
                            "languages": [
                                "uk"
                            ]
                        },
                        {
                            "value": "一切隨處可見",
                            "languages": [
                                "zh"
                            ]
                        },
...
                    ],
                    "filming_location": "400 National Way, Simi Valley, California, USA",
                    "production_companies": [
                        "A24",
                        "AGBO",
                        "IAC Films"
                    ],
                    "release_country": [
                        "United States"
                    ],
                    "short_descriptions": [
                        {
                            "value": "film Dana Kwana a Daniela Scheinerta z roku 2022",
                            "languages": [
                                "cs"
                            ]
                        },
                        {
                            "value": "amerikansk film fra 2022",
                            "languages": [
                                "nb"
                            ]
                        },
                        {
                            "value": "فیلم علمی تخیلی ۲۰۲۲",
                            "languages": [
                                "fa"
                            ]
                        },
...
                    ],
                    "websites": [
                        "https://a24films.com/films/everything-everywhere-all-at-once",
                        "https://www.instagram.com/everythingeverywheremovie/"
                    ]
                },
                "popularity": 0.9984116946335868,
                "tags": [
                    {
                        "id": "urn:tag:streaming_service:media:neon_tv",
                        "name": "Neon Tv",
                        "type": "urn:tag:streaming_service:media"
                    },
                    {
                        "id": "urn:tag:keyword:media:multiverse",
                        "name": "Multiverse",
                        "type": "urn:tag:keyword:media"
                    },
                    {
                        "id": "urn:tag:streaming_service:media:cineplex",
                        "name": "Cineplex",
                        "type": "urn:tag:streaming_service:media"
                    },
                    {
                        "id": "urn:tag:streaming_service:media:claro_video",
                        "name": "Claro Video",
                        "type": "urn:tag:streaming_service:media"
                    },
...
                ],
                "query": {
                    "measurements": {
                        "audience_growth": -0.04072975141723856
                    }
                },
                "disambiguation": "2022, Daniel Scheinert, Daniel Kwan",
                "external": {
                    "instagram": [
                        {
                            "id": "everythingeverywheremovie"
                        }
                    ],
                    "wikidata": [
                        {
                            "id": "q83808444"
                        }
                    ],
                    "twitter": [
                        {
                            "id": "allatoncemovie"
                        }
                    ],
                    "letterboxd": [
                        {
                            "id": "everything-everywhere-all-at-once"
                        }
                    ],
                    "metacritic": [
                        {
                            "id": "everything-everywhere-all-at-once",
                            "critic_rating": 81,
                            "user_rating": 7.8
                        }
                    ],
                    "rottentomatoes": [
                        {
                            "id": "everything_everywhere_all_at_once",
                            "user_rating": "89",
                            "user_rating_count": "2500"
                        }
                    ],
                    "imdb": [
                        {
                            "id": "tt6710474",
                            "user_rating": 7.8,
                            "user_rating_count": 549113
                        }
                    ]
                }
            }
    },
    "duration": 34
}

Demographic Insights
This guide shows you how to set up an Insights request to retrieve demographic data for an entity. Once you include the required parameters, you'll get a response containing the affinity score for various types of demographic data, like age and gender.

Parameters
Required
Only one of the following parameters is required:
signal.interests.entities
signal.interests.tags
For comprehensive parameter descriptions and types, visit the Parameters reference page.

Request
Below is a sample request using the Insights route to retrieve demographic data. Take a look at the sample parameters included and their values:

filter.type is set to urn:demographics
signal.interests.tags is set to urn:tag:genre:media:action
signal.interests.entities is set to B8BEE72B-B321-481F-B81A-A44881D094D6
Demographics Request Example

curl --location 'https://staging.api.qloo.com/v2/insights?filter.type=urn:demographics&signal.interests.tags=urn:tag:genre:media:action&signal.interests.entities=B8BEE72B-B321-481F-B81A-A44881D094D6' \
--header 'x-api-key: x-api-key'
Response
Demographics Response Example

{
  "success": true,
  "results": {
    "demographics": [
      {
        "entity_id": "urn:tag:genre:media:action",
        "query": {
          "age": {
            "24_and_younger": 0,
            "25_to_29": 0.43,
            "30_to_34": 0.23,
            "35_to_44": -0.02,
            "45_to_54": -0.28,
            "55_and_older": -0.17
          },
          "gender": {
            "male": 0.08,
            "female": -0.08
          }
        }
      },
      {
        "entity_id": "B8BEE72B-B321-481F-B81A-A44881D094D6",
        "query": {
          "age": {
            "24_and_younger": -0.09,
            "25_to_29": 0.36,
            "30_to_34": 0.7000000000000001,
            "35_to_44": 0.17,
            "45_to_54": -0.53,
            "55_and_older": -0.32
          },
          "gender": {
            "male": 0.16,
            "female": -0.16
          }
        }
      }
    ]
  },
  "duration": 77
}

Heatmaps
This guide shows you how to set up an Insights request to generate heatmap data.

📘
This page covers the technical details you need to send a request to create a heatmap. For a detailed explanation of the benefits and functionality of this API use case, please refer to the Heatmaps guide.

Parameters
Required
filter.type with a value of urn:heatmap
Only one of the following parameters is required:
filter.location
filter.location.query
Any signal parameter from the list below
Optional
bias.trends
output.heatmap.boundary
signal.demographics.audiences.weight
signal.demographics.age
signal.demographics.gender
signal.interests.entities
signal.interests.tags
For comprehensive parameter descriptions and types, visit the Parameters reference page.

Request
Below is a sample request using the Insights route to generate heatmap data. Take a look at the sample parameters included and their values:

filter.type is set to urn:heatmap
filter.location.query is set to NYC
signal.interests.tags is set to urn:tag:genre:media:non_fiction
Heatmaps Request Example

curl --location 'https://staging.api.qloo.com/v2/insights/?filter.type=urn:heatmap&filter.location.query=NYC&signal.interests.tags=urn:tag:genre:media:non_fiction' \
--header 'x-api-key: x-api-key'
Response
Heatmaps Response Example

{
    "success": true,
    "results": {
        "heatmap": [
            {
                "location": {
                    "latitude": 40.591736,
                    "longitude": -73.756714,
                    "geohash": "dr5wct"
                },
                "query": {
                    "affinity": 1,
                    "affinity_rank": 0.9976498237367802,
                    "popularity": 0.9717472118959107
                }
            },
            {
                "location": {
                    "latitude": 40.74005,
                    "longitude": -73.87756,
                    "geohash": "dr5ryb"
                },
                "query": {
                    "affinity": 0.9992565055762082,
                    "affinity_rank": 0.9960474308300395,
                    "popularity": 0.5449814126394052
                }
            },
            {
                "location": {
                    "latitude": 40.811462,
                    "longitude": -73.91052,
                    "geohash": "dr72nj"
                },
                "query": {
                    "affinity": 0.9985130111524163,
                    "affinity_rank": 0.9959211420802175,
                    "popularity": 0.9234200743494424
                }
            },
            {
                "location": {
                    "latitude": 40.866394,
                    "longitude": -73.85559,
                    "geohash": "dr72rr"
                },
                "query": {
                    "affinity": 0.9977695167286246,
                    "affinity_rank": 0.9952654717619208,
                    "popularity": 0.6423791821561339
                }
            },
            {
                "location": {
                    "latitude": 40.816956,
                    "longitude": -73.92151,
                    "geohash": "dr72jy"
                },
                "query": {
                    "affinity": 0.9970260223048327,
                    "affinity_rank": 0.9951690821256038,
                    "popularity": 0.7234200743494423
                }
            },
            {
                "location": {
                    "latitude": 40.58075,
                    "longitude": -73.82263,
                    "geohash": "dr5wb5"
                },
                "query": {
                    "affinity": 0.9962825278810409,
                    "affinity_rank": 0.9948072698222489,
                    "popularity": 0.9531598513011152
                }
            },
            {
                "location": {
                    "latitude": 40.73456,
                    "longitude": -73.83362,
                    "geohash": "dr5rxz"
                },
                "query": {
                    "affinity": 0.995539033457249,
                    "affinity_rank": 0.9939903846153846,
                    "popularity": 0.2312267657992565
                }
. . .
            }
        ]
    },
    "query": {
        "localities": {
            "filter": {
                "entity_id": "81E61924-6CEE-4AB4-93D3-282A5C784AB8",
                "name": "New York",
                "subtype": "urn:entity:locality",
                "location": {
                    "lat": -73.93889084762313,
                    "lng": 40.66320611815103
                },
                "popularity": 1,
                "disambiguation": "New York, New York, United States of America"
            }
        }
    },
    "duration": 75
}

Location-Based Insights
Retrieve recommendations based on location

This guide shows you how to set up an Insights request with a location. When you include a location in an Insights request, the response provides tailored recommendations based on geospatial data and user interactions.

📘
This page covers the technical details you need to send a location-based Insights request. For a detailed explanation of the benefits and functionality of this API use case, please refer to Insights with Location.

Parameters
Required
filter.type
At least one valid filter or signal parameter in your request
Only one of the following parameters is required:
signal.location
signal.location.query
Optional
The available optional parameters depend on the selected filter.type value:

For location-based filters, see Destination and Place parameters. These include filters that allow you to narrow your results by distance, address, and more.
You can also include any other parameters to refine your request
For comprehensive parameter descriptions and types, visit the Parameters reference page.

Request
Below is a sample request using the Insights route using location data. Take a look at the sample parameters included and their values:

filter.type is set to urn:entity:movie
signal.location.query is set to the Lower East Side.
This request returns a list of movies that have a high affinity score in the Lower East Side.

Insights by Location Request Example

curl --location 'https://staging.api.qloo.com/v2/insights/?filter.type=urn:entity:movie&signal.location.query=Lower%20East%20Side' \
--header 'x-api-key: x-api-key'
Response
Below is a truncated sample response with a list of movie entities tagged as comedies:

Insights by Location Response Example

{
    "success": true,
    "results": {
        "entities": [
            {
                "name": "Queen & Slim",
                "entity_id": "9E2FD257-7E23-483A-8276-36FF51A5DD67",
                "type": "urn:entity",
                "subtype": "urn:entity:movie",
                "properties": {
                    "release_year": 2019,
                    "release_date": "2019-11-27",
                    "description": "A couple's first date takes an unexpected turn when a police officer pulls them over.",
                    "content_rating": "R",
                    "duration": 132,
                    "image": {
                        "url": "https://staging.images.qloo.com/i/9E2FD257-7E23-483A-8276-36FF51A5DD67-420x-outside.jpg"
                    },
                    "akas": [
                        {
                            "value": "Queen and Slim",
                            "languages": [
                                "fr",
                                "en"
                            ]
                        },
                        {
                            "value": "Queen e Slim",
                            "languages": [
                                "gl"
                            ]
                        },
                        {
                            "value": "Queen i Slim",
                            "languages": [
                                "ca"
                            ]
                        },
                        {
                            "value": "Квин и Слим",
                            "languages": [
                                "ru"
                            ]
                        },
                        {
                            "value": "كوين وسليم",
                            "languages": [
                                "ar"
                            ]
                        },
                        {
                            "value": "کوئین و اسلیم",
                            "languages": [
                                "fa"
                            ]
                        },
                        {
                            "value": "クイーン&スリム",
                            "languages": [
                                "ja"
                            ]
                        },
                        {
                            "value": "皇后与瘦子",
                            "languages": [
                                "zh"
                            ]
                        },
                        {
                            "value": "皇后與瘦子",
                            "languages": [
                                "zh"
                            ]
                        },
                        {
                            "value": "퀸 앤 슬림",
                            "languages": [
                                "ko"
                            ]
                        }
                    ],
                    "filming_location": "6900 St. Clair Avenue, Cleveland, Ohio, USA",
                    "production_companies": [
                        "De La Revolución Films",
                        "Hillman Grad",
                        "Makeready"
                    ],
                    "release_country": [
                        "United States",
                        "Canada"
                    ],
                    "short_descriptions": [
                        {
                            "value": "2019 film directed by Melina Matsoukas",
                            "languages": [
                                "en"
                            ]
                        },
 . . .

}
        }
    }
}

Taste Analysis
Tag Insights: Retrieve tag metadata.

This guide shows you how to set up an Insights request to retrieve tag metadata associated with a certain audience, entity, tag, or keyword. This is referred to as taste analysis.

Parameters
Required
filter.type with a value of urn:tag
Only one of the following parameters is required. You can include more than one to narrow your results:
filter.tag.types
filter.parents.types
signal.demographics.audiences
signal.interests.entities
signal.interests.tags
signal.location
signal.location.query
For comprehensive parameter descriptions and types, visit the Parameters reference page.

Request
Below is a sample request using the Insights route to retrieve tag data. Take a look at the sample parameters included and their values:

filter.type is set to urn:tag
filter.tag.types is set to urn:tag:keyword:media
filter.parents.types is set to urn:entity:movie, urn:entity:tv_show
Tag Insights Request Example

curl --location 'https://staging.api.qloo.com/v2/insights?filter.type=urn%3Atag&filter.tag.types=urn%3Atag%3Akeyword%3Amedia&filter.parents.types=urn%3Aentity%3Amovie%2C%20urn%3Aentity%3Atv_show' \
--header 'x-api-key: x-api-key'
Response
Tag Insights Response Example

{
    "success": true,
    "results": {
        "tags": [
            {
                "tag_id": "urn:tag:keyword:media:brady_bunch",
                "name": "Brady Bunch",
                "types": [
                    "urn:entity:tv_show",
                    "urn:entity:writer",
                    "urn:entity:director",
                    "urn:entity:tv_episode",
                    "urn:entity:actor",
                    "urn:entity:movie"
                ],
                "subtype": "urn:tag:keyword:media",
                "tag_value": "urn:tag:keyword:media:brady_bunch",
                "query": {}
            },
            {
                "tag_id": "urn:tag:keyword:media:mining_accident",
                "name": "Mining Accident",
                "types": [
                    "urn:entity:tv_show",
                    "urn:entity:writer",
                    "urn:entity:director",
                    "urn:entity:tv_episode",
                    "urn:entity:actor",
                    "urn:entity:movie"
                ],
                "subtype": "urn:tag:keyword:media",
                "tag_value": "urn:tag:keyword:media:mining_accident",
                "query": {}
            },
            {
                "tag_id": "urn:tag:keyword:media:complex",
                "name": "Complex",
                "types": [
                    "urn:entity:tv_show",
                    "urn:entity:writer",
                    "urn:entity:director",
                    "urn:entity:tv_episode",
                    "urn:entity:actor",
                    "urn:entity:movie"
                ],
                "subtype": "urn:tag:keyword:media",
                "tag_value": "urn:tag:keyword:media:complex",
                "query": {}
            },
            {
                "tag_id": "urn:tag:keyword:media:hostile_environment",
                "name": "Hostile Environment",
                "types": [
                    "urn:entity:tv_show",
                    "urn:entity:writer",
                    "urn:entity:director",
                    "urn:entity:tv_episode",
                    "urn:entity:actor",
                    "urn:entity:movie"
                ],
                "subtype": "urn:tag:keyword:media",
                "tag_value": "urn:tag:keyword:media:hostile_environment",
                "query": {}
            },
            {
                "tag_id": "urn:tag:keyword:media:jewish_tradition",
                "name": "Jewish Tradition",
                "types": [
                    "urn:entity:tv_show",
                    "urn:entity:writer",
                    "urn:entity:director",
                    "urn:entity:tv_episode",
                    "urn:entity:actor",
                    "urn:entity:movie"
                ],
                "subtype": "urn:tag:keyword:media",
                "tag_value": "urn:tag:keyword:media:jewish_tradition",
                "query": {}
            },
            {
                "tag_id": "urn:tag:keyword:media:anthropomorphic_elephant",
                "name": "Anthropomorphic Elephant",
                "types": [
                    "urn:entity:tv_show",
                    "urn:entity:writer",
                    "urn:entity:director",
                    "urn:entity:tv_episode",
                    "urn:entity:actor",
                    "urn:entity:movie"
                ],
                "subtype": "urn:tag:keyword:media",
                "tag_value": "urn:tag:keyword:media:anthropomorphic_elephant",
                "query": {}
            },
            {
                "tag_id": "urn:tag:keyword:media:max_goof_character",
                "name": "Max Goof Character",
                "types": [
                    "urn:entity:tv_show",
                    "urn:entity:writer",
                    "urn:entity:director",
                    "urn:entity:tv_episode",
                    "urn:entity:actor",
                    "urn:entity:movie"
                ],
                "subtype": "urn:tag:keyword:media",
                "tag_value": "urn:tag:keyword:media:max_goof_character",
                "query": {}
            },
            {
                "tag_id": "urn:tag:keyword:media:gasoline_fire",
                "name": "Gasoline Fire",
                "types": [
                    "urn:entity:tv_show",
                    "urn:entity:writer",
                    "urn:entity:director",
                    "urn:entity:tv_episode",
                    "urn:entity:actor",
                    "urn:entity:movie"
                ],
                "subtype": "urn:tag:keyword:media",
                "tag_value": "urn:tag:keyword:media:gasoline_fire",
                "query": {}
            },
            {
                "tag_id": "urn:tag:keyword:media:british_museum",
                "name": "British Museum",
                "types": [
                    "urn:entity:tv_show",
                    "urn:entity:writer",
                    "urn:entity:director",
                    "urn:entity:tv_episode",
                    "urn:entity:actor",
                    "urn:entity:movie"
                ],
                "subtype": "urn:tag:keyword:media",
                "tag_value": "urn:tag:keyword:media:british_museum",
                "query": {}
            },
            {
                "tag_id": "urn:tag:keyword:media:math_class",
                "name": "Math Class",
                "types": [
                    "urn:entity:tv_show",
                    "urn:entity:writer",
                    "urn:entity:director",
                    "urn:entity:tv_episode",
                    "urn:entity:actor",
                    "urn:entity:movie"
                ],
                "subtype": "urn:tag:keyword:media",
                "tag_value": "urn:tag:keyword:media:math_class",
                "query": {}
            },
            {
                "tag_id": "urn:tag:keyword:media:tinted_film",
                "name": "Tinted Film",
                "types": [
                    "urn:entity:tv_show",
                    "urn:entity:writer",
                    "urn:entity:director",
                    "urn:entity:tv_episode",
                    "urn:entity:actor",
                    "urn:entity:movie"
                ],
                "subtype": "urn:tag:keyword:media",
                "tag_value": "urn:tag:keyword:media:tinted_film",
                "query": {}
            },
            {
                "tag_id": "urn:tag:keyword:media:chicago_police_department",
                "name": "Chicago Police Department",
                "types": [
                    "urn:entity:tv_show",
                    "urn:entity:writer",
                    "urn:entity:director",
                    "urn:entity:tv_episode",
                    "urn:entity:actor",
                    "urn:entity:movie"
                ],
                "subtype": "urn:tag:keyword:media",
                "tag_value": "urn:tag:keyword:media:chicago_police_department",
                "query": {}
            },
            {
                "tag_id": "urn:tag:keyword:media:search_meaning_life",
                "name": "Search For The Meaning Of Life",
                "types": [
                    "urn:entity:tv_show",
                    "urn:entity:writer",
                    "urn:entity:director",
                    "urn:entity:tv_episode",
                    "urn:entity:actor",
                    "urn:entity:movie"
                ],
                "subtype": "urn:tag:keyword:media",
                "tag_value": "urn:tag:keyword:media:search_meaning_life",
                "query": {}
            },
            {
                "tag_id": "urn:tag:keyword:media:woman_farting",
                "name": "Woman Farting",
                "types": [
                    "urn:entity:tv_show",
                    "urn:entity:writer",
                    "urn:entity:director",
                    "urn:entity:tv_episode",
                    "urn:entity:actor",
                    "urn:entity:movie"
                ],
                "subtype": "urn:tag:keyword:media",
                "tag_value": "urn:tag:keyword:media:woman_farting",
                "query": {}
            },
            {
                "tag_id": "urn:tag:keyword:media:cultural_clash",
                "name": "Cultural Clash",
                "types": [
                    "urn:entity:tv_show",
                    "urn:entity:writer",
                    "urn:entity:director",
                    "urn:entity:tv_episode",
                    "urn:entity:actor",
                    "urn:entity:movie"
                ],
                "subtype": "urn:tag:keyword:media",
                "tag_value": "urn:tag:keyword:media:cultural_clash",
                "query": {}
            },
            {
                "tag_id": "urn:tag:keyword:media:disappearance_father",
                "name": "Disappearance Of Father",
                "types": [
                    "urn:entity:tv_show",
                    "urn:entity:writer",
                    "urn:entity:director",
                    "urn:entity:tv_episode",
                    "urn:entity:actor",
                    "urn:entity:movie"
                ],
                "subtype": "urn:tag:keyword:media",
                "tag_value": "urn:tag:keyword:media:disappearance_father",
                "query": {}
            },
            {
                "tag_id": "urn:tag:keyword:media:city_in_panic",
                "name": "City In Panic",
                "types": [
                    "urn:entity:tv_show",
                    "urn:entity:writer",
                    "urn:entity:director",
                    "urn:entity:tv_episode",
                    "urn:entity:actor",
                    "urn:entity:movie"
                ],
                "subtype": "urn:tag:keyword:media",
                "tag_value": "urn:tag:keyword:media:city_in_panic",
                "query": {}
            },
            {
                "tag_id": "urn:tag:keyword:media:citroen_d_s",
                "name": "Citroen D S",
                "types": [
                    "urn:entity:tv_show",
                    "urn:entity:writer",
                    "urn:entity:director",
                    "urn:entity:tv_episode",
                    "urn:entity:actor",
                    "urn:entity:movie"
                ],
                "subtype": "urn:tag:keyword:media",
                "tag_value": "urn:tag:keyword:media:citroen_d_s",
                "query": {}
            },
            {
                "tag_id": "urn:tag:keyword:media:artful_dodger_character",
                "name": "Artful Dodger Character",
                "types": [
                    "urn:entity:tv_show",
                    "urn:entity:writer",
                    "urn:entity:director",
                    "urn:entity:tv_episode",
                    "urn:entity:actor",
                    "urn:entity:movie"
                ],
                "subtype": "urn:tag:keyword:media",
                "tag_value": "urn:tag:keyword:media:artful_dodger_character",
                "query": {}
            },
            {
                "tag_id": "urn:tag:keyword:media:eiffel_tower_destroyed",
                "name": "Eiffel Tower Destroyed",
                "types": [
                    "urn:entity:tv_show",
                    "urn:entity:writer",
                    "urn:entity:director",
                    "urn:entity:tv_episode",
                    "urn:entity:actor",
                    "urn:entity:movie"
                ],
                "subtype": "urn:tag:keyword:media",
                "tag_value": "urn:tag:keyword:media:eiffel_tower_destroyed",
                "query": {}
            }
        ]
    },
    "duration": 25
}

Entity Search
get
https://api.qloo.com/search
Search for an entity by name or property.

Query Params
query
string
The text to search against.

types
array of strings
The category to search against.


ADD string
filter.location
string
A geolocational position to base searches on. The radius expands from this point. The format should be "latitude,longitude".

filter.radius
float
0 to 100
Defaults to 10
The max distance in miles from the location to base results on. This only applies to categories with geolocation data. Default is 10 miles.

10
filter.exists
array of strings
Filter results by existential property check like external.resy or external.michelin


ADD string
filter.tags
array of strings
Filter results by a tag


ADD string
filter.rating
double
0 to 5
Filter by the lowest desired business rating.

filter.exclude.tags
array of strings
exclude entities from results with tags


ADD string
filter.popularity
double
0 to 1
The minimum value of popularity an entity must have to be output.

operator.filter.tags
string
Defaults to union
The operator.filter.tags parameter controls whether the API returns results matching all ("intersection") or any ("union") of the input tags.


union
operator.filter.exclude.tags
string
Defaults to union
The operator.filter.exclude.tags parameter controls whether the API returns results excluding all ("intersection") or any ("union") of the input tags.


union
page
int32
1 to 100
Defaults to 1
The page number

1
take
integer
1 to 100
Defaults to 20
The number of records to return.

20
sort_by
string
Defaults to match
Sort results by criteria


match
Responses

200
OK


404
No results


429
Rate limit exceeded


Entity Search by ID
get
https://api.qloo.com/entities
Get entities based on an array of IDs.

Query Params
entity_ids
array of uuids
length ≥ 1
The entities to base the results on.


uuid


ADD uuid
external.facebook.ids
array of strings
length ≥ 1
The Facebook IDs to base the search on.


string


ADD string
external.goodreads.ids
array of strings
length ≥ 1
The Goodreads Book IDs to base the search on.


string


ADD string
external.goodreads_author.ids
array of strings
length ≥ 1
The Goodreads Author IDs to base the search on.


string


ADD string
external.igdb.ids
array of strings
length ≥ 1
The external IGDB IDs to base the search on.


string


ADD string
external.imdb.ids
array of strings
length ≥ 1
The external IMDB IDs to base the search on.


string


ADD string
external.instagram.ids
array of strings
length ≥ 1
The external Instagram IDs to base the search on.


string


ADD string
external.isbn10.ids
array of strings
length ≥ 1
The external ISBN10 IDs to base the search on.


string


ADD string
external.isbn13.ids
array of strings
length ≥ 1
The external ISBN13 IDs to base the search on.


string


ADD string
external.itunes.ids
array of strings
length ≥ 1
The external iTunes IDs to base the search on.


string


ADD string
external.lastfm.ids
array of strings
length ≥ 1
The external Last.fm IDs to base the search on.


string


ADD string
external.library_of_congress.ids
array of strings
length ≥ 1
The external Library of Congress IDs to base the search on.


string


ADD string
external.metacritic.ids
array of strings
length ≥ 1
The external Metacritic IDs to base the search on.


string


ADD string
external.michelin.ids
array of strings
length ≥ 1
The external Michelin Guide IDs to base the search on.


string


ADD string
external.musicbrainz.ids
array of strings
length ≥ 1
The external MusicBrainz IDs to base the search on.


string


ADD string
external.rottentomatoes.ids
array of strings
length ≥ 1
The external Rotten Tomatoes IDs to base the search on.


string


ADD string
external.soundcloud.ids
array of strings
length ≥ 1
The external SoundCloud IDs to base the search on.


string


ADD string
external.spotify.ids
array of strings
length ≥ 1
The external Spotify IDs to base the search on.


string


ADD string
external.tablet.ids
array of strings
length ≥ 1
The external Tablet Hotels IDs to base the search on.


string


ADD string
external.twitch.ids
array of strings
length ≥ 1
The external Twitch IDs to base the search on.


string


ADD string
external.twitter.ids
array of strings
length ≥ 1
The external Twitter IDs to base the search on.


string


ADD string
external.wikidata.ids
array of strings
length ≥ 1
The external Wikidata IDs to base the search on.


string


ADD string
external.resy.ids
array of strings
length ≥ 1
The external Library of Congress IDs to base the search on.


string


ADD string
Responses

200
OK


404
No results


429
Rate limit exceeded


Find Audiences
get
https://staging.api.qloo.com/v2/audiences
The Find Audiences API retrieves a list of audience IDs that can be used for filtering results and refining targeting in recommendations. You can use the returned audience IDs as values for signal.demographics.audiences to filter Insights API query results by specific audiences.

Query Params
filter.parents.types
string
Filter by a comma-separated list of parental entity types.


urn:audience:communities
filter.results.audiences
array of strings
Filter by a comma-separated list of audience IDs.


ADD string
filter.audience.types
array of strings
Filter by a list of audience types.


ADD string
filter.popularity.min
number
0 to 1
Filter by the minimum popularity percentile required for a Point of Interest (float, between 0 and 1; closer to 1 indicates higher popularity, e.g., 0.98 for the 98th percentile).

filter.popularity.max
number
0 to 1
Filter by the maximum popularity percentile a Point of Interest must have (float, between 0 and 1; closer to 1 indicates higher popularity, e.g., 0.98 for the 98th percentile).

page
integer
≥ 1
The page number of results to return. This is equivalent to take + offset and is the recommended approach for most use cases.

take
integer
≥ 1
The number of results to return.

Responses

200
Successful Operation

400
Bad Request

500
Internal Server Error


Get Audience Types
get
https://staging.api.qloo.com/v2/audiences/types
The Get Audience Types API returns all available audience type IDs, representing different audience categories. You can use this API to explore audience classifications and refine searches in the Find Audiences API.

Query Params
filter.parents.types
string
Filter by a comma-separated list of parental entity types.


urn:audience:communities
page
integer
≥ 1
The page number of results to return. This is equivalent to take + offset and is the recommended approach for most use cases.

take
integer
≥ 1
The number of results to return.

Responses

200
Successful Operation

400
Bad Request

500
Internal Server Error

Tags Search
get
https://staging.api.qloo.com/v2/tags
Search for tags that are supported by the filter.tags, exclude.tags, and signal.interests.tags parameters.

Query Params
feature.typo_tolerance
boolean
Defaults to false
When set to true, allows tolerance for typos in the filter.query parameter. For example, a query for “Mediterranaen” would return tags with the word “Mediterranean” in their titles. Default is false.


false
filter.results.tags
array of strings
Filter by a comma-separated list of tag IDs. Often used to assess the affinity of a tag towards input.


ADD string
filter.parents.types
string
Filter by a comma-separated list of parental entity types.


urn:audience:communities
filter.popularity.min
number
0 to 1
Filter by the minimum popularity percentile required for a Point of Interest (float, between 0 and 1; closer to 1 indicates higher popularity, e.g., 0.98 for the 98th percentile).

filter.popularity.max
number
0 to 1
Filter by the maximum popularity percentile a Point of Interest must have (float, between 0 and 1; closer to 1 indicates higher popularity, e.g., 0.98 for the 98th percentile).

filter.query
string
A partial string search on the audience or tag name.

filter.tag.types
array of strings
Filter by a comma-separated list of tag types. Each tag type requires an exact match. You can retrieve a list of tag types supported by each entity type via the Tag Types API.


ADD string
page
integer
≥ 1
The page number of results to return. This is equivalent to take + offset and is the recommended approach for most use cases.

take
integer
≥ 1
The number of results to return.

Responses

200
Successful Operation

400
Bad Request

500
Internal Server Error

Tag Types
get
https://staging.api.qloo.com/v2/tags/types
Returns a list of tag types supported by each entity type. You can leverage this data with the Tags API to filter results by specific tag types.

Query Params
filter.parents.types
string
Filter by a comma-separated list of parental entity types.


urn:audience:communities
page
integer
≥ 1
The page number of results to return. This is equivalent to take + offset and is the recommended approach for most use cases.

take
integer
≥ 1
The number of results to return.

Responses

200
Successful Operation

400
Bad Request

500
Internal Server Error

Analysis
get
https://api.qloo.com/analysis
Analyze a group of entities

Query Params
entity_ids
array of uuids
required
length ≥ 1
The entities to base the results on.


uuid


ADD uuid
filter.type
array of strings
The category to search against.


ADD string
model
string
Model to base results on


descriptive
filter.subtype
string
Subtype to filter on


urn:tag:genre
page
int32
1 to 100
Defaults to 1
The page number

1
take
integer
1 to 100
Defaults to 20
The number of records to return.

20
Responses

200
OK


404
No results


429
Rate limit exceeded



Analysis Compare
get
https://api.qloo.com/v2/insights/compare
Analyze and compare two groups of entities.

Query Params
a.signal.interests.entities
array of strings
required
The first group of entities to base the comparison on.


ADD string
b.signal.interests.entities
array of strings
required
The second group of entities to base the comparison on.


ADD string
filter.type
array of strings
The category to search against.


ADD string
filter.subtype
string
Subtype to filter on


urn:tag:genre
model
string
Model to base results on


descriptive
page
int32
1 to 100
Defaults to 1
The page number

1
take
integer
1 to 100
Defaults to 20
The number of records to return.

20
offset
integer
When displaying results, this parameter indicates the number of results to skip, starting from 0.

Get Trending Data
get
https://staging.api.qloo.com/v2/trending
The Trending API provides time-series data showing the popularity trends of a specific entity over a given time period. It returns weekly trending statistics including population percentile, rank, velocity, and acceleration metrics for the specified entity. Results are ordered by date in descending order. Use this endpoint to monitor how an entity's popularity evolves over time.

The following query parameters are required when calling the /v2/trending endpoint. All must be provided and valid for the request to succeed:

signal.interests.entities
filter.type
filter.start_date
filter.end_date
Query Params
signal.interests.entities
array of strings
Allows you to supply a list of entities to influence affinity scores.For GET requests, provide a comma-separated list of entity IDs.


ADD string
filter.type
string
required
Filter by the category of entity to return (urn:entity:place).


urn:entity:artist
filter.start_date
date
required
Start date for the trending analysis period in ISO 8601 format (YYYY-MM-DD).

filter.end_date
date
required
End date for the trending analysis period in ISO 8601 format (YYYY-MM-DD).

take
integer
≥ 1
The number of results to return.

offset
integer
The number of results to skip, starting from 0. Allows arbitrary offsets but is less commonly used than page.

page
integer
≥ 1
The page number of results to return. This is equivalent to take + offset and is the recommended approach for most use cases.

Responses

200
Successful Operation

400
Bad Request — invalid parameters or missing required fields

500
Internal Server Error


Glossary
Affinity Score
A metric that measures the similarity between a reference entity and recommended entities, ranging from 0-1. Higher scores indicate greater relevance. Learn more.

Audiences
Audiences are collections of valid signals accumulated through client interactions with our API. Learn more.

Bias
A category of parameters that can be used to skew the bias of the query results in favor of a particular attribute (i.e. gender, age).

Entity Types
Categories for entity is categorized into (i.e. books, movies, music). Find the full list of types here.

Disambiguation
In AI, this refers to the techniques used to determine the most probable meaning of a phrase.

Entity
Entities represent notable people, places, things, and interests. Each entity represents a node that Qloo recognizes and has built inferential intelligence around. Learn more.

Filter
Filters are used to narrow down results by specifying attributes like sub-genres or price levels. They ensure outputs match the desired criteria and work inclusively by default. Learn more.

Fuzzy
This refers to methods that allow for approximate matching or searching, rather than requiring exact matches. This means the system can handle and return results that are close or similar to the input, even if there are slight errors, variations, or ambiguities.

Geo boundary
A defined border or perimeter that delineates a specific geographic area.

Geohash
A geohash encodes coordinates into a tile that represents a geographic location. Learn more.

Geo point
A geo point is represented by a latitude/longitude pair and radius.

Heatmap
A visual representation of the concentration or dispersion of signal for an entity across various geographical locations. Learn more.

Inference
The process of running live data through a trained machine learning model to make a prediction or solve a task.

Insight
In the Qloo ecosystem, an insight is a data-driven finding that uncovers patterns, preferences, or correlations in cultural and consumer domains, helping users understand and predict audience behavior.

Interest
Interests refer to unique people, places, things, and attributes. They include both Qloo entities and tags.

ML
Machine Learning

Popularity
A percentile value that represents an entity's rank in terms of its signal, compared to all other entities within the same domain

Signals
Signals are weighted interactions with entities. The weight of a signal describes the magnitude and direction of the interaction, it can describe a positive (like) or negative (dislike) interaction. Learn more.

Signal Array
A collection of signals indicating associated interaction. Learn more.

Tags
Tags are a type of entity that serve as labels, categorizing and enriching other entities to make them easier to search and filter.

Taste
Taste refers to the preferences, interests, and affinities of individuals or audiences across various cultural domains. It encompasses their inclinations, likes, dislikes, and the patterns of their consumption or engagement within different areas of culture.

Trending
This shows how well an interest is trending over the past 6 months compared to others in the same category. A percentile of 90%, for example, means the interest is performing better than 90% of similar interests.

Insights by Qloo
Base Query
This is the prompt at the top of each dashboard. Each section of the prompt narrows your insights with the selected demographics, location, or interests.

Dashboards
Dashboards are where you can create and store a visual representation of your insights data for easier analysis and comparison.

Insights by Qloo
Qloo's user-friendly interface for in-depth analyses of consumer behavior and cultural trends.

Modifiers
Modifiers (demographics, location, or interests) are selectors for individual panels that adjust the results for only that panel.

Panels
Panels are key components of a dashboard. Each displays one of three types of insights generated from your base query.


Methodology and Sources
Our platform, Insights by Qloo, and our API deliver taste-based personalization without relying on personal identity data. Instead, they leverage a highly structured ontology spanning half a billion cultural entities across domains like music, fashion, and dining. By operating exclusively on anonymized signals, our system ensures both privacy and compliance while uncovering meaningful consumer taste correlations at scale. This section explains the data foundation, processing techniques, and representative data behind Qloo’s AI-driven insights.

In this section
Data Foundation: How Qloo collects and structures entity data while ensuring privacy compliance.
Processing Methodology: How signals are processed, machine learning models are applied, and insights are derived.
Representative Data and Patterns: Sample co-occurrence data and cross-category correlations.
Core Concepts
Entity: A structured unit within Qloo’s ontology, representing a person, place, or thing (e.g., a brand, movie, musician, restaurant).
Signal: A weighted data point representing consumer interactions with entities, such as purchases, streams, or reviews.
Metadata: Attributes assigned to entities that enhance understanding and classification, such as genre for a movie or ambiance for a restaurant.
/insightsAPI : Our primary API endpoint providing personalized recommendations and entity metadata based on cultural co-occurrences.

Data Foundation
How Qloo collects and structures entity data while ensuring privacy compliance.

Our Insights endpoint is powered by diverse data sources and learning rights accumulated over years of API usage, leveraging billions of entity co-occurrences related to consumer taste.

These data sources include first-party data and anonymized second- and third-party interactions within Qloo’s API ecosystem. They capture sentiment derived from implicit actions (e.g., transactions, streams, views) and explicitly declared preferences (e.g., ratings, follows).

Core Concepts
Anonymized Signals: Aggregated and de-identified data points derived from interactions like transactions, content engagement (e.g., follows, streams, ratings), and location-based signals, used to model taste patterns while maintaining privacy.
Privacy-Centric Data Processing: Qloo operates on pre-anonymized data, ensuring GDPR compliance by focusing on cultural entities rather than personal identities. No personally identifiable information (PII) is processed or stored.
Entity Coverage: The categories Qloo analyzes, spanning half a billion+ fully deduplicated entities across consumer and entertainment industries, structured within a hierarchical ontology.
Metadata Structuring & Entity Classification: Entity metadata is normalized and classified using hierarchical categories, enabling structured tags and relationships that improve recommendation precision.
Continuous Data Ingestion: Real-time updates ensure adaptability to domain-specific changes, including ongoing entity classification, sentiment analysis, and metadata structuring.
Privacy-Centricity
Qloo operates in a fully pre-anonymized fashion, making it GDPR-compliant by design as a data processor under Article 6. Indeed. In short, Qloo’s AI is powered by an understanding of cultural entities rather than personal identities. No PII is transferred to Qloo, nor are any anonymized cross-client identifiers, such as cookies, used.

Representative API Clients & Sentiment Signal Sources

Entity Coverage
The entity graphic below illustrates the breadth of categories and individual entities Qloo can analyze and generate inferences on using its unified /insights endpoint. Qloo’s entity coverage spans over half a billion fully de-duplicated entities, organized within a comprehensive hierarchical ontology.

Metadata & Entity Relationships
Qloo structures comprehensive metadata for every entity, using over three dozen premier big-data sources that power Layer-1 entity attribute data. These include commercial partnerships, open-source processing of Wikipedia and Wikidata, leading third-party datasets, and Qloo’s proprietary databases. This enables us to pinpoint the essence of every cultural entity, whether it’s a person, place, or thing.

For example, Qloo has mapped:

2.7 million+ restaurants worldwide, including menu items, price levels, ambiance tags, notable executive chefs, and more.
18 million+ books, capturing details such as settings, characters, genres, sub-genres, and 400+ attributes, even down to the weight of a hardcover edition.
Cross-category affinities in music, film, TV, fashion, nightlife, hospitality, and consumer brands, enabling a granular approach to recommendations.
By structuring data at this granular level, we offer unparalleled filtering capabilities, enabling our machine-learning algorithms to surface meaningful, statistically significant correlations.

Selected Third Party Data Sources and Pairwise Category Signals

API-Driven Data Learning
Learning from API Signals and Co-Occurrences
Qloo learns from anonymized signal velocities and entity co-occurrences within our proprietary API ecosystem. This includes:

Contractual learning rights for requests made through Qloo’s API
The TasteDive API ecosystem, a platform for entertainment recommendations acquired by Qloo
First-party sentiment capture
This structured learning pipeline allows us to continuously refine and expand our knowledge base, adapting to evolving consumer preferences and industry trends in real time.

Cross-Category Transaction Examples illustrates how sample co-occurrence arrays enter Qloo’s learning pipeline.

Processing Methodology
How signals are processed, machine learning models are applied, and insights are derived.

Qloo’s processing and methodology transform billions of anonymized user interactions into structured, AI-powered insights. This process begins with raw consumer interactions, known as signals, which are systematically captured and processed to reveal meaningful taste patterns. Using proprietary machine learning models and statistical methodologies, Qloo translates these signals into actionable recommendations spanning categories like music, film, dining, and fashion.

Qloo’s processing pipeline applies:

Entity classification and metadata structuring to ensure a unified catalog.
Sentiment analysis and signal validation to filter out noise and maintain high-quality insights.
Aggregation of structured properties, such as restaurant menu details, book settings and characters, brand affinity scores, and more.
Core Concepts
Signal: A data point representing a consumer interaction with an entity, carrying a weight that reflects magnitude and direction (e.g., purchases, likes, reviews).
Signal Types: The different types of data Qloo processes, including consumer activity, location data, and demographics.
Taste Vectors: The final structured outputs power Qloo’s recommendation engine, representing cultural preferences through AI-generated embeddings.
From Raw Data to Signals
Qloo first captures and processes raw consumer interactions, known as signals, to generate personalized insights. These signals reflect real-world engagement with cultural entities and form the foundation for all downstream processing.

In the Qloo ecosystem, “signal” refers to consumer interactions with entities. These signals carry a specific weight, indicating the magnitude of the interaction. Signals can include interactions like transactions, reviews, likes, streams, comments, posts, and list inclusions. These weighted signals help quantify and qualify user preferences and behaviors.

Qloo’s API processes billions of time-stamped data points monthly, specializing in mapping cross-category signal occurrences. With a single dataset, we can identify transactional signals linking a specific fashion brand to a particular restaurant or correlate preferences for a music artist, TV show, and podcast. This unique capability allows Qloo to uncover meaningful correlations, such as the relationship between a music artist and a specific brand, providing valuable insights that transcend individual categories.

Signal Types
Consumer Activity: Transactions, digital interactions (e.g., reviews, likes, comments), and content engagement (e.g., views, listens).
Location Data: Patterns of movement and engagement within specific geographies.
Demographics and Psychographics: Anonymized attributes like age, gender, lifestyle preferences, and interests.
Transforming Signals into Insights
Once signals are collected, Qloo applies a structured methodology to process and extract meaning from them. This transformation happens in multiple stages:

Batch Signal Processing: Qloo’s API processes anonymized batch signals spanning various cultural categories, ensuring full GDPR compliance as a data processor.
Signal Decomposition: Raw signals are broken down into core entity attributes, forming the foundation for model training.
Model Training and Output: Machine learning models identify taste clusters, generating unique vectors for users, entities, and attributes, which are used in deep learning processes.
Extracting Meaning Through Statistical Models
After signals have been structured and processed, Qloo’s machine learning frameworks analyze their relationships. The next step is uncovering deeper insights by identifying patterns and cross-category correlations.

Cross-Category Correlations
Qloo leverages advanced statistical methodologies and machine learning techniques to process and derive meaningful insights from signal flows across categories. By analyzing patterns in user preferences, our models establish cross-category connections, enabling co-occurrence analysis that helps surface meaningful relationships.

Instances of sentiment for multiple entities are mapped using:

Neural Networks: These leverage taste co-occurrence data to uncover deep correlations by identifying relationships within a vector space and integrating signal-based taste co-occurrence data with content metadata and similarity metrics.
Content-Based Metrics: These analyze structured metadata to refine entity relationships.
Demographic and Psychographic Segmentation: These enable audience-based insights.
To ensure accuracy and reliability, Qloo employs rigorous evaluation metrics, maintains proper population sampling thresholds, and normalizes data capture velocities across categories and signal sources. This approach minimizes biases and preserves the integrity of insights.

The Final Output: Taste Vectors
The ultimate goal of Qloo’s processing methodology is to create rich, multi-dimensional representations of cultural preferences, known as taste vectors. These embeddings serve as the backbone of Qloo’s recommendation engine, precisely mapping relationships between entities. Entities are mapped into a high-dimensional vector space, where similar entities cluster based on inferred relationships.

Qloo’s proprietary neural networks process billions of structured signals to generate high-dimensional taste embeddings, optimizing recommendations across categories. To process all the data in real-time, Qloo uses proprietary machine learning algorithms rooted in the latest research in the emerging field of Neuroaesthetics. These include:

Deep learning methods
Bayesian statistics
Neural networks
Proprietary NLP algorithms
Qloo also incorporates geospatial affinity scoring to enhance location-based predictions and market-specific insights, ensuring relevance across diverse geographical areas.

Representative Data and Patterns
Sample co-occurrence data and cross-category correlations.

Understanding Consumer Taste Through Data Patterns
Qloo’s AI-powered insights are built on billions of anonymized consumer interactions, capturing cross-category relationships that drive taste-based personalization. By analyzing co-occurrence signals, Qloo uncovers meaningful connections between music, film, TV, brands, dining, travel, sports, and more.

This page presents real-world representative data patterns, demonstrating how different entities are associated based on observed behaviors. These examples illustrate the breadth and depth of Qloo’s dataset and how it enables cultural intelligence at scale.

Core Concepts
Pairwise Category Signals: A dataset capturing the strength of co-occurrences between entities from different categories (e.g., how often a movie preference aligns with a particular fashion brand).
Cross-Category Correlations: Insights derived from Qloo’s AI models, showing how preferences in one category (e.g., dining) relate to another (e.g., music).
Pairwise Category Signals and Cross-Category Correlations
This section examines how different categories interact within Qloo’s dataset, revealing meaningful relationships between consumer preferences.

Cross-Category Transaction Examples
The examples below illustrate how single events containing cross-category entity co-occurrences contribute to Qloo’s understanding of cultural correlations:



Pairwise Co-Occurrence Matrix
The matrix below displays the co-occurring signal count for pairwise cross-category relationships, highlighting consumer taste overlaps across music, film, TV, brands, dining, and more:


Search Methodology
The logic of Qloo’s search algorithm’s methodology maximizes the accuracy and efficacy of search results based on fuzzy natural language inputs.

Search Representations
The initial logic represents each name in three separate ways, with each representation checked in every request.

Combined Word Representation
The first is by combining all the words in the name into a single search term that will be matched with any of its substrings that begin with the first character (edge n-grams). For example, searching The Big Lebowski will match with queries t, th, the, the b, the bi, the big, the big l, etc. A match with this representation is weighed heavily to ensure that a user who knows precisely how their entity is named and spelled will find what they’re looking for.

Individual Word Representation
The second representation is with each name separated into its constituent words. The words are individually searchable, and certain common words such as “the”, “a”, and “an” are ignored. Queries “big” and “lebowski” will each register a match, but these matches are weighed less than in the first representation. The query “big lebowski” will score highly as it matches two full words, but not as highly as “the big lebowski” or even “the big leb” which match the entity’s name correctly from its beginning.

Hybrid Representation
The third representation is a hybrid of the first two. Like the second representation, it separates each name into individual words, but it stores every edge n-gram of each word as well. This allows for imperfect and incomplete queries to yield helpful results. Matches here will be weighed less than the second representation. Since query “big lebo” will not match against the first representation, its individual words will match against the second two, with “lebo” awarded a smaller score than “big”.

Character Removal and Transformation
As the search function was intended to help users find entities based on how they’d naturally type requests, all queries and representations are stripped of most punctuation, capitalization, and formatting since human input of these aspects tends to be inconsistent. Certain characters that do not appear on a keyboard have transformations, such as Æ to “ae”. Other characters that are popularly used in an irregular way such as $ as an “s” in A$AP Rocky also have transformations.

Terms and Policies
Adjusting API Specifications
API specifications and functionality including data domain coverage, rate limits, special parameters, and average latencies are governed by the executed Qloo Inc. – Master Services Agreement ("MSA"). Please contact sales@qloo.com or api@qloo.com to adjust any specifications in the MSA.

Learning Rights
Please note: unless otherwise specified in MSA, Qloo Inc. reserves the rights to improve it’s services and inferences on the basis of anonymized arrays of entities passed through the recommendation route. This is to the benefit of all API clients without any use or reliance on personally identifiable information (PII).

Qloo receives co-occurrence training data from the primary entity arrays that are passed through the API. For example, here is an example of a 10 entity array -

89E2CEAF-A6CB-4129-A49F-6D5878A6A4E8
4CF283D7-F2ED-4900-9F4F-CC6E7E5CFC0C
3AF8231E-F2B6-4137-84EA-CB05A5145C6B
BA99B078-4F59-49DB-94AC-6B6D907D2A1F
4DF25B77-A442-4EC4-84AA-148F287DCA8A
E45422F3-3A52-4945-B787-6DCD0F638FD6
2836DE22-F172-4CD8-91AF-367859638019
81DD0EF0-5843-4BC1-95B0-650CBA60B931
963D0573-9A6B-4FB8-B857-1EB704136637
6BB2ECEA-A20D-4044-B4F3-F2FA9F47C40E
As a data processor via its APIs, Qloo never receives any identity data whatsoever. This puts Qloo squarely in the safe harbor of Article 6 under GDPR and associated privacy regulations.

Availability of Service
Qloo. will use commercially reasonable efforts to make API available with a Monthly Uptime Percentage (defined below) of at least 99%. “Monthly Uptime Percentage”shall mean, for any month, the percentage of minutes during the month in which the Qloo API was available to Company. Monthly Uptime Percentage measurements exclude downtime resulting directly or indirectly from any Qloo SLA Exclusion (defined below).

Qloo SLA Exclusion. The service commitment set forth above does not apply to any unavailability, suspension or termination of Qloo API: (i) caused by factors outside of Qloo’s reasonable control, including any force majeure event or broad and sustained major cloud-based outages (ii) that result from any actions or inactions of Company; (iii) that result from Company equipment, software or other technology and/or third party equipment, software or other technology (iv) that result from any maintenance as provided for pursuant to this Agreement; or (v) arising from the suspension and termination of Company’s right to use Qloo API in accordance with the termination provisions contained within the master services agreement.

In the past, Qloo has averaged uptimes north of 99.9%.

