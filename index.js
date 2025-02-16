// AstroApp API credentials (Replace with actual keys)
const ASTROAPP_API_KEY = "NV3oQG44h3vnUT4Np2Fp2BnOR1yBEyp2BlNZNh1Sqzkhlu0TIp3D";

// Required planetary bodies including Uranian TNPs
const PLANETS = [
    "SO", "MO", "ME", "VE", "MA", "JU", "SA", "UR", "NE", "PL", "KN", "CH",
    "CU", "HA", "ZE", "KR", "AP", "AD", "VU", "PO",
    "AS", "MC", "PF", "AR"
];

// Define planetary pictures for classification
const PLANETARY_PICTURES = {
    "boy_sway": [
        ["SO", "ME", "VE", "MA"], ["SO", "MA", "PL", "JU"], ["MA", "PL", "KN", "MC"],
        ["MO", "SA", "PL"], ["PL", "MC", "SA"], ["UR", "MC", "MA", "SO"]
    ],
    "girl_sway": [
        ["SO", "KN", "VE", "ME"], ["MO", "VE", "JU"], ["MO", "MC", "KN"],
        ["VE", "MC", "SO", "MO"], ["NE", "MC", "MO", "VE"], ["JU", "VE", "SO", "MO"]
    ],
    "neutral": [
        ["SO", "UR", "ME", "MO"], ["MA", "VE", "JU", "SA"], ["MO", "PL", "NE", "MC"]
    ]
};

// Function to fetch planetary positions from AstroApp API
async function fetchPlanetaryPositions(date, time, location) {
    const corsProxy = "https://corsproxy.io/?"; // Free CORS proxy
    const url = `https://astroapp.com/astro/apis/locations/name?cityName=${encodeURIComponent(location)}&key=${ASTROAPP_API_KEY}`;

    try {
        const response = await fetch(corsProxy + url, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        console.log("API Response:", data);
        return data;
    } catch (error) {
        console.error("Fetch error:", error);
        return null;
    }
}


// Function to calculate all midpoints
function calculateMidpoints(planets) {
    let midpoints = [];
    for (let i = 0; i < planets.length; i++) {
        for (let j = i + 1; j < planets.length; j++) {
            let midpoint = (planets[i].position + planets[j].position) / 2;
            if (midpoint > 360) midpoint -= 360;
            midpoints.push({ midpoint, planets: [planets[i].name, planets[j].name] });
        }
    }
    return midpoints;
}

// Function to find active midpoints within given orb range
function findActiveMidpoints(midpoints, planets, orbRange) {
    let activeMidpoints = [];

    midpoints.forEach(mp => {
        planets.forEach(planet => {
            let difference = Math.abs(mp.midpoint - planet.position);
            if (difference <= orbRange || Math.abs(difference - 180) <= orbRange) {
                activeMidpoints.push({ midpoint: mp, activatedBy: planet.name, orb: difference });
            }
        });
    });

    return activeMidpoints;
}

// Function to check for planetary picture activation
function evaluatePlanetaryPictures(activeMidpoints) {
    let results = { boy_sway: [], girl_sway: [], neutral: [] };

    for (let category in PLANETARY_PICTURES) {
        PLANETARY_PICTURES[category].forEach(pattern => {
            let matches = activeMidpoints.filter(mp => pattern.includes(mp.midpoint.planets[0]) && pattern.includes(mp.midpoint.planets[1]));

            if (matches.length > 0) {
                results[category].push({ pattern, activations: matches });
            }
        });
    }

    return results;
}

// Main function to generate the final report
async function generateReport(date, time, location) {
    try {
        let planetaryPositions = await fetchPlanetaryPositions(date, time, location);
        let midpoints = calculateMidpoints(planetaryPositions);

        let activeMidpoints_010 = findActiveMidpoints(midpoints, planetaryPositions, 0.10);
        let planetaryPictures_010 = evaluatePlanetaryPictures(activeMidpoints_010);

        if (planetaryPictures_010.boy_sway.length > planetaryPictures_010.girl_sway.length) {
            return formatReport("BOY SWAY", activeMidpoints_010, planetaryPictures_010);
        } else if (planetaryPictures_010.girl_sway.length > planetaryPictures_010.boy_sway.length) {
            return formatReport("GIRL SWAY", activeMidpoints_010, planetaryPictures_010);
        }

        let activeMidpoints_030 = findActiveMidpoints(midpoints, planetaryPositions, 0.30);
        let planetaryPictures_030 = evaluatePlanetaryPictures(activeMidpoints_030);

        if (planetaryPictures_030.boy_sway.length > planetaryPictures_030.girl_sway.length) {
            return formatReport("BOY SWAY", activeMidpoints_030, planetaryPictures_030);
        } else if (planetaryPictures_030.girl_sway.length > planetaryPictures_030.boy_sway.length) {
            return formatReport("GIRL SWAY", activeMidpoints_030, planetaryPictures_030);
        }

        let activeMidpoints_100 = findActiveMidpoints(midpoints, planetaryPositions, 1.00);
        let planetaryPictures_100 = evaluatePlanetaryPictures(activeMidpoints_100);

        return formatReport("NEUTRAL", activeMidpoints_100, planetaryPictures_100);
    } catch (error) {
        return `Error: ${error.message}`;
    }
}

// Function to format the final report
function formatReport(classification, activeMidpoints, planetaryPictures) {
    let report = `🌙✨️ FINAL REPORT: MIDPOINT ACTIVATIONS & PLANETARY PICTURES\n\n`;
    report += `🎯 FINAL CLASSIFICATION: ${classification}\n\n`;

    report += `🔍 1️⃣ MIDPOINT ACTIVATIONS\n`;
    activeMidpoints.forEach(mp => {
        report += `• ${mp.midpoint.planets[0]}/${mp.midpoint.planets[1]} (Activated by ${mp.activatedBy}, Orb: ${mp.orb.toFixed(2)}°)\n`;
    });

    report += `\n🔍 2️⃣ PLANETARY PICTURE ANALYSIS\n`;

    ["boy_sway", "girl_sway", "neutral"].forEach(category => {
        if (planetaryPictures[category].length > 0) {
            report += `\n🔹 ${category.toUpperCase()}:\n`;
            planetaryPictures[category].forEach(pp => {
                report += `• ${pp.pattern.join(" = ")}\n`;
                pp.activations.forEach(a => {
                    report += ` → Activated by ${a.activatedBy}, Orb: ${a.orb.toFixed(2)}°\n`;
                });
            });
        }
    });

    return report;
}

// Example usage
generateReport("2025-02-09", "12:00", "Richland, USA").then(console.log);

