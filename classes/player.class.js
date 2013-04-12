var CLASS_BRUTE = 0;
var CLASS_RUNNER = 1;
var CLASS_ENGINEER = 2;
var CLASS_SMUGGLER = 3;
var CLASS_PILOT = 4;

Player = function(){
	this.name = '';

	this.maxHealth = 100;
	this.health = 100;

	this.inventory = {
		weapons: [],
		armor: [],
		misc: []
	};

	this.currentWeapon = null;
	this.currentArmor = null;
	this.currentMisc = [];

	this.type = 0;
	this.strength = 0;
	this.speed = 0;
	this.repair = 0;
	this.flight = 0;

	this.money = 100;

	this.ship = new Ship();

	this.stats = {
		creaturesKilled : 0,
		timesAdventured : 0
	}
}

Player.prototype.changeMaxHealth = function(dh){
		assert(isInteger(dh), 'change is not an integer in Player.changeMaxHealth');
		assert(dh != 0, 'change is 0 in Player.changeMaxHealth');
	this.maxHealth += dh;
	if(dh > 0){
		write('Your maximum health has increased by ' + dh + ', to ' + this.maxHealth, 'str_change');
	} else{
		write('Your maximum health has decreased by ' + dh + ', to ' + this.maxHealth, 'str_change');
	}
	this.changeHealth(dh);
}

Player.prototype.changeStrength = function(ds){
		assert(isInteger(ds), 'change is not an integer in Player.changeStrength');
		assert(ds != 0, 'change is 0 in Player.changeStrength');
	this.strength += ds;
	if(ds > 0){
		write('Your strength has increased by ' + ds + ', to ' + plusMinus(this.strength) + this.strength, 'str_change');
	} else{
		write('Your strength has decreased by ' + (-1 * ds) + ', to ' + plusMinus(this.strength) + this.strength, 'str_change');
	}
}

Player.prototype.changeSpeed = function(ds){
		assert(isInteger(ds), 'change is not an integer in Player.changeSpeed');
		assert(ds != 0, 'change is 0 in Player.changeSpeed');
	this.speed += ds;
	if(ds > 0){
		write('Your speed has increased by ' + ds + ', to ' + plusMinus(this.speed) + this.speed, 'str_change');
	} else{
		write('Your speed has decreased by ' + (-1 * ds) + ', to ' + plusMinus(this.speed) + this.speed, 'str_change');
	}
}

Player.prototype.changeRepair = function(dr){
		assert(isInteger(dr), 'change is not an integer in Player.changeRepair');
		assert(dr != 0, 'change is 0 in Player.changeRepair');
	this.repair += dr;
	if(dr > 0){
		write('Your repair skill has increased by ' + dr + ', to ' + plusMinus(this.repair) + this.repair, 'str_change');
	} else{
		write('Your repair has decreased by ' + (-1 * dr) + ', to ' + plusMinus(this.repair) + this.repair, 'str_change');
	}
}

Player.prototype.changeFlight = function(df){
		assert(isInteger(df), 'change is not an integer in Player.changeFlight');
		assert(df != 0, 'change is 0 in Player.changeFlight');
	this.flight += df;
	if(df > 0){
		write('Your flight skill has increased by ' + df + ', to ' + plusMinus(this.flight) + this.flight, 'str_change');
	} else if(df < 0){
		write('Your flight has decreased by ' + (-1 * df) + ', to ' + plusMinus(this.flight) + this.flight, 'str_change');
	} else{
		write('DEBUG: Flight attempted to change by 0!', 'str_debug');
	}
}

Player.prototype.changeMoney = function(dm){
		assert(isInteger(dm), 'change is not an integer in Player.changeMoney');
		assert(dm != 0, 'change is 0 in Player.changeMoney');
	this.money += dm;
	if(dm > 0){
		write('You have gained ' + dm + ' credits, and now have ' + this.money + ' credits!', 'str_change');
	} else if(dm < 0){
		write('You have lost ' + (-1 * dm) + ' credits, and now have ' + this.money + ' credits.', 'str_change');
	} else{
		write('DEBUG: Money attempted to change by 0!', 'str_debug');
	}
}

Player.prototype.changeHealth = function(dh){
		assert(isInteger(dh), 'change is not an integer in Player.changeHealth');
		assert(dh != 0, 'change is 0 in Player.changeHealth');
		assert(this.health > 0, 'player is already dead in Player.changeHealth');
	this.health += dh;
	if(dh > 0){
		if(this.health > this.maxHealth){
			this.health = this.maxHealth;
			write('You are all healed up, for a total of ' + this.health + 'health!', 'str_change');
		} else{
			write('You heal ' + dh + ' points, for a total of ' + this.health + '/' + this.maxHealth, 'str_change');
		}
	} else if(dh < 0){
		if(this.health > 0){
			write('You have taken ' + (-1 * dh) + ' damage. You are at ' + this.health + '/' + this.maxHealth + ' health', 'str_change');
		} else{
			write('Space is cold and unforgiving. You have died.', 'str_change');
		}
	}
}

Player.prototype.getWeapon = function(wpn){
		assert(typeof(wpn) == 'object', 'wpn is not an object in Player.getWeapon');
	this.inventory.weapons.push(wpn);
	write('You got a ' + wpn.toString(), 'str_change');
	if(player.currentWeapon == null){
		this.setCurrentWeapon(wpn);
	}
}

Player.prototype.setCurrentWeapon = function(wpn){
		assert(typeof(wpn) != 'undefined', 'wpn is undefined in Player.setCurrentWeapon');
	this.currentWeapon = wpn;
	write('You are now wielding your ' + this.currentWeapon.getName(), 'str_change');
}

Player.prototype.getArmor = function(arm){
		assert(typeof(arm) == 'object', 'arm is not an object in Player.getArmor');
	this.inventory.armor.push(arm);
	write('You got ' + arm.toString(), 'str_change');
	if(player.currentArmor == null){
		this.setCurrentArmor(arm);
	}
}

Player.prototype.setCurrentArmor = function(arm){
		assert(typeof(arm) != 'undefined', 'arm is undefined in Player.setCurrentArmor');
	this.currentArmor = arm;
	write('You are now wearing your ' + this.currentArmor.getName(), 'str_change');
}

Player.prototype.writeShipStatus = function(){
	write('Your ship currently holds ' + this.ship.fuel + ' fuel (taking up ' + (this.ship.fuel * 10) + ' units of storage) and ' + this.ship.treasure + '/' + (this.ship.capacity - (this.ship.fuel * 10)) + ' units of treasure.');
}

Player.prototype.writeInventory = function(){
	//weapons
	write('Weapons:', 'str_title');
		assert(this.inventory.weapons.length > 0, 'Player has no weapons in their inventory!');
	for(var i = 0; i < this.inventory.weapons.length; i++){
		if(this.currentWeapon == this.inventory.weapons[i]){
			write('[' + i + ']: ' + this.inventory.weapons[i].toString() + '(Wielded)', 'str_current');
		} else {
			write('[' + i + ']: ' + this.inventory.weapons[i].toString(), 'str_item');
		}
	}
	//armor
	write('Armor:', 'str_title');
		assert(this.inventory.armor.length > 0, 'Player has no armor in their inventory!');
	for(var i = 0; i < this.inventory.armor.length; i++){
		if(this.currentArmor == this.inventory.armor[i]){
			write('[' + i + ']: ' + this.inventory.armor[i].toString() + '(Worn)', 'str_current');
		} else {
			write('[' + i + ']: ' + this.inventory.armor[i].toString(), 'str_item');
		}
	}
	//misc
	write('Misc:', 'str_title');
	if(this.inventory.misc.length > 0){
		for(var i = 0; i < this.inventory.misc.length; i++){
			var current = false;
			for(var j = 0; j < this.currentMisc.length; j++){
				if(this.inventory.misc[i] == this.currentMisc[j]) current = true;
			}
			if(current){
				write('[' + i + ']: ' + this.inventory.misc[i].toString() + '(Active)', 'str_current');
			} else {
				write('[' + i + ']: ' + this.inventory.misc[i].toString(), 'str_item');
			}
		}
	} else{
		write('You currently have no miscelaneous items.');
	}
	//consumables
	write('Consumables:', 'str_title');
	if(this.inventory.consumables.length > 0){
		for(var i = 0; i < this.inventory.consumables.length; i++){
			write('[' + i + ']: ' + this.inventory.consumables[i].toString(), 'str_item');
		}
	} else{
		write('You currently have no consumables.');
	 }
}