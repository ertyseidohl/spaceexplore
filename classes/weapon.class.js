var WEAPON_LASER = 0;
var WEAPON_KINETIC = 1;
var WEAPON_ANTIMATTER = 2;

Weapon.prototype.toString = function(){
	var wType;
	if(type == WEAPON_LASER) wType = 'laser';
	else if(type == WEAPON_KINETIC) wType = 'kinetic';
	else if(type == WEAPON_ANTIMATTER) wType = 'antimatter';
	else assert(false, 'Weapon type in toString is not a known type.');

	return this.getName() + ' (' + wType + '): (Max Damage: ' + damage + '; Crit Chance: ' + (1/critDie) + '; Clip Size: ' + clipSize + '), Ammo: ' + ammo + ' loaded, plus ' + clips + ' extra clips';
}

Weapon.prototype.getName(){
	return this.special.name + ' ' + this.name;
}

Weapon = function(name, special, damage, type, critDie, clipSize, ammo, clips){
	this.name = name;
	this.special = special;
	this.damage = damage;
		assert(isInteger(this.damage), 'New weapon damage is not an integer');
		assert(this.damage > 0, 'New weapon damage is not greater than 0');
	this.type = type;
	this.clipSize = clipSize;
		assert(isInteger(this.clipSize), 'New weapon clip size is not an integer');
		assert(this.clipSize > 0, 'New weapon clip size is not greater than 0');
	this.ammo = ammo;
		assert(isInteger(this.ammo), 'New weapon Ammo is not an integer');
		assert(this.ammo <= this.clipSize, 'New weapon Ammo is larger than clip');
	this.clips = clips;
		assert(isInteger(this.clips), 'New weapon clips is not an integer');
	this.critDie = critDie;
		assert(isInteger(this.critDie), 'New weapon crit die is not an integer');
		assert(this.critDie > 0, 'New weapon crit die is not greater than 0');

	this.getDamage = function(enemy, location){
		var baseDamage = special.getDamage(this, enemy);
		var roll = Math.floor(Math.random() * 20);
		if(roll >= this.critDie){
			if(enemy.isCrittable()){
				write('You hit the ' + enemy.name + ' critically!');
				enemy.takeDamage(baseDamage * 2);
			} else {
				write('Your shot is true, but it doesn\'t seem to even bother the ' + enemy.name + ', since it doesn\'t seem to have any major vital points.');
				enemy.takeDamage(baseDamage);
			}
		} else {
			write('Your shot hits the ' + enemy.name + '!');
			enemy.takeDamage(baseDamage);
		}
	}

	this.changeClips = function(dc){
			assert(isInteger(dc), 'change is not an integer in Weapon.changeClips');
			assert(dc != 0, 'change is 0 in Weapon.changeClips');
		this.clips += dc;
		if(dc > 0){
			write('Your ' + this.name + ' clips have increased by ' + dc + ' to ' + this.clips, 'str_change');
		} else if(dc < 0){
			if(this.clips < 0) this.clips = 0;
			write('Your ' + this.name + ' clips have decreased by ' + (-1 * dc) + ' to ' + this.clips, 'str_change');
		}
	}

	this.isMelee = function(){
		return this.type.melee;
	}
}

function createRandomWeapon(){
	var wListGen = weaponList[Math.floor(Math.random() * weaponList.length)];
	var wSpecial = specialList[Math.floor(Math.random() * specialList.length)];
	var wName = generateWeaponName(wListGen);
	var wDamage = generateWeaponDamage(wListGen);
	var wClipSize = generateWeaponClipSize(wListGen);
	var wAmmo = wClipSize;
	var wCritDie = generateWeaponCritDie(wListGen);
	var wClips = (Math.floor(Math.random() * 3));
	//					name, special, damage, type, critDie, clipSize, ammo, clips
	return new Weapon(wName, wSpecial, wDamage, wListGen.type, wCritDie, wClipSize, wAmmo, wClips);
}

var weaponList = [
	{
		name: 'blaster',
		avgClip: 6,
		bonusDmg: -2,
		critDie: 20,
		type: WEAPON_LASER,
		melee: false
	},{
		name: 'pistol',
		avgClip: 6,
		bonusDmg: -3,
		critDie: 20,
		type: WEAPON_KINETIC,
		melee: false
	},{
		name: 'rifle',
		avgClip: 3,
		bonusDmg: 10,
		critDie: 20,
		type: WEAPON_KINETIC,
		melee: false
	},{
		name: 'scattershot',
		avgClip: 5,
		bonusDmg: 0,
		critDie: 18,
		type: WEAPON_LASER,
		melee: false
	},{
		name: 'scattergun',
		avgClip: 6,
		bonusDmg: 1,
		critDie: 18,
		type: WEAPON_LASER,
		melee: false
	},{
		name: 'shotgun',
		avgClip: 7,
		bonusDmg: 10,
		critDie: 18,
		type: WEAPON_KINETIC,
		melee: false
	},{
		name: 'laser rifle',
		avgClip: 30,
		bonusDmg: 0,
		critDie: 20,
		type: WEAPON_LASER,
		melee: false
	},{
		name: 'raygun',
		avgClip: 30,
		bonusDmg: -2,
		critDie: 20,
		type: WEAPON_LASER,
		melee: false
	},{
		name: 'hyperbeam',
		avgClip: 2,
		bonusDmg: 50,
		critDie: 15,
		type: WEAPON_LASER,
		melee: false
	},{
		name: 'antimatter rifle',
		avgClip: 1,
		bonusDmg: 1000,
		critDie: 1,
		type: WEAPON_ANTIMATTER,
		melee: false
	}
]

var specialList = [
	{
		name: 'Standard Issue',
		clipBonus: 0,
		damageBonus: 0,
		critMod: 0,
		special: function(wpn, mons){return wpn.damage}
	}
]

function generateWeaponName(listGen){
	return listGen.name;
}

function generateWeaponDamage(listGen){
		assert(typeof(listGen) == 'object', 'listGen is not an object in generateWeaponDamage');
	var baseDamage = player.stats.creaturesKilled;
	var bonusDamage = listGen.bonusDmg + (listGen.bonusDmg * Math.random() * .2) - (listGen.bonusDmg * Math.random() * .2)
	var extraDamage = (Math.random() * baseDamage * .2) - (baseDamage * Math.random() * .2);
	return Math.max(5, Math.floor(baseDamage + extraDamage + bonusDamage));
}

function generateWeaponClipSize(listGen){
		assert(typeof(listGen) == 'object', 'listGen is not an object in generateWeaponClipSize');
	return Math.max(1, Math.floor(listGen.avgClip + (listGen.avgClip * Math.random() * .2) - (listGen.avgClip * Math.random() * .2)));
}

function generateWeaponCritDie(listGen){
		assert(typeof(listGen) == 'object', 'listGen is not an object in generateWeaponCritDie');
	if(listGen.type == WEAPON_ANTIMATTER) return 1;
	return Math.max(1, Math.floor(listGen.critDie + (Math.random() * 4) + (Math.random() * 4)));
}