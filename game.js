var KEY_ENTER = 13;

var STATE_DEAD = -1;
var STATE_WAITING_FOR_NAME = 0;
var STATE_WAITING_FOR_RAND = 5;
var STATE_WAITING_FOR_HERO_TYPE = 10;
var STATE_WAITING_FOR_SHIP_TYPE = 20;
var STATE_WAITING_FOR_WEAPON_TYPE = 30;
var STATE_WAITING_FOR_ARMOR_TYPE = 40;
var STATE_IN_SPACE = 50;
var STATE_ADVENTURE = 60;
var STATE_CHOOSING_LOCATION = 70;

var STATE_ADVENTURE_COMBAT = 1000;
var STATE_ADVENTURE_FOUND_STIM = 1001;
var STATE_ADVENTURE_TRAPPED_TREASURE = 1002;
var STATE_ADVENTURE_BROKEN_WEAPON = 1003;
var STATE_ADVENTURE_BULLY_DEMAND = 1004;
var STATE_ADVENTURE_TRAP_BOX = 1005;
var STATE_ADVENTURE_SCARY_BULLY = 1006;
var STATE_ADVENTURE_SCARY_BULLY_WARNED = 1007;
var STATE_ADVENTURE_BULLY_ANTIMATTER = 1008;
var STATE_ADVENTURE_LARGE_TREASURE = 1009;

var gameState;
var player = new Player();
var currentLocation = false;
var locationList = [];
var currentCreature;

var superAdventureIndex = {
	LOCATION_PLANET: 0,
	LOCATION_STATION: 0,
	LOCATION_DEBRIS: 0
};

//cache
var output;
var input;

$(document).ready(function(){
	output = $('#output').first();
	input = $('#input').first();
	windowSize();
	input.keyup(function(evt){handleKeyPress(evt);});
	write('Write your answers in the text input at the bottom of the page.', 'str_warning');
	write('Welcome to Space Explore! What is your name, adventurer?');
	gameState = STATE_WAITING_FOR_NAME;
	input.focus();
	utilTesting();
});

$(window).resize(function(){
	windowSize();
});

$(window).bind('beforeunload', function(){
  return 'Are you sure you want to leave? Your game will not be saved (that feature should be implemented soon).';
});

function handleKeyPress(evt){
	if(evt.keyCode == KEY_ENTER && input.val().length > 0){
		handleInput(input.val());
		clearInput();
	}
}

function clearInput(){
	input.val('');
}

function handleInput(str){
	write(str, 'str_input');
	switch(gameState){
		case STATE_WAITING_FOR_NAME:
			player.name = str;
			write('Welcome, ' + player.name + '! Your ship awaits you. Be warned: Space is full of scoundrels, looking out for nobody but themself.');
			write('The commands that are available to you will be listed in a light blue box, as below. Type the bracketed letter of any command that you want to do!', 'str_warning');
			gameState = STATE_WAITING_FOR_RAND;
			break;
		case STATE_WAITING_FOR_RAND:
			str = sanitize(str);
			if(str.startsWith('c')){
				gameState = STATE_WAITING_FOR_HERO_TYPE;
			} else if(str.startsWith('r')){
				var classes = ['b', 'r', 'e', 's', 'p'];
				chooseAdventureClass(classes[Math.floor(Math.random() * classes.length)]);
				var ships = ['f', 's', 'j'];
				chooseAdventureShip(ships[Math.floor(Math.random() * ships.length)]);
				var weapons = ['r','s','l'];
				chooseAdventureWeapon(weapons[Math.floor(Math.random() * weapons.length)]);
				var armors = ['l', 's', 'h'];
				chooseAdventureArmor(armors[Math.floor(Math.random() * armors.length)]);
				var shipType;
				if(player.ship.type == SHIP_TYPE_FIGHTER) shipType = 'fighter ship';
				else if(player.ship.type == SHIP_TYPE_SMUGGLER) shipType = 'smuggler ship';
				else if(player.ship.type == SHIP_TYPE_JUMPER) shipType = 'jumper ship';
				write('Okay, ' + player.name + ', you\'re ready to blast off in your ' + shipType + ', accompanied by your trusty ' + player.currentWeapon.getName() + ', and wearing your ' + player.currentArmor.getName() + '! Welcome to Space Explore.');
				gameState = STATE_IN_SPACE;
			} else {
				write('Sorry, I didn\'t understand that.');
			}
			break;
		case STATE_WAITING_FOR_HERO_TYPE:
			str = sanitize(str);
			var chosen = chooseAdventureClass(str);
			if(chosen){
				gameState = STATE_WAITING_FOR_SHIP_TYPE;
			}
			break;
		case STATE_WAITING_FOR_SHIP_TYPE:
			str = sanitize(str);
			var chosen = chooseAdventureShip(str);
			if(chosen){
				write('Welcome to space, ' + player.name + '! It\'s a dangerous place, so you should take a weapon.');
				gameState = STATE_WAITING_FOR_WEAPON_TYPE;
			}
			break;
		case STATE_WAITING_FOR_WEAPON_TYPE:
			str = sanitize(str);
			var chosen = chooseAdventureWeapon(str);
			if(chosen){
				write('Well, if you\'re taking that weapon, you should probably take some armor in case they shoot back.');
				gameState = STATE_WAITING_FOR_ARMOR_TYPE;
			}
			break;
		case STATE_WAITING_FOR_ARMOR_TYPE:
		str = sanitize(str);
			var chosen = chooseAdventureArmor(str);
			if(chosen){
				var shipType;
				if(player.ship.type == SHIP_TYPE_FIGHTER) shipType = 'fighter ship';
				else if(player.ship.type == SHIP_TYPE_SMUGGLER) shipType = 'smuggler ship';
				else if(player.ship.type == SHIP_TYPE_JUMPER) shipType = 'jumper ship';
				write('Okay, ' + player.name + ', you\'re ready to blast off in your ' + shipType + ', accompanied by your trusty ' + player.currentWeapon.getName() + ', and wearing your ' + player.currentArmor.getName() + '! Welcome to Space Explore.');
				gameState = STATE_IN_SPACE;
			}
		case STATE_IN_SPACE:
			str = sanitize(str);
			if(str.startsWith('e')){ //explore
				var rand = Math.random();
				if(rand < .5){ //50%
					currentLocation = new Location(LOCATION_PLANET);
				} else if(rand < .6){ //10%
					currentLocation = new Location(LOCATION_STATION);
				} else if(rand < .8){ //20%
					currentLocation = new Location(LOCATION_DEBRIS);
				} else{ // 20%
					currentLocation = false;
				}
				if(currentLocation != false){
					writeFindDescription(currentLocation.type);
					currentLocation.adventuredAt(0, true);
					addDestination(currentLocation);
				} else{
					writeEmptyFindDescription();
				}
				player.ship.useFuel();
			} else if(str.startsWith('a')){ //adventure
				if(currentLocation != false){
					doAdventure();
					player.stats.timesAdventured ++;
				} else{
					write('There\'s nowhere to go adventuring here.');
				}
			} else if(str.startsWith('v')){ //visit
				if(locationList.length > 0){
					for(var i = 0; i < locationList.length; i++){
						if(currentLocation == locationList[i]){
							write('[' + i + ']: ' + locationList[i].toString() + ' (Current Location)', 'str_current');
						} else {
							write('[' + i + ']: ' + locationList[i].toString(), 'str_item');
						}
					}
					gameState = STATE_CHOOSING_LOCATION;
				 } else{
					write('You don\'t know of any locations right now. [E]xplore a bit to find some!');
				 }
			} else if(str.startsWith('i')){ //inventory
				write('The contents of your inventory: ');
				player.writeInventory();
				write('You currently have ' + player.money + ' credits.', 'str_item');
				write('You currently have ' + player.ship.treasure + ' units of treasure on your ship.', 'str_item');
			} else if(str.startsWith('s')){ //ship status
				player.writeShipStatus();
			} else if(str.startsWith('m')){ //more options
				write('[L]icense and info, [C]lear out log, [H]elp', 'str_options');
			} else if(str.startsWith('l')){ //license
				write('Space Explore is by Erty Seidel of Handprint Games. Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License. You\'re welcome to explore the source code - I\'ve left it unminified.');
			} else if(str.startsWith('c')){ //clear log
				output.children('p').slice(0, -1).remove();
				write('Cleared out the log.', 'str_change');
			} else if(str.startsWith('h')){
				write('There is no help yet.');
			} else {
				write('Type the bracketed letter of the command you want to do!');
			}
			break;
		case STATE_CHOOSING_LOCATION:
			str = sanitize(str);
			strint = parseInt(str);
			if(!isNaN(strint)){
				if(strint > 0 && strint < locationList.length){
					write('You decide to fly to ' + locationList[strint].name + '!');
					currentLocation = locationList[strint];
					player.ship.useFuel();
					gameState = STATE_IN_SPACE;
				} else {
					write('That planet is not on your navigation maps.');
				}
			} else if(str == 'x') {
				write('You leave the navigation center and return to the pilot\'s seat.');
				state = STATE_IN_SPACE;
			} else {
				write('I didn\'t understand that.');
			}
			break;
		case STATE_ADVENTURE_COMBAT:
			if(currentCreature.health <= 0){
				currentCreature = null;
				gameState = STATE_IN_SPACE;
			} else {
				var rand = Math.random();
				write('The ' + currentCreature.getName() + ' attacks!');
				player.changeHealth(-1 * currentCreature.getDamage());
			}
			break;
		case STATE_ADVENTURE_FOUND_STIM:
			str = sanitize(str);
			if(str.startsWith('t')){
				var rand = Math.random();
				if(rand < .5){ //50%
					write('You feel strong!');
					player.changeStrength(1);
				} else if(rand < .98){ //49.9%
					write('Ehh... you don\'t feel so good.');
					player.changeStrength(-1);
				} else if(rand < .01){ //.01%
					write('Wow! That\'s the stuff!')
					player.changeStrength(5);
				} else{ //.01%
					write('Ooh.. you feel like death.');
					player.changeStrength(-5);
				}
				gameState = STATE_IN_SPACE;
			} else if(str.startsWith('i')){
				write('You decide to ignore the stim. Probably a good idea.');
				gameState = STATE_IN_SPACE;
			} else{
				write('I didn\'t understand that.');
			}
			break;
		case STATE_ADVENTURE_TRAPPED_TREASURE:
			str = sanitize(str);
			if(str.startsWith('d')){
				var roll = Math.floor(Math.random() * 20);
				if(roll + player.repair > 15){
					write('You successfully disarm the traps and get to the cache!');
				} else{
					write('BOOM! The trap explodes in your face!');
					player.changeHealth(-1 * (Math.floor(Math.random() * 50) + 10));
				}
				if(player.health > 0){
					var amt = Math.floor(Math.random() * 2000) + 10;
					if(amt > 1000){
						write('The cache is huge! You grab as much as you can.');
					} else if(amt < 100){
						write('Unfortunately, it looks like whoever stored this treasure has already taken most of the good stuff.');
					}
					player.ship.changeTreasure(amt);
				}
				gameState = STATE_IN_SPACE;
			} else if(str.startsWith('i')){
				write('You decide to ignore the cache.');
				gameState = STATE_IN_SPACE;
			} else{
				write('I didn\'t understand that.');
			}
			break;
		case STATE_ADVENTURE_BROKEN_WEAPON:
			str = sanitize(str);
			if(str.startsWith('r')){
				var roll = Math.floor(Math.random() * 20);
				if(roll + player.repair > 10){
					write('You successfully repair the weapon!')
					player.getWeapon(createRandomWeapon());
				} else if(roll + player.repair < 3){
					write('The weapon explodes in your hands!');
					player.changeHealth(-1 *(Math.floor(Math.random() * 10) + 10));
				} else{
					write('You don\'t seem to be able to repair the weapon. It might be worth something, though.');
					player.ship.changeTreasure(Math.floor(Math.random * 3) + 1);
				}
				gameState = STATE_IN_SPACE;
			} else if(str.startsWith('i')){
				write('You decide to ignore the weapon.');
				gameState = STATE_IN_SPACE;
			} else{
				write('I didn\'t understand that.');
			}
			break;
		case STATE_ADVENTURE_BULLY_DEMAND:
			str = sanitize(str);
			if(str.startsWith('f')){
				if(player.ship.treasure > 0){
					write('As painful as it is, you give them all your treasure. They thank you and leave.');
					player.ship.changeTreasure(-1 * player.ship.treasure);
				} else {
					write('Joke\'s on them, you don\'t have any treasure! They feel bad for you and give you some of theirs.');
					player.ship.changeTreasure(100);
				}
				gameState = STATE_IN_SPACE;
			} else if(str.startsWith('r')){
				var rand = Math.random();
				if(player.flight < 5){
					if(rand < .5){
						write('They fire every weapon they have!');
						player.changeHealth(-1000);
					} else if(rand < .9){
						write('They blast the heck out of your ship!');
						player.changeHealth(-1 * (Math.floor(Math.random() * 1000) + 10));
						if(player.health > 0){
							write('Wow! You somehow manage to escape! Lucky break.');
						}
					} else{
						write('Wow! You somehow manage to escape! Lucky break.');
					}
				} else {
					write('You easily manage to evade them with your superior piloting skill.');
				}
				gameState = STATE_IN_SPACE;
			} else {
				write('They don\'t seem to understand what you\'re saying.');
			}
			break;
		case STATE_ADVENTURE_TRAP_BOX:
			str = sanitize(str);
			if(str.startsWith('o')){
				var rand = Math.random();
				if(rand < .3){
					switch(currentLocation.type){
						case LOCATION_STATION:
							write('As you open the box and look inside, someone bumps into you and steals some credits!');
							player.changeMoney(-1 * (Math.floor(Math.random() * 100) + 100));
							break;
						case LOCATION_PLANET:
						case LOCATION_DEBRIS:
							if(player.speed < 4){
								write('The box suddenly lights on fire! You are burned.');
								player.changeHealth(-1 * (Math.floor(Math.random() * 10) + 2));
							} else {
								write('The box suddenly lights on fire! Luckily, you are fast enough to evade the flames.');
							}
					}
				} else if(rand < .6){
					write('A swarm of bees flies out of the box! You are stung several times.');
					var dmg = (-1 * Math.floor(Math.random() * 10) + 2) + player.strength;
					if(dmg < 0){
						player.changeHealth(dmg);
						if(player.health > 0){
							write('Eventually, the bees disperse.');
						} else {
							write('Killed by a box of bees. How humiliating.');
						}
					} else {
						write('Fortunately, your strength allows you to totally ignore the damage.');
					}
				} else if(rand < .9){
					write('Inside of the box is ... nothing. You feel cheated.');
				} else {
					write('The box contains some computer chips. You\'re not sure what they\'re for, but someone will probably buy them.');
					player.ship.changeTreasure(Math.floor(Math.random() * 100) + 10);
				}
				gameState = STATE_IN_SPACE;
			} else if(str.startsWith('i')){
				write('You decide to ignore the box. Now you\'ll never know what was inside.');
				gameState = STATE_IN_SPACE;
			} else {
				write('I didn\'t understand that.');
			}
			break;
		case STATE_ADVENTURE_SCARY_BULLY_WARNED:
		case STATE_ADVENTURE_SCARY_BULLY:
			str = sanitize(str);
			if(str.startsWith('h')){
				write('You hide for a while until the danger passes. Probably a good idea.');
				gameState = STATE_IN_SPACE;
			} else if(str.startsWith('s')){
				if(player.stats.creaturesKilled > 100){
					write('You notice that they actually avoid <i>your</i> ship! They must have heard of your reputation as a monster killer.');
					gameState = STATE_IN_SPACE;
				} else{
					var rand = Math.random();
					if(player.flight < 5){
						if(gameState = STATE_ADVENTURE_SCARY_BULLY){
							write('They fire a warning shot, destroying a chunk of rock near you. There\'s no way your hull could take a blast that size.');
							gameState = STATE_ADVENTURE_SCARY_BULLY_WARNED;
						} else if(rand < .8){
							write('Bad decision! They blast the heck out of you!');
							player.changeHealth(-1 * (Math.floor(Math.random() * 200) + 100));
							if(player.health > 0){
								write('You somehow manage to get away.');
								gameState = STATE_IN_SPACE;
							}
						} else {
							write('They\'re either in awe of your sheer courage to stick around, or just don\'t see you (both equal possibilities). They allow you to live, for now.');
							gameState = STATE_IN_SPACE;
						}
					} else {
						write('You easily manage to evade them with your superior piloting skill.');
					}
				}
			} else {
				write('I didn\'t understand that.');
			}
			break;
		case STATE_ADVENTURE_BULLY_ANTIMATTER:
			str = sanitize(str);
			if(player.repair >= 9 || player.pilot >= 9){
				if(str.startsWith('g')){
					write('You know they were bluffing, but you give them the treasure anyway? Oookay.');
					gameState = STATE_IN_SPACE;
					player.ship.changeTreasure(-1 * player.ship.treasure);
				} else if(str.startsWith('c')){
					write('You call them on their bluff and continue to adventure. Scoundrels.');
					gameState = STATE_IN_SPACE;
				} else if(str.startsWtih('f')){
					write('You decide to call their bluff and fight them!');
					write('They jettison their treasure to distract you and warp away.');
					player.ship.changeTreasure(Math.floor(Math.random() * 1000) + 1000);
					gameState = STATE_IN_SPACE;
				} else {
					write('They don\'t seem to understand you, and are growing impatient.');
				}
			} else {
				if(str.startsWith('g')){
					write('Just in case, you give them the treasure, then check your ship.');
					if(Math.random() < 5){
						write('They were bluffing. There is nothing attached to your ship.');
					} else {
						write('Good thing, too. There was a bomb! Fortunately, the bomb is worth more than you, so they detatch it and move on to other targets.');
					}
					gameState = STATE_IN_SPACE;
				} else if(str.startsWith('c')){
					write('You call them on their bluff and continue to adventure.');
					if(Math.random() < 5){
						write('Turns out they were bluffing. Lucky break.');
					} else {
						write('Calling them on their bluff turns out to be the last thing you ever do. The antimatter bomb rips through your ship in less than ten nanoseconds.');
						player.changeHealth(-9999);
					}
					gameState = STATE_IN_SPACE;
				} else if(str.startsWtih('f')){
					write('You decide to call their bluff and fight them!');
					if(Math.random() < 5){
						write('Turns out they were bluffing. They jettison their treasure to distract you and warp away.');
						player.ship.changeTreasure(Math.floor(Math.random() * 1000) + 1000);
					} else {
						write('Calling them on their bluff turns out to be the last thing you ever do. The antimatter bomb rips through your ship in less than ten nanoseconds.');
						player.changeHealth(-9999);
					}
					gameState = STATE_IN_SPACE;
				} else{
					write('They don\'t seem to understand you, and are growing impatient.');
				}
			}
			break;
		case STATE_ADVENTURE_LARGE_TREASURE:
			str = sanitize(str);
			if(str.startsWith('c')){
				write('You spend a while cutting up the treasure.');
				var time = Math.floor(Math.random() * 10) + 10;
				if(player.repair > 2) time = time * .5;
				currentLocation.adventuredAt(time);
				player.ship.changeTreasure(Math.floor(Math.random() * 1000) + 1000);
				gameState = STATE_IN_SPACE;
			} else if(str.startsWith('i')){
				write('You decide to ignore the treasure. There are more valuable things to nab here.');
				gameState = STATE_IN_SPACE;
			} else{
				write('What? I didn\'t understand that.');
			}
			break;
		case STATE_DEAD:
			write('Game over.', 'str_warning');
			break;
	}
	if(player.health <= 0){
		gameState = STATE_DEAD;
	}
	writeInstructions();
}

function addDestination(dest){
	locationList.push(dest);
	write(dest.name + ' has been added to your star map.', 'str_change');
}

function beginCombat(){
		assert(typeof(currentCreature) == 'undefined', 'currentCreature is not null before generating a new one!');
	currentCreature = createRandomCreature(currentLocation);
	write('A ' + currentCreature.getName() + ' suddenly attacks! (todo make this more interesting).');
	gameState = STATE_ADVENTURE_COMBAT;
}

function sanitize(str){
	return str.toLowerCase().replace(/\s/g, "");
}

function write(str, cls){
	if(typeof(cls) == 'undefined') cls = 'str_default';
	output.append('<p class="' + cls + '">' + str + '</p>');
	output.scrollTop(output[0].scrollHeight);
}

function writeInstructions(){
	switch(gameState){
		case STATE_WAITING_FOR_NAME:
			//do nothing
			break;
		case STATE_WAITING_FOR_RAND:
			write('Do you want to [c]reate your character, or get a [r]andom one?', 'str_options');
			break;
		case STATE_WAITING_FOR_HERO_TYPE:
			write('Do you wish to be a [B]rute, [R]unner, [E]ngineer, [S]muggler, or [P]ilot? ([M]ore info)', 'str_options');
			break;
		case STATE_WAITING_FOR_SHIP_TYPE:
			write('Do you want to fly in a [F]ighter, [S]muggler ship, or a [J]umper ship? ([M]ore info)', 'str_options');
			break;
		case STATE_WAITING_FOR_WEAPON_TYPE:
			write('Do you want to take a [R]ifle, a [S]hotgun, or a [L]aser rifle to begin? ([M]ore info)', 'str_options');
			break;
		case STATE_WAITING_FOR_ARMOR_TYPE:
			write('Do you want to take [L]ight, [S]tandard, or [H]eavy armor? ([M]ore info)', 'str_options');
			break;
		case STATE_IN_SPACE:
			if(currentLocation == false){
				write('You are floating in space.', 'str_status');
				if(locationList.length == 0){
					write('[E]xplore space, [I]nventory Check, [S]hip status check, [M]ore options', 'str_options');
				} else{
					write('[E]xplore space, [V]isit a known location, [I]nventory check, [S]hip status check, [M]ore options', 'str_options');
				}
			} else{
				switch(currentLocation.type){
					case LOCATION_PLANET:
						write('You are currently in orbit around the planet ' + currentLocation.name, 'str_status');
						break;
					case LOCATION_STATION:
						write('You are currently docked at ' + currentLocation.name, 'str_status');
						break;
					case LOCATION_DEBRIS:
						write('You are currently floating a safe distance away from ' + currentLocation.name, 'str_status');
						break;
				}
				write('[E]xplore space, [A]dventure at this location, [V]isit another location, [I]nventory Check, [S]hip status check, [M]ore options', 'str_options');
			}
			break;
		case STATE_CHOOSING_LOCATION:
			write('Write the [Number] of a planet to visit it! Or [X] to go back to the previous menu.', 'str_options');
			break;
		case STATE_ADVENTURE_COMBAT:
			write('[A]ttack, [R]un, or [E]scape?', 'str_options');
			break;
		case STATE_ADVENTURE_FOUND_STIM:
			write('[T]ry the stim, or [I]gnore it?', 'str_options');
			break;
		case STATE_ADVENTURE_TRAPPED_TREASURE:
			write('[I]gnore it, or attempt to [D]isarm it, using your repair skill?', 'str_options');
			break;
		case STATE_ADVENTURE_BROKEN_WEAPON:
			if(player.repair > 5){
				write('You\'re confident enough in your repair skill that you won\'t hurt yourself if you try to repair this weapon.', 'str_skill');
			}
			write('Attempt to [R]epair the weapon, or [I]gnore it?', 'str_options');
			break;
		case STATE_ADVENTURE_BULLY_DEMAND:
			if(player.flight >= 5){
				write('You feel confident that you could pilot your ship away without any problems.', 'str_skill');
			} else {
				write('You do not feel confident that you could evade them if they decided to fire.');
			}
			write('[F]ork over the treasure, or [R]efuse and run?', 'str_options');
			break;
		case STATE_ADVENTURE_TRAP_BOX:
			write('[O]pen or [I]gnore the box?', 'str_options');
			break;
		case STATE_ADVENTURE_SCARY_BULLY:
			if(player.flight >= 5){
				write('You feel confident that you could pilot your ship away without any problems.', 'str_skill');
			} else {
				write('You do not feel confident that you could evade them if they decided to fire.');
			}
			write('[H]ide, or [S]tay and see what happens?');
			break;
		case STATE_ADVENTURE_BULLY_ANTIMATTER:
			if(player.repair >= 9){
				write('Your excellent repair skill has allowed you the knowledge that they are, in fact, bluffing. Your ship\'s sensors are good enough to detect that there is no antimatter on your ship.', 'str_skill');
			} else if(player.pilot >= 9){
				write('Your excellent piloting skill has allowed you the knowledge that they are, in fact, bluffing. Your ship sense is good enough to know that there was no way they could attach a bomb. You can also easily take them in a fight, if you so desire.', 'str_skill');
			}
			write('[G]ive them all of your treasure, [C]all their bluff and keep adventuring, or [F]ight them?');
			break;
		case STATE_ADVENTURE_LARGE_TREASURE:
			if(player.repair > 2){
				write('Fortunately, your good repair skill will halve that time.', 'str_skill');
			}
			write('[C]ut up the metal, or [I]gnore it?');
			break;
		case STATE_DEAD:
			write('Refresh the page to restart the game.');
	}
}

function writeEmptyFindDescription(){
	switch(Math.floor(Math.random() * 10)){
		case 0:
			write('You blast off into space... and find nothing of interest.');
			break;
		case 1:
			write('You discover a brilliant star system... with nothing interesting orbiting it.');
			break;
		case 2:
			write('You discover a large gas giant... with nothing of interest or value on it.');
			break;
		case 3:
			write('You discover the charred remains of a ship, but it appears scrappers have already taken everything valuable.');
			break;
		case 4:
			write('A large yellow star burns brightly, beautiful but totally worthless.');
			break;
		case 5:
			write('You find a binary star system, which has scorched every orbiting planet and rendered the whole system uninteresting.');
			break;
		case 6:
			write('You fall out of warp in a nebula, totally surrounded by gas and disoriented. It\s going to be impossible to find anything interesting in here.');
			break;
		case 7:
			write('You have found a white dwarf star, surrounded by worthless, frozen planets.');
			break;
		case 8:
			write('You have found a red giant star, which has consumed any planets worth investigating in its fiery expansion.');
			break;
		case 9:
			write('You find yourself in an asteroid field! Better warp away before you get crushed by a giant mass of nickel-iron.');
			break;
	}
}

function doAdventure(){
	switch(currentLocation.type){
		case LOCATION_PLANET:
			var rand = Math.random();
			if(rand < .50){ //50%
				currentLocation.adventuredAt(1);
				beginCombat();
			} else if(rand < .70){ //20%
				currentLocation.adventuredAt(1);
				switch(Math.floor(Math.random() * 20)){
					case 0:
						var amt = Math.floor(Math.random() * 900) + 100;
						write('You find a pirate\'s cache, with ' + amt + ' credits inside!');
						player.changeMoney(amt);
						break;
					case 1:
						var amt = Math.floor(Math.random() * 250) + 50;
						write('There is a box here with some treasure in it. You don\'t think anyone will miss it...');
						player.ship.changeTreasure(amt);
						break;
					case 2:
						var amt = Math.floor(Math.random() * 350) + 50;
						write('You see the charred body of an unlucky adventurer like yourself. It looks like whoever killed them wasn\'t interested in their treasure, though...');
						player.ship.changeTreasure(amt);
						break;
					case 3:
						var amt = Math.floor(Math.random() * 450) + 50;
						write('You see a dead adventurer like yourself, lying against the damaged hull of their crashed ship. Might as well check for valuables...');
						player.ship.changeTreasure(amt);
						break;
					case 4:
						var amt = Math.floor(Math.random() * 550) + 50;
						write('You find a small hoard of treasure, hidden away.');
						player.ship.changeTreasure(amt);
						break;
					case 5:
						var amt = Math.floor(Math.random() * 3) + 2;
						write('You find a few fuel canisters that appear to have been jettisoned.');
						player.ship.changeFuel(amt);
						break;
					case 6:
						var amt = Math.floor(Math.random() * 4) + 1;
						write('You find some fuel that seems to have been abandoned.');
						player.ship.changeFuel(amt);
						break;
					case 7:
						var amt = 1;
						write('Oh, a shiny rock!');
						player.ship.changeTreasure(amt);
						break;
					case 8:
						var amt = Math.floor(Math.random() * 10) + 5;
						write('You find a piece of scrap metal that you might be able to sell for a bit.');
						player.ship.changeTreasure(amt);
						break;
					case 9:
						var amt = Math.floor(Math.random() * 40) + 5;
						write('You find a small canister of specialized blaster gas. It doesn\'t fit any of your weapons, but someone might be willing to pay for it.');
						player.ship.changeTreasure(amt);
						break;
					case 10:
						var amt = Math.floor(Math.random() * 100) + 100;
						write('Wow! You find a massive tanker of fuel with nobody at the helm. You don\'t think anyone will even notice if you siphon a little.');
						player.ship.changeFuel(amt);
						break;
					case 11:
						var amt = Math.floor(Math.random() * 1000) + 1000;
						write('You witness the explosion of a massive cargo ship. Better grab everything you can before someone else does!');
						player.ship.changeTreasure(amt);
						break;
					case 12:
						write('You find an explorer\'s body with no identification. They have some credits on them.');
						player.changeMoney(Math.floor(Math.random() * 1000) + 1);
						break;
					case 13:
						write('You find an illegal stim pack. It looks old but totally unused.');
						gameState = STATE_ADVENTURE_FOUND_STIM;
						break;
					case 14:
						write('You find a treasure cache, but it seems booby trapped.');
						gameState = STATE_ADVENTURE_TRAPPED_TREASURE;
						break;
					case 15:
						write('You find a clip of ammo that you didn\'t realize you had. What fortune!');
						var wpn = player.inventory.weapons[Math.floor(Math.random() * player.inventory.weapons.length)];
						wpn.changeClips(1);
						break;
					case 16:
						write('You find a weapon with nobody around to care for it. How sad.');
						player.getWeapon(createRandomWeapon());
						break;
					case 17:
						write('You find a weapon. Looks like it\'s abandoned.');
						player.getWeapon(createRandomWeapon());
						break;
					case 18:
						write('You find a damaged weapon.');
						gameState = STATE_ADVENTURE_BROKEN_WEAPON;
						break;
					case 19:
						write('You see a meteor made of rare metals! Time to break out the mining drill.');
						player.ship.changeTreasure(Math.floor(Math.random() * 200) + 50);
						break;
				}
			} else if(rand < .80){ //10%
				currentLocation.adventuredAt(1);
				switch(Math.floor(Math.random() * 10)){
					case 0:
						if(player.money > 0){
							write('You notice that some of your money has gone missing. Weird.');
							player.changeMoney(-1 * (Math.floor(Math.random() * 30) + 10));
						} else {
							write('You find some trash on your ship that isn\'t yours, but the systems say that whoever was on your ship left before you got back. Nothing seems missing, either. How odd.');
						}
						break;
					case 1:
						if(player.ship.treasure > 0){
							write('You notice that someone has made off with some of your treasure! Scoundrels.');
							player.ship.changeTreasure(-1 * (Math.floor(Math.random() * 30) + 10));
						} else {
							write('You notice that your ship logs indicate that someone else was on your ship lately! Fortunately, there was nothing for them to steal.');
						}
						break;
					case 2:
						write('An enormous pirate ship appears, and demands that you hand over all of the treasure on your ship! They have a very large array of guns pointed at you, and you\'ll almost certainly die if you refuse.');
						gameState = STATE_ADVENTURE_BULLY_DEMAND;
						break;
					case 3:
						var wpn = player.inventory.weapons[Math.floor(Math.random() * player.inventory.weapons.length)];
						if(wpn.clips > 0){
							write('You discover that one of your clips of ammo is a dud. Good thing you found that out now, and not in the middle of a battle!');
							wpn.changeClips(-1);
						} else{
							write('You have a strange sense of loss, but it soon passes.');
						}
						break;
					case 4:
						write('You see in front of you a box. Could be anything, including a trap. [O]pen it, or [I]gnore it?');
						gameState = STATE_ADVENTURE_TRAP_BOX;
						break;
					case 5:
						write('You return to your ship to find that someone has siphoned off some of your fuel! Scoundrels.');
						player.ship.changeFuel( -1 * (Math.floor(Math.random() * 10) + 1));
						break;
					case 6:
						var rand = Math.floor(Math.random() * 10) - player.repair;
						if(rand > 0){
							if(player.ship.treasure > 0){
								write('A small fire has broken out on your ship, and destroyed some of your treasure!');
								player.ship.changeTreasure(-1 * (Math.floor(Math.random() * 100) + 100));
							} else if(player.ship.fuel > 0){
								write('A small fire has broken out on your ship, and destroyed some of your fuel!');
								player.ship.changeFuel(-1 * (Math.floor(Math.random() * 3) + 2));
							} else {
								write('A small fire has broken out on your ship! In fighting it, you manage to burn yourself.');
								player.changeHealth(-1 * (Math.floor(Math.random() * 10) + 5));
							}
						} else {
							write('A small fire threatened to break out on the ship, but you managed to fix the problem before it consumed anything.');
						}
						break;
					case 7:
						write('Someone has left a box for you near your ship.');
						gameState = STATE_ADVENTURE_TRAP_BOX;
						break;
					case 8:
						write('A giant ship appears overhead, and demands that you pay a tax for orbiting their planet. They are very heavily armed, and refusal probably means death. They don\'t take credits, but would be willing to let you go for... all the treasure on your ship.');
						gameState = STATE_ADVENTURE_BULLY_DEMAND;
						break;
					case 9:
						if(player.ship.treasure > 0){
							write('You suddenly wake up at the console, and your nech aches. It appears that someone snuck onto your ship, drugged you, and stole all your treasure. Scoundrels!');
							player.ship.changeTreasure(-1 * player.ship.treasure);
						} else {
							write('Your neck aches for a moment, but the feeling soon passes. Space continues to drift by your viewports.');
						}
						break;
				}
			} else if(rand < .90){ //10%
				switch(Math.floor(Math.random() * 10)){
					case 0:
						write('You touch down on the planet surface, but nothing of consequence happens and you soon are forced to return to your ship.');
						break;
					case 1:
						write('Absolutely nothing happens during your adventure. You probably should have just stayed on your ship and napped.');
						break;
					case 2:
						write('Besides a beautiful view of a massive chasm, nothing of interest happens during your adventure.');
						break;
					case 3:
						write('A boring walk out, accompanied by an equally boring walk back.');
						break;
					case 4:
						write('You can\'t find anywhere to land on this side of the planet. You\'ll have to wait a bit and try again.');
						break;
					case 5:
						write('You\'re tired. Instead of adventuring, you decide to take a nice long nap.');
						break;
					case 6:
						write('Your thrusters refuse to fire for a bit, and by the time you have them repaired, you find yourself on the dark side of the planet. Better wait until you\'re on the daytime side before trying another adventure.');
						break;
					case 7:
						write('Your ' + player.getCurrentWeapon().getName() + ' needs cleaning. You decide that it\'s better to stay home and clean it instead of risking a malfunction during an adventure.');
						break;
					case 8:
						write('Why adventure now, when your favorite space opera is on the galactic network?');
						break;
					case 9:
						write('A malfunction in your ship\'s bathroom takes up more of your time than you\'d care to admit.');
						break;
				}
			} else { //10%
				switch(superAdventureIndex.LOCATION_PLANET){
					case 0:
						write('something cool happens 0');
						break;
					case 1:
						write('something cool happens 1');
						break;
					case 2:
						write('something cool happens 2');
						break;
					case 3:
						write('something cool happens 3');
						break;
					case 4:
						write('something cool happens 4');
						break;
					default:
						write('You feel as though something important was supposed to happen, but didn\'t. Strange.');
				}
				superAdventureIndex.LOCATION_PLANET ++;
			}
			break;
		case LOCATION_DEBRIS:
			var rand = Math.floor(Math.random() * 100) - currentLocation.timesAdventured;
			if(rand < 0){rand = Math.random() <= .1 ? 1 : 2;}
			if(rand == 1){
				currentLocation.adventuredAt(1);
				write('You find a tiny scrap of fuel among the wreckage, just enough to make one jump.');
				player.ship.changeFuel(1);
			} else if (rand == 2){
				currentLocation.adventuredAt(1);
				write('You look for a while, but find nothing.');
			} else if(rand < 20){ //20%
				switch(Math.floor(Math.random() * 10)){
					case 0:
						write('Another scavenger bumps into your ship, dealing you no personal damage but jamming the door for an hour.');
						currentLocation.adventuredAt(3);
						break;
					case 1:
						write('A large cloud of fuel is nearby, forcing you to drift for a while, lest you ignite it and kill everyone.');
						currentLocation.adventuredAt(4);
						break;
					case 2:
						write('You find a large chunk of treasure, but by the time you get it onto your ship, you discover that it\'s actually worthless.');
						currentLocation.adventuredAt(5);
						break;
					case 3:
						currentLocation.adventuredAt(20); //adventuredAt call has to be before text in cases with gameState change
						write('A ship piloted by the person known as the most dangerous pirate in the galaxy shows up. Their reputation is well deserved - everyone in the entire debris field spends the next two hours on the far side of the planet to avoid incurring their wrath. Join them?');
						gameState = STATE_ADVENTURE_SCARY_BULLY;
						break;
					case 4:
						if(currentLocation.timesAdventured < 50){
							write('A fleet of at least fifty ships owned by a megacorporation show up - this debris must have been one of their ships. They broadcast on all channels, "Leave now - we are authorized to use deadly force to clear this area."');
							write('There must be something super valuable in this field, or they woulldn\'t send this many ships to claim it.');
							gameState = STATE_ADVENTURE_SCARY_BULLY;
							currentLocation.adventuredAt(50);
						} else {
							write('You have a strange feeling, as though someone is trying to intimidate you, but it soon passes.');
						}
						break;
					case 5:
						if(player.repair < 5){
							write('Your thrusters refuse to fire for an hour. You watch with a bit of sadness as another scavenger retrieves a truly enormous amount of treasure.');
							currentLocation.adventuredAt(5);
						} else {
							write('You smell burning fuel, but upon investigation you find nothing wrong with your ship. Lost a bit of scavenge time, though.');
							currentLocation.adventuredAt(3);
						}
						break;
					case 6:
						write('Two giant pieces of metal collide near you, forcing you to take evasive maneuvers!');
						currentLocation.adventuredAt(2);
						break;
					case 7:
						write('A fight breaks out between two scavengers. Missles fly everywhere, forcing you to take evasive maneuvers.');
						currentLocation.adventuredAt(2);
						break;
					case 8:
						write('You sort through tons of scrap but find nothing valuable.');
						currentLocation.adventuredAt(5);
						break;
					case 9:
						write('Something large, biological, and dead - probably from onboard the ship - floats by, leaving a trail of slime behind it. Probably a good idea to get to the other side of the debris field.');
						currentLocation.adventuredAt(3);
						break;
				}
			} else if(rand < 60){ //40%
				currentLocation.adventuredAt(1);
				beginCombat();
			} else if(rand < 70){ //10%
				currentLocation.adventuredAt(1);
				switch(Math.floor(Math.random() * 11)){
					case 0:
						if(player.ship.treasure > 0){
							write('You find a bit of valuables on the wreck!');
							player.ship.changeTreasure(Math.floor(Math.random() * 20) + 10);
							write('However, as you work on getting that treasure into your ship, another scavenger has broken into your treasure hold and taken valuables! Scoundrel.');
							player.ship.changeTreasure(-1 * (Math.floor(Math.random() * 100) + 50));
						} else {
							write('You find a bit of valuables on the wreck!');
							player.ship.changeTreasure(Math.floor(Math.random() * 20) + 10);
						}
						break;
					case 1:
						if(player.strength < 5){
							write('You manage to injure yourself on a sharp bit of metal as you work it into your treasure hold.');
							player.ship.changeTreasure(Math.floor(Math.random() * 20) + 10);
							player.changeHealth(-1 * (Math.floor(Math.random() * 8) + 2));
						} else {
							write('You find a bit of treasure on the wreck. It\'s large and sharp, but with your strength you manage to stow it in your treasure hold anyway.');
							player.ship.changeTreasure(Math.floor(Math.random() * 20) + 10);
						}
						break;
					case 2:
						write('A larger scavenging ship decides to use the debris to its advantage, and traps you up against a part of the wreck. They demand that you turn over all of your treasure to them, or they\'ll destroy you.');
						write('You\'re pretty sure they\'re not bluffing, as you see many more laser cannons and missile bays on their ship than you could hope to defeat.');
						gameState = STATE_ADVENTURE_BULLY_DEMAND;
						break;
					case 3:
						if(player.ship.treasure > 0){
							write('As you open your cargo bay to put some treasure inside, a small ship flies by and quickly nabs the treasure you were hoping to collect, as well as a good chunk of stuff from your cargo bay! What a scoundrel.');
							player.ship.changeTreasure(-1 * (Math.floor(Math.random() * 1000) + 800));
						} else {
							write('As you open your cargo bay to put some treasure inside, a small ship flies by and quickly nabs the treasure you were hoping to collect! Scoundrel!');
						}
						break;
					case 4:
						if(player.ship.treasure > 0){
							write('Some of the treasure you\'ve collected explodes, destroying some of your other treasure. Next time try not to pick up bombs, okay?');
							player.ship.changeTreasure(-1 * (Math.floor(Math.random() * 500) + 400));
						} else{
							write('You hear a loud "bang!" from your cargo hold, but everything seems in place. You check to see if something collided with you, but all of the ship cameras show that you\'re in good shape.');
						}
						break;
					case 5:
						if(player.ship.treasure > 0){
							write('Another ship collides with yours, throwing you to the ground and destroying some of your more delicate treasure! Scoundrels.');
							player.ship.changeTreasure(-1 * (Math.floor(Math.random() * 300) + 10));
						} else{
							write('Another ship collides with yours, throwing you to the ground! You hear metal crunching, but nothing seems damaged. Must have been on their ship...');
						}
						player.changeHealth(-1 * (Math.floor(Math.random() * 3) + 2));
						break;
					case 6:
						var rand = Math.floor(Math.random() * 10) - player.repair;
						if(rand > 0){
							if(player.ship.treasure > 0){
								write('A small fire has broken out on your ship, and destroyed some of your treasure!');
								player.ship.changeTreasure(-1 * (Math.floor(Math.random() * 100) + 100));
							} else if(player.ship.fuel > 0){
								write('A small fire has broken out on your ship, and destroyed some of your fuel!');
								player.ship.changeFuel(-1 * (Math.floor(Math.random() * 3) + 2));
							} else {
								write('A small fire has broken out on your ship! In fighting it, you manage to burn yourself.');
								player.changeHealth(-1 * (Math.floor(Math.random() * 10) + 5));
							}
						} else {
							write('A small fire threatened to break out on the ship, but you managed to fix the problem before it consumed anything.');
						}
						break;
					case 7:
						if(player.ship.treasure > 0){
							write('You open your cargo bay to acquire some new treasure, but in doing so you knock some other treasure loose, which floats away into space.');
							player.ship.changeTreasure(-1 * (Math.floor(Math.random() * 500) + 100));
						} else {
							write('You manage to acquire some new treasure! You feel that things are going better than they should...');
							player.ship.changeTreasure((Math.floor(Math.random() * 100) + 100));
						}
						break;
					case 8:
						write('A well-armed pirate ship pulls up alongside you, and demands the surrender of all of your hard-earned treasure.');
						write('It seems that they are not bluffing - you\'ll likely be joining the debris field permanently if you refuse.');
						gameState = STATE_ADVENTURE_BULLY_DEMAND;
						break;
					case 9:
						write('A smaller ship pulls up beside you, and demands all of your treasure. The pilot claims to have attached an Antimatter bomb to your ship. You can\'t see one on your cameras, but if they\'re not bluffing, you\'ll certainly die.');
						gameState = STATE_ADVENTURE_BULLY_ANTIMATTER;
						break;
					case 10:
						write('You scavenge a mystery box from the wreckage.');
						gameState = STATE_ADVENTURE_TRAP_BOX;
						break;
				}
			} else if(rand < 90){ //20%
				currentLocation.adventuredAt(1);
				//find something
				switch(Math.floor(Math.random() * 10)){
					case 0:
						write('You manage to scavenge an entire crate of ammo!');
						var wpn = player.inventory.weapons[Math.floor(Math.random() * player.inventory.weapons.length)];
						if(wpn.type == WEAPON_ANTIMATTER){
							write('Wow! Inside is an antimatter charge. That\'s incredibly valuable!');
							wpn.changeClips(1);
						} else{
							wpn.changeClips(10);
						}
						break;
					case 1:
						write('You scavenge a large piece of scrap from the wreckage that contains some valuable electronics!');
						player.ship.changeTreasure(Math.floor(Math.random() * 2000) + 1000);
						break;
					case 2:
						write('You scavenge a piece of very valuable catalyst material from the wreckage!');
						player.ship.changeTreasure(Math.floor(Math.random() * 1000) + 1000)
						break;
					case 3:
						write('You find a weapons locker floating around in space near the wreckage. It must have come from the ship.');
						for(var i = 0; i < 3; i++){
							player.getWeapon(createRandomWeapon());
						}
						break;
					case 4:
						write('You find a well-secured safe in the wreckage. It appears to be booby-trapped.');
						gameState = STATE_ADVENTURE_TRAPPED_TREASURE;
						break;
					case 5:
						write('You find a very large piece of valuable metal. It will take some time to cut the metal into a size that will fit on your ship, but will probably be worth a lot of credits.');
						gameState = STATE_ADVENTURE_LARGE_TREASURE;
						break;
					case 6:
						write('You find a weapon in the debris. It might have been someone\'s sidearm when the debris was created. You try not to think about that too much.');
						player.getWeapon(createRandomWeapon());
						break;
					case 7:
						write('You find a chunk of treasure! What fortune.');
						player.ship.changeTreasure(Math.floor(Math.random() * 400) + 100);
						break;
					case 8:
						write('You find some treasure in the wreckage.');
						player.ship.changeTreasure(Math.floor(Math.random() * 200) + 100);
						break;
					case 9:
						write('You find just a bit of treasure. Perhaps the good stuff is gone already?');
						player.ship.changeTreasure(Math.floor(Math.random() * 100) + 100);
						break;
				}

			} else { //10%
				currentLocation.adventuredAt(1);
				switch(superAdventureIndex.LOCATION_DEBRIS){
					case 0:
						write('something cool happens 0');
						break;
					case 1:
						write('something cool happens 1');
						break;
					case 2:
						write('something cool happens 2');
						break;
					case 3:
						write('something cool happens 3');
						break;
					case 4:
						write('something cool happens 4');
						break;
					default:
						write('You feel as though something important was supposed to happen, but didn\'t. Strange.');
				}
				superAdventureIndex.LOCATION_DEBRIS ++;
			}
			break;
		case LOCATION_STATION:
			write('todo: station');
			break;
	}
}

function chooseAdventureClass(str){
	var chosen = true;
	if(str.startsWith('b')){
		write('You have chosed to be a Brute! Your attack and health are better than usual.');
		player.changeStrength(3);
		player.changeMaxHealth(50);
		player.type = CLASS_BRUTE;
	} else if(str.startsWith('r')){
		write('You have chosen to be a Runner! Your speed and armor are better than usual.');
		player.changeSpeed(3);
		player.type = CLASS_RUNNER;
	} else if(str.startsWith('e')){
		write('You have chosen to be an Engineer! Your weapons will last longer, and you can sometimes repair your way out of dangerous situations.');
		player.changeRepair(3);
		player.type = CLASS_ENGINEER;
	} else if(str.startsWith('s')){
		write('You have chosen to be a Smuggler! You start with 3000 extra credits, and can often sell your treasure for higher prices.');
		player.changeMoney(3000);
		player.type = CLASS_SMUGGLER;
	} else if(str.startsWith('p')){
		write('You have chosen to be a Pilot! Your ship will sometimes make fuel-free jumps, and you can often fly your way out of dangerous situations.');
		player.changeFlight(3);
		player.type = CLASS_PILOT;
	} else if(str.startsWith('m')){
		write('Brutes have a strength bonus of 3, which improves attack and health.');
		write('Runners have a speed bonus of 3, which improves running and armor class.');
		write('Engineers have a repair bonus of 3, which improves weapon life, and can often repair their way out of dangerous situations.');
		write('Smugglers start with an extra 3000 credits, and can sell their treasure for higher prices.');
		write('Pilots have a flight bonus of 3, which improves fuel use, and can often fly their way out of dangerous situations.');
		chosen = false;
	} else{
		write('Sorry, I didn\'t understand that. Type the name or bracketed letter of the class you want to choose.');
		chosen = false;
	}
	return chosen;
}

function chooseAdventureShip(str){
	var chosen = true;
	if(str.startsWith('f')){
		player.ship.type = SHIP_TYPE_FIGHTER;
		write('You have chosen a fighter! Your ship will sometimes make an extra attack against an enemy for you.');
		player.ship.changeCapacity(1000);
	} else if(str.startsWith('s')){
		player.ship.type = SHIP_TYPE_SMUGGLER;
		write('You have chosen a smuggler ship! Your ship has an extra 100% carrying capacity for treasure.');
		player.ship.changeCapacity(2000);
	} else if(str.startsWith('j')){
		player.ship.type = SHIP_TYPE_JUMPER;
		write('You have chosen a jumper ship! Your ship will sometimes use negligable fuel during a jump.');
		player.ship.changeCapacity(1000);
	} else if(str.startsWith('m')){
		write('Fighters will sometimes make an extra attack against an enemy for you.');
		write('Smuggler ships can carry twice the amount of treasure as other ships.');
		write('Jumper ships will sometimes use a negliable amout of fuel during a jump.');
		chosen = false;
	} else{
		write('Sorry, I didn\'t understand that. Type the name or bracketed letter of the type of ship you want to fly.');
		chosen = false;
	}
	return chosen;
}

function chooseAdventureWeapon(str){
	var chosen = true;
	if(str.startsWith('r')){
		write('Take this Standard Issue Rifle.');
		//Weapon(name, damage, type, critDie, clipSize, ammo, critDie)
		player.getWeapon(new Weapon('Rifle', specialList[0], 10, WEAPON_KINETIC, 20, 10, 10, 3));
	} else if(str.startsWith('s')){
		write('Take this Standard Issue Shotgun.');
		//Weapon(name, damage, type, critDie, clipSize, ammo, critDie)
		player.getWeapon(new Weapon('Shotgun', specialList[0], 8, WEAPON_KINETIC, 18, 10, 10, 3));
	} else if(str.startsWith('l')){
		write('Take this Laser Rifle.');
		//Weapon(name, damage, type, critDie, clipSize, ammo, critDie)
		player.getWeapon(new Weapon('Laser Rifle', specialList[0], 10, WEAPON_LASER, 20, 30, 10, 3));
	} else if(str.startsWith('m')){
		write('A rifle is the standard kinetic weapon, which will be trusty and reliable.');
		write('A shotgun is more likely to score a critical hit, but does slightly less damage and has a smaller clip.');
		write('A laser rifle has a much larger clip, but some creatures might be resistant to it.');
		chosen = false;
	} else{
		write('Sorry, I didn\'t understand that. Type the name or bracketed letter of the weapon you want to take.');
		chosen = false;
	}
	return chosen;
}

function chooseAdventureArmor(str){
	var chosen = true;
	if(str.startsWith('l')){
		write('Take this Light Armor.');
		//Armor(name, type, attributes)
		var arm = new Armor('Starting Armor', armorTypes[0], new Array());
		player.getArmor(arm);
	} else if(str.startsWith('s')){
		write('Take this Standard Armor');
		//Armor(name, type, attributes)
		var arm = new Armor('Starting Armor', armorTypes[1], new Array());
		player.getArmor(arm);
	} else if(str.startsWith('h')){
		write('Take this Heavy Armor');
		//Armor(name, type, attributes)
		var arm = new Armor('Starting Armor', armorTypes[2], new Array());
		player.getArmor(arm);
	} else if(str.startsWith('m')){
		write('Light armor is the least protective, but allows you to run faster and farther.');
		write('Medium armer has average protectivity and average weight.');
		write('Heavy armor is the most protective, but is very heavy and will reduce your running speed and endurance.');
		chosen = false;
	} else{
		write('Sorry, I didn\'t understand that. Type the name or bracketed letter of the weapon you want to take.');
		chosen = false;
	}
	return chosen;
}

/*
		case 0:
			break;
		case 1:
			break;
		case 2:
			break;
		case 3:
			break;
		case 4:
			break;
		case 5:
			break;
		case 6:
			break;
		case 7:
			break;
		case 8:
			break;
		case 9:
			break;
*/