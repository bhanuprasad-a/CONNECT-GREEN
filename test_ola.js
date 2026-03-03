const API_KEY = 'TlL70XLRSucp1UzWwhXrnGkVUh23Z5jlQaMWzBoR';

async function run() {
    try {
        const geoRes = await fetch(`https://api.olamaps.io/places/v1/geocode?address=Mumbai&api_key=${API_KEY}`);
        const geoData = await geoRes.json();
        console.log("Geocode Data:", JSON.stringify(geoData, null, 2));

        const routeRes = await fetch(`https://api.olamaps.io/routing/v1/directions?origin=12.93444,77.61633&destination=12.93510,77.62479&api_key=${API_KEY}`);
        const routeData = await routeRes.json();
        console.log("Routing request URL: ", `https://api.olamaps.io/routing/v1/directions?origin=12.93444,77.61633&destination=12.93510,77.62479&api_key=${API_KEY}`);
        console.log("Route Data:", JSON.stringify(routeData, null, 2));
    } catch (e) {
        console.error(e);
    }
}
run();
