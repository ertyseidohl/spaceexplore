const SHIP_TYPE_FIGHTER = 0;
const SHIP_TYPE_SMUGGLER = 1;
const SHIP_TYPE_JUMPER = 2;

Ship = function(){
	this.name = '';
	this.type = 0;
	this.treasure = 0;
	this.fuel = 20;
	this.capacity = 0;

	this.changeCapacity = function(dc){
			assert(isInteger(dc), 'change is not an integer in Ship.changeCapacity');
			assert(dc != 0, 'change is 0 in Ship.changeCapacity');
		this.capacity += dc;
		if(dc > 0){
			if(this.capacity == dc) write('Your ship\'s capacity is now '+ this.capacity, 'str_change');
			else write('Your ship\'s capacity increased to ' + this.capacity, 'str_change');
		} else if(dc < 0){
			write('Your ship\'s capacity decreased to ' + this.capacity, 'str_change');
		} else{
			write('DEBUG: Ship capacity attempted to change by 0', 'str_debug');
		}
	}

	this.useFuel = function(){
			assert(this.fuel > 0, 'fuel tank was used when empty in Ship.useFuel');
		if(this.type == SHIP_TYPE_JUMPER && Math.random() <= .1){
			write('Your jumper-style ship has routed a super-efficient path, and this jump used negligable fuel!', 'str_change');
		} else {
			this.fuel --;
			if(this.fuel < 10){
				write('You are now at only ' + this.fuel + ' units of fuel.', 'str_warning');
			}
		}
	}

	this.changeFuel = function(df){
			assert(isInteger(df), 'change is not an integer in Ship.changeFuel');
			assert(df != 0, 'change is 0 in Ship.changeFuel');
		this.fuel += df;
		if(df > 0){
			write('Your fuel has increased by ' + df + ', to a total of ' + this.fuel, 'str_change');
		} else if(df < 0){
			if(this.fuel <= 0){
				this.fuel = 0;
				write('You\'ve run out of fuel entirely!');
			} else{
				write('Your fuel has decreased by  ' + (-1 * df) + ', for a total of ' + this.fuel, 'str_change');
			}
		} else{
			write('DEBUG: Fuel attempted to change by 0', 'str_debug');
		}
	}

	this.changeTreasure = function(dt){
			assert(isInteger(dt), 'change is not an integer in Ship.changeTreasure');
			assert(dt != 0, 'change is 0 in Ship.changeTreasure');
		this.treasure += dt;
		if(dt > 0){
			write('You put ' + dt + ' treasure on your ship, for a total of ' + this.treasure, 'str_change');
		} else if(dt < 0){
			if(this.treasure < 0){
				this.treasure = 0;
				write('You\'ve been cleaned out! Your ship has no treasure on it.', 'str_change');
			} else{
				write('You\'ve lost ' + (-1 * dt) + ' treasure, and are now at a total of ' + this.treasure, 'str_change');
			}
		} else{
			write('DEBUG: Treasure attempted to change by 0', 'str_debug');
		}
	}
}