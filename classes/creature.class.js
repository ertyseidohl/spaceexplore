var CREATURE_SLIME = 1;
var CREATURE_INSECTOID = 2;
var CREATURE_ANIMAL = 3;
var CREATURE_HUMAN = 4;
var CREATURE_GREY = 5;

var CREATURE_ANGER_NONE = 10;
var CREATURE_ANGER_BAD_DAY = 30;
var CREATURE_ANGER_MAD = 50;
var CREATURE_ANGER_ENRAGED = 70;
var CREATUER_ANGER_OVERLOAD = 90;

function Creature(name, health, weaponsArray, angerLevel, evolutionLevel){
	this.name = name;
	this.health = health;
	this.weaponsArray = weaponsArray;
	this.angerLevel = angerLevel;
	this.evolutionLevel = evolutionLevel;

	this.currentWeapon = this.weaponsArray[0];
}

Creature.prototype.getDamage = function(){
	var roll = Math.floor(Math.random() * 20);
	if(roll >= this.currentWeapon.critDie){
		write('The ' + this.name + '\'s ' + this.name + ' hits you perfectly!');
		return this.currentWeapon.damage * 2;
	}
	return Math.max(Math.floor(this.currentWeapon.damage * Math.random()), 1);
}

Creature.prototype.isCrittable = function(){
	if(this.evolutionLevel == CREATURE_SLIME) return false;
	return true;
}

Creature.prototype.getName = function(){
	return this.name;
}

function createRandomCreature(location){
	var name = location.getRandomCreatureName();
	var health = generateCreatureHealth();
	var weaponsArray = generateCreatureWeapons();
	var angerLevel = getCreatureAngerLevel();
	return new Creature(name, health, weaponsArray, angerLevel);
}

function generateCreatureWeapons(){
	return [createRandomWeapon(), createRandomWeapon(), createRandomWeapon()];
}

function generateCreatureHealth(){
	return (Math.floor(Math.random() * player.stats.creaturesKilled) * 5) + Math.floor(Math.random() * 10) + 10;
}

function getCreatureAngerLevel(){
	return Math.floor(Math.random() * 100) + 5;
}