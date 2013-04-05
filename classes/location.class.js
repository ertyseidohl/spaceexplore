const LOCATION_PLANET = 0;
const LOCATION_STATION = 1;
const LOCATION_DEBRIS = 2;

function Location(type){
	switch(type){
		case LOCATION_PLANET:
			this.name = generatePlanetName();
			break;
		case LOCATION_STATION:
			this.name = generateStationName();
			break;
		case LOCATION_DEBRIS:
			this.name = 'debris field near ' + generatePlanetName();
			break;
		default:
			this.name = 'DEBUG: Unknown location type';
	}
	this.type = type;

	this.alienNames = generateAlienNameArray();

	this.timesAdventured = 0;
	this.adventuredWarning = 0;

	this.adventuredAt = function(time, arrival){
		if(typeof(arrival) == 'undefined') arrival = false;
		this.timesAdventured += time;
		if(this.type == LOCATION_DEBRIS){
			if((this.timesAdventured > 80 && this.adventuredWarning < 80) || arrival){
				this.adventuredWarning = 80;
				write('The debris field is practically empty, save for some worthless scrap. There is almost no treasure available here.', 'str_warning');
			} else if((this.timesAdventured > 50 && this.adventuredWarning < 50) || arrival){
				this.adventuredWarning = 50;
				write('The debris field is starting to thin out. There is less treasure available here.', 'str_warning');
			} else if((this.timesAdventured > 20 && this.adventuredWarning < 20) || arrival){
				this.adventuredWarning = 20;
				write('Some of the less dedicated scavengers have begun to leave - the main parts of the debris have been picked over.', 'str_warning');
			}
		}
	}

	this.toString = function(){
		var lType;
		if(this.type == LOCATION_PLANET) lType = 'planet';
		else if(this.type == LOCATION_STATION) lType = 'station';
		else if(this.type == LOCATION_DEBRIS) lType = 'debris field';
		return this.name + ' (' + lType + ')' + ', level ' + this.level;
	}

	this.getRandomCreatureName = function(){
		return this.alienNames[Math.floor(Math.random() * this.alienNames.length)];
	}
}

function generateAlienNameArray(){
	var aliens = new Array();
	var numAliens = Math.floor(Math.random() * 3);
	for(var i = 0; i < numAliens; i++){
		aliens.push(generateAlienName());
	}
	return aliens;
}

function generatePlanetName(){
	return 'planetname';
}

function generateStationName(){
	return 'stationname station';
}

function generateAlienName(){
	return 'alienname';
}

function writeFindDescription(type){
	switch(type){
		case LOCATION_PLANET:
			switch(Math.floor(Math.random() * 10)){
				case 0:
					write("You blast off into space... and find a planet!");
					break;
				case 1:
					write('You discover a planet with signs of life!');
					break;
				case 2:
					write("Around a brilliantly bright blue-white star, you see a planet with signs of life.");
					break;
				case 3:
					write("In the shadow of its many moons, you see a planet with signs of life.");
					break;
				case 4:
					write("As you arrive in orbit around a planet, your sensors indicate life on the system below.");
					break;
				case 5:
					write("Although it might not be the most habitable, you find a planet with signs of life.");
					break;
				case 6:
					write("As you arrive at this system, A planet looms below you, obscuring the light from the small white sun in the distance.");
					break;
				case 7:
					write("You find a pair of co-orbital planets, although only one has signs of life.");
					break;
				case 8:
					write('You find a planet on the edge of the habitable zone, yet your sensors indicate that it holds some life.');
					break;
				case 9:
					write('Your jump brings you a little too close for comfort to a new planet. As you pull away from the surface, your sensors indicate that there is life here.');
					break;
			}
			break;
		case LOCATION_STATION:
			switch(Math.floor(Math.random() * 10)){
				case 0:
					write('stationstring 0');
					break;
				case 1:
					write('stationstring 1');
					break;
				case 2:
					write('stationstring 2');
					break;
				case 3:
					write('stationstring 3');
					break;
				case 4:
					write('stationstring 4');
					break;
				case 5:
					write('stationstring 5');
					break;
				case 6:
					write('stationstring 6');
					break;
				case 7:
					write('stationstring 7');
					break;
				case 8:
					write('stationstring 8');
					break;
				case 9:
					write('stationstring 9');
					break;
			}
			break;
		case LOCATION_DEBRIS:
			switch(Math.floor(Math.random() * 10)){
				case 0:
					write('debrisstring 0');
					break;
				case 1:
					write('debrisstring 1');
					break;
				case 2:
					write('debrisstring 2');
					break;
				case 3:
					write('debrisstring 3');
					break;
				case 4:
					write('debrisstring 4');
					break;
				case 5:
					write('debrisstring 5');
					break;
				case 6:
					write('debrisstring 6');
					break;
				case 7:
					write('debrisstring 7');
					break;
				case 8:
					write('debrisstring 8');
					break;
				case 9:
					write('debrisstring 9');
					break;
			}
			break;
	}
}